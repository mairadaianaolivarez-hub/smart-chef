import { supabase } from './supabase';

// ─────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────

export interface HotmartOffer {
  product_ucode: string;
  offer_code: string;
  access_type: string;
  product_name: string;
  offer_name: string;
  checkout_url: string;
  price_value: number | null;
  price_currency: string;
  billing_period: string | null;
}

export interface HotmartEntitlement {
  product_ucode: string;
  offer_code: string;
  access_status: 'active' | 'grace';
  access_ends_at: string | null;
}

// ─────────────────────────────────────────────────────────
// DEMO — Mientras Hotmart no esté conectado desde el
// Backend Panel, estos datos de ejemplo permiten que la UI
// funcione. Cuando se conecte Hotmart, el archivo real
// reemplazará estas funciones.
// ─────────────────────────────────────────────────────────

const DEMO_OFFERS: HotmartOffer[] = [
  {
    product_ucode: 'demo-smartchef',
    offer_code: 'demo-oferta-unica',
    access_type: 'one_time',
    product_name: 'Smart Chef - Acceso Completo',
    offer_name: 'Pago único · Acceso de por vida',
    checkout_url: '#',
    price_value: 7999,
    price_currency: 'ARS',
    billing_period: null,
  },
];

/**
 * Obtiene las ofertas de Hotmart disponibles.
 * Mientras no esté conectado, devuelve datos demo.
 */
export async function listHotmartOffers(): Promise<{ data: HotmartOffer[] | null; error: Error | null }> {
  // TODO: Cuando Hotmart esté conectado desde el Backend Panel,
  // este código usará la tabla real de ofertas.
  console.log('📦 [DEMO] listHotmartOffers — Hotmart no conectado aún');
  return { data: DEMO_OFFERS, error: null };
}

/**
 * Obtiene los accesos (entitlements) del usuario autenticado.
 * Mientras no esté conectado, devuelve vacío.
 */
export async function getMyHotmartAccess(): Promise<{ entitlements: HotmartEntitlement[] }> {
  // Verificar acceso local en hotmart_access (por si el webhook ya lo activó)
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (userId) {
      const { data } = await supabase
        .from('hotmart_access')
        .select('has_access, product_id, product_name, offer_code, purchase_date')
        .eq('user_id', userId)
        .maybeSingle();

      if (data?.has_access) {
        return {
          entitlements: [{
            product_ucode: data.product_id ?? 'hotmart',
            offer_code: data.offer_code ?? 'hotmart',
            access_status: 'active',
            access_ends_at: null,
          }],
        };
      }
    }
  } catch {
    // ignorar errores — devolver vacío
  }

  return { entitlements: [] };
}

/**
 * Abre el checkout de Hotmart en una nueva pestaña.
 */
export function openHotmartCheckout(url: string): void {
  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    window.location.href = url;
  }
}

/**
 * Verifica si el usuario tiene acceso vía Hotmart.
 */
export async function checkHotmartAccess(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('hotmart_access')
      .select('has_access')
      .eq('user_id', userId)
      .maybeSingle();

    return data?.has_access === true;
  } catch {
    return false;
  }
}