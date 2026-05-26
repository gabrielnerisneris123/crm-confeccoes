import { create } from 'zustand'
import { Cliente } from '@/types'
import { mockClientes } from '@/lib/mock-data'
import {
  getClientes, createClienteDB, updateClienteDB, deleteClienteDB,
} from '@/lib/supabase/queries'

type SB = Parameters<typeof getClientes>[0]

interface ClientesState {
  clientes: Cliente[]
  busca: string
  filtroTag: string
  filtroEstado: string
  clienteSelecionado: Cliente | null
  isLoading: boolean
  _inicializado: boolean

  setBusca: (busca: string) => void
  setFiltroTag: (tag: string) => void
  setFiltroEstado: (estado: string) => void
  setClienteSelecionado: (cliente: Cliente | null) => void

  inicializar: (supabase: SB) => Promise<void>

  adicionarCliente: (dados: Omit<Cliente, 'id' | 'criado_em' | 'atualizado_em'>, supabase?: SB) => Promise<Cliente>
  atualizarCliente: (id: string, dados: Partial<Cliente>, supabase?: SB) => Promise<void>
  toggleAtivo: (id: string, supabase?: SB) => Promise<void>
  removerCliente: (id: string, supabase?: SB) => Promise<void>

  getClienteById: (id: string) => Cliente | undefined
  getClientesFiltrados: () => Cliente[]
}

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: mockClientes,
  busca: '',
  filtroTag: '',
  filtroEstado: '',
  clienteSelecionado: null,
  isLoading: false,
  _inicializado: false,

  setBusca: (busca) => set({ busca }),
  setFiltroTag: (filtroTag) => set({ filtroTag }),
  setFiltroEstado: (filtroEstado) => set({ filtroEstado }),
  setClienteSelecionado: (clienteSelecionado) => set({ clienteSelecionado }),

  inicializar: async (supabase) => {
    if (get()._inicializado) return
    set({ isLoading: true })
    try {
      const clientes = await getClientes(supabase)
      set({ clientes, isLoading: false, _inicializado: true })
    } catch (err) {
      console.error('[clientesStore] Erro ao carregar:', err)
      set({ isLoading: false })
    }
  },

  adicionarCliente: async (dados, supabase?) => {
    // Otimista: adicionar localmente primeiro
    const temp: Cliente = {
      ...dados,
      id: `temp-${Date.now()}`,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    }
    set((state) => ({ clientes: [temp, ...state.clientes] }))

    if (supabase) {
      try {
        const salvo = await createClienteDB(supabase, dados)
        // Substituir o temporário pelo salvo
        set((state) => ({
          clientes: state.clientes.map((c) => (c.id === temp.id ? salvo : c)),
        }))
        return salvo
      } catch (err) {
        console.error('[clientesStore] Erro ao salvar:', err)
      }
    }
    return temp
  },

  atualizarCliente: async (id, dados, supabase?) => {
    set((state) => ({
      clientes: state.clientes.map((c) =>
        c.id === id ? { ...c, ...dados, atualizado_em: new Date().toISOString() } : c
      ),
    }))
    if (supabase) {
      try { await updateClienteDB(supabase, id, dados) }
      catch (err) { console.error('[clientesStore] Erro ao atualizar:', err) }
    }
  },

  toggleAtivo: async (id, supabase?) => {
    const cliente = get().clientes.find((c) => c.id === id)
    if (!cliente) return
    const novoAtivo = !cliente.ativo
    set((state) => ({
      clientes: state.clientes.map((c) =>
        c.id === id ? { ...c, ativo: novoAtivo, atualizado_em: new Date().toISOString() } : c
      ),
    }))
    if (supabase) {
      try { await updateClienteDB(supabase, id, { ativo: novoAtivo }) }
      catch (err) { console.error('[clientesStore] Erro ao toggle ativo:', err) }
    }
  },

  removerCliente: async (id, supabase?) => {
    set((state) => ({ clientes: state.clientes.filter((c) => c.id !== id) }))
    if (supabase) {
      try { await deleteClienteDB(supabase, id) }
      catch (err) { console.error('[clientesStore] Erro ao remover:', err) }
    }
  },

  getClienteById: (id) => get().clientes.find((c) => c.id === id),

  getClientesFiltrados: () => {
    const { clientes, busca, filtroTag, filtroEstado } = get()
    return clientes.filter((c) => {
      const termo = busca.toLowerCase()
      const matchBusca =
        !busca ||
        c.nome.toLowerCase().includes(termo) ||
        (c.empresa_nome?.toLowerCase().includes(termo) ?? false) ||
        (c.email?.toLowerCase().includes(termo) ?? false) ||
        (c.telefone?.includes(busca) ?? false) ||
        (c.cidade?.toLowerCase().includes(termo) ?? false)
      const matchTag = !filtroTag || filtroTag === 'todos' || c.tag === filtroTag
      const matchEstado = !filtroEstado || filtroEstado === 'todos' || c.estado === filtroEstado
      return matchBusca && matchTag && matchEstado
    })
  },
}))
