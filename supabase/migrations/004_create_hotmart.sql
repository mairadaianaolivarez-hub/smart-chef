CREATE TABLE hotmart_purchases (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  hotmart_transaction TEXT NOT NULL UNIQUE,
  hotmart_product_id TEXT,
  hotmart_product_name TEXT,
  hotmart_offer_code TEXT,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT,
  buyer_doc TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  price_value NUMERIC(10,2),
  price_currency TEXT DEFAULT 'BRL',
  purchase_date TIMESTAMPTZ,
  raw_payload JSONB
);

ALTER TABLE hotmart_purchases ENABLE ROW LEVEL SECURITY;

-- Solo el backend (Edge Functions con service_role) escribe aquí
REVOKE ALL ON hotmart_purchases FROM anon, authenticated;

-- Tabla de acceso: quién tiene acceso por haber comprado en Hotmart
CREATE TABLE hotmart_access (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  has_access BOOLEAN NOT NULL DEFAULT true,
  source TEXT NOT NULL DEFAULT 'hotmart',
  product_id TEXT,
  product_name TEXT,
  offer_code TEXT,
  purchase_date TIMESTAMPTZ,
  UNIQUE(user_id)
);

ALTER TABLE hotmart_access ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON hotmart_access TO authenticated;

CREATE POLICY "Users can view their own hotmart access"
  ON hotmart_access
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);