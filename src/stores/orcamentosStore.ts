import { create } from 'zustand'
import { Orcamento, OrcamentoItem } from '@/types'
import { mockClientes } from '@/lib/mock-data'

const mockOrcamentos: Orcamento[] = [
  {
    id: 'ORC-001',
    numero: 'ORC-2024-001',
    empresa_id: '1',
    cliente_id: '1',
    cliente: mockClientes[0],
    status: 'enviado',
    validade_dias: 7,
    data_validade: new Date(Date.now() + 5 * 86400000).toISOString(),
    valor_total: 1500,
    desconto: 100,
    valor_final: 1400,
    observacoes: 'Camisetas para evento da academia',
    itens: [
      { descricao: 'Camiseta Dry-Fit DTF', modelo: 'baby look', tipo_estampa: 'DTF', quantidade: 50, valor_unitario: 28, valor_total: 1400 },
      { descricao: 'Regata fitness', quantidade: 10, valor_unitario: 10, valor_total: 100 },
    ],
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'ORC-002',
    numero: 'ORC-2024-002',
    empresa_id: '1',
    cliente_id: '2',
    cliente: mockClientes[1],
    status: 'aprovado',
    validade_dias: 10,
    data_validade: new Date(Date.now() + 8 * 86400000).toISOString(),
    valor_total: 800,
    desconto: 0,
    valor_final: 800,
    itens: [
      { descricao: 'Polo com bordado', quantidade: 20, valor_unitario: 40, valor_total: 800 },
    ],
    convertido_pedido_id: 'P002',
    criado_em: new Date(Date.now() - 5 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'ORC-003',
    numero: 'ORC-2024-003',
    empresa_id: '1',
    cliente_id: '3',
    cliente: mockClientes[2],
    status: 'rascunho',
    validade_dias: 7,
    valor_total: 480,
    desconto: 0,
    valor_final: 480,
    itens: [
      { descricao: 'Camiseta silk screen', quantidade: 30, valor_unitario: 16, valor_total: 480 },
    ],
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
]

let contadorOrc = 4

interface OrcamentosState {
  orcamentos: Orcamento[]
  busca: string
  filtroStatus: string

  setBusca: (v: string) => void
  setFiltroStatus: (v: string) => void

  adicionarOrcamento: (dados: Omit<Orcamento, 'id' | 'numero' | 'criado_em' | 'atualizado_em'>) => Orcamento
  atualizarOrcamento: (id: string, dados: Partial<Orcamento>) => void
  removerOrcamento: (id: string) => void
  alterarStatus: (id: string, status: Orcamento['status']) => void

  getOrcamentoById: (id: string) => Orcamento | undefined
  getOrcamentosFiltrados: () => Orcamento[]
}

export const useOrcamentosStore = create<OrcamentosState>((set, get) => ({
  orcamentos: mockOrcamentos,
  busca: '',
  filtroStatus: '',

  setBusca: (busca) => set({ busca }),
  setFiltroStatus: (filtroStatus) => set({ filtroStatus }),

  adicionarOrcamento: (dados) => {
    const numero = `ORC-2024-${String(contadorOrc++).padStart(3, '0')}`
    const novo: Orcamento = {
      ...dados,
      id: `ORC-${Date.now()}`,
      numero,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    }
    set((s) => ({ orcamentos: [novo, ...s.orcamentos] }))
    return novo
  },

  atualizarOrcamento: (id, dados) =>
    set((s) => ({
      orcamentos: s.orcamentos.map((o) =>
        o.id === id ? { ...o, ...dados, atualizado_em: new Date().toISOString() } : o
      ),
    })),

  removerOrcamento: (id) =>
    set((s) => ({ orcamentos: s.orcamentos.filter((o) => o.id !== id) })),

  alterarStatus: (id, status) =>
    set((s) => ({
      orcamentos: s.orcamentos.map((o) =>
        o.id === id ? { ...o, status, atualizado_em: new Date().toISOString() } : o
      ),
    })),

  getOrcamentoById: (id) => get().orcamentos.find((o) => o.id === id),

  getOrcamentosFiltrados: () => {
    const { orcamentos, busca, filtroStatus } = get()
    return orcamentos.filter((o) => {
      const termo = busca.toLowerCase()
      const matchBusca =
        !busca ||
        o.numero.toLowerCase().includes(termo) ||
        (o.cliente?.nome.toLowerCase().includes(termo) ?? false)
      const matchStatus = !filtroStatus || o.status === filtroStatus
      return matchBusca && matchStatus
    })
  },
}))
