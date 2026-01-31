-- =====================================================
-- SCRIPT 003: ACTUALIZAR ÁREAS, EVENTOS Y ANALYTICS
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- PASO 1: Eliminar restricciones de rol en policies
DROP POLICY IF EXISTS "areas_insert_admin" ON areas;
DROP POLICY IF EXISTS "areas_update_admin" ON areas;
DROP POLICY IF EXISTS "areas_delete_admin" ON areas;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;
DROP POLICY IF EXISTS "suscriptores_update_admin" ON suscriptores;
DROP POLICY IF EXISTS "suscriptores_delete_admin" ON suscriptores;

-- PASO 2: Crear nuevas políticas sin restricción de rol
-- Areas - cualquier usuario autenticado puede gestionar
CREATE POLICY "areas_insert_auth" ON areas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "areas_update_auth" ON areas FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "areas_delete_auth" ON areas FOR DELETE USING (auth.uid() IS NOT NULL);

-- Profiles - cualquier usuario autenticado puede ver y gestionar
CREATE POLICY "profiles_select_auth" ON profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "profiles_insert_auth" ON profiles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "profiles_update_auth" ON profiles FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "profiles_delete_auth" ON profiles FOR DELETE USING (auth.uid() IS NOT NULL);

-- Suscriptores - cualquier usuario autenticado puede gestionar
CREATE POLICY "suscriptores_update_auth" ON suscriptores FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "suscriptores_delete_auth" ON suscriptores FOR DELETE USING (auth.uid() IS NOT NULL);

-- PASO 3: Eliminar columna rol de profiles (ya no necesaria)
ALTER TABLE profiles DROP COLUMN IF EXISTS rol;

-- PASO 4: Limpiar áreas anteriores e insertar las 5 nuevas
DELETE FROM areas;

INSERT INTO areas (nombre, color) VALUES
  ('Expresiones culturales y artísticas', '#E94E77'),
  ('Promoción socioeconómica', '#4A90E2'),
  ('Desarrollo humano y convivencia universitaria', '#F5A623'),
  ('Prevención y promoción de la salud', '#50C878'),
  ('Fomento de la actividad física, el deporte y la recreación', '#9B59B6');

-- PASO 5: Crear tabla de vistas de eventos (analytics)
CREATE TABLE IF NOT EXISTS evento_vistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  visitor_id TEXT, -- identificador anónimo del visitante
  ip_hash TEXT, -- hash del IP para contar únicos
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 6: Crear tabla de inscripciones a eventos
CREATE TABLE IF NOT EXISTS evento_inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evento_id, email)
);

-- Índices para analytics
CREATE INDEX IF NOT EXISTS idx_evento_vistas_evento ON evento_vistas(evento_id);
CREATE INDEX IF NOT EXISTS idx_evento_vistas_fecha ON evento_vistas(created_at);
CREATE INDEX IF NOT EXISTS idx_evento_inscripciones_evento ON evento_inscripciones(evento_id);

-- Habilitar RLS en nuevas tablas
ALTER TABLE evento_vistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE evento_inscripciones ENABLE ROW LEVEL SECURITY;

-- Políticas para vistas - público puede insertar, auth puede leer
CREATE POLICY "vistas_insert_public" ON evento_vistas FOR INSERT WITH CHECK (true);
CREATE POLICY "vistas_select_auth" ON evento_vistas FOR SELECT USING (auth.uid() IS NOT NULL);

-- Políticas para inscripciones - público puede insertar, auth puede gestionar
CREATE POLICY "inscripciones_insert_public" ON evento_inscripciones FOR INSERT WITH CHECK (true);
CREATE POLICY "inscripciones_select_auth" ON evento_inscripciones FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "inscripciones_delete_auth" ON evento_inscripciones FOR DELETE USING (auth.uid() IS NOT NULL);

-- PASO 7: Limpiar eventos anteriores
DELETE FROM eventos;

-- PASO 8: Insertar eventos de ejemplo (2-4 por área)
-- Necesitamos los IDs de las áreas
DO $$
DECLARE
  area_cultura UUID;
  area_socioeconomica UUID;
  area_desarrollo UUID;
  area_salud UUID;
  area_deporte UUID;
BEGIN
  SELECT id INTO area_cultura FROM areas WHERE nombre = 'Expresiones culturales y artísticas';
  SELECT id INTO area_socioeconomica FROM areas WHERE nombre = 'Promoción socioeconómica';
  SELECT id INTO area_desarrollo FROM areas WHERE nombre = 'Desarrollo humano y convivencia universitaria';
  SELECT id INTO area_salud FROM areas WHERE nombre = 'Prevención y promoción de la salud';
  SELECT id INTO area_deporte FROM areas WHERE nombre = 'Fomento de la actividad física, el deporte y la recreación';

  -- EVENTOS: Expresiones culturales y artísticas (4 eventos)
  INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url) VALUES
  ('Festival de Danza Contemporánea', 'Presentación de grupos de danza contemporánea con coreografías innovadoras que fusionan técnicas clásicas y modernas.', 'Auditorio Principal Universidad', CURRENT_DATE + INTERVAL '15 days', '18:00', area_cultura, 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800'),
  ('Exposición de Arte Universitario', 'Muestra colectiva de obras de estudiantes de artes plásticas incluyendo pintura, escultura y arte digital.', 'Galería de Arte Campus Norte', CURRENT_DATE + INTERVAL '25 days', '10:00', area_cultura, 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800'),
  ('Concierto de Música Clásica', 'La orquesta sinfónica universitaria presenta obras de Beethoven y Mozart.', 'Teatro Universitario', CURRENT_DATE + INTERVAL '30 days', '19:30', area_cultura, 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800'),
  ('Noche de Teatro Experimental', 'Presentación de obras cortas de teatro experimental creadas por estudiantes de artes escénicas.', 'Sala de Teatro Campus Central', CURRENT_DATE + INTERVAL '45 days', '20:00', area_cultura, 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800');

  -- EVENTOS: Promoción socioeconómica (3 eventos)
  INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url) VALUES
  ('Feria de Emprendimiento Universitario', 'Exposición de proyectos de emprendimiento estudiantil con oportunidades de networking e inversión.', 'Plaza Central Universidad', CURRENT_DATE + INTERVAL '20 days', '09:00', area_socioeconomica, 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800'),
  ('Taller de Finanzas Personales', 'Aprende a manejar tu dinero, crear presupuestos y planificar tu futuro financiero.', 'Aula Magna Edificio B', CURRENT_DATE + INTERVAL '35 days', '14:00', area_socioeconomica, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800'),
  ('Seminario de Empleabilidad', 'Técnicas de entrevista, elaboración de CV y estrategias para conseguir tu primer empleo.', 'Centro de Convenciones', CURRENT_DATE + INTERVAL '50 days', '10:00', area_socioeconomica, 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800');

  -- EVENTOS: Desarrollo humano y convivencia universitaria (3 eventos)
  INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url) VALUES
  ('Semana de la Convivencia', 'Actividades de integración y fortalecimiento del tejido social universitario.', 'Áreas verdes Campus Principal', CURRENT_DATE + INTERVAL '10 days', '08:00', area_desarrollo, 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800'),
  ('Taller de Inteligencia Emocional', 'Desarrolla habilidades para gestionar tus emociones y mejorar tus relaciones interpersonales.', 'Sala de Conferencias Edificio A', CURRENT_DATE + INTERVAL '28 days', '15:00', area_desarrollo, 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800'),
  ('Jornada de Voluntariado Comunitario', 'Únete a actividades de servicio social en comunidades cercanas al campus.', 'Punto de encuentro: Entrada Principal', CURRENT_DATE + INTERVAL '40 days', '07:00', area_desarrollo, 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800');

  -- EVENTOS: Prevención y promoción de la salud (3 eventos)
  INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url) VALUES
  ('Jornada de Salud Mental', 'Charlas y talleres sobre manejo del estrés, ansiedad y bienestar emocional.', 'Centro de Bienestar Universitario', CURRENT_DATE + INTERVAL '12 days', '09:00', area_salud, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
  ('Campaña de Donación de Sangre', 'Dona sangre y salva vidas. Evento en colaboración con el banco de sangre regional.', 'Enfermería Campus Norte', CURRENT_DATE + INTERVAL '22 days', '08:00', area_salud, 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800'),
  ('Taller de Nutrición Saludable', 'Aprende a preparar comidas nutritivas y económicas para estudiantes.', 'Cafetería Central', CURRENT_DATE + INTERVAL '38 days', '12:00', area_salud, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800'),
  ('Feria de Salud Integral', 'Exámenes médicos gratuitos, charlas preventivas y actividades de bienestar.', 'Polideportivo Universidad', CURRENT_DATE + INTERVAL '55 days', '09:00', area_salud, 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800');

  -- EVENTOS: Fomento de la actividad física, el deporte y la recreación (4 eventos)
  INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url) VALUES
  ('Torneo Interfacultades de Fútbol', 'Competencia deportiva entre las diferentes facultades de la universidad.', 'Canchas de Fútbol Campus Sur', CURRENT_DATE + INTERVAL '18 days', '14:00', area_deporte, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'),
  ('Carrera 5K Universitaria', 'Carrera atlética abierta a toda la comunidad universitaria y público general.', 'Pista de Atletismo', CURRENT_DATE + INTERVAL '32 days', '06:30', area_deporte, 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800'),
  ('Clase Masiva de Yoga', 'Sesión de yoga al aire libre para principiantes y practicantes avanzados.', 'Jardín Botánico Universidad', CURRENT_DATE + INTERVAL '42 days', '07:00', area_deporte, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
  ('Torneo de Ajedrez', 'Competencia de ajedrez con categorías para principiantes y avanzados.', 'Biblioteca Central - Sala de Juegos', CURRENT_DATE + INTERVAL '48 days', '10:00', area_deporte, 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800');

END $$;

-- PASO 9: Insertar suscriptores de ejemplo
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
  ('andres.morales@universidad.edu', 'Andrés Morales', true)
ON CONFLICT (email) DO NOTHING;

-- PASO 10: Insertar datos de ejemplo para analytics
-- Vistas de eventos (simuladas)
DO $$
DECLARE
  evento_record RECORD;
  i INT;
BEGIN
  FOR evento_record IN SELECT id FROM eventos LOOP
    FOR i IN 1..floor(random() * 50 + 10)::int LOOP
      INSERT INTO evento_vistas (evento_id, visitor_id, created_at)
      VALUES (
        evento_record.id,
        'visitor_' || floor(random() * 1000)::text,
        NOW() - (random() * INTERVAL '30 days')
      );
    END LOOP;
  END LOOP;
END $$;

-- Inscripciones de ejemplo
DO $$
DECLARE
  evento_record RECORD;
  nombres TEXT[] := ARRAY['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Diego', 'Sofía', 'Andrés', 'Valentina', 'Luis', 'Carmen', 'Roberto', 'Patricia', 'Miguel'];
  apellidos TEXT[] := ARRAY['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres'];
  i INT;
  nombre_completo TEXT;
  email_gen TEXT;
BEGIN
  FOR evento_record IN SELECT id FROM eventos LOOP
    FOR i IN 1..floor(random() * 15 + 5)::int LOOP
      nombre_completo := nombres[floor(random() * array_length(nombres, 1) + 1)::int] || ' ' || apellidos[floor(random() * array_length(apellidos, 1) + 1)::int];
      email_gen := lower(replace(nombre_completo, ' ', '.')) || floor(random() * 100)::text || '@universidad.edu';
      BEGIN
        INSERT INTO evento_inscripciones (evento_id, nombre, email, telefono, created_at)
        VALUES (
          evento_record.id,
          nombre_completo,
          email_gen,
          '+57 3' || floor(random() * 100000000 + 100000000)::text,
          NOW() - (random() * INTERVAL '20 days')
        );
      EXCEPTION WHEN unique_violation THEN
        -- Ignorar duplicados
        NULL;
      END;
    END LOOP;
  END LOOP;
END $$;

-- PASO 11: Crear vista para estadísticas de eventos
CREATE OR REPLACE VIEW evento_estadisticas AS
SELECT 
  e.id,
  e.nombre,
  e.fecha,
  a.nombre as area_nombre,
  a.color as area_color,
  COUNT(DISTINCT ev.id) as total_vistas,
  COUNT(DISTINCT ev.visitor_id) as vistas_unicas,
  COUNT(DISTINCT ei.id) as total_inscripciones
FROM eventos e
LEFT JOIN areas a ON e.area_id = a.id
LEFT JOIN evento_vistas ev ON e.id = ev.evento_id
LEFT JOIN evento_inscripciones ei ON e.id = ei.evento_id
GROUP BY e.id, e.nombre, e.fecha, a.nombre, a.color;
