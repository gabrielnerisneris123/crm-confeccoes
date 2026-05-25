import { Header } from '@/components/shared/Header'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { GraficoProducao } from '@/components/dashboard/GraficoProducao'
import { PedidosRecentes } from '@/components/dashboard/PedidosRecentes'
import { AtividadesRecentes } from '@/components/dashboard/AtividadesRecentes'
import { mockMetrics, mockPedidos, mockGraficoData } from '@/lib/mock-data'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  AlertTriangle,
  Truck,
  Zap,
} from 'lucide-react'

const pedidosAndamento = mockPedidos.filter(
  p => !['entregue', 'cancelado'].includes(p.status)
)

export default function DashboardPage() {
  const hoje = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })
  const hojeFormatado = hoje.charAt(0).toUpperCase() + hoje.slice(1)

  return (
    <div className="page-enter">
      <Header
        titulo="Dashboard"
        subtitulo={hojeFormatado}
      />

      <div className="p-6 space-y-6">

        {/* Alertas rápidos */}
        {mockMetrics.pedidos_atrasados > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700 text-sm font-semibold">
                ⚠️ {mockMetrics.pedidos_atrasados} pedidos atrasados precisam de atenção imediata!
              </p>
              <p className="text-red-500 text-xs mt-0.5">Acesse a produção para verificar o status</p>
            </div>
            <button className="text-red-600 text-xs font-bold hover:text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors">
              Ver agora
            </button>
          </div>
        )}

        {mockMetrics.entregas_hoje > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Truck className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-amber-700 text-sm font-semibold">
                📦 {mockMetrics.entregas_hoje} entregas previstas para hoje
              </p>
              <p className="text-amber-500 text-xs mt-0.5">Certifique-se de que os pedidos estão prontos</p>
            </div>
            <button className="text-amber-600 text-xs font-bold hover:text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">
              Ver lista
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <StatsCards metrics={mockMetrics} />

        {/* Gráfico + Atividades */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <GraficoProducao data={mockGraficoData} />
          </div>

          {/* Mini Kanban Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-slate-900 font-semibold text-sm mb-4">
              Status da Produção
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Novo Pedido', count: 2, color: 'bg-indigo-500', pct: 15 },
                { label: 'Aguard. Aprovação', count: 1, color: 'bg-amber-500', pct: 8 },
                { label: 'Impressão DTF', count: 3, color: 'bg-purple-500', pct: 25 },
                { label: 'Estamparia', count: 2, color: 'bg-pink-500', pct: 18 },
                { label: 'Revisão', count: 1, color: 'bg-orange-500', pct: 8 },
                { label: 'Embalagem', count: 2, color: 'bg-teal-500', pct: 18 },
              ].map((item) => (
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
            <button className="w-full mt-5 text-indigo-600 text-xs font-semibold hover:text-indigo-700 flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
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
