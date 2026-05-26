import { create } from 'zustand'
import { Cliente } from '@/types'
import { mockClientes } from '@/lib/mock-data'

interface ClientesState {
  clientes: Cliente[]
  busca: string
  filtroTag: string
  filtroEstado: string
  clienteSelecionado: Cliente | null

  setBusca: (busca: string) => void
  setFiltroTag: (tag: string) => void
  setFiltroEstado: (estado: string) => void
  setClienteSelecionado: (cliente: Cliente | null) => void

  adicionarCliente: (dados: Omit<Cliente, 'id' | 'criado_em' | 'atualizado_em'>) => void
  atualizarCliente: (id: string, dados: Partial<Cliente>) => void
  toggleAtivo: (id: string) => void

  getClienteById: (id: string) => Cliente | undefined
  getClientesFiltrados: () => Cliente[]
}

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: mockClientes,
  busca: '',
  filtroTag: '',
  filtroEstado: '',
  clienteSelecionado: null,

  setBusca: (busca) => set({ busca }),
  setFiltroTag: (filtroTag) => set({ filtroTag }),
  setFiltroEstado: (filtroEstado) => set({ filtroEstado }),
  setClienteSelecionado: (clienteSelecionado) => set({ clienteSelecionado }),

  adicionarCliente: (dados) =>
    set((state) => ({
      clientes: [
        {
          ...dados,
          id: `cliente-${Date.now()}`,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        } as Cliente,
        ...state.clientes,
      ],
    })),

  atualizarCliente: (id, dados) =>
    set((state) => ({
      clientes: state.clientes.map((c) =>
        c.id === id
          ? { ...c, ...dados, atualizado_em: new Date().toISOString() }
          : c
      ),
    })),

  toggleAtivo: (id) =>
    set((state) => ({
      clientes: state.clientes.map((c) =>
        c.id === id
          ? { ...c, ativo: !c.ativo, atualizado_em: new Date().toISOString() }
          : c
      ),
    })),

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

      const matchTag =
        !filtroTag || filtroTag === 'todos' || c.tag === filtroTag

      const matchEstado =
        !filtroEstado || filtroEstado === 'todos' || c.estado === filtroEstado

      return matchBusca && matchTag && matchEstado
    })
  },
}))
