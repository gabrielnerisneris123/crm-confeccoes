'use client'

import { useState } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { Header } from '@/components/shared/Header'
import { KanbanColuna } from '@/components/producao/KanbanColuna'
import { usePedidosStore } from '@/stores/pedidosStore'
import { usePermissao } from '@/hooks/usePermissao'
import { StatusPedido, STATUS_CONFIG, PRIORIDADE_CONFIG, PrioridadePedido } from '@/types'
import { Input } from '@/components/ui/input'
import { Search, AlertTriangle, LayoutGrid } from 'lucide-react'
import { isPast, parseISO } from 'date-fns'

const COLUNAS_KANBAN: StatusPedido[] = [
  'novo', 'aguardando_aprovacao', 'aprovado', 'separacao',
  'impressao_dtf', 'estamparia', 'revisao', 'embalagem', 'pronto', 'entregue',
]

export default function ProducaoPage() {
  const { pedidos, atualizarPedido } = usePedidosStore()
  const { podeAvancarStatus } = usePermissao()
  const [busca, setBusca] = useState('')
  const [filtroPrioridade, setFiltroPrioridade] = useState('')
  const [mostrarCancelados, setMostrarCancelados] = useState(false)

  // Filtra pedidos para o kanban (exclui cancelados por padrão)
  const pedidosFiltrados = pedidos.filter((p) => {
    if (!mostrarCancelados && p.status === 'cancelado') return false
    const matchBusca =
      !busca ||
      p.numero.toLowerCase().includes(busca.toLowerCase()) ||
      (p.cliente?.nome.toLowerCase().includes(busca.toLowerCase()) ?? false)
    const matchPrioridade = !filtroPrioridade || p.prioridade === filtroPrioridade
    return matchBusca && matchPrioridade
  })

  const colunasVisiveis = mostrarCancelados
    ? [...COLUNAS_KANBAN, 'cancelado' as StatusPedido]
    : COLUNAS_KANBAN

  const getPedidosDaColuna = (status: StatusPedido) =>
    pedidosFiltrados
      .filter((p) => p.status === status)
      .sort((a, b) => {
        // Urgente primeiro, depois por prazo
        const priorOrdem: Record<PrioridadePedido, number> = { urgente: 0, alta: 1, normal: 2, baixa: 3 }
        if (priorOrdem[a.prioridade] !== priorOrdem[b.prioridade])
          return priorOrdem[a.prioridade] - priorOrdem[b.prioridade]
        return parseISO(a.data_prazo).getTime() - parseISO(b.data_prazo).getTime()
      })

  const onDragEnd = (result: DropResult) => {
    if (!podeAvancarStatus) return
    const { destination, source, draggableId } = result
    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return

    const novoStatus = destination.droppableId as StatusPedido
    atualizarPedido(draggableId, { status: novoStatus })
  }

  // Stats do kanban
  const atrasados = pedidos.filter(
    (p) => !['entregue','cancelado'].includes(p.status) && isPast(parseISO(p.data_prazo))
  ).length
  const totalAtivos = pedidos.filter((p) => !['entregue','cancelado'].includes(p.status)).length
  const prontos = pedidos.filter((p) => p.status === 'pronto').length

  return (
    <div className="page-enter flex flex-col h-full">
      <Header titulo="Produção / Kanban" subtitulo="Controle visual do fluxo de produção" />

      {/* Toolbar */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 space-y-3">
        {/* Mini stats */}
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-600">
            <LayoutGrid className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-slate-800">{totalAtivos}</span> em produção
          </div>
          {atrasados > 0 && (
            <div className="flex items-center gap-1.5 text-red-600 font-medium">
              <AlertTriangle className="w-4 h-4" />
              {atrasados} atrasado{atrasados > 1 ? 's' : ''}
            </div>
          )}
          {prontos > 0 && (
            <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
              ✨ {prontos} pronto{prontos > 1 ? 's' : ''} para entrega
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar pedido ou cliente..."
              className="pl-9 h-8 bg-slate-50 border-slate-200 text-sm"
            />
          </div>

          {/* Filtro prioridade */}
          <div className="flex gap-1">
            {(['', 'urgente', 'alta', 'normal', 'baixa'] as ('' | PrioridadePedido)[]).map((p) => (
              <button
                key={p}
                onClick={() => setFiltroPrioridade(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  filtroPrioridade === p
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p === '' ? 'Todas'
                  : p === 'urgente' ? '🔴 Urgente'
                  : p === 'alta' ? '🟠 Alta'
                  : p === 'normal' ? '🔵 Normal'
                  : '⚪ Baixa'
                }
              </button>
            ))}
          </div>

          {/* Toggle cancelados */}
          <button
            onClick={() => setMostrarCancelados(!mostrarCancelados)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              mostrarCancelados
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            ❌ Cancelados
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 min-w-max pb-4">
            {colunasVisiveis.map((status) => (
              <KanbanColuna
                key={status}
                status={status}
                pedidos={getPedidosDaColuna(status)}
                podeArrastar={podeAvancarStatus}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}
