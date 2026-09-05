CREATE TABLE payments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mp_payment_id TEXT NOT NULL UNIQUE,
  mp_status TEXT NOT NULL DEFAULT 'pending',
  mp_status_detail TEXT,
  amount NUMERIC(10,2) NOT NULL DEFAULT 7999.00,
  currency TEXT NOT NULL DEFAULT 'ARS',
  paid_at TIMESTAMPTZ
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Solo usuarios autenticados pueden leer sus propios pagos
GRANT SELECT, INSERT, UPDATE ON payments TO authenticated;

CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- La Edge Function necesita poder insertar/actualizar pagos (usa service_role)
-- Pero desde cliente solo se permite lo de arriba

-- Tabla para tracking de acceso de pago
CREATE TABLE payment_access (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  has_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

ALTER TABLE payment_access ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON payment_access TO authenticated;

CREATE POLICY "Users can view their own payment access"
  ON payment_access
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment access"
  ON payment_access
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment access"
  ON payment_access
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);