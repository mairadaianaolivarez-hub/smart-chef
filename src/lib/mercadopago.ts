import { supabase } from './supabase';

/**
 * Crea una preferencia de pago en Mercado Pago y devuelve la URL de checkout.
 * Usa la Edge Function de Supabase para no exponer el Access Token en el cliente.
 */
export async function createPaymentPreference(userId: string, userEmail: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('create-mp-preference', {
      body: {
        user_id: userId,
        user_email: userEmail,
        title: 'Smart Chef - Acceso Completo',
        description: 'Acceso ilimitado a todas las recetas, planes semanales, blog y más',
        quantity: 1,
        unit_price: 7999,
        currency_id: 'ARS',
      },
    });

    if (error) {
      console.error('Error creando preferencia:', error);
      return null;
    }

    return data?.init_point ?? null;
  } catch (err) {
    console.error('Error en createPaymentPreference:', err);
    return null;
  }
}

/**
 * Abre el checkout de Mercado Pago en una nueva pestaña.
 * Si el popup es bloqueado, navega en la misma ventana.
 */
export function openMercadoPagoCheckout(url: string): void {
  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    // Popup bloqueado, navegar en la misma ventana
    window.location.href = url;
  }
}

/**
 * Verifica si el usuario actual tiene acceso de pago.
 */
export async function checkPaymentAccess(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('payment_access')
      .select('has_paid')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    return data.has_paid === true;
  } catch {
    return false;
  }
}

/**
 * Obtiene el historial de pagos del usuario.
 */
export async function getUserPayments(userId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo pagos:', error);
    return [];
  }

  return data ?? [];
}