'use client'

import { Bell, Search, Plus, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  titulo: string
  subtitulo?: string
}

export function Header({ titulo, subtitulo }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 sticky top-0 z-30">
      {/* Title */}
      <div className="flex-1">
        <h1 className="text-slate-900 font-bold text-lg leading-tight">{titulo}</h1>
        {subtitulo && (
          <p className="text-slate-400 text-xs">{subtitulo}</p>
        )}
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar pedidos, clientes..."
          className="pl-9 w-72 bg-slate-50 border-slate-200 text-sm h-9 cursor-default"
          readOnly
          onFocus={(e) => e.target.blur()}
        />
      </div>

      {/* Notifications */}
      <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
        <Bell className="w-4 h-4 text-slate-600" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      </button>

      {/* New Button */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4 text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer">
          <Plus className="w-4 h-4" />
          Novo
          <ChevronDown className="w-3 h-3 opacity-70" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem onClick={() => router.push('/pedidos/novo')}>
            📦 Novo Pedido
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/clientes/novo')}>
            👤 Novo Cliente
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/orcamentos')}>
            📋 Novo Orçamento
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
