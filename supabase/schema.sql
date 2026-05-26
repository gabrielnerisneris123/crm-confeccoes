-- ================================================
-- CRM CONFECÇÕES — SCHEMA SUPABASE
-- Execute este arquivo no SQL Editor do Supabase
-- ================================================

-- Tabela de perfis de usuários (estende auth.users)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id TEXT DEFAULT '1',
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cargo TEXT NOT NULL DEFAULT 'vendedor'
    CHECK (cargo IN ('admin', 'vendedor', 'producao', 'financeiro')),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: cria perfil automaticamente após novo usuário no Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, cargo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'cargo', 'vendedor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id TEXT DEFAULT '1',
  nome TEXT NOT NULL,
  telefone TEXT,
  whatsapp TEXT,
  email TEXT,
  instagram TEXT,
  empresa_nome TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  endereco TEXT,
  observacoes TEXT,
  tag TEXT,
  ativo BOOLEAN DEFAULT true,
  total_pedidos INT DEFAULT 0,
  valor_total_gasto NUMERIC(10,2) DEFAULT 0,
  ultimo_pedido TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  empresa_id TEXT DEFAULT '1',
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  criado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'novo',
  prioridade TEXT NOT NULL DEFAULT 'normal',
  data_pedido TIMESTAMPTZ DEFAULT NOW(),
  data_prazo TIMESTAMPTZ NOT NULL,
  data_entrega TIMESTAMPTZ,
  valor_total NUMERIC(10,2) DEFAULT 0,
  valor_desconto NUMERIC(10,2) DEFAULT 0,
  valor_final NUMERIC(10,2) DEFAULT 0,
  forma_pagamento TEXT,
  status_pagamento TEXT DEFAULT 'pendente',
  valor_pago NUMERIC(10,2) DEFAULT 0,
  tipo_entrega TEXT,
  observacoes TEXT,
  observacoes_internas TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Itens do pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  modelo TEXT,
  cor TEXT,
  tipo_estampa TEXT,
  posicao_estampa TEXT,
  num_cores INT,
  qtd_pp INT DEFAULT 0,
  qtd_p INT DEFAULT 0,
  qtd_m INT DEFAULT 0,
  qtd_g INT DEFAULT 0,
  qtd_gg INT DEFAULT 0,
  qtd_xgg INT DEFAULT 0,
  qtd_total INT DEFAULT 0,
  valor_unitario NUMERIC(10,2) DEFAULT 0,
  valor_total NUMERIC(10,2) DEFAULT 0,
  observacoes TEXT
);

-- Timeline do pedido
CREATE TABLE IF NOT EXISTS pedido_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  status_anterior TEXT,
  status_novo TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  empresa_id TEXT DEFAULT '1',
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  criado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'rascunho',
  validade_dias INT DEFAULT 15,
  data_validade TIMESTAMPTZ,
  valor_total NUMERIC(10,2) DEFAULT 0,
  desconto NUMERIC(10,2) DEFAULT 0,
  valor_final NUMERIC(10,2) DEFAULT 0,
  observacoes TEXT,
  convertido_pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Itens do orçamento
CREATE TABLE IF NOT EXISTS orcamento_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  modelo TEXT,
  tipo_estampa TEXT,
  quantidade INT DEFAULT 0,
  valor_unitario NUMERIC(10,2) DEFAULT 0,
  valor_total NUMERIC(10,2) DEFAULT 0
);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_itens ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário autenticado tem acesso total (controle de acesso feito no frontend)
CREATE POLICY "usuarios_autenticados" ON usuarios
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "autenticados_clientes" ON clientes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "autenticados_pedidos" ON pedidos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "autenticados_pedido_itens" ON pedido_itens
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "autenticados_pedido_timeline" ON pedido_timeline
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "autenticados_orcamentos" ON orcamentos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "autenticados_orcamento_itens" ON orcamento_itens
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ================================================
-- USUÁRIO ADMIN INICIAL
-- Após rodar o schema, crie um usuário em:
-- Supabase Dashboard > Authentication > Users > Add user
-- Depois atualize o cargo para 'admin':
-- UPDATE usuarios SET cargo = 'admin' WHERE email = 'seu@email.com';
-- ================================================
