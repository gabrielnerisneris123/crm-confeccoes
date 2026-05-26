'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Orcamento, OrcamentoItem, TipoEstampa } from '@/types'
import { useClientesStore } from '@/stores/clientesStore'
import { Calculator, Plus, Trash2, User, Package, FileText, AlertTriangle } from 'lucide-react'

type ItemForm = {
  id: string
  descricao: string
  modelo: string
  tipo_estampa: TipoEstampa | ''
  quantidade: number
  valor_unitario: number
}

export type OrcamentoFormData = {
  cliente_id: string
  validade_dias: number
  desconto: number
  observacoes: string
  itens: ItemForm[]
}

interface OrcamentoFormProps {
  orcamentoInicial?: Partial<Orcamento>
  onSubmit: (dados: OrcamentoFormData) => void
  onCancelar: () => void
  loading?: boolean
  modo: 'criar' | 'editar'
}

const novoItem = (): ItemForm => ({
  id: `i-${Date.now()}-${Math.random()}`,
  descricao: '', modelo: '', tipo_estampa: '',
  quantidade: 0, valor_unitario: 0,
})

const TIPOS_ESTAMPA: TipoEstampa[] = ['DTF', 'silk_screen', 'bordado', 'sublimacao', 'transfer', 'laser', 'outro']

export function OrcamentoForm({ orcamentoInicial, onSubmit, onCancelar, loading, modo }: OrcamentoFormProps) {
  const { clientes } = useClientesStore()

  const itensIniciais: ItemForm[] = (orcamentoInicial?.itens ?? []).map((it, i) => ({
    id: `i-${i}`,
    descricao: it.descricao,
    modelo: it.modelo ?? '',
    tipo_estampa: it.tipo_estampa ?? '',
    quantidade: it.quantidade,
    valor_unitario: it.valor_unitario,
  }))

  const [form, setForm] = useState<OrcamentoFormData>({
    cliente_id: orcamentoInicial?.cliente_id ?? '',
    validade_dias: orcamentoInicial?.validade_dias ?? 7,
    desconto: orcamentoInicial?.desconto ?? 0,
    observacoes: orcamentoInicial?.observacoes ?? '',
    itens: itensIniciais.length > 0 ? itensIniciais : [novoItem()],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const setField = <K extends keyof OrcamentoFormData>(k: K, v: OrcamentoFormData[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  const addItem = () => setForm((p) => ({ ...p, itens: [...p.itens, novoItem()] }))
  const removeItem = (id: string) => setForm((p) => ({ ...p, itens: p.itens.filter((i) => i.id !== id) }))
  const updateItem = (id: string, field: keyof ItemForm, value: string | number) =>
    setForm((p) => ({ ...p, itens: p.itens.map((i) => i.id === id ? { ...i, [field]: value } : i) }))

  const subtotal = form.itens.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0)
  const total = Math.max(0, subtotal - form.desconto)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.cliente_id) e.cliente_id = 'Selecione um cliente'
    if (form.itens.some((i) => !i.descricao.trim())) e.itens = 'Preencha a descrição de todos os itens'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Dados gerais */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Calculator className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Dados do Orçamento</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              value={form.cliente_id}
              onChange={(e) => setField('cliente_id', e.target.value)}
              className={`h-9 w-full rounded-lg border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors ${errors.cliente_id ? 'border-red-300' : 'border-input'}`}
            >
              <option value="">Selecione um cliente...</option>
              {clientes.filter((c) => c.ativo).map((c) => (
                <option key={c.id} value={c.id}>{c.nome}{c.empresa_nome ? ` — ${c.empresa_nome}` : ''}</option>
              ))}
            </select>
            {errors.cliente_id && <p className="text-xs text-red-500 mt-1">{errors.cliente_id}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Validade (dias)</label>
            <select
              value={form.validade_dias}
              onChange={(e) => setField('validade_dias', Number(e.target.value))}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
            >
              {[3, 5, 7, 10, 15, 30].map((d) => (
                <option key={d} value={d}>{d} dias</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Desconto (R$)</label>
            <Input type="number" min={0} step={0.01} value={form.desconto}
              onChange={(e) => setField('desconto', Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Itens */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">Itens do Orçamento</h3>
          </div>
          <button type="button" onClick={addItem}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Adicionar item
          </button>
        </div>

        {errors.itens && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5" /> {errors.itens}
          </div>
        )}

        <div className="space-y-3">
          {form.itens.map((item, idx) => (
            <div key={item.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Item {idx + 1}</span>
                {form.itens.length > 1 && (
                  <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Descrição *</label>
                  <Input value={item.descricao} onChange={(e) => updateItem(item.id, 'descricao', e.target.value)}
                    placeholder="Ex: Camiseta Dry-Fit" className="h-8 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Modelo</label>
                  <Input value={item.modelo} onChange={(e) => updateItem(item.id, 'modelo', e.target.value)}
                    placeholder="baby look..." className="h-8 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Tipo estampa</label>
                  <select value={item.tipo_estampa} onChange={(e) => updateItem(item.id, 'tipo_estampa', e.target.value)}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-xs outline-none transition-colors">
                    <option value="">Sem estampa</option>
                    {TIPOS_ESTAMPA.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Quantidade</label>
                  <Input type="number" min={0} value={item.quantidade}
                    onChange={(e) => updateItem(item.id, 'quantidade', Number(e.target.value))} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Valor unitário (R$)</label>
                  <Input type="number" min={0} step={0.01} value={item.valor_unitario}
                    onChange={(e) => updateItem(item.id, 'valor_unitario', Number(e.target.value))} className="h-8 text-sm" />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-xs text-slate-500 mb-1">Subtotal</label>
                  <div className="h-8 flex items-center text-sm font-semibold text-emerald-600">
                    R$ {(item.quantidade * item.valor_unitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totais */}
        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          {form.desconto > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>Desconto</span>
              <span>- R$ {form.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-slate-800 pt-1 border-t border-slate-200">
            <span>Total do Orçamento</span>
            <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Observações</h3>
        </div>
        <Textarea value={form.observacoes} onChange={(e) => setField('observacoes', e.target.value)}
          placeholder="Condições comerciais, prazos de entrega estimados, notas..." rows={3} />
      </div>

      <div className="flex gap-3 justify-end pb-4">
        <Button type="button" variant="outline" onClick={onCancelar} disabled={loading}>Cancelar</Button>
        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-36">
          {loading ? 'Salvando...' : modo === 'criar' ? 'Criar Orçamento' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
