-- =====================================================
-- AGREGAR SUSCRIPTORES ADICIONALES
-- =====================================================

INSERT INTO suscriptores (email, nombre, activo) VALUES
  ('alejandra.ruiz@universidad.edu', 'Alejandra Ruiz', true),
  ('fernando.castro@universidad.edu', 'Fernando Castro', true),
  ('valentina.mendez@universidad.edu', 'Valentina Méndez', true),
  ('sebastian.vargas@universidad.edu', 'Sebastián Vargas', true),
  ('camila.ortiz@universidad.edu', 'Camila Ortiz', true),
  ('nicolas.perez@universidad.edu', 'Nicolás Pérez', true),
  ('daniela.silva@universidad.edu', 'Daniela Silva', true),
  ('mateo.jimenez@universidad.edu', 'Mateo Jiménez', true),
  ('isabella.rojas@universidad.edu', 'Isabella Rojas', true),
  ('samuel.moreno@universidad.edu', 'Samuel Moreno', true),
  ('lucia.diaz@universidad.edu', 'Lucía Díaz', true),
  ('david.gutierrez@universidad.edu', 'David Gutiérrez', true),
  ('mariana.flores@universidad.edu', 'Mariana Flores', true),
  ('andres.reyes@universidad.edu', 'Andrés Reyes', true),
  ('paula.navarro@universidad.edu', 'Paula Navarro', true),
  ('julian.romero@universidad.edu', 'Julián Romero', true),
  ('carolina.aguilar@universidad.edu', 'Carolina Aguilar', true),
  ('miguel.herrera@universidad.edu', 'Miguel Herrera', true),
  ('gabriela.medina@universidad.edu', 'Gabriela Medina', true),
  ('ricardo.paredes@universidad.edu', 'Ricardo Paredes', true),
  ('natalia.vega@universidad.edu', 'Natalia Vega', true),
  ('jorge.salazar@universidad.edu', 'Jorge Salazar', true),
  ('adriana.cruz@universidad.edu', 'Adriana Cruz', true),
  ('luis.torres@universidad.edu', 'Luis Torres', true),
  ('monica.ramos@universidad.edu', 'Mónica Ramos', true)
ON CONFLICT (email) DO NOTHING;

-- Verificar total de suscriptores
SELECT COUNT(*) as total_suscriptores FROM suscriptores;