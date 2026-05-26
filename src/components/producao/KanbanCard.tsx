'use client'

import { Draggable } from '@hello-pangea/dnd'
import { Pedido, STATUS_CONFIG, PRIORIDADE_CONFIG } from '@/types'
import { format, parseISO, isPast, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { User, Package, AlertTriangle, Clock } from 'lucide-react'

interface KanbanCardProps {
  pedido: Pedido
  index: number
}

export function KanbanCard({ pedido, index }: KanbanCardProps) {
  const router = useRouter()

  const atrasado =
    !['entregue', 'cancelado'].includes(pedido.status) &&
    isPast(parseISO(pedido.data_prazo))

  const diasRestantes = differenceInDays(parseISO(pedido.data_prazo), new Date())
  const totalPecas = (pedido.itens ?? []).reduce(
    (acc, i) => acc + (i.qtd_total ?? 0), 0
  )

  const priorCfg = PRIORIDADE_CONFIG[pedido.prioridade]

  return (
    <Draggable draggableId={pedido.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => router.push(`/pedidos/${pedido.id}`)}
          className={`bg-white rounded-xl border p-3.5 cursor-pointer select-none transition-all ${
            snapshot.isDragging
              ? 'shadow-xl border-indigo-300 rotate-1 scale-105'
              : atrasado
              ? 'border-red-200 hover:border-red-300 hover:shadow-sm'
              : 'border-slate-200 hover:border-indigo-200 hover:shadow-sm'
          }`}
        >
          {/* Topo: número + prioridade */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">{pedido.numero}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${priorCfg.bg}`}>
              {pedido.prioridade === 'urgente' && '🔴'}
              {pedido.prioridade === 'alta' && '🟠'}
              {pedido.prioridade === 'normal' && '🔵'}
              {pedido.prioridade === 'baixa' && '⚪'}
            </span>
          </div>

          {/* Cliente */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 text-indigo-600" />
            </div>
            <span className="text-sm font-semibold text-slate-800 truncate">
              {pedido.cliente?.nome ?? 'Cliente'}
            </span>
          </div>

          {/* Descrição resumida dos itens */}
          {(pedido.itens ?? []).length > 0 && (
            <div className="flex items-center gap-1.5 mb-2.5">
              <Package className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">
                {pedido.itens![0].descricao}
                {pedido.itens!.length > 1 && ` +${pedido.itens!.length - 1}`}
              </span>
            </div>
          )}

          {/* Footer: prazo + valor */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className={`flex items-center gap-1 text-xs ${
              atrasado ? 'text-red-600 font-medium' : diasRestantes <= 2 ? 'text-amber-600 font-medium' : 'text-slate-400'
            }`}>
              {atrasado
                ? <><AlertTriangle className="w-3 h-3" /> Atrasado</>
                : diasRestantes === 0
                ? <><Clock className="w-3 h-3" /> Hoje</>
                : diasRestantes === 1
                ? <><Clock className="w-3 h-3" /> Amanhã</>
                : <>{format(parseISO(pedido.data_prazo), 'dd/MM', { locale: ptBR })}</>
              }
            </div>
            <span className="text-xs font-semibold text-emerald-600">
              R$ {pedido.valor_final.toLocaleString('pt-BR')}
            </span>
          </div>

          {totalPecas > 0 && (
            <div className="mt-1 text-xs text-slate-400 text-right">{totalPecas} peças</div>
          )}
        </div>
      )}
    </Draggable>
  )
}
