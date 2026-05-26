import { TagCliente } from '@/types'
import { cn } from '@/lib/utils'

const TAG_CONFIG: Record<TagCliente, { label: string; className: string; emoji: string }> = {
  vip: {
    label: 'VIP',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    emoji: '⭐',
  },
  recorrente: {
    label: 'Recorrente',
    className: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    emoji: '🔁',
  },
  novo: {
    label: 'Novo',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    emoji: '🌱',
  },
  inativo: {
    label: 'Inativo',
    className: 'bg-slate-100 text-slate-500 border border-slate-200',
    emoji: '😴',
  },
}

export const TAG_LIST = Object.entries(TAG_CONFIG).map(([value, config]) => ({
  value: value as TagCliente,
  ...config,
}))

interface TagBadgeProps {
  tag: TagCliente
  showEmoji?: boolean
  className?: string
}

export function TagBadge({ tag, showEmoji = true, className }: TagBadgeProps) {
  const config = TAG_CONFIG[tag]
  if (!config) return null
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {showEmoji && <span>{config.emoji}</span>}
      {config.label}
    </span>
  )
}
