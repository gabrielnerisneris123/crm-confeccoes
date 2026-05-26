'use client'

import { Header } from '@/components/shared/Header'
import { usePedidosStore } from '@/stores/pedidosStore'
import { useRouter } from 'next/navigation'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { format, parseISO, startOfMonth, isSameMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MESES = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i))

export default function FinanceiroPage() {
  const router = useRouter()
  const { pedidos } = usePedidosStore()

  const pedidosAtivos = pedidos.filter((p) => p.status !== 'cancelado')

  // Stats gerais
  const faturamentoTotal = pedidosAtivos.reduce((acc, p) => acc + p.valor_final, 0)
  const totalRecebido = pedidosAtivos.reduce((acc, p) => acc + p.valor_pago, 0)
  const totalPendente = faturamentoTotal - totalRecebido
  const pedidosPendentes = pedidosAtivos.filter((p) => p.status_pagamento !== 'pago').length
  const pedidosPagos = pedidosAtivos.filter((p) => p.status_pagamento === 'pago').length

  // Faturamento por mês
  const faturamentoPorMes = MESES.map((mes) => {
    const pedidosDoMes = pedidosAtivos.filter((p) =>
      isSameMonth(parseISO(p.data_pedido), mes)
    )
    return {
      mes: format(mes, 'MMM', { locale: ptBR }),
      faturamento: pedidosDoMes.reduce((acc, p) => acc + p.valor_final, 0),
      recebido: pedidosDoMes.reduce((acc, p) => acc + p.valor_pago, 0),
      pedidos: pedidosDoMes.length,
    }
  })

  // Por forma de pagamento
  const pagamentosMap = pedidosAtivos.reduce<Record<string, number>>((acc, p) => {
    const key = p.forma_pagamento || 'Não definido'
    acc[key] = (acc[key] ?? 0) + p.valor_final
    return acc
  }, {})
  const pieData = Object.entries(pagamentosMap).map(([name, value]) => ({ name, value }))
  const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  // Pendentes ordenados por valor
  const pendentes = pedidosAtivos
    .filter((p) => p.status_pagamento !== 'pago' && p.status !== 'cancelado')
    .sort((a, b) => (b.valor_final - b.valor_pago) - (a.valor_final - a.valor_pago))
    .slice(0, 6)

  // Recentes pagos
  const recentesPagos = pedidosAtivos
    .filter((p) => p.status_pagamento === 'pago')
    .slice(0, 5)

  const taxaAdimplencia = pedidosAtivos.length > 0
    ? Math.round((pedidosPagos / pedidosAtivos.length) * 100)
    : 0

  return (
    <div className="page-enter">
      <Header titulo="Financeiro" subtitulo="Controle de faturamento e pagamentos" />

      <div className="p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<DollarSign className="w-5 h-5 text-indigo-600" />} bg="bg-indigo-50"
            label="Faturamento Total" value={`R$ ${faturamentoTotal.toLocaleString('pt-BR')}`} />
          <StatCard icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} bg="bg-emerald-50"
            label="Total Recebido" value={`R$ ${totalRecebido.toLocaleString('pt-BR')}`} trend="up" />
          <StatCard icon={<Clock className="w-5 h-5 text-amber-600" />} bg="bg-amber-50"
            label="A Receber" value={`R$ ${totalPendente.toLocaleString('pt-BR')}`}
            sub={`${pedidosPendentes} pedido${pedidosPendentes !== 1 ? 's' : ''}`} />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-purple-600" />} bg="bg-purple-50"
            label="Adimplência" value={`${taxaAdimplencia}%`}
            sub={`${pedidosPagos} de ${pedidosAtivos.length} pedidos`} />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Faturamento por mês */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">Faturamento × Recebido (últimos 6 meses)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={faturamentoPorMes} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`R$ ${Number(v).toLocaleString('pt-BR')}`, '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="faturamento" name="Faturado" fill="#e0e7ff" radius={[6, 6, 0, 0]} />
                <Bar dataKey="recebido" name="Recebido" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-100 inline-block" /> Faturado</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block" /> Recebido</span>
            </div>
          </div>

          {/* Pizza por forma de pagamento */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">Por Forma de Pagamento</h3>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                      dataKey="value" stroke="none">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`R$ ${Number(v).toLocaleString('pt-BR')}`, '']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {pieData.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-slate-600 capitalize">{entry.name.replace('_', ' ')}</span>
                      </div>
                      <span className="font-medium text-slate-700">R$ {entry.value.toLocaleString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Sem dados</div>
            )}
          </div>
        </div>

        {/* Contas a receber + Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pendentes */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Contas a Receber</h3>
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                {pedidosPendentes} pendente{pedidosPendentes !== 1 ? 's' : ''}
              </span>
            </div>
            {pendentes.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                Tudo em dia! 🎉
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendentes.map((p) => {
                  const aReceber = p.valor_final - p.valor_pago
                  return (
                    <div key={p.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/pedidos/${p.id}`)}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status_pagamento === 'parcial' ? 'bg-amber-400' : 'bg-red-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800">{p.numero}</div>
                        <div className="text-xs text-slate-400">{p.cliente?.nome}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-amber-600">R$ {aReceber.toLocaleString('pt-BR')}</div>
                        <div className="text-xs text-slate-400 capitalize">{p.status_pagamento}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recentes pagos */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Pagamentos Recentes</h3>
              <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                ✓ {pedidosPagos} pago{pedidosPagos !== 1 ? 's' : ''}
              </span>
            </div>
            {recentesPagos.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">Nenhum pagamento registrado</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentesPagos.map((p) => (
                  <div key={p.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/pedidos/${p.id}`)}>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800">{p.numero}</div>
                      <div className="text-xs text-slate-400">{p.cliente?.nome}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-600">R$ {p.valor_pago.toLocaleString('pt-BR')}</div>
                      {p.forma_pagamento && (
                        <div className="text-xs text-slate-400 capitalize">{p.forma_pagamento.replace('_', ' ')}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, bg, label, value, sub, trend }: {
  icon: React.ReactNode; bg: string; label: string; value: string; sub?: string; trend?: 'up' | 'down'
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <div className="text-xl font-bold text-slate-800 truncate">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
        {sub && <div className="text-xs text-slate-400">{sub}</div>}
      </div>
    </div>
  )
}
