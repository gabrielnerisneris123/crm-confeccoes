'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, ShoppingBag, Kanban,
  Calculator, DollarSign, Settings, LogOut, Shirt, ChevronRight, Bell,
} from 'lucide-react'
import { usePedidosStore } from '@/stores/pedidosStore'
import { useUsuario } from '@/contexts/UsuarioContext'
import { usePermissao } from '@/hooks/usePermissao'
import { isPast, parseISO } from 'date-fns'

const CARGO_LABELS: Record<string, string> = {
  admin: '👑 Administrador',
  vendedor: '💼 Vendas',
  producao: '🏭 Produção',
  financeiro: '💰 Financeiro',
}

export function Sidebar() {
  const pathname = usePathname()
  const { pedidos } = usePedidosStore()
  const { usuario, logout } = useUsuario()
  const { podeVerFinanceiro, podeVerKanban, podeVerOrcamentos, podeVerConfiguracoes } = usePermissao()

  // Badges dinâmicos
  const pedidosAtivos = pedidos.filter((p) => !['entregue', 'cancelado'].includes(p.status))
  const pedidosAtrasados = pedidos.filter(
    (p) => !['entregue', 'cancelado'].includes(p.status) && isPast(parseISO(p.data_prazo))
  )

  // Iniciais do usuário
  const iniciais = usuario?.nome
    ? usuario.nome.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const navItems = [
    { label: 'Dashboard',       href: '/dashboard',  icon: LayoutDashboard, badge: null as string | null,  mostrar: true },
    { label: 'Clientes',        href: '/clientes',   icon: Users,           badge: null as string | null,  mostrar: true },
    {
      label: 'Pedidos',
      href: '/pedidos',
      icon: ShoppingBag,
      badge: pedidosAtivos.length > 0 ? String(pedidosAtivos.length) : null,
      mostrar: true,
    },
    {
      label: 'Produção / Kanban',
      href: '/producao',
      icon: Kanban,
      badge: pedidosAtrasados.length > 0 ? String(pedidosAtrasados.length) : null,
      badgeVariant: 'destructive' as const,
      mostrar: podeVerKanban,
    },
    { label: 'Orçamentos',      href: '/orcamentos', icon: Calculator,      badge: null as string | null,  mostrar: podeVerOrcamentos },
    { label: 'Financeiro',      href: '/financeiro', icon: DollarSign,      badge: null as string | null,  mostrar: podeVerFinanceiro },
  ].filter((item) => item.mostrar)

  return (
    <aside className="flex flex-col h-screen w-64 bg-[#0f172a] border-r border-[#1e293b] fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1e293b]">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/20">
          <Shirt className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">CRM Confecções</p>
          <p className="text-slate-400 text-xs">Gestão Operacional</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-3">
          Menu Principal
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-400 hover:bg-[#1e293b] hover:text-slate-200'
                  )}
                >
                  <item.icon className={cn(
                    'w-4 h-4 flex-shrink-0',
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                  )} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      'flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold',
                      item.badgeVariant === 'destructive'
                        ? 'bg-red-500 text-white animate-pulse'
                        : isActive ? 'bg-indigo-500 text-white' : 'bg-[#1e293b] text-slate-300'
                    )}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-300" />}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Alerta de pedidos atrasados */}
        {pedidosAtrasados.length > 0 && (
          <div className="mt-6 mb-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-3">
              Alertas
            </p>
            <Link href="/producao" className="block">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mx-1 hover:bg-red-500/20 transition-colors">
                <div className="flex items-start gap-2">
                  <Bell className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 text-xs font-semibold">
                      {pedidosAtrasados.length} pedido{pedidosAtrasados.length !== 1 ? 's' : ''} atrasado{pedidosAtrasados.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-red-400/70 text-[10px] mt-0.5">Ver urgentes →</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-[#1e293b] pt-4">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{iniciais}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-xs font-medium truncate">
              {usuario?.nome ?? 'Carregando...'}
            </p>
            <p className="text-slate-500 text-[10px] truncate">
              {usuario?.cargo ? CARGO_LABELS[usuario.cargo] : '—'}
            </p>
          </div>
        </div>

        {/* Configurações — apenas admin */}
        {podeVerConfiguracoes && (
          <Link
            href="/configuracoes"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-[#1e293b] hover:text-slate-200 transition-all"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            Configurações
          </Link>
        )}

        {/* Sair */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full mt-1"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
