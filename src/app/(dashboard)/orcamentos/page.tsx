import { Header } from '@/components/shared/Header'
import { Calculator } from 'lucide-react'

export default function OrcamentosPage() {
  return (
    <div className="page-enter">
      <Header titulo="Orçamentos" subtitulo="Gere orçamentos inteligentes" />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <Calculator className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-slate-800 font-bold text-xl mb-2">Orçamento Inteligente</h2>
          <p className="text-slate-400 text-sm max-w-sm">
            Em breve: cálculo automático de orçamentos com geração de PDF
            e envio direto pelo WhatsApp.
          </p>
        </div>
      </div>
    </div>
  )
}
