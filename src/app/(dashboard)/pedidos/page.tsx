'use client'

import { Header } from '@/components/shared/Header'
import { usePedidosStore } from '@/stores/pedidosStore'
import { StatusBadge } from '@/components/pedidos/StatusBadge'
import { PrioridadeBadge } from '@/components/pedidos/PrioridadeBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag, Search, Plus, MoreHorizontal, Eye, Edit,
  ChevronRight, Clock, AlertTriangle, CheckCircle, TrendingUp,
} from 'lucide-react'
import { STATUS_CONFIG, StatusPedido, PRIORIDADE_CONFIG, PrioridadePedido } from '@/types'
import { format, isPast, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const STATUS_FILTROS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'novo', label: 'Novo' },
  { value: 'aguardando_aprovacao', label: 'Ag. Aprovação' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'separacao', label: 'Separação' },
  { value: 'impressao_dtf', label: 'DTF' },
  { value: 'estamparia', label: 'Estamparia' },
  { value: 'revisao', label: 'Revisão' },
  { value: 'embalagem', label: 'Embalagem' },
  { value: 'pronto', label: 'Pronto' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelado', label: 'Cancelado' },
]

export default function PedidosPage() {
  const router = useRouter()
  const {
    pedidos, busca, filtroStatus, filtroPrioridade,
    setBusca, setFiltroStatus, setFiltroPrioridade,
    avancarStatus, getPedidosFiltrados,
  } = usePedidosStore()

  const filtrados = getPedidosFiltrados()

  const emAndamento = pedidos.filter(
    (p) => !['entregue', 'cancelado'].includes(p.status)
  ).length
  const atrasados = pedidos.filter(
    (p) => !['entregue', 'cancelado'].includes(p.status) && isPast(parseISO(p.data_prazo))
  ).length
  const faturamento = pedidos
    .filter((p) => p.status !== 'cancelado')
    .reduce((acc, p) => acc + p.valor_final, 0)

  const limpar = () => { setBusca(''); setFiltroStatus(''); setFiltroPrioridade('') }

  return (
    <div className="page-enter">
      <Header titulo="Pedidos" subtitulo="Todos os pedidos da empresa" />

      <div className="p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<ShoppingBag className="w-5 h-5 text-indigo-600" />} bg="bg-indigo-50"
            label="Total de Pedidos" value={pedidos.length} />
          <StatCard icon={<Clock className="w-5 h-5 text-amber-600" />} bg="bg-amber-50"
            label="Em Andamento" value={emAndamento} />
          <StatCard icon={<AlertTriangle className="w-5 h-5 text-red-500" />} bg="bg-red-50"
            label="Atrasados" value={atrasados} destaque={atrasados > 0} />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} bg="bg-emerald-50"
            label="Faturamento Total" value={`R$ ${faturamento.toLocaleString('pt-BR')}`} />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nº pedido, cliente..."
                className="pl-9 bg-slate-50 border-slate-200 h-9"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={filtroPrioridade}
                onChange={(e) => setFiltroPrioridade(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm text-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 transition-colors"
              >
                <option value="">Todas prioridades</option>
                {(['urgente','alta','normal','baixa'] as PrioridadePedido[]).map((p) => (
                  <option key={p} value={p}>{PRIORIDADE_CONFIG[p].label}</option>
                ))}
              </select>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-9"
                onClick={() => router.push('/pedidos/novo')}
              >
                <Plus className="w-4 h-4" /> Novo Pedido
              </Button>
            </div>
          </div>

          {/* Status filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {STATUS_FILTROS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltroStatus(f.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filtroStatus === f.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.value && <span>{STATUS_CONFIG[f.value as StatusPedido]?.icone}</span>}
                {f.label}
              </button>
            ))}
          </div>

          {(busca || filtroStatus || filtroPrioridade) && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</span>
              <button onClick={limpar} className="text-indigo-600 hover:text-indigo-700 font-medium">
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {filtrados.length === 0 ? (
            <EmptyState busca={busca} onLimpar={limpar} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="pl-5">Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="pr-5 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((pedido) => {
                  const atrasado =
                    !['entregue','cancelado'].includes(pedido.status) &&
                    isPast(parseISO(pedido.data_prazo))
                  return (
                    <TableRow
                      key={pedido.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/pedidos/${pedido.id}`)}
                    >
                      <TableCell className="pl-5">
                        <div className="font-semibold text-sm text-slate-800">{pedido.numero}</div>
                        <div className="text-xs text-slate-400">
                          {format(parseISO(pedido.data_pedido), 'dd/MM/yyyy')}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-slate-700">{pedido.cliente?.nome ?? '—'}</div>
                        {pedido.cliente?.empresa_nome && (
                          <div className="text-xs text-slate-400">{pedido.cliente.empresa_nome}</div>
                        )}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={pedido.status} />
                      </TableCell>

                      <TableCell>
                        <PrioridadeBadge prioridade={pedido.prioridade} />
                      </TableCell>

                      <TableCell>
                        <div className={`text-xs font-medium flex items-center gap-1 ${atrasado ? 'text-red-600' : 'text-slate-600'}`}>
                          {atrasado && <AlertTriangle className="w-3 h-3" />}
                          {format(parseISO(pedido.data_prazo), 'dd/MM/yyyy')}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm font-semibold text-slate-800">
                          R$ {pedido.valor_final.toLocaleString('pt-BR')}
                        </span>
                      </TableCell>

                      <TableCell>
                        <PagamentoBadge status={pedido.status_pagamento} />
                      </TableCell>

                      <TableCell className="pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer inline-flex items-center justify-center">
                            <MoreHorizontal className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="bottom" align="end">
                            <DropdownMenuItem onClick={() => router.push(`/pedidos/${pedido.id}`)}>
                              <Eye className="w-3.5 h-3.5 mr-2" /> Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/pedidos/${pedido.id}/editar`)}>
                              <Edit className="w-3.5 h-3.5 mr-2" /> Editar
                            </DropdownMenuItem>
                            {!['entregue','cancelado'].includes(pedido.status) && (
                              <DropdownMenuItem onClick={() => avancarStatus(pedido.id)}>
                                <ChevronRight className="w-3.5 h-3.5 mr-2 text-indigo-500" /> Avançar status
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, bg, label, value, destaque }: {
  icon: React.ReactNode; bg: string; label: string; value: number | string; destaque?: boolean
}) {
  return (
    <div className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${destaque ? 'border-red-200' : 'border-slate-200'}`}>
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <div>
        <div className={`text-2xl font-bold ${destaque ? 'text-red-600' : 'text-slate-800'}`}>{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </div>
  )
}

function PagamentoBadge({ status }: { status: string }) {
  const map = {
    pago: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    parcial: 'text-amber-700 bg-amber-50 border-amber-200',
    pendente: 'text-red-600 bg-red-50 border-red-200',
    cancelado: 'text-slate-500 bg-slate-100 border-slate-200',
  } as Record<string, string>
  const labels = { pago: '✓ Pago', parcial: '◐ Parcial', pendente: 'Pendente', cancelado: 'Cancelado' } as Record<string, string>
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? 'text-slate-500'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function EmptyState({ busca, onLimpar }: { busca: string; onLimpar: () => void }) {
  return (
    <div className="py-16 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <ShoppingBag className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-700 mb-1">
        {busca ? 'Nenhum pedido encontrado' : 'Nenhum pedido'}
      </h3>
      <p className="text-slate-400 text-sm max-w-xs mb-4">
        {busca ? `Sem resultados para "${busca}"` : 'Crie o primeiro pedido.'}
      </p>
      {busca && (
        <button onClick={onLimpar} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          Limpar filtros
        </button>
      )}
    </div>
  )
}
