import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// ─────────────────────────────────────────────────────────
// Hotmart puede enviar webhooks en varios formatos.
// Esta función normaliza cualquier formato a una estructura
// predecible que el resto del código puede procesar.
// ─────────────────────────────────────────────────────────

interface NormalizedPayload {
  transaction: string;
  product_id: string | null;
  product_name: string | null;
  offer_code: string | null;
  buyer_email: string;
  buyer_name: string | null;
  buyer_doc: string | null;
  status: string;
  payment_method: string | null;
  price_value: number | null;
  price_currency: string;
  approved_date: string | null;
  raw: Record<string, unknown>;
}

/**
 * Normaliza el payload de Hotmart sin importar el formato.
 * Hotmart puede enviar los datos en distintas ubicaciones:
 *   - body.data.transaction
 *   - body.transaction
 *   - body.purchase.transaction
 *   - body.data.purchase.transaction
 * etc.
 */
function normalizePayload(body: Record<string, unknown>): NormalizedPayload | null {
  // Intentar extraer los datos de todas las ubicaciones posibles
  const data = (body.data as Record<string, unknown>) ?? {};
  const purchase = (data.purchase as Record<string, unknown>) ??
    (body.purchase as Record<string, unknown>) ?? {};
  const buyer = (data.buyer as Record<string, unknown>) ??
    (body.buyer as Record<string, unknown>) ?? {};
  const offer = (data.offer as Record<string, unknown>) ??
    (body.offer as Record<string, unknown>) ?? {};
  const price = (purchase.price as Record<string, unknown>) ??
    (data.price as Record<string, unknown>) ?? {};
  const payment = (purchase.payment as Record<string, unknown>) ?? {};

  // ── Transaction ──
  // Puede venir como: data.transaction, body.transaction, purchase.transaction,
  // data.purchase.transaction, o incluso como "transaction" a secas
  const transaction = (
    (data.transaction as string) ??
    (body.transaction as string) ??
    (purchase.transaction as string) ??
    (body.code as string) ??        // algunos eventos usan "code"
    (body.id as string) ??          // algunos eventos usan "id"
    ''
  ).toString().trim();

  // ── Buyer email ──
  const buyer_email = (
    (buyer.email as string) ??
    (data.email as string) ??
    (body.email as string) ??
    (body.buyer_email as string) ??
    (data.buyer_email as string) ??
    ''
  ).toString().trim().toLowerCase();

  // ── Status ──
  const status = (
    (purchase.status as string) ??
    (body.status as string) ??
    (data.status as string) ??
    'pending'
  ).toString().trim().toLowerCase();

  // ── Product ──
  const product_id = (
    (data.product_id as string) ??
    (body.product_id as string) ??
    (data.product as string) ??     // algunos eventos usan "product"
    null
  );

  const product_name = (
    (data.product_name as string) ??
    (body.product_name as string) ??
    null
  );

  // ── Offer ──
  const offer_code = (
    (offer.code as string) ??
    (data.offer_code as string) ??
    (body.offer_code as string) ??
    null
  );

  // ── Buyer ──
  const buyer_name = (
    (buyer.name as string) ??
    (data.buyer_name as string) ??
    (body.buyer_name as string) ??
    null
  );

  const buyer_doc = (
    (buyer.doc as string) ??
    (data.buyer_doc as string) ??
    (body.buyer_doc as string) ??
    null
  );

  // ── Payment ──
  const payment_method = (
    (payment.method as string) ??
    (data.payment_method as string) ??
    (body.payment_method as string) ??
    null
  );

  // ── Price ──
  const price_value = typeof price.value === 'number'
    ? price.value
    : typeof data.price_value === 'number'
      ? data.price_value
      : null;

  const price_currency = (
    (price.currency_code as string) ??
    (data.price_currency as string) ??
    (body.price_currency as string) ??
    'BRL'
  ).toString().trim().toUpperCase();

  // ── Approved date ──
  const approved_date_ms = purchase.approved_date as number | undefined;
  const approved_date = approved_date_ms
    ? new Date(approved_date_ms).toISOString()
    : null;

  // ── Validación mínima ──
  // Para eventos de prueba (ping), Hotmart puede no enviar transaction ni email.
  // En ese caso, simplemente respondemos OK sin procesar.
  if (!transaction && !buyer_email) {
    // Podría ser un ping de prueba de Hotmart
    console.log('ℹ️ Payload sin transaction ni buyer.email — probablemente un ping de prueba');
    console.log('📋 Body completo:', JSON.stringify(body).slice(0, 500));
    return null; // señal para responder OK sin procesar
  }

  if (!transaction) {
    console.warn('⚠️ Payload sin transaction. Body:', JSON.stringify(body).slice(0, 500));
  }

  if (!buyer_email) {
    console.warn('⚠️ Payload sin buyer.email. Body:', JSON.stringify(body).slice(0, 500));
  }

  return {
    transaction,
    product_id,
    product_name,
    offer_code,
    buyer_email,
    buyer_name,
    buyer_doc,
    status,
    payment_method,
    price_value,
    price_currency,
    approved_date,
    raw: body as Record<string, unknown>,
  };
}

// ─────────────────────────────────────────────────────────
// Handler principal
// ─────────────────────────────────────────────────────────

serve(async (req) => {
  try {
    // Solo POST
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Leer el body
    let body: Record<string, unknown>;
    try {
      body = await req.json() as Record<string, unknown>;
    } catch {
      console.error('❌ Body no es JSON válido');
      return new Response('Invalid JSON', { status: 400 });
    }

    console.log('📨 Webhook recibido:', JSON.stringify(body).slice(0, 800));

    // ── 1. Validar Hottok ──
    const expectedHottok = Deno.env.get('HOTMART_HOTTOK');
    if (!expectedHottok) {
      console.error('❌ HOTMART_HOTTOK no configurado en secrets');
      return new Response('Server configuration error - HOTMART_HOTTOK missing', { status: 500 });
    }

    // El hottok puede venir en: body.hottok, query string, o header
    const receivedHottok = (body.hottok as string) ?? '';

    if (receivedHottok !== expectedHottok) {
      console.error('❌ Hottok inválido. Esperado:', expectedHottok.slice(0, 6) + '...', 'Recibido:', receivedHottok.slice(0, 6) + '...');
      return new Response('Unauthorized - Invalid Hottok', { status: 401 });
    }

    // ── 2. Normalizar payload ──
    const normalized = normalizePayload(body);

    // Si es null, es un ping de prueba sin datos procesables
    if (!normalized) {
      console.log('✅ Ping de prueba respondido OK');
      return new Response('OK - Test ping acknowledged', { status: 200 });
    }

    const {
      transaction,
      product_id,
      product_name,
      offer_code,
      buyer_email,
      buyer_name,
      buyer_doc,
      status,
      payment_method,
      price_value,
      price_currency,
      approved_date,
      raw,
    } = normalized;

    console.log(`📦 Webhook normalizado: tx=${transaction} | status=${status} | email=${buyer_email}`);

    // ── 3. Conectar a Supabase con service_role ──
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados');
      return new Response('Server configuration error - Supabase credentials missing', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── 4. Guardar la compra en hotmart_purchases ──
    const { error: insertError } = await supabase
      .from('hotmart_purchases')
      .upsert({
        hotmart_transaction: transaction,
        hotmart_product_id: product_id,
        hotmart_product_name: product_name,
        hotmart_offer_code: offer_code,
        buyer_email: buyer_email,
        buyer_name: buyer_name,
        buyer_doc: buyer_doc,
        status: status || 'pending',
        payment_method: payment_method,
        price_value: price_value,
        price_currency: price_currency,
        purchase_date: approved_date,
        raw_payload: raw,
      }, {
        onConflict: 'hotmart_transaction',
      });

    if (insertError) {
      console.error('❌ Error guardando compra en hotmart_purchases:', insertError);
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
      filter: `email eq '${buyer_email}'`,
    });

    if (listError || !existingUsers || existingUsers.users.length === 0) {
      // El usuario no existe — crear cuenta automáticamente
      console.log(`👤 Creando usuario nuevo para ${buyer_email}...`);

      // Generar contraseña temporal aleatoria
      const tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email: buyer_email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: buyer_name || 'Usuario Smart Chef',
          source: 'hotmart',
        },
      });

      if (createUserError || !newUser?.user) {
        console.error('❌ Error creando usuario:', createUserError);
        return new Response('Error creating user', { status: 500 });
      }

      userId = newUser.user.id;
      console.log(`✅ Usuario creado: ${userId}`);

      // ── 7. Enviar email de acceso (recovery link) ──
      const { error: recoveryError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: buyer_email,
      });

      if (recoveryError) {
        console.error('⚠️ Error enviando recovery link:', recoveryError);
      } else {
        console.log(`📧 Recovery link enviado a ${buyer_email}`);
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
      console.error('⚠️ Error vinculando compra con usuario:', updateError);
    }

    // ── 9. Activar acceso en hotmart_access ──
    const { error: accessError } = await supabase
      .from('hotmart_access')
      .upsert({
        user_id: userId,
        has_access: true,
        source: 'hotmart',
        product_id: product_id,
        product_name: product_name,
        offer_code: offer_code,
        purchase_date: approved_date || new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (accessError) {
      console.error('❌ Error activando acceso:', accessError);
      return new Response('Error activating access', { status: 500 });
    }

    console.log(`🎉 Acceso activado para ${buyer_email} (${userId}) — Compra: ${transaction}`);

    return new Response('OK - Access granted', { status: 200 });

  } catch (error) {
    console.error('❌ Error en webhook de Hotmart:', error);
    return new Response('Internal server error', { status: 500 });
  }
});