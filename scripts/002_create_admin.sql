-- =====================================================
-- SCRIPT PARA CREAR EL PRIMER ADMINISTRADOR
-- =====================================================
-- 
-- Actualizado para usar contraseña: lock24lock
-- CREDENCIALES DEL ADMINISTRADOR INICIAL:
-- Email: admin@eventoscalendar.com
-- Contraseña: lock24lock
--
-- IMPORTANTE: Este script debe ejecutarse DESPUÉS de que
-- el usuario admin@eventoscalendar.com se haya registrado
-- en la aplicación con la contraseña lock24lock
--
-- Pasos:
-- 1. Ejecutar scripts/001_create_tables.sql
-- 2. Registrar usuario con email: admin@eventoscalendar.com y contraseña: lock24lock
-- 3. Confirmar email (revisar bandeja de entrada)
-- 4. Ejecutar este script para asignar rol de admin
-- =====================================================

-- Insertar el perfil de administrador
-- (Reemplaza el UUID con el ID real del usuario después de registrarse)
INSERT INTO profiles (id, email, nombre, rol, activo)
SELECT 
  id,
  email,
  'Administrador Principal',
  'admin',
  true
FROM auth.users 
WHERE email = 'admin@eventoscalendar.com'
ON CONFLICT (id) DO UPDATE SET rol = 'admin', activo = true;

-- Crear las 5 áreas oficiales
INSERT INTO areas (nombre, color) VALUES
  ('Expresiones culturales y artísticas', '#E94E77'),
  ('Promoción socioeconómica', '#4A90E2'),
  ('Desarrollo humano y convivencia universitaria', '#F5A623'),
  ('Prevención y promoción de la salud', '#50C878'),
  ('Fomento de la actividad física, el deporte y la recreación', '#9B59B6')
ON CONFLICT (nombre) DO NOTHING;
