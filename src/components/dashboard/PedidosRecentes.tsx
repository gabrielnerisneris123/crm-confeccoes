'use client'

import { Pedido, STATUS_CONFIG, PRIORIDADE_CONFIG } from '@/types'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Clock, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface PedidosRecentesProps {
  pedidos: Pedido[]
}

function getDiasRestantes(prazo: string): number {
  return differenceInDays(parseISO(prazo), new Date())
}

function StatusBadge({ status }: { status: Pedido['status'] }) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
      config.bg, config.cor
    )}>
      <span>{config.icone}</span>
      {config.label}
    </span>
  )
}

function PrioridadeBadge({ prioridade }: { prioridade: Pedido['prioridade'] }) {
  const config = PRIORIDADE_CONFIG[prioridade]
  return (
    <span className={cn(
      'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold',
      config.bg,
      prioridade === 'urgente' && 'animate-pulse'
    )}>
      {config.label}
    </span>
  )
}

export function PedidosRecentes({ pedidos }: PedidosRecentesProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-slate-900 font-semibold text-sm">Pedidos em Andamento</h3>
          <p className="text-slate-400 text-xs mt-0.5">{pedidos.length} pedidos ativos</p>
        </div>
        <Link
          href="/pedidos"
          className="text-indigo-600 text-xs font-medium hover:text-indigo-700 flex items-center gap-1"
        >
          Ver todos
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-slate-50">
        {pedidos.map((pedido) => {
          const diasRestantes = getDiasRestantes(pedido.data_prazo)
          const atrasado = diasRestantes < 0
          const urgente = diasRestantes <= 1 && !atrasado

          return (
            <Link
              key={pedido.id}
              href={`/pedidos/${pedido.id}`}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 transition-colors group"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm">
                {pedido.cliente?.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-slate-800 text-sm font-semibold truncate">
                    {pedido.cliente?.nome}
                  </span>
                  <PrioridadeBadge prioridade={pedido.prioridade} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs font-mono">{pedido.numero}</span>
                  <span className="text-slate-300 text-xs">·</span>
                  <span className="text-slate-400 text-xs">
                    {pedido.itens?.[0]?.qtd_total ?? '—'} peças
                  </span>
                  {pedido.cliente?.empresa_nome && (
                    <>
                      <span className="text-slate-300 text-xs">·</span>
                      <span className="text-slate-400 text-xs truncate">
                        {pedido.cliente.empresa_nome}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Status */}
              <StatusBadge status={pedido.status} />

              {/* Prazo */}
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium min-w-[90px] text-right justify-end',
                atrasado ? 'text-red-600' : urgente ? 'text-amber-600' : 'text-slate-400'
              )}>
                <Clock className="w-3 h-3" />
                {atrasado
                  ? `${Math.abs(diasRestantes)}d atrasado`
                  : diasRestantes === 0
                    ? 'Hoje!'
                    : `${diasRestantes}d restantes`
                }
              </div>

              {/* Valor */}
              <div className="text-slate-800 text-sm font-bold min-w-[80px] text-right">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                }).format(pedido.valor_final)}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
