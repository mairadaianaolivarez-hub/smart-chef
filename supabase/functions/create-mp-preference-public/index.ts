import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

interface PreferenceRequest {
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

serve(async (req) => {
  try {
    // Solo POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json() as PreferenceRequest;

    if (!body.title || !body.unit_price) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Obtener el Access Token de Mercado Pago
    const mpAccessToken = Deno.env.get('MPACCESSTOKEN');
    if (!mpAccessToken) {
      console.error('MPACCESSTOKEN no configurado');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Obtener la URL base para el webhook y los back_urls
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const functionUrl = `${supabaseUrl}/functions/v1/mercadopago-webhook`;

    // La URL de la aplicación la obtenemos del header Origin del request
    const appUrl = req.headers.get('Origin') || 'https://quecocinohoy.app';

    // Crear la preferencia en Mercado Pago (sin external_reference porque no hay user_id aún)
    const preferenceData = {
      items: [
        {
          id: 'smartchef-access',
          title: body.title,
          description: body.description,
          quantity: body.quantity,
          currency_id: body.currency_id,
          unit_price: body.unit_price,
        },
      ],
      back_urls: {
        success: `${appUrl}/?payment=success`,
        failure: `${appUrl}/?payment=failure`,
        pending: `${appUrl}/?payment=pending`,
      },
      auto_return: 'approved',
      notification_url: functionUrl,
      payment_methods: {
        excluded_payment_types: [],
        installments: 1,
      },
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify(preferenceData),
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error('Error creando preferencia en MP:', errorText);
      return new Response(JSON.stringify({ error: 'Error creating preference' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const preference = await mpResponse.json();

    return new Response(JSON.stringify({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en create-mp-preference-public:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});