import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface HotmartWebhookPayload {
  hottok?: string;
  event?: string;
  data?: {
    transaction?: string;
    product_id?: string;
    product_name?: string;
    offer?: {
      code?: string;
    };
    buyer?: {
      email?: string;
      name?: string;
      doc?: string;
    };
    purchase?: {
      status?: string;
      payment?: {
        method?: string;
      };
      price?: {
        value?: number;
        currency_code?: string;
      };
      approved_date?: number;
    };
  };
}

serve(async (req) => {
  try {
    // Solo POST
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Leer el body
    const body = await req.json() as HotmartWebhookPayload;

    // ── 1. Validar Hottok ──
    const expectedHottok = Deno.env.get('HOTMART_HOTTOK');
    if (!expectedHottok) {
      console.error('HOTMART_HOTTOK no configurado en secrets');
      return new Response('Server configuration error', { status: 500 });
    }

    const receivedHottok = body.hottok ?? '';

    if (receivedHottok !== expectedHottok) {
      console.error('Hottok inválido. Recibido:', receivedHottok.slice(0, 6) + '...');
      return new Response('Unauthorized - Invalid Hottok', { status: 401 });
    }

    // ── 2. Extraer datos ──
    const transaction = body.data?.transaction;
    const productId = body.data?.product_id;
    const productName = body.data?.product_name;
    const offerCode = body.data?.offer?.code;
    const buyerEmail = body.data?.buyer?.email;
    const buyerName = body.data?.buyer?.name;
    const buyerDoc = body.data?.buyer?.doc;
    const status = body.data?.purchase?.status;
    const paymentMethod = body.data?.purchase?.payment?.method;
    const priceValue = body.data?.purchase?.price?.value;
    const priceCurrency = body.data?.purchase?.price?.currency_code;
    const approvedDate = body.data?.purchase?.approved_date;

    if (!transaction || !buyerEmail) {
      console.error('Faltan datos obligatorios: transaction o buyer.email');
      return new Response('Missing required fields', { status: 400 });
    }

    console.log(`📦 Webhook Hotmart recibido: ${transaction} | Status: ${status} | Email: ${buyerEmail}`);

    // ── 3. Conectar a Supabase con service_role ──
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados');
      return new Response('Server configuration error', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── 4. Guardar la compra en hotmart_purchases ──
    const { error: insertError } = await supabase
      .from('hotmart_purchases')
      .upsert({
        hotmart_transaction: transaction,
        hotmart_product_id: productId ?? null,
        hotmart_product_name: productName ?? null,
        hotmart_offer_code: offerCode ?? null,
        buyer_email: buyerEmail,
        buyer_name: buyerName ?? null,
        buyer_doc: buyerDoc ?? null,
        status: status ?? 'pending',
        payment_method: paymentMethod ?? null,
        price_value: priceValue ?? null,
        price_currency: priceCurrency ?? 'BRL',
        purchase_date: approvedDate ? new Date(approvedDate).toISOString() : null,
        raw_payload: body as unknown as Record<string, unknown>,
      }, {
        onConflict: 'hotmart_transaction',
      });

    if (insertError) {
      console.error('Error guardando compra en hotmart_purchases:', insertError);
      return new Response('Error saving purchase', { status: 500 });
    }

    console.log(`✅ Compra ${transaction} guardada en BD`);

    // ── 5. Solo procesar compras aprobadas ──
    if (status !== 'approved' && status !== 'completed') {
      console.log(`ℹ️ Compra ${transaction} con estado "${status}" — no se activa acceso`);
      return new Response('OK - Status not approved, no access granted', { status: 200 });
    }

    // ── 6. Buscar o crear usuario ──
    let userId: string;

    // Buscar si el usuario ya existe por email
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({
      filter: `email eq '${buyerEmail}'`,
    });

    if (listError || !existingUsers || existingUsers.users.length === 0) {
      // El usuario no existe — crear cuenta automáticamente
      console.log(`👤 Creando usuario nuevo para ${buyerEmail}...`);

      // Generar contraseña temporal aleatoria
      const tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email: buyerEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: buyerName || 'Usuario Smart Chef',
          source: 'hotmart',
        },
      });

      if (createUserError || !newUser?.user) {
        console.error('Error creando usuario:', createUserError);
        return new Response('Error creating user', { status: 500 });
      }

      userId = newUser.user.id;
      console.log(`✅ Usuario creado: ${userId}`);

      // ── 7. Enviar email de acceso (recovery link) ──
      const { error: recoveryError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: buyerEmail,
      });

      if (recoveryError) {
        console.error('Error enviando recovery link:', recoveryError);
        // No es crítico — el usuario puede pedir reset manualmente
      } else {
        console.log(`📧 Recovery link enviado a ${buyerEmail}`);
      }
    } else {
      userId = existingUsers.users[0].id;
      console.log(`👤 Usuario existente encontrado: ${userId}`);
    }

    // ── 8. Actualizar la compra con el user_id ──
    const { error: updateError } = await supabase
      .from('hotmart_purchases')
      .update({ user_id: userId })
      .eq('hotmart_transaction', transaction);

    if (updateError) {
      console.error('Error vinculando compra con usuario:', updateError);
    }

    // ── 9. Activar acceso en hotmart_access ──
    const { error: accessError } = await supabase
      .from('hotmart_access')
      .upsert({
        user_id: userId,
        has_access: true,
        source: 'hotmart',
        product_id: productId ?? null,
        product_name: productName ?? null,
        offer_code: offerCode ?? null,
        purchase_date: approvedDate ? new Date(approvedDate).toISOString() : new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (accessError) {
      console.error('Error activando acceso:', accessError);
      return new Response('Error activating access', { status: 500 });
    }

    console.log(`🎉 Acceso activado para ${buyerEmail} (${userId}) — Compra: ${transaction}`);

    return new Response('OK - Access granted', { status: 200 });

  } catch (error) {
    console.error('Error en webhook de Hotmart:', error);
    return new Response('Internal server error', { status: 500 });
  }
});