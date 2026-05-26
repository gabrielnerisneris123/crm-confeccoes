'use client'

import { useState } from 'react'
import { MessageCircle, Copy, ExternalLink, X, CheckCircle } from 'lucide-react'
import { Cliente, Pedido } from '@/types'

type Template = {
  id: string
  label: string
  emoji: string
  getMensagem: (ctx: { cliente?: Cliente; pedido?: Pedido }) => string
}

const TEMPLATES: Template[] = [
  {
    id: 'orcamento',
    label: 'Enviar Orçamento',
    emoji: '💰',
    getMensagem: ({ cliente, pedido }) =>
      `Olá ${cliente?.nome?.split(' ')[0] ?? 'cliente'}! 👋\n\nSegue o orçamento solicitado. Qualquer dúvida estou à disposição!\n\nAguardo seu retorno. 😊`,
  },
  {
    id: 'confirmacao',
    label: 'Pedido Confirmado',
    emoji: '✅',
    getMensagem: ({ cliente, pedido }) =>
      `Olá ${cliente?.nome?.split(' ')[0] ?? 'cliente'}! ✅\n\nSeu pedido *${pedido?.numero ?? ''}* foi confirmado e está em produção!\n\n` +
      `📅 Prazo previsto: ${pedido?.data_prazo ? new Date(pedido.data_prazo).toLocaleDateString('pt-BR') : ''}\n\nQualquer dúvida, pode chamar! 😊`,
  },
  {
    id: 'arte',
    label: 'Arte para Aprovação',
    emoji: '🎨',
    getMensagem: ({ cliente, pedido }) =>
      `Olá ${cliente?.nome?.split(' ')[0] ?? 'cliente'}! 🎨\n\nA arte do seu pedido *${pedido?.numero ?? ''}* está pronta para aprovação!\n\nPor favor, confirme se está tudo certo para darmos início à produção. ✅`,
  },
  {
    id: 'pronto',
    label: 'Pedido Pronto',
    emoji: '✨',
    getMensagem: ({ cliente, pedido }) =>
      `Olá ${cliente?.nome?.split(' ')[0] ?? 'cliente'}! ✨\n\nSeu pedido *${pedido?.numero ?? ''}* está PRONTO!\n\n` +
      `${pedido?.tipo_entrega === 'retirada' ? '🏪 Pode vir retirar quando preferir!' : '🚚 Em breve entraremos em contato para combinar a entrega.'}\n\nObrigado pela preferência! 🙏`,
  },
  {
    id: 'cobranca',
    label: 'Lembrete de Pagamento',
    emoji: '💳',
    getMensagem: ({ cliente, pedido }) =>
      `Olá ${cliente?.nome?.split(' ')[0] ?? 'cliente'}! 😊\n\nPassando para lembrar sobre o pagamento pendente do pedido *${pedido?.numero ?? ''}*.\n\n` +
      `💰 Valor: R$ ${pedido?.valor_final?.toLocaleString('pt-BR') ?? ''}\n\nQualquer dúvida estou à disposição!`,
  },
  {
    id: 'atraso',
    label: 'Aviso de Atraso',
    emoji: '⏰',
    getMensagem: ({ cliente, pedido }) =>
      `Olá ${cliente?.nome?.split(' ')[0] ?? 'cliente'}, tudo bem? 😊\n\nPassando para informar que o pedido *${pedido?.numero ?? ''}* sofreu um pequeno atraso na produção.\n\nEstamos trabalhando para entregar o mais breve possível. Pedimos desculpas pelo inconveniente! 🙏`,
  },
]

interface WhatsAppModalProps {
  cliente?: Cliente
  pedido?: Pedido
  onClose: () => void
}

export function WhatsAppModal({ cliente, pedido, onClose }: WhatsAppModalProps) {
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id)
  const [mensagemCustom, setMensagemCustom] = useState('')
  const [copiado, setCopiado] = useState(false)

  const template = TEMPLATES.find((t) => t.id === templateId)!
  const mensagem = mensagemCustom || template.getMensagem({ cliente, pedido })
  const numero = cliente?.whatsapp || cliente?.telefone?.replace(/\D/g, '')
  const link = numero ? `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}` : null

  const copiar = () => {
    navigator.clipboard.writeText(mensagem)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-green-500 text-white">
          <MessageCircle className="w-5 h-5" />
          <div className="flex-1">
            <h2 className="font-bold text-sm">Enviar via WhatsApp</h2>
            {cliente && <p className="text-xs text-green-100">{cliente.nome} — {numero ? `+55 ${numero}` : 'Sem número'}</p>}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-green-600 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Templates */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Modelo de mensagem</p>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => { setTemplateId(t.id); setMensagemCustom('') }}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    templateId === t.id ? 'border-green-400 bg-green-50 text-green-700' : 'border-slate-200 hover:border-green-300 text-slate-600'
                  }`}>
                  <span className="text-lg">{t.emoji}</span>
                  <span className="text-center leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview / edit */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mensagem</p>
            <textarea
              value={mensagemCustom || mensagem}
              onChange={(e) => setMensagemCustom(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-colors resize-none leading-relaxed font-mono"
            />
            {mensagemCustom && (
              <button onClick={() => setMensagemCustom('')} className="text-xs text-slate-400 hover:text-slate-600 mt-1">
                ↩ Restaurar template
              </button>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <button onClick={copiar}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                copiado ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}>
              {copiado ? <><CheckCircle className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
            </button>

            {link ? (
              <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  Abrir WhatsApp
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </button>
              </a>
            ) : (
              <div className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-slate-100 text-slate-400 text-sm">
                Sem número cadastrado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
