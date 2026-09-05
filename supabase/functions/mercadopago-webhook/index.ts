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

    // Buscar el usuario por external_reference (user_id) o por email
    let userId = verifiedPayment.external_reference;

    if (!userId && verifiedPayment.payer?.email) {
      // Buscar el usuario por email
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', verifiedPayment.payer.email)
        .single();

      if (userError || !userData) {
        console.error('Usuario no encontrado:', verifiedPayment.payer.email);
        return new Response('User not found', { status: 404 });
      }

      userId = userData.id;
    }

    if (!userId) {
      console.error('No se pudo determinar el usuario');
      return new Response('User not identified', { status: 400 });
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

    console.log(`✅ Pago ${verifiedPayment.id} procesado para usuario ${userId}`);

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error en webhook:', error);
    return new Response('Internal server error', { status: 500 });
  }
});