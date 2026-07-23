-- ============================================================
-- SEED DATA para FashionCRM / BarberPro
-- Ejecutar en Supabase SQL Editor después de la migración
-- ============================================================

-- Limpiar datos existentes (en este orden por las FK)
TRUNCATE TABLE visitas CASCADE;
TRUNCATE TABLE clientes CASCADE;
TRUNCATE TABLE servicios CASCADE;

-- ─── Servicios ──────────────────────────────────────────────
INSERT INTO servicios (nombre, precio) VALUES
  ('Corte', 8.00),
  ('Barba', 5.00),
  ('Cejas', 3.00),
  ('Combo', 12.00);

-- ─── Clientes (con UUIDs deterministas) ─────────────────────
INSERT INTO clientes (id, cedula, nombre, telefono, fecha_nacimiento, notas_pref) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'PE-1234567', 'Carlos Mendoza',   '+50760001111', '1990-03-15', 'Le gusta el degradado alto'),
  ('a0000000-0000-4000-8000-000000000002', 'PE-2345678', 'Luis Rivera',      '+50760002222', '1985-07-22', 'Prefiere barba completa'),
  ('a0000000-0000-4000-8000-000000000003', 'PE-3456789', 'Pedro Castillo',   '+50760003333', '1993-11-08', NULL),
  ('a0000000-0000-4000-8000-000000000004', 'PE-4567890', 'Jorge Herrera',    '+50760004444', '1988-01-05', 'Corte fade medio'),
  ('a0000000-0000-4000-8000-000000000005', 'PE-5678901', 'Miguel Torres',    '+50760005555', '1995-07-22', 'Usa pomade'),
  ('a0000000-0000-4000-8000-000000000006', 'PE-6789012', 'Anaís De León',    '+50760006666', '1998-07-25', 'Cejas con diseño'),
  ('a0000000-0000-4000-8000-000000000007', 'PE-7890123', 'Roberto Quintero', '+50760007777', '1992-07-21', NULL),
  ('a0000000-0000-4000-8000-000000000008', 'PE-8901234', 'David Samudio',    '+50760008888', '1991-09-12', 'Siempre combo'),
  ('a0000000-0000-4000-8000-000000000009', 'PE-9012345', 'José Icaza',       '+50760009999', '1987-04-18', NULL),
  ('a0000000-0000-4000-8000-00000000000a', 'PE-0123456', 'Santiago Poveda', '+50760001010', '1994-06-30', 'Corte + Barba cada 3 semanas'),
  ('a0000000-0000-4000-8000-00000000000b', 'PP-1234567', 'Fernando Arosemena', '+50760002020', '1986-12-25', NULL),
  ('a0000000-0000-4000-8000-00000000000c', 'PP-2345678', 'Ricardo De La Espriella', '+50760003030', '1996-02-14', 'Solo corte, sin barba'),
  ('a0000000-0000-4000-8000-00000000000d', 'PP-3456789', 'Alonso Pérez',    '+50760004040', '1993-08-08', 'Corte escolar para su hijo a veces'),
  ('a0000000-0000-4000-8000-00000000000e', 'PP-4567890', 'Kevin Morrison',  '+50760005050', NULL, 'Primera vez'),
  ('a0000000-0000-4000-8000-00000000000f', 'PP-5678901', 'Diego Villarreal', '+50760006060', '1999-10-10', NULL);

-- ─── Visitas (usar los mismos UUIDs de clientes como cliente_id) ──
-- c1
INSERT INTO visitas (cliente_id, fecha, servicio, precio) VALUES
  ('a0000000-0000-4000-8000-000000000001', NOW() - interval '90 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000001', NOW() - interval '70 days', 'Combo', 12),
  ('a0000000-0000-4000-8000-000000000001', NOW() - interval '48 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000001', NOW() - interval '45 days', 'Corte', 10);
-- c2
INSERT INTO visitas (cliente_id, fecha, servicio, precio) VALUES
  ('a0000000-0000-4000-8000-000000000002', NOW() - interval '120 days', 'Barba', 5),
  ('a0000000-0000-4000-8000-000000000002', NOW() - interval '105 days', 'Combo', 12),
  ('a0000000-0000-4000-8000-000000000002', NOW() - interval '90 days', 'Barba', 5),
  ('a0000000-0000-4000-8000-000000000002', NOW() - interval '75 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000002', NOW() - interval '60 days', 'Combo', 14),
  ('a0000000-0000-4000-8000-000000000002', NOW() - interval '45 days', 'Barba', 5),
  ('a0000000-0000-4000-8000-000000000002', NOW() - interval '30 days', 'Barba', 5);
-- c3
INSERT INTO visitas (cliente_id, fecha, servicio, precio) VALUES
  ('a0000000-0000-4000-8000-000000000003', NOW() - interval '180 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000003', NOW() - interval '150 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000003', NOW() - interval '120 days', 'Combo', 12),
  ('a0000000-0000-4000-8000-000000000003', NOW() - interval '90 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000003', NOW() - interval '60 days', 'Corte', 10);
-- c4
INSERT INTO visitas (cliente_id, fecha, servicio, precio) VALUES
  ('a0000000-0000-4000-8000-000000000004', NOW() - interval '130 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000004', NOW() - interval '110 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000004', NOW() - interval '88 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000004', NOW() - interval '65 days', 'Combo', 12),
  ('a0000000-0000-4000-8000-000000000004', NOW() - interval '40 days', 'Corte', 8);
-- c5
INSERT INTO visitas (cliente_id, fecha, servicio, precio) VALUES
  ('a0000000-0000-4000-8000-000000000005', NOW() - interval '100 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000005', NOW() - interval '75 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000005', NOW() - interval '50 days', 'Corte', 10),
  ('a0000000-0000-4000-8000-000000000005', NOW() - interval '25 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000005', NOW() - interval '10 days', 'Corte', 8);
-- c6
INSERT INTO visitas (cliente_id, fecha, servicio, precio) VALUES
  ('a0000000-0000-4000-8000-000000000006', NOW() - interval '80 days', 'Cejas', 3),
  ('a0000000-0000-4000-8000-000000000006', NOW() - interval '60 days', 'Cejas', 5),
  ('a0000000-0000-4000-8000-000000000006', NOW() - interval '40 days', 'Cejas', 3),
  ('a0000000-0000-4000-8000-000000000006', NOW() - interval '15 days', 'Cejas', 3);
-- c7
INSERT INTO visitas (cliente_id, fecha, servicio, precio) VALUES
  ('a0000000-0000-4000-8000-000000000007', NOW() - interval '110 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000007', NOW() - interval '85 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000007', NOW() - interval '60 days', 'Combo', 12),
  ('a0000000-0000-4000-8000-000000000007', NOW() - interval '35 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000007', NOW() - interval '7 days', 'Corte', 8);
-- c8
INSERT INTO visitas (cliente_id, fecha, servicio, precio) VALUES
  ('a0000000-0000-4000-8000-000000000008', NOW() - interval '150 days', 'Combo', 12),
  ('a0000000-0000-4000-8000-000000000008', NOW() - interval '130 days', 'Combo', 14),
  ('a0000000-0000-4000-8000-000000000008', NOW() - interval '110 days', 'Combo', 12),
  ('a0000000-0000-4000-8000-000000000008', NOW() - interval '90 days', 'Combo', 12),
  ('a0000000-0000-4000-8000-000000000008', NOW() - interval '70 days', 'Combo', 16),
  ('a0000000-0000-4000-8000-000000000008', NOW() - interval '50 days', 'Combo', 12),
  ('a0000000-0000-4000-8000-000000000008', NOW() - interval '30 days', 'Combo', 12),
  ('a0000000-0000-4000-8000-000000000008', NOW() - interval '10 days', 'Combo', 12);
-- c9
INSERT INTO visitas (cliente_id, fecha, servicio, precio) VALUES
  ('a0000000-0000-4000-8000-000000000009', NOW() - interval '140 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000009', NOW() - interval '115 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000009', NOW() - interval '95 days', 'Corte', 10),
  ('a0000000-0000-4000-8000-000000000009', NOW() - interval '70 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000009', NOW() - interval '50 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000009', NOW() - interval '28 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-000000000009', NOW() - interval '12 days', 'Corte', 10);
-- c10
INSERT INTO visitas (cliente_id, fecha, servicio, precio) VALUES
  ('a0000000-0000-4000-8000-00000000000a', NOW() - interval '130 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-00000000000a', NOW() - interval '110 days', 'Barba', 5),
  ('a0000000-0000-4000-8000-00000000000a', NOW() - interval '90 days', 'Combo', 12),
  ('a0000000-0000-4000-8000-00000000000a', NOW() - interval '70 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-00000000000a', NOW() - interval '50 days', 'Barba', 5),
  ('a0000000-0000-4000-8000-00000000000a', NOW() - interval '30 days', 'Combo', 14),
  ('a0000000-0000-4000-8000-00000000000a', NOW() - interval '14 days', 'Corte', 8);
-- c11
INSERT INTO visitas (cliente_id, fecha, servicio, precio) VALUES
  ('a0000000-0000-4000-8000-00000000000b', NOW() - interval '160 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-00000000000b', NOW() - interval '140 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-00000000000b', NOW() - interval '120 days', 'Barba', 5),
  ('a0000000-0000-4000-8000-00000000000b', NOW() - interval '100 days', 'Corte', 10),
  ('a0000000-0000-4000-8000-00000000000b', NOW() - interval '80 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-00000000000b', NOW() - interval '60 days', 'Combo', 12),
  ('a0000000-0000-4000-8000-00000000000b', NOW() - interval '40 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-00000000000b', NOW() - interval '20 days', 'Corte', 8);
-- c12
INSERT INTO visitas (cliente_id, fecha, servicio, precio) VALUES
  ('a0000000-0000-4000-8000-00000000000c', NOW() - interval '120 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-00000000000c', NOW() - interval '100 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-00000000000c', NOW() - interval '80 days', 'Corte', 10),
  ('a0000000-0000-4000-8000-00000000000c', NOW() - interval '60 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-00000000000c', NOW() - interval '40 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-00000000000c', NOW() - interval '18 days', 'Corte', 8);
-- c13
INSERT INTO visitas (cliente_id, fecha, servicio, precio) VALUES
  ('a0000000-0000-4000-8000-00000000000d', NOW() - interval '100 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-00000000000d', NOW() - interval '80 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-00000000000d', NOW() - interval '60 days', 'Combo', 12),
  ('a0000000-0000-4000-8000-00000000000d', NOW() - interval '35 days', 'Corte', 8),
  ('a0000000-0000-4000-8000-00000000000d', NOW() - interval '15 days', 'Corte', 8);
-- c14 (1 visita)
INSERT INTO visitas (cliente_id, fecha, servicio, precio) VALUES
  ('a0000000-0000-4000-8000-00000000000e', NOW() - interval '5 days', 'Corte', 8);

-- ============================================================
-- FIN DEL SEED
-- ============================================================
