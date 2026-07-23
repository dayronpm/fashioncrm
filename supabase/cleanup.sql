-- ============================================================
-- LIMPIAR TODOS LOS DATOS (para producción)
-- Ejecutar en Supabase SQL Editor cuando termines el demo
-- y quieras empezar con datos reales.
--
-- Esto borra TODOS los datos pero mantiene la estructura
-- de tablas, índices y policies intactas.
-- ============================================================

TRUNCATE TABLE visitas CASCADE;
TRUNCATE TABLE clientes CASCADE;
TRUNCATE TABLE servicios CASCADE;

-- Después de ejecutar esto, inserta tus servicios reales:
--
-- INSERT INTO servicios (nombre, precio) VALUES
--   ('Corte', 8.00),
--   ('Barba', 5.00),
--   ('Cejas', 3.00),
--   ('Combo', 12.00);
--
-- Y ya puedes empezar a registrar clientes desde la app.
--
-- Para volver a los datos demo en cualquier momento,
-- ejecuta seed-demo.sql.
