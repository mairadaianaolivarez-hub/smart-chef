CREATE TABLE weekly_plans (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dia TEXT NOT NULL CHECK (dia IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')),
  categoria TEXT NOT NULL CHECK (categoria IN ('Desayuno', 'Almuerzo', 'Merienda', 'Cena')),
  receta_id INTEGER NOT NULL,
  receta_nombre TEXT NOT NULL
);

ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;

-- Solo usuarios autenticados pueden leer/escribir sus propios planes
GRANT SELECT, INSERT, UPDATE, DELETE ON weekly_plans TO authenticated;

CREATE POLICY "Users can manage their own weekly plans"
  ON weekly_plans
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);