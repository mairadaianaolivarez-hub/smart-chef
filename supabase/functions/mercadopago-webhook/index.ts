import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface MercadoPagoPayment {
  id: string;
  status: string;
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  payer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  external_reference?: string;
}

serve(async (req) => {
  try {
    // Verificar que sea un POST
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Obtener el body
    const body = await req.json() as MercadoPagoPayment;

    // Verificar que sea un pago
    if (!body.id || !body.status) {
      return new Response('Not a payment notification', { status: 200 });
    }

    // Obtener el Access Token de Mercado Pago desde las secrets
    const mpAccessToken = Deno.env.get('MPACCESSTOKEN');
    if (!mpAccessToken) {
      console.error('MPACCESSTOKEN no configurado');
      return new Response('Server configuration error', { status: 500 });
    }

    // Obtener las credenciales de Supabase desde las secrets
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return new Response('Server configuration error', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar el pago con Mercado Pago para asegurarnos de que es legítimo
    const verifyResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${body.id}`,
      {
        headers: {
          Authorization: `Bearer ${mpAccessToken}`,
        },
      }
    );

    if (!verifyResponse.ok) {
      console.error('Error verificando pago con MP:', await verifyResponse.text());
      return new Response('Payment verification failed', { status: 400 });
    }

    const verifiedPayment = await verifyResponse.json() as MercadoPagoPayment;

    // Solo procesar pagos aprobados
    if (verifiedPayment.status !== 'approved') {
      console.log(`Pago ${verifiedPayment.id} con estado ${verifiedPayment.status} - ignorado`);
      return new Response('OK', { status: 200 });
    }

    // Obtener el email del comprador
    const buyerEmail = verifiedPayment.payer?.email;
    if (!buyerEmail) {
      console.error('No se pudo obtener el email del comprador');
      return new Response('Buyer email not found', { status: 400 });
    }

    console.log(`✅ Pago aprobado: ${verifiedPayment.id} - Email: ${buyerEmail}`);

    // Buscar si el usuario ya existe en auth.users
    const { data: existingUsers, error: userQueryError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', buyerEmail);

    let userId: string;

    if (userQueryError || !existingUsers || existingUsers.length === 0) {
      // El usuario no existe - crear cuenta automáticamente
      console.log(`Creando usuario nuevo para ${buyerEmail}...`);

      // Generar una contraseña temporal aleatoria
      const tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

      // Crear el usuario usando la API de Admin de Supabase
      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email: buyerEmail,
        password: tempPassword,
        email_confirm: true, // Confirmar email automáticamente
        user_metadata: {
          full_name: `${verifiedPayment.payer?.first_name || ''} ${verifiedPayment.payer?.last_name || ''}`.trim() || 'Usuario Smart Chef',
        },
      });

      if (createUserError || !newUser?.user) {
        console.error('Error creando usuario:', createUserError);
        return new Response('Error creating user', { status: 500 });
      }

      userId = newUser.user.id;
      console.log(`✅ Usuario creado: ${userId}`);

      // Enviar email de bienvenida con instrucciones para acceder
      // Usamos el sistema de recovery de Supabase para enviar un magic link
      const { error: recoveryError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: buyerEmail,
      });

      if (recoveryError) {
        console.error('Error enviando recovery link:', recoveryError);
        // No es crítico, el usuario puede pedir reset de contraseña manualmente
      } else {
        console.log(`✅ Recovery link enviado a ${buyerEmail}`);
      }
    } else {
      // El usuario ya existe
      userId = existingUsers[0].id;
      console.log(`✅ Usuario existente encontrado: ${userId}`);
    }

    // Guardar el pago en la tabla payments
    const { error: paymentError } = await supabase
      .from('payments')
      .upsert({
        user_id: userId,
        mp_payment_id: String(verifiedPayment.id),
        mp_status: verifiedPayment.status,
        mp_status_detail: verifiedPayment.status_detail,
        amount: verifiedPayment.transaction_amount,
        currency: verifiedPayment.currency_id,
        paid_at: new Date().toISOString(),
      }, {
        onConflict: 'mp_payment_id',
      });

    if (paymentError) {
      console.error('Error guardando pago:', paymentError);
      return new Response('Error saving payment', { status: 500 });
    }

    // Actualizar el acceso del usuario
    const { error: accessError } = await supabase
      .from('payment_access')
      .upsert({
        user_id: userId,
        has_paid: true,
        paid_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (accessError) {
      console.error('Error actualizando acceso:', accessError);
      return new Response('Error updating access', { status: 500 });
    }

    console.log(`✅ Pago ${verifiedPayment.id} procesado exitosamente para usuario ${userId} (${buyerEmail})`);

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error en webhook:', error);
    return new Response('Internal server error', { status: 500 });
  }
});