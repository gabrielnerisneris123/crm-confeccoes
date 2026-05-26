import { PrioridadePedido, PRIORIDADE_CONFIG } from '@/types'
import { cn } from '@/lib/utils'

interface PrioridadeBadgeProps {
  prioridade: PrioridadePedido
  className?: string
}

export function PrioridadeBadge({ prioridade, className }: PrioridadeBadgeProps) {
  const cfg = PRIORIDADE_CONFIG[prioridade]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        cfg.bg, className
      )}
    >
      {prioridade === 'urgente' && '🔴 '}
      {prioridade === 'alta' && '🟠 '}
      {prioridade === 'normal' && '🔵 '}
      {prioridade === 'baixa' && '⚪ '}
      {cfg.label}
    </span>
  )
}
