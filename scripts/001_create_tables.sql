-- Tabla de áreas/departamentos
CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#F5A623',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabla de perfiles de usuarios (administradores y publicadores)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'publicador')),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  lugar TEXT NOT NULL,
  ubicacion_lat DECIMAL(10, 8),
  ubicacion_lng DECIMAL(11, 8),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  imagen_url TEXT,
  area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT fecha_futura CHECK (fecha >= CURRENT_DATE),
  CONSTRAINT fecha_max_un_ano CHECK (fecha <= CURRENT_DATE + INTERVAL '1 year')
);

-- Tabla de correos para envío masivo
CREATE TABLE IF NOT EXISTS suscriptores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  nombre TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);
CREATE INDEX IF NOT EXISTS idx_eventos_area ON eventos(area_id);
CREATE INDEX IF NOT EXISTS idx_profiles_rol ON profiles(rol);

-- Habilitar RLS en todas las tablas
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscriptores ENABLE ROW LEVEL SECURITY;

-- Políticas para AREAS
-- Lectura pública
CREATE POLICY "areas_select_public" ON areas FOR SELECT USING (true);
-- Solo admins pueden insertar/actualizar/eliminar áreas
CREATE POLICY "areas_insert_admin" ON areas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin' AND activo = true)
);
CREATE POLICY "areas_update_admin" ON areas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin' AND activo = true)
);
CREATE POLICY "areas_delete_admin" ON areas FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin' AND activo = true)
);

-- Políticas para PROFILES
-- Solo admins pueden ver todos los perfiles
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (
  auth.uid() = id OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin' AND activo = true)
);
-- Solo admins pueden crear perfiles
CREATE POLICY "profiles_insert_admin" ON profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin' AND activo = true)
);
-- Solo admins pueden actualizar perfiles
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin' AND activo = true)
);
-- Solo admins pueden eliminar perfiles
CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin' AND activo = true)
);

-- Políticas para EVENTOS
-- Lectura pública de eventos
CREATE POLICY "eventos_select_public" ON eventos FOR SELECT USING (true);
-- Admins y publicadores pueden crear eventos
CREATE POLICY "eventos_insert_auth" ON eventos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND activo = true)
);
-- Admins y publicadores pueden actualizar eventos
CREATE POLICY "eventos_update_auth" ON eventos FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND activo = true)
);
-- Admins y publicadores pueden eliminar eventos
CREATE POLICY "eventos_delete_auth" ON eventos FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND activo = true)
);

-- Políticas para SUSCRIPTORES
-- Solo usuarios autenticados pueden ver suscriptores
CREATE POLICY "suscriptores_select_auth" ON suscriptores FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND activo = true)
);
-- Cualquiera puede suscribirse (insertar su correo)
CREATE POLICY "suscriptores_insert_public" ON suscriptores FOR INSERT WITH CHECK (true);
-- Solo admins pueden actualizar/eliminar suscriptores
CREATE POLICY "suscriptores_update_admin" ON suscriptores FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin' AND activo = true)
);
CREATE POLICY "suscriptores_delete_admin" ON suscriptores FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin' AND activo = true)
);
