-- Migración inicial: esquema para FashionCRM / BarberPro
-- Ejecutar cuando se migre de datos mock a Supabase

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cedula TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  fecha_nacimiento DATE,
  notas_pref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de servicios
CREATE TABLE IF NOT EXISTS servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  precio NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de visitas
CREATE TABLE IF NOT EXISTS visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  servicio TEXT NOT NULL,
  precio NUMERIC(10,2) NOT NULL,
  grupo_id TEXT, -- para agrupar visitas múltiples en una misma sesión
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_visitas_cliente_id ON visitas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON visitas(fecha);
CREATE INDEX IF NOT EXISTS idx_visitas_grupo_id ON visitas(grupo_id);
CREATE INDEX IF NOT EXISTS idx_clientes_cedula ON clientes(cedula);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security: policies para anon (demo sin auth)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

-- Policies para clientes
CREATE POLICY "anon_select_clientes" ON clientes FOR SELECT USING (true);
CREATE POLICY "anon_insert_clientes" ON clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_clientes" ON clientes FOR UPDATE USING (true);

-- Policies para visitas
CREATE POLICY "anon_select_visitas" ON visitas FOR SELECT USING (true);
CREATE POLICY "anon_insert_visitas" ON visitas FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_visitas" ON visitas FOR UPDATE USING (true);
CREATE POLICY "anon_delete_visitas" ON visitas FOR DELETE USING (true);

-- Policies para servicios
CREATE POLICY "anon_select_servicios" ON servicios FOR SELECT USING (true);
CREATE POLICY "anon_insert_servicios" ON servicios FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_servicios" ON servicios FOR UPDATE USING (true);
CREATE POLICY "anon_delete_servicios" ON servicios FOR DELETE USING (true);
