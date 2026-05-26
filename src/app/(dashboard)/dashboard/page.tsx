'use client'

import { Header } from '@/components/shared/Header'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { GraficoProducao } from '@/components/dashboard/GraficoProducao'
import { PedidosRecentes } from '@/components/dashboard/PedidosRecentes'
import { AtividadesRecentes } from '@/components/dashboard/AtividadesRecentes'
import { mockMetrics, mockGraficoData } from '@/lib/mock-data'
import { usePedidosStore } from '@/stores/pedidosStore'
import { format, isPast, parseISO, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertTriangle, Truck, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { STATUS_CONFIG } from '@/types'

const STATUS_PRODUCAO = [
  { key: 'novo',                label: 'Novo Pedido',       color: 'bg-indigo-500' },
  { key: 'aguardando_aprovacao',label: 'Aguard. Aprovação', color: 'bg-amber-500'  },
  { key: 'impressao_dtf',       label: 'Impressão DTF',     color: 'bg-purple-500' },
  { key: 'estamparia',          label: 'Estamparia',        color: 'bg-pink-500'   },
  { key: 'revisao',             label: 'Revisão',           color: 'bg-orange-500' },
  { key: 'embalagem',           label: 'Embalagem',         color: 'bg-teal-500'   },
] as const

export default function DashboardPage() {
  const router = useRouter()
  const { pedidos } = usePedidosStore()

  const hoje = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })
  const hojeFormatado = hoje.charAt(0).toUpperCase() + hoje.slice(1)

  const pedidosAtivos = pedidos.filter(
    (p) => !['entregue', 'cancelado'].includes(p.status)
  )

  const pedidosAndamento = pedidosAtivos

  // Cálculos reais para alertas
  const pedidosAtrasados = pedidosAtivos.filter(
    (p) => isPast(parseISO(p.data_prazo))
  )
  const entregasHoje = pedidos.filter(
    (p) => !['cancelado'].includes(p.status) && isToday(parseISO(p.data_prazo))
  )

  // Contagem por status para o mini-kanban
  const contagemPorStatus = STATUS_PRODUCAO.map(({ key, label, color }) => {
    const count = pedidosAtivos.filter((p) => p.status === key).length
    const totalAtivos = pedidosAtivos.length
    const pct = totalAtivos > 0 ? Math.round((count / totalAtivos) * 100) : 0
    return { label, count, color, pct }
  })

  return (
    <div className="page-enter">
      <Header titulo="Dashboard" subtitulo={hojeFormatado} />

      <div className="p-6 space-y-6">

        {/* Alertas rápidos */}
        {pedidosAtrasados.length > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700 text-sm font-semibold">
                ⚠️ {pedidosAtrasados.length} pedido{pedidosAtrasados.length !== 1 ? 's' : ''} atrasado{pedidosAtrasados.length !== 1 ? 's' : ''} — atenção imediata!
              </p>
              <p className="text-red-500 text-xs mt-0.5">Acesse a produção para verificar o status</p>
            </div>
            <button
              onClick={() => router.push('/producao')}
              className="text-red-600 text-xs font-bold hover:text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Ver agora
            </button>
          </div>
        )}

        {entregasHoje.length > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Truck className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-amber-700 text-sm font-semibold">
                📦 {entregasHoje.length} entrega{entregasHoje.length !== 1 ? 's' : ''} prevista{entregasHoje.length !== 1 ? 's' : ''} para hoje
              </p>
              <p className="text-amber-500 text-xs mt-0.5">Certifique-se de que os pedidos estão prontos</p>
            </div>
            <button
              onClick={() => router.push('/pedidos')}
              className="text-amber-600 text-xs font-bold hover:text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Ver lista
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <StatsCards metrics={mockMetrics} />

        {/* Gráfico + Mini Kanban */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <GraficoProducao data={mockGraficoData} />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-slate-900 font-semibold text-sm mb-4">Status da Produção</h3>
            {contagemPorStatus.every((s) => s.count === 0) ? (
              <div className="py-6 text-center text-slate-400 text-sm">
                Nenhum pedido em produção
              </div>
            ) : (
              <div className="space-y-3">
                {contagemPorStatus.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">{item.label}</span>
                      <span className="text-slate-500 font-bold">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => router.push('/producao')}
              className="w-full mt-5 text-indigo-600 text-xs font-semibold hover:text-indigo-700 flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Abrir Kanban completo
            </button>
          </div>
        </div>

        {/* Pedidos + Atividades */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <PedidosRecentes pedidos={pedidosAndamento} />
          </div>
          <div>
            <AtividadesRecentes />
          </div>
        </div>

      </div>
    </div>
  )
}
