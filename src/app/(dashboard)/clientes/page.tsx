import { Header } from '@/components/shared/Header'
import { Users } from 'lucide-react'

export default function ClientesPage() {
  return (
    <div className="page-enter">
      <Header titulo="Clientes" subtitulo="Gerencie sua base de clientes" />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-slate-800 font-bold text-xl mb-2">Gestão de Clientes</h2>
          <p className="text-slate-400 text-sm max-w-sm">
            Em breve: CRUD completo de clientes com histórico de pedidos,
            valor gasto e frequência de compra.
          </p>
        </div>
      </div>
    </div>
  )
}
