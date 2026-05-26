'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { usePedidosStore } from '@/stores/pedidosStore'
import { StatusBadge } from '@/components/pedidos/StatusBadge'
import { PrioridadeBadge } from '@/components/pedidos/PrioridadeBadge'
import { StatusStepper } from '@/components/pedidos/StatusStepper'
import { ArteUploader } from '@/components/pedidos/ArteUploader'
import { WhatsAppModal } from '@/components/shared/WhatsAppModal'
import { Button } from '@/components/ui/button'
import { format, parseISO, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft, Edit, ChevronRight, User, Package,
  CreditCard, Calendar, Truck, Clock, AlertTriangle,
  ImageIcon, MessageCircle, FileText,
} from 'lucide-react'
import { STATUS_CONFIG, PedidoArte } from '@/types'

type Tab = 'detalhes' | 'artes' | 'timeline'

export default function PedidoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { getPedidoById, avancarStatus, atualizarPedido } = usePedidosStore()
  const [tab, setTab] = useState<Tab>('detalhes')
  const [whatsOpen, setWhatsOpen] = useState(false)

  const pedido = getPedidoById(params.id as string)

  if (!pedido) {
    return (
      <div className="page-enter">
        <Header titulo="Pedido não encontrado" />
        <div className="p-6">
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Pedido não encontrado</h2>
            <Button onClick={() => router.push('/pedidos')} variant="outline">Voltar para pedidos</Button>
          </div>
        </div>
      </div>
    )
  }

  const atrasado = !['entregue', 'cancelado'].includes(pedido.status) && isPast(parseISO(pedido.data_prazo))
  const podeAvancar = !['entregue', 'cancelado'].includes(pedido.status)
  const restante = pedido.valor_final - pedido.valor_pago
  const totalItens = (pedido.itens ?? []).reduce((acc, i) => acc + (i.qtd_total ?? 0), 0)
  const artes = pedido.artes ?? []

  const handleAddArte = (arte: PedidoArte) =>
    atualizarPedido(pedido.id, { artes: [...artes, arte] })

  const handleToggleAprovacao = (arteId: string) =>
    atualizarPedido(pedido.id, {
      artes: artes.map((a) =>
        a.id === arteId ? { ...a, aprovado: !a.aprovado, aprovado_em: !a.aprovado ? new Date().toISOString() : undefined } : a
      ),
    })

  const handleRemoverArte = (arteId: string) =>
    atualizarPedido(pedido.id, { artes: artes.filter((a) => a.id !== arteId) })

  return (
    <div className="page-enter">
      <Header titulo={pedido.numero} subtitulo="Detalhes do pedido" />

      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        {/* Cabeçalho */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{pedido.numero}</h1>
                <StatusBadge status={pedido.status} />
                <PrioridadeBadge prioridade={pedido.prioridade} />
                {atrasado && (
                  <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-medium">
                    <AlertTriangle className="w-3 h-3" /> Atrasado
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Criado em {format(parseISO(pedido.criado_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => setWhatsOpen(true)} className="text-green-600 border-green-200 hover:bg-green-50">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </Button>
              {podeAvancar && (
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => avancarStatus(pedido.id)}>
                  <ChevronRight className="w-4 h-4" /> Avançar Status
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push(`/pedidos/${pedido.id}/editar`)}>
                <Edit className="w-4 h-4" /> Editar
              </Button>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 overflow-hidden">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Progresso</h3>
          <StatusStepper status={pedido.status} />
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard icon={<User className="w-4 h-4 text-indigo-600" />} bg="bg-indigo-50"
            label="Cliente" value={pedido.cliente?.nome ?? '—'} sub={pedido.cliente?.empresa_nome}
            onClick={() => pedido.cliente_id && router.push(`/clientes/${pedido.cliente_id}`)} />
          <InfoCard icon={<Calendar className="w-4 h-4 text-amber-600" />} bg="bg-amber-50"
            label="Prazo" value={format(parseISO(pedido.data_prazo), 'dd/MM/yyyy')}
            sub={atrasado ? '⚠️ Atrasado' : undefined} danger={atrasado} />
          <InfoCard icon={<Truck className="w-4 h-4 text-slate-600" />} bg="bg-slate-100"
            label="Entrega"
            value={pedido.tipo_entrega === 'retirada' ? '🏪 Retirada' : pedido.tipo_entrega === 'entrega' ? '🚚 Entrega' : pedido.tipo_entrega === 'correios' ? '📮 Correios' : '—'} />
          <InfoCard icon={<Package className="w-4 h-4 text-purple-600" />} bg="bg-purple-50"
            label="Total de Peças" value={`${totalItens} peças`}
            sub={`${(pedido.itens ?? []).length} ite${(pedido.itens ?? []).length !== 1 ? 'ns' : 'm'}`} />
        </div>

        {/* Financeiro */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">Financeiro</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Valor Total</p>
              <p className="text-lg font-bold text-slate-800">R$ {pedido.valor_final.toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Valor Pago</p>
              <p className="text-lg font-bold text-emerald-600">R$ {pedido.valor_pago.toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Restante</p>
              <p className={`text-lg font-bold ${restante > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                R$ {Math.max(0, restante).toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Pagamento</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-2.5 h-2.5 rounded-full ${pedido.status_pagamento === 'pago' ? 'bg-emerald-500' : pedido.status_pagamento === 'parcial' ? 'bg-amber-500' : 'bg-red-400'}`} />
                <span className="text-sm font-medium text-slate-700 capitalize">{pedido.status_pagamento}</span>
              </div>
              {pedido.forma_pagamento && <p className="text-xs text-slate-400 mt-0.5 capitalize">{pedido.forma_pagamento.replace('_', ' ')}</p>}
            </div>
          </div>
        </div>

        {/* Tabs: Itens / Artes / Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            {([
              { id: 'detalhes', label: 'Itens', icon: <Package className="w-3.5 h-3.5" /> },
              { id: 'artes', label: `Artes ${artes.length > 0 ? `(${artes.length})` : ''}`, icon: <ImageIcon className="w-3.5 h-3.5" /> },
              { id: 'timeline', label: 'Histórico', icon: <Clock className="w-3.5 h-3.5" /> },
            ] as { id: Tab; label: string; icon: React.ReactNode }[]).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Tab: Itens */}
            {tab === 'detalhes' && (
              <>
                {(pedido.itens ?? []).length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">Nenhum item cadastrado</div>
                ) : (
                  <div className="space-y-4">
                    {pedido.itens!.map((item, idx) => (
                      <div key={item.id} className="border border-slate-100 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-slate-800">{idx + 1}. {item.descricao}</span>
                              {item.modelo && <span className="text-xs text-slate-400">{item.modelo}</span>}
                              {item.cor && <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{item.cor}</span>}
                              {item.tipo_estampa && <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded">{item.tipo_estampa}</span>}
                            </div>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              {(['pp','p','m','g','gg','xgg'] as const).map((tam) => {
                                const qtd = item[`qtd_${tam}`]
                                if (!qtd) return null
                                return (
                                  <div key={tam} className="text-center">
                                    <div className="text-xs text-slate-400 uppercase">{tam}</div>
                                    <div className="text-sm font-semibold text-slate-700">{qtd}</div>
                                  </div>
                                )
                              })}
                              <div className="text-center ml-2 pl-2 border-l border-slate-200">
                                <div className="text-xs text-slate-400">Total</div>
                                <div className="text-sm font-bold text-indigo-600">{item.qtd_total}</div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold text-slate-800">R$ {item.valor_total.toLocaleString('pt-BR')}</div>
                            <div className="text-xs text-slate-400">R$ {item.valor_unitario}/un</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {(pedido.observacoes || pedido.observacoes_internas) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {pedido.observacoes && (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Obs. do cliente</p>
                        <p className="text-sm text-slate-600">{pedido.observacoes}</p>
                      </div>
                    )}
                    {pedido.observacoes_internas && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1.5">Obs. internas</p>
                        <p className="text-sm text-amber-800">{pedido.observacoes_internas}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Tab: Artes */}
            {tab === 'artes' && (
              <ArteUploader
                pedidoId={pedido.id}
                artes={artes}
                onAddArte={handleAddArte}
                onToggleAprovacao={handleToggleAprovacao}
                onRemoverArte={handleRemoverArte}
              />
            )}

            {/* Tab: Timeline */}
            {tab === 'timeline' && (
              <>
                {(pedido.timeline ?? []).length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">Nenhum evento registrado</div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200" />
                    <div className="space-y-4">
                      {[...(pedido.timeline ?? [])].reverse().map((evento) => {
                        const statusCfg = evento.status_novo ? STATUS_CONFIG[evento.status_novo] : null
                        return (
                          <div key={evento.id} className="flex gap-4 relative">
                            <div className="w-6 h-6 rounded-full bg-white border-2 border-indigo-300 flex items-center justify-center flex-shrink-0 z-10 text-xs">
                              {statusCfg?.icone ?? '📝'}
                            </div>
                            <div className="flex-1 pt-0.5">
                              <p className="text-sm text-slate-700">{evento.descricao}</p>
                              {evento.status_anterior && evento.status_novo && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {STATUS_CONFIG[evento.status_anterior].label} → {STATUS_CONFIG[evento.status_novo].label}
                                </p>
                              )}
                              <p className="text-xs text-slate-400 mt-0.5">
                                {format(parseISO(evento.criado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {whatsOpen && (
        <WhatsAppModal
          cliente={pedido.cliente}
          pedido={pedido}
          onClose={() => setWhatsOpen(false)}
        />
      )}
    </div>
  )
}

function InfoCard({ icon, bg, label, value, sub, danger, onClick }: {
  icon: React.ReactNode; bg: string; label: string; value: string
  sub?: string; danger?: boolean; onClick?: () => void
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 ${onClick ? 'cursor-pointer hover:border-indigo-200 transition-colors' : ''}`} onClick={onClick}>
      <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>{icon}</div>
      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
      <div className={`text-sm font-semibold ${danger ? 'text-red-600' : 'text-slate-800'}`}>{value}</div>
      {sub && <div className={`text-xs mt-0.5 ${danger ? 'text-red-500' : 'text-slate-400'}`}>{sub}</div>}
    </div>
  )
}
