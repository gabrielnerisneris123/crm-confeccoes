import { Header } from '@/components/shared/Header'
import { Kanban } from 'lucide-react'

export default function ProducaoPage() {
  return (
    <div className="page-enter">
      <Header titulo="Produção / Kanban" subtitulo="Controle visual do fluxo de produção" />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <Kanban className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-slate-800 font-bold text-xl mb-2">Kanban de Produção</h2>
          <p className="text-slate-400 text-sm max-w-sm">
            Em breve: Kanban visual com drag & drop, cards de pedidos,
            filtros e alertas de prazo em tempo real.
          </p>
        </div>
      </div>
    </div>
  )
}
