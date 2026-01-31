-- =====================================================
-- FIX POLÍTICAS RLS PARA SUSCRIPTORES + AGREGAR DATOS
-- =====================================================

-- Paso 1: Eliminar políticas restrictivas
DROP POLICY IF EXISTS "suscriptores_select_auth" ON suscriptores;
DROP POLICY IF EXISTS "suscriptores_insert_auth" ON suscriptores;
DROP POLICY IF EXISTS "suscriptores_update_auth" ON suscriptores;
DROP POLICY IF EXISTS "suscriptores_delete_auth" ON suscriptores;
DROP POLICY IF EXISTS "suscriptores_insert_public" ON suscriptores;

-- Paso 2: Crear políticas que permitan acceso a usuarios autenticados
CREATE POLICY "suscriptores_select" ON suscriptores FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "suscriptores_insert" ON suscriptores FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "suscriptores_update" ON suscriptores FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "suscriptores_delete" ON suscriptores FOR DELETE USING (auth.uid() IS NOT NULL);

-- Paso 3: Asegurar que RLS esté habilitado
ALTER TABLE suscriptores ENABLE ROW LEVEL SECURITY;

-- Paso 4: Insertar suscriptores de ejemplo
INSERT INTO suscriptores (email, nombre, activo) VALUES
  ('maria.garcia@universidad.edu', 'María García', true),
  ('carlos.rodriguez@universidad.edu', 'Carlos Rodríguez', true),
  ('ana.martinez@universidad.edu', 'Ana Martínez', true),
  ('jose.lopez@universidad.edu', 'José López', true),
  ('laura.sanchez@universidad.edu', 'Laura Sánchez', true),
  ('pedro.gonzalez@universidad.edu', 'Pedro González', true),
  ('sofia.hernandez@universidad.edu', 'Sofía Hernández', true),
  ('diego.ramirez@universidad.edu', 'Diego Ramírez', true),
  ('valentina.torres@universidad.edu', 'Valentina Torres', true),
  ('andres.morales@universidad.edu', 'Andrés Morales', true),
  ('alejandra.ruiz@universidad.edu', 'Alejandra Ruiz', true),
  ('fernando.castro@universidad.edu', 'Fernando Castro', false),
  ('valentina.mendez@universidad.edu', 'Valentina Méndez', true),
  ('sebastian.vargas@universidad.edu', 'Sebastián Vargas', true),
  ('camila.ortiz@universidad.edu', 'Camila Ortiz', false),
  ('nicolas.perez@universidad.edu', 'Nicolás Pérez', true),
  ('daniela.silva@universidad.edu', 'Daniela Silva', true),
  ('mateo.jimenez@universidad.edu', 'Mateo Jiménez', true),
  ('isabella.rojas@universidad.edu', 'Isabella Rojas', false),
  ('samuel.moreno@universidad.edu', 'Samuel Moreno', true)
ON CONFLICT (email) DO NOTHING;

-- Verificar
SELECT COUNT(*) as total FROM suscriptores;