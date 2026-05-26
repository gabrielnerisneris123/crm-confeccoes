'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Cliente, TagCliente } from '@/types'
import { TAG_LIST } from './TagBadge'
import { User, Building2, MapPin, Tag } from 'lucide-react'

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

type FormData = {
  nome: string
  telefone: string
  whatsapp: string
  email: string
  empresa_nome: string
  instagram: string
  cidade: string
  estado: string
  cep: string
  endereco: string
  observacoes: string
  tag: TagCliente | ''
  ativo: boolean
}

export type ClienteFormData = FormData

interface ClienteFormProps {
  clienteInicial?: Partial<Cliente>
  onSubmit: (dados: FormData) => void
  onCancelar: () => void
  loading?: boolean
  modo: 'criar' | 'editar'
}

export function ClienteForm({
  clienteInicial,
  onSubmit,
  onCancelar,
  loading = false,
  modo,
}: ClienteFormProps) {
  const [formData, setFormData] = useState<FormData>({
    nome: clienteInicial?.nome ?? '',
    telefone: clienteInicial?.telefone ?? '',
    whatsapp: clienteInicial?.whatsapp ?? '',
    email: clienteInicial?.email ?? '',
    empresa_nome: clienteInicial?.empresa_nome ?? '',
    instagram: clienteInicial?.instagram ?? '',
    cidade: clienteInicial?.cidade ?? '',
    estado: clienteInicial?.estado ?? '',
    cep: clienteInicial?.cep ?? '',
    endereco: clienteInicial?.endereco ?? '',
    observacoes: clienteInicial?.observacoes ?? '',
    tag: clienteInicial?.tag ?? '',
    ativo: clienteInicial?.ativo ?? true,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dados pessoais */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Dados Pessoais</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Nome completo <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Maria Silva"
              className={errors.nome ? 'border-red-300' : ''}
            />
            {errors.nome && (
              <p className="text-xs text-red-500 mt-1">{errors.nome}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Telefone
            </label>
            <Input
              value={formData.telefone}
              onChange={(e) => handleChange('telefone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              WhatsApp
            </label>
            <Input
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              placeholder="11999999999"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              E-mail
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="maria@exemplo.com"
            />
          </div>
        </div>
      </div>

      {/* Empresa e redes sociais */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Empresa e Redes Sociais</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Empresa / Negócio
            </label>
            <Input
              value={formData.empresa_nome}
              onChange={(e) => handleChange('empresa_nome', e.target.value)}
              placeholder="Academia FitLife"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Instagram
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">
                @
              </span>
              <Input
                value={formData.instagram.replace('@', '')}
                onChange={(e) =>
                  handleChange(
                    'instagram',
                    e.target.value ? `@${e.target.value.replace('@', '')}` : ''
                  )
                }
                placeholder="usuario"
                className="pl-7"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Endereço</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              CEP
            </label>
            <Input
              value={formData.cep}
              onChange={(e) => handleChange('cep', e.target.value)}
              placeholder="00000-000"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Cidade
            </label>
            <Input
              value={formData.cidade}
              onChange={(e) => handleChange('cidade', e.target.value)}
              placeholder="São Paulo"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Estado
            </label>
            <select
              value={formData.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring transition-colors"
            >
              <option value="">Selecione...</option>
              {ESTADOS_BR.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Endereço completo
            </label>
            <Input
              value={formData.endereco}
              onChange={(e) => handleChange('endereco', e.target.value)}
              placeholder="Rua, número, complemento..."
            />
          </div>
        </div>
      </div>

      {/* Tag e Observações */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
            <Tag className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Classificação e Observações</h3>
        </div>

        <div className="space-y-4">
          {/* Tag selector */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Tag do cliente
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleChange('tag', '')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  formData.tag === ''
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                }`}
              >
                Nenhuma
              </button>
              {TAG_LIST.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleChange('tag', t.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${t.className} ${
                    formData.tag === t.value
                      ? 'ring-2 ring-offset-1 ring-slate-400'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <span>{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Observações
            </label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Preferências, notas importantes sobre o cliente..."
              rows={3}
            />
          </div>

          {/* Toggle ativo — só no modo editar */}
          {modo === 'editar' && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-700">Status do cliente</p>
                <p className="text-xs text-slate-400">Clientes inativos não aparecem em buscas</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('ativo', !formData.ativo)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formData.ativo ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    formData.ativo ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 justify-end pb-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancelar}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-36"
        >
          {loading
            ? 'Salvando...'
            : modo === 'criar'
            ? 'Criar Cliente'
            : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
