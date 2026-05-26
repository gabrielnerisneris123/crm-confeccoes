'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Shirt, Eye, EyeOff, Loader2, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    })

    if (error) {
      setErro('E-mail ou senha inválidos. Verifique suas credenciais.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-5 ring-4 ring-indigo-500/20">
            <Shirt className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">CRM Confecções</h1>
          <p className="text-slate-400 text-sm mt-1.5">Sistema de Gestão Operacional</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-7 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-white text-sm font-semibold">Acesso ao sistema</h2>
              <p className="text-slate-400 text-xs">Entre com suas credenciais</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-slate-300 text-xs font-medium block mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full bg-slate-900/60 border border-slate-600/60 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Senha */}
            <div>
              <label className="text-slate-300 text-xs font-medium block mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-600/60 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-xs">
                ⚠️ {erro}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading || !email || !senha}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-1 shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-5 pt-5 border-t border-slate-700/50">
            <p className="text-slate-500 text-xs text-center leading-relaxed">
              Acesso restrito aos colaboradores.<br />
              Contate o administrador para obter credenciais.
            </p>
          </div>
        </div>

        {/* Níveis de acesso */}
        <div className="mt-5 grid grid-cols-4 gap-2">
          {[
            { cargo: 'Admin', emoji: '👑', desc: 'Total' },
            { cargo: 'Vendas', emoji: '💼', desc: 'Pedidos' },
            { cargo: 'Produção', emoji: '🏭', desc: 'Kanban' },
            { cargo: 'Financeiro', emoji: '💰', desc: 'Financeiro' },
          ].map((n) => (
            <div key={n.cargo} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-2.5 text-center">
              <div className="text-base mb-0.5">{n.emoji}</div>
              <div className="text-slate-300 text-[10px] font-semibold">{n.cargo}</div>
              <div className="text-slate-500 text-[9px]">{n.desc}</div>
            </div>
          ))}
        </div>

        <p className="text-slate-600 text-xs text-center mt-5">
          TCC — Sistema CRM para Confecções © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
