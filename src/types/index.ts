// ============================================
// TIPOS GLOBAIS DO SISTEMA CRM CONFECÇÕES
// ============================================

export type StatusPedido =
  | 'novo'
  | 'aguardando_aprovacao'
  | 'aprovado'
  | 'separacao'
  | 'impressao_dtf'
  | 'estamparia'
  | 'revisao'
  | 'embalagem'
  | 'pronto'
  | 'entregue'
  | 'cancelado'

export type PrioridadePedido = 'urgente' | 'alta' | 'normal' | 'baixa'

export type StatusPagamento = 'pendente' | 'parcial' | 'pago' | 'cancelado'

export type TipoEstampa =
  | 'DTF'
  | 'silk_screen'
  | 'bordado'
  | 'sublimacao'
  | 'transfer'
  | 'laser'
  | 'outro'

export type CargoUsuario = 'admin' | 'vendedor' | 'producao' | 'arte' | 'financeiro'

export type TagCliente = 'vip' | 'recorrente' | 'novo' | 'inativo'

// ============================================
// EMPRESA
// ============================================
export interface Empresa {
  id: string
  nome: string
  slug: string
  plano: 'basic' | 'pro' | 'enterprise'
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

// ============================================
// USUÁRIO
// ============================================
export interface Usuario {
  id: string
  empresa_id: string
  nome: string
  email: string
  telefone?: string
  cargo: CargoUsuario
  avatar_url?: string
  ativo: boolean
  criado_em: string
}

// ============================================
// CLIENTE
// ============================================
export interface Cliente {
  id: string
  empresa_id: string
  nome: string
  telefone?: string
  whatsapp?: string
  email?: string
  empresa_nome?: string
  instagram?: string
  cidade?: string
  estado?: string
  cep?: string
  endereco?: string
  observacoes?: string
  tag?: TagCliente
  ativo: boolean
  criado_em: string
  atualizado_em: string
  // Calculados / Relacionamentos
  total_pedidos?: number
  valor_total_gasto?: number
  ultimo_pedido?: string
}

// ============================================
// PEDIDO
// ============================================
export interface Pedido {
  id: string
  numero: string
  empresa_id: string
  cliente_id: string
  cliente?: Cliente
  criado_por?: string
  usuario_criador?: Usuario
  status: StatusPedido
  prioridade: PrioridadePedido
  data_pedido: string
  data_prazo: string
  data_entrega?: string
  valor_total: number
  valor_desconto: number
  valor_final: number
  forma_pagamento?: string
  status_pagamento: StatusPagamento
  valor_pago: number
  tipo_entrega?: 'retirada' | 'entrega' | 'correios'
  observacoes?: string
  observacoes_internas?: string
  criado_em: string
  atualizado_em: string
  // Relacionamentos
  itens?: PedidoItem[]
  artes?: PedidoArte[]
  timeline?: PedidoTimeline[]
}

// ============================================
// ITEM DO PEDIDO
// ============================================
export interface PedidoItem {
  id: string
  pedido_id: string
  descricao: string
  modelo?: string
  cor?: string
  tipo_estampa?: TipoEstampa
  posicao_estampa?: string
  num_cores?: number
  qtd_pp: number
  qtd_p: number
  qtd_m: number
  qtd_g: number
  qtd_gg: number
  qtd_xgg: number
  qtd_total?: number
  valor_unitario: number
  valor_total: number
  observacoes?: string
}

// ============================================
// ARTE / ARQUIVO
// ============================================
export interface PedidoArte {
  id: string
  pedido_id: string
  item_id?: string
  nome: string
  tipo: 'arte_final' | 'mockup' | 'referencia' | 'aprovacao'
  url: string
  public_id?: string
  formato?: string
  tamanho_bytes?: number
  aprovado: boolean
  aprovado_em?: string
  criado_em: string
}

// ============================================
// TIMELINE DO PEDIDO
// ============================================
export interface PedidoTimeline {
  id: string
  pedido_id: string
  usuario_id?: string
  usuario?: Usuario
  tipo: 'status_change' | 'comentario' | 'arquivo' | 'whatsapp' | 'pagamento'
  descricao: string
  status_anterior?: StatusPedido
  status_novo?: StatusPedido
  criado_em: string
}

// ============================================
// KANBAN
// ============================================
export interface KanbanColuna {
  id: string
  empresa_id: string
  nome: string
  ordem: number
  cor: string
  icone: string
  limite_cards: number
  pedidos?: Pedido[]
}

// ============================================
// ORÇAMENTO
// ============================================
export interface Orcamento {
  id: string
  numero: string
  empresa_id: string
  cliente_id: string
  cliente?: Cliente
  criado_por?: string
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'expirado'
  validade_dias: number
  data_validade?: string
  valor_total: number
  desconto: number
  valor_final: number
  observacoes?: string
  itens?: OrcamentoItem[]
  convertido_pedido_id?: string
  criado_em: string
  atualizado_em: string
}

export interface OrcamentoItem {
  descricao: string
  modelo?: string
  tipo_estampa?: TipoEstampa
  quantidade: number
  valor_unitario: number
  valor_total: number
}

// ============================================
// DASHBOARD / MÉTRICAS
// ============================================
export interface DashboardMetrics {
  pedidos_hoje: number
  pedidos_semana: number
  pedidos_atrasados: number
  entregas_hoje: number
  faturamento_mes: number
  faturamento_semana: number
  pedidos_em_andamento: number
  pedidos_concluidos_mes: number
  taxa_conclusao: number
  ticket_medio: number
}

export interface GraficoData {
  data: string
  pedidos: number
  faturamento: number
  concluidos: number
}

// ============================================
// CONFIGURAÇÕES DE STATUS
// ============================================
export const STATUS_CONFIG: Record<StatusPedido, {
  label: string
  cor: string
  bg: string
  icone: string
  ordem: number
}> = {
  novo: {
    label: 'Novo Pedido',
    cor: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-200',
    icone: '🆕',
    ordem: 1
  },
  aguardando_aprovacao: {
    label: 'Aguard. Aprovação',
    cor: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    icone: '⏳',
    ordem: 2
  },
  aprovado: {
    label: 'Aprovado',
    cor: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    icone: '✅',
    ordem: 3
  },
  separacao: {
    label: 'Separação',
    cor: 'text-cyan-600',
    bg: 'bg-cyan-50 border-cyan-200',
    icone: '📦',
    ordem: 4
  },
  impressao_dtf: {
    label: 'Impressão DTF',
    cor: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
    icone: '🖨️',
    ordem: 5
  },
  estamparia: {
    label: 'Estamparia',
    cor: 'text-pink-600',
    bg: 'bg-pink-50 border-pink-200',
    icone: '👕',
    ordem: 6
  },
  revisao: {
    label: 'Revisão',
    cor: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-200',
    icone: '🔍',
    ordem: 7
  },
  embalagem: {
    label: 'Embalagem',
    cor: 'text-teal-600',
    bg: 'bg-teal-50 border-teal-200',
    icone: '🎁',
    ordem: 8
  },
  pronto: {
    label: 'Pronto',
    cor: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    icone: '✨',
    ordem: 9
  },
  entregue: {
    label: 'Entregue',
    cor: 'text-gray-600',
    bg: 'bg-gray-50 border-gray-200',
    icone: '🚚',
    ordem: 10
  },
  cancelado: {
    label: 'Cancelado',
    cor: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    icone: '❌',
    ordem: 11
  },
}

export const PRIORIDADE_CONFIG: Record<PrioridadePedido, {
  label: string
  cor: string
  bg: string
}> = {
  urgente: { label: 'Urgente', cor: 'text-red-700', bg: 'bg-red-100 text-red-700' },
  alta: { label: 'Alta', cor: 'text-orange-700', bg: 'bg-orange-100 text-orange-700' },
  normal: { label: 'Normal', cor: 'text-blue-700', bg: 'bg-blue-100 text-blue-700' },
  baixa: { label: 'Baixa', cor: 'text-gray-600', bg: 'bg-gray-100 text-gray-600' },
}
