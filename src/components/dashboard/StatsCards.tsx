'use client'

import { DashboardMetrics } from '@/types'
import {
  ShoppingBag,
  AlertTriangle,
  Truck,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  metrics: DashboardMetrics
}

interface StatCard {
  label: string
  value: string | number
  subtext: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  trend?: string
  trendUp?: boolean
  alert?: boolean
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function StatsCards({ metrics }: StatsCardsProps) {
  const cards: StatCard[] = [
    {
      label: 'Em Andamento',
      value: metrics.pedidos_em_andamento,
      subtext: `${metrics.pedidos_hoje} novos hoje`,
      icon: ShoppingBag,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      trend: `+${metrics.pedidos_semana} esta semana`,
      trendUp: true,
    },
    {
      label: 'Atrasados',
      value: metrics.pedidos_atrasados,
      subtext: 'Requerem atenção',
      icon: AlertTriangle,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      alert: metrics.pedidos_atrasados > 0,
    },
    {
      label: 'Entregas Hoje',
      value: metrics.entregas_hoje,
      subtext: 'Previstas para entrega',
      icon: Truck,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      trend: 'Ver lista →',
    },
    {
      label: 'Faturamento Mês',
      value: formatCurrency(metrics.faturamento_mes),
      subtext: `Ticket médio ${formatCurrency(metrics.ticket_medio)}`,
      icon: DollarSign,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      trend: `${formatCurrency(metrics.faturamento_semana)} esta semana`,
      trendUp: true,
    },
    {
      label: 'Concluídos/Mês',
      value: metrics.pedidos_concluidos_mes,
      subtext: 'Pedidos entregues',
      icon: CheckCircle2,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: `+12% vs. mês anterior`,
      trendUp: true,
    },
    {
      label: 'Taxa de Conclusão',
      value: `${metrics.taxa_conclusao}%`,
      subtext: 'Pedidos no prazo',
      icon: Target,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      trend: metrics.taxa_conclusao >= 90 ? '🏆 Excelente!' : 'Pode melhorar',
      trendUp: metrics.taxa_conclusao >= 80,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={cn(
            'bg-white rounded-xl border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-default',
            card.alert
              ? 'border-red-200 bg-red-50/30'
              : 'border-slate-200'
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', card.iconBg)}>
              <card.icon className={cn('w-4.5 h-4.5', card.iconColor)} />
            </div>
            {card.alert && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1" />
            )}
          </div>
          <div className="space-y-0.5">
            <p className={cn(
              'text-2xl font-bold leading-none',
              card.alert ? 'text-red-600' : 'text-slate-900'
            )}>
              {card.value}
            </p>
            <p className="text-xs font-semibold text-slate-500">{card.label}</p>
            <p className="text-[10px] text-slate-400">{card.subtext}</p>
          </div>
          {card.trend && (
            <p className={cn(
              'text-[10px] mt-2 font-medium',
              card.trendUp ? 'text-emerald-600' : 'text-slate-400'
            )}>
              {card.trendUp && '↑ '}{card.trend}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
