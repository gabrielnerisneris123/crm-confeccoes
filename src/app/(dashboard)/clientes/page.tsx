'use client'

import { useState } from 'react'
import { Header } from '@/components/shared/Header'
import { useClientesStore } from '@/stores/clientesStore'
import { TagBadge } from '@/components/clientes/TagBadge'
import { ClienteDrawer } from '@/components/clientes/ClienteDrawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import {
  Users,
  Search,
  LayoutGrid,
  List,
  Plus,
  Phone,
  MessageCircle,
  Star,
  UserX,
  Sprout,
  MoreHorizontal,
  Edit,
  Eye,
  Ban,
  CheckCircle,
  MapPin,
  Building2,
} from 'lucide-react'
import { Cliente } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type ViewMode = 'tabela' | 'cards'

const TAG_FILTERS = [
  { value: 'todos', label: 'Todos', icon: '👥' },
  { value: 'vip', label: 'VIP', icon: '⭐' },
  { value: 'recorrente', label: 'Recorrente', icon: '🔁' },
  { value: 'novo', label: 'Novo', icon: '🌱' },
  { value: 'inativo', label: 'Inativo', icon: '😴' },
]

export default function ClientesPage() {
  const router = useRouter()
  const {
    clientes,
    busca,
    filtroTag,
    filtroEstado,
    clienteSelecionado,
    setBusca,
    setFiltroTag,
    setFiltroEstado,
    setClienteSelecionado,
    toggleAtivo,
    getClientesFiltrados,
  } = useClientesStore()

  const [viewMode, setViewMode] = useState<ViewMode>('tabela')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const clientesFiltrados = getClientesFiltrados()

  // Stats
  const totalVIP = clientes.filter((c) => c.tag === 'vip').length
  const totalNovos = clientes.filter((c) => c.tag === 'novo').length
  const totalInativos = clientes.filter((c) => !c.ativo).length

  const handleAbrirDrawer = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setDrawerOpen(true)
  }

  const handleFecharDrawer = () => {
    setDrawerOpen(false)
    setTimeout(() => setClienteSelecionado(null), 300)
  }

  const handleEditar = (id: string) => {
    router.push(`/clientes/${id}/editar`)
  }

  const iniciais = (nome: string) =>
    nome
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  const formatarData = (data?: string) => {
    if (!data) return '—'
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR })
  }

  const formatarValor = (valor?: number) => {
    if (!valor) return 'R$ 0'
    return `R$ ${valor.toLocaleString('pt-BR')}`
  }

  const estadosUnicos = [
    ...new Set(clientes.map((c) => c.estado).filter(Boolean)),
  ] as string[]

  const limparFiltros = () => {
    setBusca('')
    setFiltroTag('')
    setFiltroEstado('')
  }

  return (
    <div className="page-enter">
      <Header titulo="Clientes" subtitulo="Gerencie sua base de clientes" />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-5 h-5 text-indigo-600" />}
            bg="bg-indigo-50"
            label="Total de Clientes"
            value={clientes.length}
          />
          <StatCard
            icon={<Star className="w-5 h-5 text-amber-500" />}
            bg="bg-amber-50"
            label="Clientes VIP"
            value={totalVIP}
          />
          <StatCard
            icon={<Sprout className="w-5 h-5 text-emerald-600" />}
            bg="bg-emerald-50"
            label="Novos Clientes"
            value={totalNovos}
          />
          <StatCard
            icon={<UserX className="w-5 h-5 text-slate-400" />}
            bg="bg-slate-50"
            label="Inativos"
            value={totalInativos}
          />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, empresa, e-mail, cidade..."
                className="pl-9 bg-slate-50 border-slate-200 h-9"
              />
            </div>

            {/* Botões direita */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {estadosUnicos.length > 0 && (
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm text-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:border-indigo-300 transition-colors"
                >
                  <option value="">Todos estados</option>
                  {estadosUnicos.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              )}

              {/* View toggle */}
              <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setViewMode('tabela')}
                  className={`p-2 transition-colors ${
                    viewMode === 'tabela'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-9"
                onClick={() => router.push('/clientes/novo')}
              >
                <Plus className="w-4 h-4" />
                Novo Cliente
              </Button>
            </div>
          </div>

          {/* Tag filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {TAG_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() =>
                  setFiltroTag(f.value === 'todos' ? '' : f.value)
                }
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  (filtroTag === '' && f.value === 'todos') ||
                  filtroTag === f.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          {(busca || filtroTag || filtroEstado) && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>
                {clientesFiltrados.length} resultado
                {clientesFiltrados.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={limparFiltros}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Lista / Tabela */}
        {viewMode === 'tabela' ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {clientesFiltrados.length === 0 ? (
              <EmptyState busca={busca} onLimpar={limparFiltros} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="pl-5">Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead className="text-center">Pedidos</TableHead>
                    <TableHead>Total Gasto</TableHead>
                    <TableHead>Último Pedido</TableHead>
                    <TableHead className="pr-5 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados.map((cliente) => (
                    <TableRow
                      key={cliente.id}
                      className="cursor-pointer"
                      onClick={() => handleAbrirDrawer(cliente)}
                    >
                      {/* Cliente */}
                      <TableCell className="pl-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              cliente.ativo
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {iniciais(cliente.nome)}
                          </div>
                          <div>
                            <div
                              className={`text-sm font-medium ${
                                cliente.ativo
                                  ? 'text-slate-800'
                                  : 'text-slate-400'
                              }`}
                            >
                              {cliente.nome}
                            </div>
                            {cliente.empresa_nome && (
                              <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-2.5 h-2.5" />
                                {cliente.empresa_nome}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Contato */}
                      <TableCell>
                        <div className="space-y-0.5">
                          {cliente.telefone && (
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {cliente.telefone}
                            </div>
                          )}
                          {cliente.whatsapp && (
                            <div className="text-xs text-green-600 flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              WhatsApp
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Localização */}
                      <TableCell>
                        {cliente.cidade || cliente.estado ? (
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {[cliente.cidade, cliente.estado]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </TableCell>

                      {/* Tag */}
                      <TableCell>
                        {cliente.tag ? (
                          <TagBadge tag={cliente.tag} />
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </TableCell>

                      {/* Pedidos */}
                      <TableCell className="text-center">
                        <span className="text-sm font-semibold text-slate-700">
                          {cliente.total_pedidos ?? 0}
                        </span>
                      </TableCell>

                      {/* Total Gasto */}
                      <TableCell>
                        <span className="text-sm font-semibold text-emerald-600">
                          {formatarValor(cliente.valor_total_gasto)}
                        </span>
                      </TableCell>

                      {/* Último pedido */}
                      <TableCell>
                        <span className="text-xs text-slate-500">
                          {formatarData(cliente.ultimo_pedido)}
                        </span>
                      </TableCell>

                      {/* Ações */}
                      <TableCell
                        className="pr-5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer inline-flex items-center justify-center">
                            <MoreHorizontal className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="bottom" align="end">
                            <DropdownMenuItem
                              onClick={() => handleAbrirDrawer(cliente)}
                            >
                              <Eye className="w-3.5 h-3.5 mr-2" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditar(cliente.id)}
                            >
                              <Edit className="w-3.5 h-3.5 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleAtivo(cliente.id)}
                            >
                              {cliente.ativo ? (
                                <>
                                  <Ban className="w-3.5 h-3.5 mr-2 text-red-500" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        ) : (
          /* Cards view */
          <div>
            {clientesFiltrados.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200">
                <EmptyState busca={busca} onLimpar={limparFiltros} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {clientesFiltrados.map((cliente) => (
                  <ClienteCard
                    key={cliente.id}
                    cliente={cliente}
                    onVerDetalhes={handleAbrirDrawer}
                    onEditar={handleEditar}
                    iniciais={iniciais}
                    formatarValor={formatarValor}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer */}
      <ClienteDrawer
        cliente={clienteSelecionado}
        open={drawerOpen}
        onClose={handleFecharDrawer}
        onEditar={handleEditar}
        onDesativar={toggleAtivo}
      />
    </div>
  )
}

/* ---- Sub-componentes ---- */

function StatCard({
  icon,
  bg,
  label,
  value,
}: {
  icon: React.ReactNode
  bg: string
  label: string
  value: number
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
      <div
        className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </div>
  )
}

function ClienteCard({
  cliente,
  onVerDetalhes,
  onEditar,
  iniciais,
  formatarValor,
}: {
  cliente: Cliente
  onVerDetalhes: (c: Cliente) => void
  onEditar: (id: string) => void
  iniciais: (n: string) => string
  formatarValor: (v?: number) => string
}) {
  return (
    <div
      className={`bg-white rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${
        cliente.ativo ? 'border-slate-200' : 'border-slate-100 opacity-60'
      }`}
      onClick={() => onVerDetalhes(cliente)}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                cliente.ativo
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {iniciais(cliente.nome)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">
                {cliente.nome}
              </div>
              {cliente.empresa_nome && (
                <div className="text-xs text-slate-400 truncate">
                  {cliente.empresa_nome}
                </div>
              )}
            </div>
          </div>
          {cliente.tag && <TagBadge tag={cliente.tag} />}
        </div>

        {(cliente.cidade || cliente.estado) && (
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {[cliente.cidade, cliente.estado].filter(Boolean).join(', ')}
          </div>
        )}

        <div className="mt-2 flex gap-3">
          {cliente.telefone && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Phone className="w-3 h-3" />
              {cliente.telefone}
            </div>
          )}
          {cliente.whatsapp && !cliente.telefone && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <MessageCircle className="w-3 h-3" />
              WhatsApp
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-px bg-slate-100 border-t border-b border-slate-100">
        <div className="bg-white px-4 py-2.5 text-center">
          <div className="text-base font-bold text-slate-800">
            {cliente.total_pedidos ?? 0}
          </div>
          <div className="text-xs text-slate-400">Pedidos</div>
        </div>
        <div className="bg-white px-4 py-2.5 text-center">
          <div className="text-base font-bold text-emerald-600">
            {formatarValor(cliente.valor_total_gasto)}
          </div>
          <div className="text-xs text-slate-400">Total Gasto</div>
        </div>
      </div>

      {/* Ações */}
      <div className="p-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onVerDetalhes(cliente)}
          className="flex-1 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg py-2 transition-colors border border-slate-200 hover:border-indigo-200"
        >
          Ver detalhes
        </button>
        <button
          onClick={() => onEditar(cliente.id)}
          className="flex-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg py-2 transition-colors border border-indigo-200"
        >
          Editar
        </button>
      </div>
    </div>
  )
}

function EmptyState({
  busca,
  onLimpar,
}: {
  busca: string
  onLimpar: () => void
}) {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Users className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-700 mb-1">
        {busca ? 'Nenhum resultado encontrado' : 'Nenhum cliente'}
      </h3>
      <p className="text-slate-400 text-sm max-w-xs mb-4">
        {busca
          ? `Não encontramos clientes para "${busca}"`
          : 'Adicione o primeiro cliente para começar.'}
      </p>
      {busca && (
        <button
          onClick={onLimpar}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
