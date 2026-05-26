'use client'

import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { useOrcamentosStore } from '@/stores/orcamentosStore'
import { usePedidosStore } from '@/stores/pedidosStore'
import { useClientesStore } from '@/stores/clientesStore'
import { Button } from '@/components/ui/button'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft, Edit, Trash2, Send, CheckCircle, XCircle,
  User, Clock, Package, MessageCircle, ArrowRight,
} from 'lucide-react'
import { usePermissao } from '@/hooks/usePermissao'
import { Orcamento } from '@/types'

const STATUS_CFG: Record<Orcamento['status'], { label: string; bg: string; cor: string; icone: string }> = {
  rascunho: { label: 'Rascunho', bg: 'bg-slate-100 border-slate-300', cor: 'text-slate-600', icone: '📝' },
  enviado:  { label: 'Enviado',  bg: 'bg-blue-50 border-blue-200',   cor: 'text-blue-700',  icone: '📤' },
  aprovado: { label: 'Aprovado', bg: 'bg-emerald-50 border-emerald-200', cor: 'text-emerald-700', icone: '✅' },
  rejeitado:{ label: 'Rejeitado',bg: 'bg-red-50 border-red-200',    cor: 'text-red-700',   icone: '❌' },
  expirado: { label: 'Expirado', bg: 'bg-amber-50 border-amber-200',  cor: 'text-amber-700', icone: '⏰' },
}

export default function OrcamentoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { getOrcamentoById, alterarStatus, atualizarOrcamento, removerOrcamento } = useOrcamentosStore()
  const { adicionarPedido } = usePedidosStore()
  const { clientes } = useClientesStore()
  const { podeCriarEditar, podeExcluir } = usePermissao()

  const orc = getOrcamentoById(params.id as string)

  if (!orc) {
    return (
      <div className="page-enter">
        <Header titulo="Orçamento não encontrado" />
        <div className="p-6">
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Orçamento não encontrado</h2>
            <Button onClick={() => router.push('/orcamentos')} variant="outline">Voltar</Button>
          </div>
        </div>
      </div>
    )
  }

  const cfg = STATUS_CFG[orc.status]
  const diasRestantes = orc.data_validade
    ? differenceInDays(parseISO(orc.data_validade), new Date())
    : null

  const whatsappMsg = encodeURIComponent(
    `Olá ${orc.cliente?.nome?.split(' ')[0]}! Segue o orçamento *${orc.numero}*:\n\n` +
    (orc.itens ?? []).map((i) => `• ${i.descricao} — ${i.quantidade}un × R$${i.valor_unitario} = R$${i.valor_total}`).join('\n') +
    `\n\n*Total: R$ ${orc.valor_final.toLocaleString('pt-BR')}*` +
    (orc.validade_dias ? `\nValidade: ${orc.validade_dias} dias` : '') +
    (orc.observacoes ? `\n\n${orc.observacoes}` : '')
  )
  const whatsappLink = orc.cliente?.whatsapp
    ? `https://wa.me/55${orc.cliente.whatsapp}?text=${whatsappMsg}`
    : null

  const converterEmPedido = async () => {
    const cliente = clientes.find((c) => c.id === orc.cliente_id)
    const pedido = await adicionarPedido({
      empresa_id: '1',
      cliente_id: orc.cliente_id,
      cliente,
      status: 'novo',
      prioridade: 'normal',
      data_pedido: new Date().toISOString(),
      data_prazo: new Date(Date.now() + 7 * 86400000).toISOString(),
      valor_total: orc.valor_total,
      valor_desconto: orc.desconto,
      valor_final: orc.valor_final,
      status_pagamento: 'pendente',
      valor_pago: 0,
      observacoes: orc.observacoes,
      itens: (orc.itens ?? []).map((i, idx) => ({
        id: `item-orc-${idx}`,
        pedido_id: '',
        descricao: i.descricao,
        modelo: i.modelo,
        tipo_estampa: i.tipo_estampa,
        qtd_pp: 0, qtd_p: 0, qtd_m: 0,
        qtd_g: 0, qtd_gg: 0, qtd_xgg: 0,
        qtd_total: i.quantidade,
        valor_unitario: i.valor_unitario,
        valor_total: i.valor_total,
      })),
    })
    atualizarOrcamento(orc.id, { convertido_pedido_id: pedido.id, status: 'aprovado' })
    router.push(`/pedidos/${pedido.id}`)
  }

  return (
    <div className="page-enter">
      <Header titulo={orc.numero} subtitulo="Detalhes do orçamento" />
      <div className="p-6 max-w-4xl mx-auto space-y-5">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        {/* Cabeçalho */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{orc.numero}</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${cfg.bg} ${cfg.cor}`}>
                  {cfg.icone} {cfg.label}
                </span>
                {orc.convertido_pedido_id && (
                  <button onClick={() => router.push(`/pedidos/${orc.convertido_pedido_id}`)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> Ver Pedido
                  </button>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Criado em {format(parseISO(orc.criado_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                    <MessageCircle className="w-4 h-4" /> Enviar WhatsApp
                  </Button>
                </a>
              )}
              {podeCriarEditar && orc.status === 'rascunho' && (
                <Button variant="outline" onClick={() => alterarStatus(orc.id, 'enviado')} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Send className="w-4 h-4" /> Marcar Enviado
                </Button>
              )}
              {podeCriarEditar && orc.status === 'enviado' && (
                <>
                  <Button variant="outline" onClick={() => alterarStatus(orc.id, 'rejeitado')} className="text-red-500 border-red-200 hover:bg-red-50">
                    <XCircle className="w-4 h-4" /> Rejeitar
                  </Button>
                  <Button onClick={() => alterarStatus(orc.id, 'aprovado')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <CheckCircle className="w-4 h-4" /> Aprovar
                  </Button>
                </>
              )}
              {podeCriarEditar && orc.status === 'aprovado' && !orc.convertido_pedido_id && (
                <Button onClick={converterEmPedido} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <ArrowRight className="w-4 h-4" /> Converter em Pedido
                </Button>
              )}
              {podeCriarEditar && (
                <Button variant="outline" onClick={() => router.push(`/orcamentos/${orc.id}/editar`)}>
                  <Edit className="w-4 h-4" /> Editar
                </Button>
              )}
              {podeExcluir && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (window.confirm(`Excluir orçamento "${orc.numero}"? Esta ação não pode ser desfeita.`)) {
                      removerOrcamento(orc.id)
                      router.push('/orcamentos')
                    }
                  }}
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mb-2">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-xs text-slate-400">Cliente</p>
            <p className="text-sm font-semibold text-slate-800">{orc.cliente?.nome ?? '—'}</p>
            {orc.cliente?.empresa_nome && <p className="text-xs text-slate-400">{orc.cliente.empresa_nome}</p>}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xs text-slate-400">Validade</p>
            <p className="text-sm font-semibold text-slate-800">{orc.validade_dias} dias</p>
            {diasRestantes !== null && (
              <p className={`text-xs ${diasRestantes < 0 ? 'text-red-500' : diasRestantes <= 2 ? 'text-amber-600' : 'text-slate-400'}`}>
                {diasRestantes < 0 ? 'Expirado' : `${diasRestantes}d restantes`}
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mb-2">
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xs text-slate-400">Itens</p>
            <p className="text-sm font-semibold text-slate-800">{(orc.itens ?? []).length} ite{(orc.itens ?? []).length !== 1 ? 'ns' : 'm'}</p>
            <p className="text-xs text-slate-400">{(orc.itens ?? []).reduce((a, i) => a + i.quantidade, 0)} peças</p>
          </div>
          <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
              <span className="text-base">💰</span>
            </div>
            <p className="text-xs text-emerald-600">Valor Total</p>
            <p className="text-lg font-bold text-emerald-700">R$ {orc.valor_final.toLocaleString('pt-BR')}</p>
            {orc.desconto > 0 && <p className="text-xs text-emerald-600">Desconto: R$ {orc.desconto.toLocaleString('pt-BR')}</p>}
          </div>
        </div>

        {/* Itens */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Itens do Orçamento</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {(orc.itens ?? []).map((item, idx) => (
              <div key={idx} className="px-5 py-4 flex items-center gap-4">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">{item.descricao}</span>
                    {item.modelo && <span className="text-xs text-slate-400">{item.modelo}</span>}
                    {item.tipo_estampa && (
                      <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded">
                        {item.tipo_estampa}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{item.quantidade} unidades × R$ {item.valor_unitario}/un</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-slate-800">R$ {item.valor_total.toLocaleString('pt-BR')}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-8">
            {orc.desconto > 0 && (
              <div className="text-sm text-red-500">
                Desconto: - R$ {orc.desconto.toLocaleString('pt-BR')}
              </div>
            )}
            <div className="text-base font-bold text-slate-800">
              Total: R$ {orc.valor_final.toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        {orc.observacoes && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Observações</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{orc.observacoes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
