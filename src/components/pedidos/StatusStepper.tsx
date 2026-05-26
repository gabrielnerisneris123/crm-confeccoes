import { StatusPedido, STATUS_CONFIG } from '@/types'

const STEPS: StatusPedido[] = [
  'novo', 'aguardando_aprovacao', 'aprovado', 'separacao',
  'impressao_dtf', 'estamparia', 'revisao', 'embalagem', 'pronto', 'entregue',
]

interface StatusStepperProps {
  status: StatusPedido
}

export function StatusStepper({ status }: StatusStepperProps) {
  if (status === 'cancelado') {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
        <span className="text-xl">❌</span>
        <div>
          <p className="text-sm font-semibold text-red-700">Pedido Cancelado</p>
          <p className="text-xs text-red-500">Este pedido foi cancelado</p>
        </div>
      </div>
    )
  }

  const currentIdx = STEPS.indexOf(status)

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center min-w-max gap-0">
        {STEPS.map((step, idx) => {
          const cfg = STATUS_CONFIG[step]
          const done = idx < currentIdx
          const current = idx === currentIdx
          const upcoming = idx > currentIdx

          return (
            <div key={step} className="flex items-center">
              {/* Step */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
                    done
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : current
                      ? 'bg-white border-indigo-600 text-indigo-600 shadow-md shadow-indigo-100'
                      : 'bg-white border-slate-200 text-slate-300'
                  }`}
                >
                  {done ? '✓' : cfg.icone}
                </div>
                <span
                  className={`text-xs whitespace-nowrap ${
                    current
                      ? 'text-indigo-600 font-semibold'
                      : done
                      ? 'text-slate-500'
                      : 'text-slate-300'
                  }`}
                >
                  {cfg.label}
                </span>
              </div>

              {/* Connector */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 mx-1 mb-5 rounded-full ${
                    idx < currentIdx ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
