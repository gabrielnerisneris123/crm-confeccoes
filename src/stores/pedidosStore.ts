import { create } from 'zustand'
import { Pedido, StatusPedido, PrioridadePedido, PedidoTimeline } from '@/types'
import { mockPedidos } from '@/lib/mock-data'

interface PedidosState {
  pedidos: Pedido[]
  busca: string
  filtroStatus: string
  filtroPrioridade: string
  filtroCliente: string

  setBusca: (v: string) => void
  setFiltroStatus: (v: string) => void
  setFiltroPrioridade: (v: string) => void
  setFiltroCliente: (v: string) => void

  adicionarPedido: (dados: Omit<Pedido, 'id' | 'numero' | 'criado_em' | 'atualizado_em'>) => Pedido
  atualizarPedido: (id: string, dados: Partial<Pedido>) => void
  avancarStatus: (id: string, usuarioNome?: string) => void
  removerPedido: (id: string) => void

  getPedidoById: (id: string) => Pedido | undefined
  getPedidosFiltrados: () => Pedido[]
}

const STATUS_ORDEM: StatusPedido[] = [
  'novo', 'aguardando_aprovacao', 'aprovado', 'separacao',
  'impressao_dtf', 'estamparia', 'revisao', 'embalagem',
  'pronto', 'entregue',
]

let contadorPedidos = 6

export const usePedidosStore = create<PedidosState>((set, get) => ({
  pedidos: mockPedidos,
  busca: '',
  filtroStatus: '',
  filtroPrioridade: '',
  filtroCliente: '',

  setBusca: (busca) => set({ busca }),
  setFiltroStatus: (filtroStatus) => set({ filtroStatus }),
  setFiltroPrioridade: (filtroPrioridade) => set({ filtroPrioridade }),
  setFiltroCliente: (filtroCliente) => set({ filtroCliente }),

  adicionarPedido: (dados) => {
    const numero = `PED-2024-${String(contadorPedidos++).padStart(3, '0')}`
    const novoPedido: Pedido = {
      ...dados,
      id: `P${Date.now()}`,
      numero,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      timeline: [{
        id: `tl-${Date.now()}`,
        pedido_id: `P${Date.now()}`,
        tipo: 'status_change',
        descricao: 'Pedido criado',
        status_novo: dados.status,
        criado_em: new Date().toISOString(),
      }],
    }
    set((state) => ({ pedidos: [novoPedido, ...state.pedidos] }))
    return novoPedido
  },

  atualizarPedido: (id, dados) =>
    set((state) => ({
      pedidos: state.pedidos.map((p) =>
        p.id === id ? { ...p, ...dados, atualizado_em: new Date().toISOString() } : p
      ),
    })),

  avancarStatus: (id, usuarioNome = 'Sistema') => {
    const pedido = get().getPedidoById(id)
    if (!pedido || pedido.status === 'entregue' || pedido.status === 'cancelado') return

    const idx = STATUS_ORDEM.indexOf(pedido.status)
    if (idx === -1 || idx >= STATUS_ORDEM.length - 1) return

    const novoStatus = STATUS_ORDEM[idx + 1]
    const entrada: PedidoTimeline = {
      id: `tl-${Date.now()}`,
      pedido_id: id,
      tipo: 'status_change',
      descricao: `Status avançado para "${novoStatus}"`,
      status_anterior: pedido.status,
      status_novo: novoStatus,
      criado_em: new Date().toISOString(),
    }

    set((state) => ({
      pedidos: state.pedidos.map((p) =>
        p.id === id
          ? {
              ...p,
              status: novoStatus,
              atualizado_em: new Date().toISOString(),
              data_entrega: novoStatus === 'entregue' ? new Date().toISOString() : p.data_entrega,
              timeline: [...(p.timeline ?? []), entrada],
            }
          : p
      ),
    }))
  },

  removerPedido: (id) =>
    set((state) => ({ pedidos: state.pedidos.filter((p) => p.id !== id) })),

  getPedidoById: (id) => get().pedidos.find((p) => p.id === id),

  getPedidosFiltrados: () => {
    const { pedidos, busca, filtroStatus, filtroPrioridade, filtroCliente } = get()
    return pedidos.filter((p) => {
      const termo = busca.toLowerCase()
      const matchBusca =
        !busca ||
        p.numero.toLowerCase().includes(termo) ||
        (p.cliente?.nome.toLowerCase().includes(termo) ?? false) ||
        (p.observacoes?.toLowerCase().includes(termo) ?? false)
      const matchStatus = !filtroStatus || p.status === filtroStatus
      const matchPrioridade = !filtroPrioridade || p.prioridade === filtroPrioridade
      const matchCliente = !filtroCliente || p.cliente_id === filtroCliente
      return matchBusca && matchStatus && matchPrioridade && matchCliente
    })
  },
}))
