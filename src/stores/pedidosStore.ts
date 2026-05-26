import { create } from 'zustand'
import { Pedido, StatusPedido, PedidoTimeline } from '@/types'
import { mockPedidos } from '@/lib/mock-data'
import {
  getPedidos, createPedidoDB, updatePedidoDB, deletePedidoDB,
  addTimelineEntryDB, gerarNumeroPedido,
} from '@/lib/supabase/queries'

type SB = Parameters<typeof getPedidos>[0]

interface PedidosState {
  pedidos: Pedido[]
  busca: string
  filtroStatus: string
  filtroPrioridade: string
  filtroCliente: string
  isLoading: boolean
  _inicializado: boolean

  setBusca: (v: string) => void
  setFiltroStatus: (v: string) => void
  setFiltroPrioridade: (v: string) => void
  setFiltroCliente: (v: string) => void

  inicializar: (supabase: SB) => Promise<void>

  adicionarPedido: (
    dados: Omit<Pedido, 'id' | 'numero' | 'criado_em' | 'atualizado_em'>,
    supabase?: SB,
    usuarioId?: string
  ) => Promise<Pedido>
  atualizarPedido: (id: string, dados: Partial<Pedido>, supabase?: SB) => void
  avancarStatus: (id: string, usuarioNome?: string, supabase?: SB, usuarioId?: string) => void
  removerPedido: (id: string, supabase?: SB) => void

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
  isLoading: false,
  _inicializado: false,

  setBusca: (busca) => set({ busca }),
  setFiltroStatus: (filtroStatus) => set({ filtroStatus }),
  setFiltroPrioridade: (filtroPrioridade) => set({ filtroPrioridade }),
  setFiltroCliente: (filtroCliente) => set({ filtroCliente }),

  inicializar: async (supabase) => {
    if (get()._inicializado) return
    set({ isLoading: true })
    try {
      const pedidos = await getPedidos(supabase)
      contadorPedidos = pedidos.length + 1
      set({ pedidos, isLoading: false, _inicializado: true })
    } catch (err) {
      console.error('[pedidosStore] Erro ao carregar:', err)
      set({ isLoading: false })
    }
  },

  adicionarPedido: async (dados, supabase?, usuarioId?) => {
    const numero = `PED-${new Date().getFullYear()}-${String(contadorPedidos++).padStart(3, '0')}`
    const id = `P${Date.now()}`
    const novoPedido: Pedido = {
      ...dados,
      id,
      numero,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      timeline: [{
        id: `tl-${Date.now()}`,
        pedido_id: id,
        tipo: 'status_change',
        descricao: 'Pedido criado',
        status_novo: dados.status,
        criado_em: new Date().toISOString(),
      }],
    }
    set((state) => ({ pedidos: [novoPedido, ...state.pedidos] }))

    if (supabase) {
      try {
        const numeroSupabase = await gerarNumeroPedido(supabase)
        const { itens, artes: _a, timeline: _tl, cliente: _cl, ...rest } = dados
        const pedidoSalvo = await createPedidoDB(supabase, rest, itens ?? [], numeroSupabase, usuarioId)
        // Substituir temporário pelo salvo
        set((state) => ({
          pedidos: state.pedidos.map((p) => (p.id === id ? pedidoSalvo : p)),
        }))
        return pedidoSalvo
      } catch (err) {
        console.error('[pedidosStore] Erro ao salvar pedido:', err)
      }
    }
    return novoPedido
  },

  atualizarPedido: (id, dados, supabase?) => {
    set((state) => ({
      pedidos: state.pedidos.map((p) =>
        p.id === id ? { ...p, ...dados, atualizado_em: new Date().toISOString() } : p
      ),
    }))
    if (supabase) {
      updatePedidoDB(supabase, id, dados).catch((err) =>
        console.error('[pedidosStore] Erro ao atualizar pedido:', err)
      )
    }
  },

  avancarStatus: (id, usuarioNome = 'Sistema', supabase?, usuarioId?) => {
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

    if (supabase) {
      updatePedidoDB(supabase, id, { status: novoStatus }).catch(console.error)
      addTimelineEntryDB(supabase, {
        pedido_id: id,
        usuario_id: usuarioId,
        tipo: 'status_change',
        descricao: entrada.descricao,
        status_anterior: pedido.status,
        status_novo: novoStatus,
        criado_em: entrada.criado_em,
      }).catch(console.error)
    }
  },

  removerPedido: (id, supabase?) => {
    set((state) => ({ pedidos: state.pedidos.filter((p) => p.id !== id) }))
    if (supabase) {
      deletePedidoDB(supabase, id).catch((err) =>
        console.error('[pedidosStore] Erro ao remover pedido:', err)
      )
    }
  },

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
