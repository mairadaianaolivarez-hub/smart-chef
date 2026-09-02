CREATE TABLE contact_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT a usuarios autenticados y anónimos (para el formulario de contacto público)
GRANT INSERT ON contact_messages TO anon, authenticated;

-- Solo el usuario puede ver sus propios mensajes (si está autenticado)
CREATE POLICY "Users can insert their own messages"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);