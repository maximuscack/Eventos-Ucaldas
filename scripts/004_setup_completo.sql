-- =====================================================
-- SCRIPT 004: CONFIGURACIÓN COMPLETA DEL SISTEMA
-- Ejecutar en Supabase SQL Editor como postgres/service_role
-- =====================================================

-- ===========================
-- PASO 1: ELIMINAR POLÍTICAS ANTIGUAS CON RESTRICCIÓN DE ROL
-- ===========================
DROP POLICY IF EXISTS "areas_insert_admin" ON areas;
DROP POLICY IF EXISTS "areas_update_admin" ON areas;
DROP POLICY IF EXISTS "areas_delete_admin" ON areas;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;
DROP POLICY IF EXISTS "suscriptores_update_admin" ON suscriptores;
DROP POLICY IF EXISTS "suscriptores_delete_admin" ON suscriptores;

-- ===========================
-- PASO 2: CREAR NUEVAS POLÍTICAS SIN RESTRICCIÓN DE ROL
-- Cualquier usuario autenticado puede hacer todo
-- ===========================
CREATE POLICY IF NOT EXISTS "areas_insert_auth" ON areas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "areas_update_auth" ON areas FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "areas_delete_auth" ON areas FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "profiles_select_auth" ON profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "profiles_insert_auth" ON profiles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "profiles_update_auth" ON profiles FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "profiles_delete_auth" ON profiles FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "suscriptores_update_auth" ON suscriptores FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "suscriptores_delete_auth" ON suscriptores FOR DELETE USING (auth.uid() IS NOT NULL);

-- ===========================
-- PASO 3: MODIFICAR TABLA PROFILES - QUITAR ROL OBLIGATORIO
-- ===========================
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_rol_check;
ALTER TABLE profiles ALTER COLUMN rol DROP NOT NULL;

-- ===========================
-- PASO 4: CREAR TABLA DE VISTAS DE EVENTOS (ANALYTICS)
-- ===========================
CREATE TABLE IF NOT EXISTS evento_vistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  visitor_id TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evento_vistas_evento ON evento_vistas(evento_id);
CREATE INDEX IF NOT EXISTS idx_evento_vistas_fecha ON evento_vistas(created_at);

ALTER TABLE evento_vistas ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "vistas_insert_public" ON evento_vistas FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "vistas_select_auth" ON evento_vistas FOR SELECT USING (auth.uid() IS NOT NULL);

-- ===========================
-- PASO 5: CREAR TABLA DE INSCRIPCIONES A EVENTOS
-- ===========================
CREATE TABLE IF NOT EXISTS evento_inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evento_id, email)
);

CREATE INDEX IF NOT EXISTS idx_evento_inscripciones_evento ON evento_inscripciones(evento_id);

ALTER TABLE evento_inscripciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "inscripciones_insert_public" ON evento_inscripciones FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "inscripciones_select_auth" ON evento_inscripciones FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "inscripciones_delete_auth" ON evento_inscripciones FOR DELETE USING (auth.uid() IS NOT NULL);

-- ===========================
-- PASO 6: LIMPIAR ÁREAS ANTERIORES E INSERTAR LAS 5 CORRECTAS
-- ===========================
DELETE FROM areas;

INSERT INTO areas (nombre, color) VALUES
  ('Expresiones culturales y artísticas', '#E94E77'),
  ('Promoción socioeconómica', '#4A90E2'),
  ('Desarrollo humano y convivencia universitaria', '#F5A623'),
  ('Prevención y promoción de la salud', '#50C878'),
  ('Fomento de la actividad física, el deporte y la recreación', '#9B59B6');

-- ===========================
-- PASO 7: LIMPIAR EVENTOS E INSERTAR EJEMPLOS (2-4 POR ÁREA)
-- ===========================
DELETE FROM eventos;

-- Eventos para: Expresiones culturales y artísticas
INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Festival de Danza Contemporánea',
  'Presentación de grupos de danza contemporánea con coreografías innovadoras que fusionan técnicas modernas y tradicionales. Participan 8 grupos universitarios.',
  'Auditorio Principal Universidad',
  CURRENT_DATE + INTERVAL '15 days',
  '18:00',
  id,
  'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800'
FROM areas WHERE nombre = 'Expresiones culturales y artísticas';

INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Exposición de Arte Universitario',
  'Muestra colectiva de obras de estudiantes de artes plásticas. Incluye pintura, escultura, fotografía y arte digital.',
  'Galería de Arte Campus Norte',
  CURRENT_DATE + INTERVAL '25 days',
  '10:00',
  id,
  'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800'
FROM areas WHERE nombre = 'Expresiones culturales y artísticas';

INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Concierto de Música Clásica',
  'La orquesta sinfónica universitaria presenta obras de Beethoven, Mozart y compositores latinoamericanos.',
  'Teatro Universitario',
  CURRENT_DATE + INTERVAL '30 days',
  '19:30',
  id,
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800'
FROM areas WHERE nombre = 'Expresiones culturales y artísticas';

INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Noche de Teatro Experimental',
  'Obras cortas de teatro experimental creadas y dirigidas por estudiantes del programa de artes escénicas.',
  'Sala de Teatro Campus Central',
  CURRENT_DATE + INTERVAL '45 days',
  '20:00',
  id,
  'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800'
FROM areas WHERE nombre = 'Expresiones culturales y artísticas';

-- Eventos para: Promoción socioeconómica
INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Feria de Emprendimiento Universitario',
  'Exposición de más de 50 proyectos de emprendimiento estudiantil. Oportunidad de networking con inversionistas.',
  'Plaza Central Universidad',
  CURRENT_DATE + INTERVAL '20 days',
  '09:00',
  id,
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800'
FROM areas WHERE nombre = 'Promoción socioeconómica';

INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Taller de Finanzas Personales',
  'Aprende a manejar tu dinero, crear presupuestos y planificar tu futuro financiero. Incluye material didáctico.',
  'Aula Magna Edificio B',
  CURRENT_DATE + INTERVAL '35 days',
  '14:00',
  id,
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800'
FROM areas WHERE nombre = 'Promoción socioeconómica';

INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Seminario de Empleabilidad',
  'Técnicas de entrevista, elaboración de CV y estrategias para conseguir tu primer empleo profesional.',
  'Centro de Convenciones',
  CURRENT_DATE + INTERVAL '50 days',
  '10:00',
  id,
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800'
FROM areas WHERE nombre = 'Promoción socioeconómica';

-- Eventos para: Desarrollo humano y convivencia universitaria
INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Semana de la Convivencia Universitaria',
  'Actividades de integración, talleres de comunicación y fortalecimiento del tejido social universitario.',
  'Áreas verdes Campus Principal',
  CURRENT_DATE + INTERVAL '10 days',
  '08:00',
  id,
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800'
FROM areas WHERE nombre = 'Desarrollo humano y convivencia universitaria';

INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Taller de Inteligencia Emocional',
  'Desarrolla habilidades para gestionar tus emociones, mejorar relaciones interpersonales y reducir el estrés.',
  'Sala de Conferencias Edificio A',
  CURRENT_DATE + INTERVAL '28 days',
  '15:00',
  id,
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800'
FROM areas WHERE nombre = 'Desarrollo humano y convivencia universitaria';

INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Jornada de Voluntariado Social',
  'Actividades de servicio social en comunidades cercanas. Transporte y refrigerio incluidos.',
  'Punto de encuentro: Entrada Principal',
  CURRENT_DATE + INTERVAL '40 days',
  '07:00',
  id,
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800'
FROM areas WHERE nombre = 'Desarrollo humano y convivencia universitaria';

-- Eventos para: Prevención y promoción de la salud
INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Jornada de Salud Mental',
  'Charlas y talleres sobre manejo del estrés, ansiedad y bienestar emocional. Atención psicológica gratuita.',
  'Centro de Bienestar Universitario',
  CURRENT_DATE + INTERVAL '12 days',
  '09:00',
  id,
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
FROM areas WHERE nombre = 'Prevención y promoción de la salud';

INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Campaña de Donación de Sangre',
  'Dona sangre y salva hasta 3 vidas. Requisitos: mayor de 18 años, peso mínimo 50kg, no estar en ayunas.',
  'Enfermería Campus Norte',
  CURRENT_DATE + INTERVAL '22 days',
  '08:00',
  id,
  'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800'
FROM areas WHERE nombre = 'Prevención y promoción de la salud';

INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Taller de Nutrición Saludable',
  'Aprende a preparar comidas nutritivas, económicas y deliciosas. Incluye degustación.',
  'Cafetería Central',
  CURRENT_DATE + INTERVAL '38 days',
  '12:00',
  id,
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800'
FROM areas WHERE nombre = 'Prevención y promoción de la salud';

INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Feria de Prevención de Enfermedades',
  'Exámenes médicos gratuitos, vacunación y charlas sobre prevención de enfermedades crónicas.',
  'Coliseo Universitario',
  CURRENT_DATE + INTERVAL '55 days',
  '08:00',
  id,
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800'
FROM areas WHERE nombre = 'Prevención y promoción de la salud';

-- Eventos para: Fomento de la actividad física, el deporte y la recreación
INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Torneo Interfacultades de Fútbol',
  'Competencia deportiva entre las 12 facultades. Fase de grupos y eliminación directa.',
  'Canchas de Fútbol Campus Sur',
  CURRENT_DATE + INTERVAL '18 days',
  '14:00',
  id,
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'
FROM areas WHERE nombre = 'Fomento de la actividad física, el deporte y la recreación';

INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Carrera 5K Universitaria',
  'Carrera atlética abierta a toda la comunidad universitaria. Inscripción gratuita, incluye camiseta y medalla.',
  'Pista de Atletismo',
  CURRENT_DATE + INTERVAL '32 days',
  '06:30',
  id,
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800'
FROM areas WHERE nombre = 'Fomento de la actividad física, el deporte y la recreación';

INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Clase Masiva de Yoga al Aire Libre',
  'Sesión de yoga para todos los niveles. Trae tu mat o tapete. Instructor certificado.',
  'Jardín Botánico Universidad',
  CURRENT_DATE + INTERVAL '42 days',
  '07:00',
  id,
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800'
FROM areas WHERE nombre = 'Fomento de la actividad física, el deporte y la recreación';

INSERT INTO eventos (nombre, descripcion, lugar, fecha, hora, area_id, imagen_url)
SELECT 
  'Torneo de Ajedrez Universitario',
  'Competencia para principiantes y avanzados. Modalidad suiza, 7 rondas. Premios para los 3 primeros lugares.',
  'Biblioteca Central - Sala de Lectura',
  CURRENT_DATE + INTERVAL '48 days',
  '10:00',
  id,
  'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800'
FROM areas WHERE nombre = 'Fomento de la actividad física, el deporte y la recreación';

-- ===========================
-- PASO 8: INSERTAR SUSCRIPTORES DE EJEMPLO
-- ===========================
DELETE FROM suscriptores;

INSERT INTO suscriptores (email, nombre, activo) VALUES
  ('maria.garcia@universidad.edu', 'María García López', true),
  ('carlos.rodriguez@universidad.edu', 'Carlos Rodríguez Pérez', true),
  ('ana.martinez@universidad.edu', 'Ana Martínez Silva', true),
  ('jose.lopez@universidad.edu', 'José López Hernández', true),
  ('laura.sanchez@universidad.edu', 'Laura Sánchez Torres', true),
  ('pedro.gonzalez@universidad.edu', 'Pedro González Ruiz', true),
  ('sofia.hernandez@universidad.edu', 'Sofía Hernández Díaz', true),
  ('diego.ramirez@universidad.edu', 'Diego Ramírez Castro', true),
  ('valentina.torres@universidad.edu', 'Valentina Torres Mora', true),
  ('andres.morales@universidad.edu', 'Andrés Morales Vargas', true),
  ('camila.castro@universidad.edu', 'Camila Castro Jiménez', true),
  ('sebastian.diaz@universidad.edu', 'Sebastián Díaz Ortiz', true),
  ('isabella.ortiz@universidad.edu', 'Isabella Ortiz Mendoza', true),
  ('mateo.mendoza@universidad.edu', 'Mateo Mendoza Rojas', true),
  ('emma.vargas@universidad.edu', 'Emma Vargas Guerrero', true);

-- ===========================
-- PASO 9: GENERAR DATOS DE VISTAS (ANALYTICS)
-- ===========================
DELETE FROM evento_vistas;

DO $$
DECLARE
  evento_record RECORD;
  i INT;
  dias_atras INT;
BEGIN
  FOR evento_record IN SELECT id FROM eventos LOOP
    -- Entre 20 y 80 vistas por evento
    FOR i IN 1..floor(random() * 60 + 20)::int LOOP
      dias_atras := floor(random() * 30)::int;
      INSERT INTO evento_vistas (evento_id, visitor_id, ip_hash, created_at)
      VALUES (
        evento_record.id, 
        'visitor_' || floor(random() * 500 + 1)::text,
        md5(random()::text),
        NOW() - (dias_atras || ' days')::interval - (floor(random() * 24) || ' hours')::interval
      );
    END LOOP;
  END LOOP;
END $$;

-- ===========================
-- PASO 10: GENERAR INSCRIPCIONES (ANALYTICS)
-- ===========================
DELETE FROM evento_inscripciones;

DO $$
DECLARE
  evento_record RECORD;
  nombres TEXT[] := ARRAY['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Diego', 'Sofía', 'Andrés', 'Valentina', 'Camila', 'Sebastián', 'Isabella', 'Mateo', 'Emma', 'Daniel', 'Paula', 'Luis', 'Gabriela', 'Fernando'];
  apellidos TEXT[] := ARRAY['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández', 'Pérez', 'Sánchez', 'Torres', 'Ramírez', 'Díaz', 'Morales', 'Castro', 'Ortiz', 'Vargas'];
  i INT;
  nombre_completo TEXT;
  email_gen TEXT;
  dias_atras INT;
BEGIN
  FOR evento_record IN SELECT id FROM eventos LOOP
    -- Entre 8 y 25 inscripciones por evento
    FOR i IN 1..floor(random() * 17 + 8)::int LOOP
      nombre_completo := nombres[floor(random() * array_length(nombres, 1) + 1)::int] || ' ' || 
                         apellidos[floor(random() * array_length(apellidos, 1) + 1)::int] || ' ' ||
                         apellidos[floor(random() * array_length(apellidos, 1) + 1)::int];
      email_gen := lower(replace(split_part(nombre_completo, ' ', 1) || '.' || split_part(nombre_completo, ' ', 2), ' ', '')) || 
                   floor(random() * 100)::text || '@universidad.edu';
      dias_atras := floor(random() * 20)::int;
      BEGIN
        INSERT INTO evento_inscripciones (evento_id, nombre, email, telefono, created_at)
        VALUES (
          evento_record.id, 
          nombre_completo, 
          email_gen,
          '+57 3' || floor(random() * 100000000 + 100000000)::text,
          NOW() - (dias_atras || ' days')::interval
        );
      EXCEPTION WHEN unique_violation THEN 
        -- Ignorar duplicados
        NULL;
      END;
    END LOOP;
  END LOOP;
END $$;

-- ===========================
-- PASO 11: CREAR VISTA PARA ESTADÍSTICAS
-- ===========================
DROP VIEW IF EXISTS evento_estadisticas;

CREATE VIEW evento_estadisticas AS
SELECT 
  e.id,
  e.nombre,
  e.fecha,
  e.lugar,
  a.nombre as area_nombre,
  a.color as area_color,
  COUNT(DISTINCT ev.id) as total_vistas,
  COUNT(DISTINCT ev.visitor_id) as vistas_unicas,
  COUNT(DISTINCT ei.id) as total_inscripciones
FROM eventos e
LEFT JOIN areas a ON e.area_id = a.id
LEFT JOIN evento_vistas ev ON e.id = ev.evento_id
LEFT JOIN evento_inscripciones ei ON e.id = ei.evento_id
GROUP BY e.id, e.nombre, e.fecha, e.lugar, a.nombre, a.color
ORDER BY e.fecha;

-- ===========================
-- FIN DEL SCRIPT
-- ===========================
-- Resumen de lo creado:
-- - 5 Áreas correctas
-- - 17 Eventos de ejemplo (3-4 por área)
-- - 15 Suscriptores
-- - Datos de vistas (analytics)
-- - Datos de inscripciones (analytics)
-- - Sin restricciones de rol - todos los usuarios pueden publicar
