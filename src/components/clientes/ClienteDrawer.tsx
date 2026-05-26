'use client'

import { useEffect } from 'react'
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  AtSign,
  MapPin,
  Building2,
  Calendar,
  Edit,
} from 'lucide-react'
import { Cliente, STATUS_CONFIG } from '@/types'
import { TagBadge } from './TagBadge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { usePedidosStore } from '@/stores/pedidosStore'
import { useRouter } from 'next/navigation'

interface ClienteDrawerProps {
  cliente: Cliente | null
  open: boolean
  onClose: () => void
  onEditar: (id: string) => void
  onDesativar: (id: string) => void
}

export function ClienteDrawer({
  cliente,
  open,
  onClose,
  onEditar,
}: ClienteDrawerProps) {
  const router = useRouter()
  const { pedidos: todosPedidos } = usePedidosStore()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const pedidos = cliente
    ? todosPedidos.filter((p) => p.cliente_id === cliente.id)
    : []

  const iniciais = cliente
    ? cliente.nome
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : ''

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-900 text-sm">Detalhes do Cliente</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        {cliente && (
          <div className="flex-1 overflow-y-auto">
            {/* Client hero */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                    cliente.ativo
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {iniciais}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base">
                      {cliente.nome}
                    </h3>
                    {cliente.tag && <TagBadge tag={cliente.tag} />}
                    {!cliente.ativo && (
                      <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
                        Inativo
                      </span>
                    )}
                  </div>
                  {cliente.empresa_nome && (
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                      <Building2 className="w-3 h-3" />
                      {cliente.empresa_nome}
                    </div>
                  )}
                  {(cliente.cidade || cliente.estado) && (
                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {[cliente.cidade, cliente.estado].filter(Boolean).join(' – ')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-px bg-slate-100">
              <div className="bg-white p-4 text-center">
                <div className="text-xl font-bold text-indigo-600">
                  {cliente.total_pedidos ?? 0}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Pedidos</div>
              </div>
              <div className="bg-white p-4 text-center">
                <div className="text-xl font-bold text-emerald-600">
                  R${' '}
                  {(cliente.valor_total_gasto ?? 0) >= 1000
                    ? `${((cliente.valor_total_gasto ?? 0) / 1000).toFixed(1)}k`
                    : (cliente.valor_total_gasto ?? 0)}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Total</div>
              </div>
              <div className="bg-white p-4 text-center">
                <div className="text-xl font-bold text-amber-600">
                  R${' '}
                  {cliente.total_pedidos && cliente.total_pedidos > 0
                    ? Math.round(
                        (cliente.valor_total_gasto ?? 0) / cliente.total_pedidos
                      )
                    : 0}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Ticket</div>
              </div>
            </div>

            {/* Contato */}
            <div className="p-5 border-t border-slate-100 space-y-2.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Contato
              </p>

              {cliente.telefone && (
                <ContactRow
                  icon={<Phone className="w-3.5 h-3.5 text-slate-500" />}
                  bg="bg-slate-50"
                  href={`tel:${cliente.telefone}`}
                  text={cliente.telefone}
                />
              )}
              {cliente.whatsapp && (
                <ContactRow
                  icon={<MessageCircle className="w-3.5 h-3.5 text-green-500" />}
                  bg="bg-green-50"
                  href={`https://wa.me/55${cliente.whatsapp}`}
                  text={`WhatsApp: ${cliente.whatsapp}`}
                  external
                />
              )}
              {cliente.email && (
                <ContactRow
                  icon={<Mail className="w-3.5 h-3.5 text-slate-500" />}
                  bg="bg-slate-50"
                  href={`mailto:${cliente.email}`}
                  text={cliente.email}
                />
              )}
              {cliente.instagram && (
                <ContactRow
                  icon={<AtSign className="w-3.5 h-3.5 text-pink-500" />}
                  bg="bg-pink-50"
                  href={`https://instagram.com/${cliente.instagram.replace('@', '')}`}
                  text={cliente.instagram}
                  external
                />
              )}

              {!cliente.telefone &&
                !cliente.whatsapp &&
                !cliente.email &&
                !cliente.instagram && (
                  <p className="text-slate-400 text-sm">Sem contatos registrados</p>
                )}
            </div>

            {/* Pedidos recentes */}
            {pedidos.length > 0 && (
              <div className="px-5 pb-5 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 pt-5">
                  Pedidos Recentes
                </p>
                <div className="space-y-2">
                  {pedidos.slice(0, 3).map((pedido) => {
                    const cfg = STATUS_CONFIG[pedido.status]
                    return (
                      <div
                        key={pedido.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                        onClick={() => {
                          onClose()
                          router.push(`/pedidos/${pedido.id}`)
                        }}
                      >
                        <span className="text-lg">{cfg.icone}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800">
                            {pedido.numero}
                          </div>
                          <div className="text-xs text-slate-400">{cfg.label}</div>
                        </div>
                        <div className="text-sm font-semibold text-slate-700">
                          R$ {pedido.valor_final.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Observações */}
            {cliente.observacoes && (
              <div className="px-5 pb-5 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 pt-5">
                  Observações
                </p>
                <p className="text-sm text-slate-600 bg-amber-50 border border-amber-100 rounded-xl p-3 leading-relaxed">
                  {cliente.observacoes}
                </p>
              </div>
            )}

            {/* Membro desde */}
            <div className="px-5 pb-6 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Cliente desde{' '}
                {format(new Date(cliente.criado_em), "MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        {cliente && (
          <div className="p-4 border-t border-slate-200 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onClose()
                router.push(`/clientes/${cliente.id}`)
              }}
            >
              Ver Completo
            </Button>
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => {
                onClose()
                onEditar(cliente.id)
              }}
            >
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

function ContactRow({
  icon,
  bg,
  href,
  text,
  external = false,
}: {
  icon: React.ReactNode
  bg: string
  href: string
  text: string
  external?: boolean
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex items-center gap-3 text-sm text-slate-700 hover:text-indigo-600 transition-colors"
    >
      <div
        className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <span className="truncate">{text}</span>
    </a>
  )
}
