'use client'

import { useState } from 'react'
import { Header } from '@/components/shared/Header'
import { Building2, User, Bell, Palette, Save, Check, Shield, Smartphone } from 'lucide-react'

type Tab = 'empresa' | 'perfil' | 'notificacoes' | 'aparencia'

export default function ConfiguracoesPage() {
  const [tab, setTab] = useState<Tab>('empresa')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-enter">
      <Header titulo="Configurações" subtitulo="Gerencie as preferências do sistema" />

      <div className="p-6 max-w-4xl mx-auto space-y-5">
        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {([
              { id: 'empresa',       label: 'Empresa',       icon: <Building2 className="w-3.5 h-3.5" /> },
              { id: 'perfil',        label: 'Perfil',        icon: <User className="w-3.5 h-3.5" /> },
              { id: 'notificacoes',  label: 'Notificações',  icon: <Bell className="w-3.5 h-3.5" /> },
              { id: 'aparencia',     label: 'Aparência',     icon: <Palette className="w-3.5 h-3.5" /> },
            ] as { id: Tab; label: string; icon: React.ReactNode }[]).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  tab === t.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Empresa */}
            {tab === 'empresa' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Dados da Empresa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nome da Empresa" defaultValue="Confecções Modelo" />
                    <Field label="CNPJ" defaultValue="12.345.678/0001-99" />
                    <Field label="Telefone" defaultValue="(11) 3333-4444" />
                    <Field label="WhatsApp Comercial" defaultValue="(11) 99999-0000" />
                    <Field label="E-mail" defaultValue="contato@confeccoes.com.br" className="md:col-span-2" />
                    <Field label="Site" defaultValue="www.confeccoes.com.br" className="md:col-span-2" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Endereço" defaultValue="Rua das Flores, 123" className="md:col-span-2" />
                    <Field label="Cidade" defaultValue="São Paulo" />
                    <Field label="Estado" defaultValue="SP" />
                    <Field label="CEP" defaultValue="01310-100" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Financeiro</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-500">Formas de Pagamento Aceitas</label>
                      <div className="space-y-2 mt-1">
                        {['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Dinheiro', 'Transferência'].map((m) => (
                          <label key={m} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded accent-indigo-600" />
                            {m}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <Field label="Prazo padrão de entrega (dias)" defaultValue="7" type="number" />
                      <Field label="Validade padrão de orçamento (dias)" defaultValue="15" type="number" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Perfil */}
            {tab === 'perfil' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Dados do Usuário</h3>
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-700 flex-shrink-0">
                      AD
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Foto de perfil</p>
                      <button className="text-xs text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors">
                        Alterar foto
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nome" defaultValue="Administrador" />
                    <Field label="Cargo" defaultValue="Gerente" />
                    <Field label="E-mail" defaultValue="admin@confeccoes.com" className="md:col-span-2" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-400" />
                    Segurança
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Senha atual" type="password" placeholder="••••••••" />
                    <div />
                    <Field label="Nova senha" type="password" placeholder="••••••••" />
                    <Field label="Confirmar nova senha" type="password" placeholder="••••••••" />
                  </div>
                </div>
              </div>
            )}

            {/* Notificações */}
            {tab === 'notificacoes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-400" /> Alertas do Sistema
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Pedidos atrasados', sub: 'Notifica quando um pedido ultrapassa o prazo', on: true },
                      { label: 'Novo pedido criado', sub: 'Alerta ao criar um novo pedido', on: true },
                      { label: 'Pagamento recebido', sub: 'Confirmação de recebimento de pagamento', on: true },
                      { label: 'Orçamento aprovado', sub: 'Quando um cliente aprova um orçamento', on: false },
                      { label: 'Arte enviada para aprovação', sub: 'Quando uma arte está aguardando retorno', on: true },
                    ].map((item) => (
                      <ToggleRow key={item.label} label={item.label} sub={item.sub} defaultChecked={item.on} />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-400" /> WhatsApp Automático
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Confirmação de pedido', sub: 'Enviar mensagem ao criar pedido', on: false },
                      { label: 'Lembrete de pagamento', sub: 'Avisar cliente 3 dias antes do vencimento', on: false },
                      { label: 'Pedido pronto para retirada', sub: 'Notificar quando status mudar para Pronto', on: true },
                    ].map((item) => (
                      <ToggleRow key={item.label} label={item.label} sub={item.sub} defaultChecked={item.on} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Aparência */}
            {tab === 'aparencia' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Tema do Sistema</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Indigo (Padrão)', colors: ['#6366f1', '#0f172a'], active: true },
                      { label: 'Emerald', colors: ['#10b981', '#0f172a'], active: false },
                      { label: 'Rose', colors: ['#f43f5e', '#0f172a'], active: false },
                    ].map((theme) => (
                      <button key={theme.label}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${theme.active ? 'border-indigo-500' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div className="flex gap-1.5 mb-2">
                          {theme.colors.map((c) => (
                            <div key={c} className="w-5 h-5 rounded-full" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <p className="text-xs font-medium text-slate-700">{theme.label}</p>
                        {theme.active && <p className="text-xs text-indigo-600 mt-0.5">Ativo</p>}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Preferências de Exibição</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Sidebar compacta', sub: 'Reduz o tamanho da barra lateral', on: false },
                      { label: 'Animações', sub: 'Transições e animações da interface', on: true },
                      { label: 'Confirmar antes de excluir', sub: 'Solicitar confirmação ao deletar registros', on: true },
                    ].map((item) => (
                      <ToggleRow key={item.label} label={item.label} sub={item.sub} defaultChecked={item.on} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Salvar */}
        <div className="flex justify-end">
          <button onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              saved
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}>
            {saved ? <><Check className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar alterações</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, defaultValue, className = '', type = 'text', placeholder }: {
  label: string; defaultValue?: string; className?: string; type?: string; placeholder?: string
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
      />
    </div>
  )
}

function ToggleRow({ label, sub, defaultChecked }: { label: string; sub: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 flex-shrink-0">
        <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-10 h-5 rounded-full bg-slate-200 peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</p>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
    </label>
  )
}
