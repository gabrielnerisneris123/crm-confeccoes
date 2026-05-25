'use client'

import { GraficoData } from '@/types'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { useState } from 'react'

interface GraficoProducaoProps {
  data: GraficoData[]
}

function formatCurrency(value: number) {
  return `R$ ${value.toLocaleString('pt-BR')}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs">
        <p className="font-semibold text-slate-700 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500">{entry.name}:</span>
            <span className="font-semibold text-slate-800">
              {entry.name === 'Faturamento' ? formatCurrency(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function GraficoProducao({ data }: GraficoProducaoProps) {
  const [view, setView] = useState<'pedidos' | 'faturamento'>('pedidos')

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-slate-900 font-semibold text-sm">Produção da Semana</h3>
          <p className="text-slate-400 text-xs mt-0.5">Pedidos vs Faturamento</p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setView('pedidos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              view === 'pedidos'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Pedidos
          </button>
          <button
            onClick={() => setView('faturamento')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              view === 'faturamento'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Faturamento
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        {view === 'pedidos' ? (
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="data"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="pedidos"
              name="Pedidos"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="concluidos"
              name="Concluídos"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        ) : (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="data"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="faturamento"
              name="Faturamento"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#colorFaturamento)"
              dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
