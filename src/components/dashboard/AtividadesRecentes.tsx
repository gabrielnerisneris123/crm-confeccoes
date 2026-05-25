'use client'

import { mockAtividades } from '@/lib/mock-data'

export function AtividadesRecentes() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-slate-900 font-semibold text-sm">Atividades Recentes</h3>
        <p className="text-slate-400 text-xs mt-0.5">Últimas ações no sistema</p>
      </div>

      <div className="divide-y divide-slate-50">
        {mockAtividades.map((atividade) => (
          <div key={atividade.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-sm">
              {atividade.icone}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-700 text-xs font-medium leading-snug">
                {atividade.descricao}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-slate-400 text-[10px]">{atividade.usuario}</span>
                <span className="text-slate-300 text-[10px]">·</span>
                <span className="text-slate-400 text-[10px]">{atividade.tempo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <button className="text-indigo-600 text-xs font-medium hover:text-indigo-700">
          Ver histórico completo →
        </button>
      </div>
    </div>
  )
}
