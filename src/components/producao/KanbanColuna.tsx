'use client'

import { Droppable } from '@hello-pangea/dnd'
import { Pedido, StatusPedido, STATUS_CONFIG } from '@/types'
import { KanbanCard } from './KanbanCard'

interface KanbanColunaProps {
  status: StatusPedido
  pedidos: Pedido[]
  podeArrastar?: boolean
}

const COR_HEADER: Record<string, string> = {
  novo: 'border-t-indigo-500',
  aguardando_aprovacao: 'border-t-amber-500',
  aprovado: 'border-t-blue-500',
  separacao: 'border-t-cyan-500',
  impressao_dtf: 'border-t-purple-500',
  estamparia: 'border-t-pink-500',
  revisao: 'border-t-orange-500',
  embalagem: 'border-t-teal-500',
  pronto: 'border-t-emerald-500',
  entregue: 'border-t-gray-400',
  cancelado: 'border-t-red-500',
}

export function KanbanColuna({ status, pedidos, podeArrastar = true }: KanbanColunaProps) {
  const cfg = STATUS_CONFIG[status]
  const borderCor = COR_HEADER[status] ?? 'border-t-slate-400'

  return (
    <div className={`flex flex-col w-64 flex-shrink-0 bg-slate-50 rounded-xl border border-slate-200 border-t-4 ${borderCor}`}>
      {/* Header da coluna */}
      <div className="px-3 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{cfg.icone}</span>
          <span className="text-sm font-semibold text-slate-700">{cfg.label}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          pedidos.length > 0 ? `${cfg.bg} ${cfg.cor}` : 'bg-slate-200 text-slate-400'
        }`}>
          {pedidos.length}
        </span>
      </div>

      {/* Cards droppable */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-24 px-2 pb-2 space-y-2 transition-colors rounded-b-xl ${
              snapshot.isDraggingOver ? 'bg-indigo-50/60' : ''
            }`}
          >
            {pedidos.map((pedido, idx) => (
              <KanbanCard key={pedido.id} pedido={pedido} index={idx} podeArrastar={podeArrastar} />
            ))}
            {provided.placeholder}

            {pedidos.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-16 text-xs text-slate-300 border-2 border-dashed border-slate-200 rounded-lg">
                Solte aqui
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
