'use client'

import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { useClientesStore } from '@/stores/clientesStore'
import { usePedidosStore } from '@/stores/pedidosStore'
import { TagBadge } from '@/components/clientes/TagBadge'
import { Button } from '@/components/ui/button'
import { STATUS_CONFIG } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MessageCircle,
  AtSign,
  MapPin,
  Building2,
  Calendar,
  Package,
  UserCheck,
  UserX,
} from 'lucide-react'

export default function ClienteDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { getClienteById, toggleAtivo, removerCliente } = useClientesStore()
  const { pedidos } = usePedidosStore()

  const cliente = getClienteById(params.id as string)

  if (!cliente) {
    return (
      <div className="page-enter">
        <Header titulo="Cliente não encontrado" />
        <div className="p-6">
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <h2 className="text-slate-800 font-bold text-xl mb-2">
              Cliente não encontrado
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              O cliente solicitado não existe ou foi removido.
            </p>
            <Button
              onClick={() => router.push('/clientes')}
              variant="outline"
            >
              Voltar para clientes
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const pedidosDoCliente = pedidos.filter(
    (p) => p.cliente_id === cliente.id
  )

  const handleExcluir = () => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome}"? Esta ação não pode ser desfeita.`)) {
      removerCliente(cliente.id)
      router.push('/clientes')
    }
  }
  const iniciais = cliente.nome
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const ticketMedio =
    cliente.total_pedidos && cliente.total_pedidos > 0
      ? Math.round((cliente.valor_total_gasto ?? 0) / cliente.total_pedidos)
      : 0

  return (
    <div className="page-enter">
      <Header titulo={cliente.nome} subtitulo="Ficha do cliente" />

      <div className="p-6 max-w-4xl mx-auto space-y-5">
        {/* Voltar */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </button>

        {/* Cabeçalho do cliente */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${
                  cliente.ativo
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {iniciais}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900">
                    {cliente.nome}
                  </h1>
                  {cliente.tag && <TagBadge tag={cliente.tag} />}
                  {!cliente.ativo && (
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
                      Inativo
                    </span>
                  )}
                </div>
                {cliente.empresa_nome && (
                  <div className="flex items-center gap-1 text-slate-500 text-sm mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {cliente.empresa_nome}
                  </div>
                )}
                <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                  <Calendar className="w-3 h-3" />
                  Cliente desde{' '}
                  {format(new Date(cliente.criado_em), "MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAtivo(cliente.id)}
                className={
                  cliente.ativo
                    ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
                    : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                }
              >
                {cliente.ativo ? (
                  <>
                    <UserX className="w-3.5 h-3.5" />
                    Desativar
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    Ativar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/clientes/${cliente.id}/editar`)}
              >
                <Edit className="w-3.5 h-3.5" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExcluir}
                className="text-red-500 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            emoji="📦"
            label="Total de Pedidos"
            value={String(cliente.total_pedidos ?? 0)}
            cor="text-indigo-600"
          />
          <StatCard
            emoji="💰"
            label="Total Gasto"
            value={`R$ ${(cliente.valor_total_gasto ?? 0).toLocaleString('pt-BR')}`}
            cor="text-emerald-600"
          />
          <StatCard
            emoji="🎯"
            label="Ticket Médio"
            value={`R$ ${ticketMedio.toLocaleString('pt-BR')}`}
            cor="text-amber-600"
          />
          <StatCard
            emoji="🗓️"
            label="Último Pedido"
            value={
              cliente.ultimo_pedido
                ? format(new Date(cliente.ultimo_pedido), 'dd/MM/yy')
                : '—'
            }
            cor="text-slate-600"
          />
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Contato */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Contato
            </h3>
            <div className="space-y-3">
              {cliente.telefone && (
                <InfoRow
                  icon={<Phone className="w-3.5 h-3.5 text-slate-400" />}
                  label="Telefone"
                  value={cliente.telefone}
                  href={`tel:${cliente.telefone}`}
                />
              )}
              {cliente.whatsapp && (
                <InfoRow
                  icon={
                    <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                  }
                  label="WhatsApp"
                  value={cliente.whatsapp}
                  href={`https://wa.me/55${cliente.whatsapp}`}
                  external
                />
              )}
              {cliente.email && (
                <InfoRow
                  icon={<Mail className="w-3.5 h-3.5 text-slate-400" />}
                  label="E-mail"
                  value={cliente.email}
                  href={`mailto:${cliente.email}`}
                />
              )}
              {cliente.instagram && (
                <InfoRow
                  icon={
                    <AtSign className="w-3.5 h-3.5 text-pink-500" />
                  }
                  label="Instagram"
                  value={cliente.instagram}
                  href={`https://instagram.com/${cliente.instagram.replace('@', '')}`}
                  external
                />
              )}
              {!cliente.telefone &&
                !cliente.whatsapp &&
                !cliente.email &&
                !cliente.instagram && (
                  <p className="text-slate-400 text-sm">
                    Nenhum contato cadastrado
                  </p>
                )}
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Endereço
            </h3>
            <div className="space-y-2">
              {(cliente.cidade || cliente.estado) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-700">
                    {[cliente.cidade, cliente.estado]
                      .filter(Boolean)
                      .join(' – ')}
                  </span>
                </div>
              )}
              {cliente.endereco && (
                <p className="text-sm text-slate-500 ml-5">
                  {cliente.endereco}
                </p>
              )}
              {cliente.cep && (
                <p className="text-xs text-slate-400 ml-5">
                  CEP: {cliente.cep}
                </p>
              )}
              {!cliente.cidade &&
                !cliente.estado &&
                !cliente.endereco && (
                  <p className="text-slate-400 text-sm">
                    Endereço não cadastrado
                  </p>
                )}
            </div>
          </div>

          {/* Observações */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Observações
            </h3>
            {cliente.observacoes ? (
              <p className="text-sm text-slate-600 leading-relaxed">
                {cliente.observacoes}
              </p>
            ) : (
              <p className="text-slate-400 text-sm">Nenhuma observação</p>
            )}
          </div>
        </div>

        {/* Histórico de pedidos */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">
              Histórico de Pedidos
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/pedidos')}
            >
              Ver todos
            </Button>
          </div>

          {pedidosDoCliente.length === 0 ? (
            <div className="py-12 flex flex-col items-center text-center">
              <Package className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm font-medium">
                Nenhum pedido ainda
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Os pedidos deste cliente aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pedidosDoCliente.map((pedido) => {
                const cfg = STATUS_CONFIG[pedido.status]
                return (
                  <div
                    key={pedido.id}
                    className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/pedidos`)}
                  >
                    <span className="text-2xl">{cfg.icone}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800">
                          {pedido.numero}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.cor}`}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {format(new Date(pedido.data_pedido), 'dd/MM/yyyy')} —
                        Prazo:{' '}
                        {format(new Date(pedido.data_prazo), 'dd/MM/yyyy')}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-slate-800">
                        R$ {pedido.valor_final.toLocaleString('pt-BR')}
                      </div>
                      <div
                        className={`text-xs ${
                          pedido.status_pagamento === 'pago'
                            ? 'text-emerald-600'
                            : pedido.status_pagamento === 'parcial'
                            ? 'text-amber-600'
                            : 'text-red-500'
                        }`}
                      >
                        {pedido.status_pagamento === 'pago'
                          ? '✓ Pago'
                          : pedido.status_pagamento === 'parcial'
                          ? '◐ Parcial'
                          : 'Pendente'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---- Sub-componentes ---- */

function StatCard({
  emoji,
  label,
  value,
  cor,
}: {
  emoji: string
  label: string
  value: string
  cor: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className={`text-xl font-bold ${cor}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
  href,
  external = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href: string
  external?: boolean
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex items-center gap-2.5 group"
    >
      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
          {value}
        </div>
      </div>
    </a>
  )
}
