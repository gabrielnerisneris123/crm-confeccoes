import { StatusPedido, STATUS_CONFIG } from '@/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: StatusPedido
  showIcon?: boolean
  className?: string
}

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        cfg.bg, cfg.cor, className
      )}
    >
      {showIcon && <span>{cfg.icone}</span>}
      {cfg.label}
    </span>
  )
}
