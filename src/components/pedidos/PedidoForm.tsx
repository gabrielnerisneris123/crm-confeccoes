'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Pedido, PedidoItem, PrioridadePedido, StatusPedido,
  TipoEstampa, StatusPagamento,
} from '@/types'
import { useClientesStore } from '@/stores/clientesStore'
import {
  ShoppingBag, Plus, Trash2, User, Package,
  CreditCard, FileText, AlertTriangle,
} from 'lucide-react'

const TAMANHOS = ['pp', 'p', 'm', 'g', 'gg', 'xgg'] as const
const TIPOS_ESTAMPA: TipoEstampa[] = ['DTF', 'silk_screen', 'bordado', 'sublimacao', 'transfer', 'laser', 'outro']

type ItemForm = {
  id: string
  descricao: string
  modelo: string
  cor: string
  tipo_estampa: TipoEstampa | ''
  posicao_estampa: string
  num_cores: number
  qtd_pp: number; qtd_p: number; qtd_m: number
  qtd_g: number; qtd_gg: number; qtd_xgg: number
  valor_unitario: number
}

export type PedidoFormData = {
  cliente_id: string
  prioridade: PrioridadePedido
  status: StatusPedido
  data_prazo: string
  tipo_entrega: 'retirada' | 'entrega' | 'correios' | ''
  valor_desconto: number
  forma_pagamento: string
  status_pagamento: StatusPagamento
  valor_pago: number
  observacoes: string
  observacoes_internas: string
  itens: ItemForm[]
}

interface PedidoFormProps {
  pedidoInicial?: Partial<Pedido>
  onSubmit: (dados: PedidoFormData) => void
  onCancelar: () => void
  loading?: boolean
  modo: 'criar' | 'editar'
}

const novoItem = (): ItemForm => ({
  id: `item-${Date.now()}`,
  descricao: '', modelo: '', cor: '',
  tipo_estampa: '', posicao_estampa: '',
  num_cores: 1,
  qtd_pp: 0, qtd_p: 0, qtd_m: 0,
  qtd_g: 0, qtd_gg: 0, qtd_xgg: 0,
  valor_unitario: 0,
})

export function PedidoForm({ pedidoInicial, onSubmit, onCancelar, loading, modo }: PedidoFormProps) {
  const { clientes } = useClientesStore()

  const itensIniciais: ItemForm[] = (pedidoInicial?.itens ?? []).map((it) => ({
    id: it.id,
    descricao: it.descricao,
    modelo: it.modelo ?? '',
    cor: it.cor ?? '',
    tipo_estampa: it.tipo_estampa ?? '',
    posicao_estampa: it.posicao_estampa ?? '',
    num_cores: it.num_cores ?? 1,
    qtd_pp: it.qtd_pp, qtd_p: it.qtd_p, qtd_m: it.qtd_m,
    qtd_g: it.qtd_g, qtd_gg: it.qtd_gg, qtd_xgg: it.qtd_xgg,
    valor_unitario: it.valor_unitario,
  }))

  const [form, setForm] = useState<PedidoFormData>({
    cliente_id: pedidoInicial?.cliente_id ?? '',
    prioridade: pedidoInicial?.prioridade ?? 'normal',
    status: pedidoInicial?.status ?? 'novo',
    data_prazo: pedidoInicial?.data_prazo
      ? pedidoInicial.data_prazo.slice(0, 10)
      : '',
    tipo_entrega: pedidoInicial?.tipo_entrega ?? '',
    valor_desconto: pedidoInicial?.valor_desconto ?? 0,
    forma_pagamento: pedidoInicial?.forma_pagamento ?? '',
    status_pagamento: pedidoInicial?.status_pagamento ?? 'pendente',
    valor_pago: pedidoInicial?.valor_pago ?? 0,
    observacoes: pedidoInicial?.observacoes ?? '',
    observacoes_internas: pedidoInicial?.observacoes_internas ?? '',
    itens: itensIniciais.length > 0 ? itensIniciais : [novoItem()],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const setField = <K extends keyof PedidoFormData>(k: K, v: PedidoFormData[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  /* Itens */
  const addItem = () =>
    setForm((prev) => ({ ...prev, itens: [...prev.itens, novoItem()] }))

  const removeItem = (id: string) =>
    setForm((prev) => ({ ...prev, itens: prev.itens.filter((i) => i.id !== id) }))

  const updateItem = (id: string, field: keyof ItemForm, value: string | number) =>
    setForm((prev) => ({
      ...prev,
      itens: prev.itens.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    }))

  /* Cálculos */
  const calcItemTotal = (item: ItemForm) => {
    const qtdTotal = item.qtd_pp + item.qtd_p + item.qtd_m + item.qtd_g + item.qtd_gg + item.qtd_xgg
    return qtdTotal * item.valor_unitario
  }
  const subtotal = form.itens.reduce((acc, i) => acc + calcItemTotal(i), 0)
  const total = Math.max(0, subtotal - form.valor_desconto)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.cliente_id) e.cliente_id = 'Selecione um cliente'
    if (!form.data_prazo) e.data_prazo = 'Informe o prazo'
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

      {/* Dados do pedido */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Dados do Pedido</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cliente */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              value={form.cliente_id}
              onChange={(e) => setField('cliente_id', e.target.value)}
              className={`h-9 w-full rounded-lg border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring transition-colors ${errors.cliente_id ? 'border-red-300' : 'border-input'}`}
            >
              <option value="">Selecione um cliente...</option>
              {clientes.filter((c) => c.ativo).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}{c.empresa_nome ? ` — ${c.empresa_nome}` : ''}
                </option>
              ))}
            </select>
            {errors.cliente_id && <p className="text-xs text-red-500 mt-1">{errors.cliente_id}</p>}
          </div>

          {/* Prazo */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Data de Prazo <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={form.data_prazo}
              onChange={(e) => setField('data_prazo', e.target.value)}
              className={errors.data_prazo ? 'border-red-300' : ''}
            />
            {errors.data_prazo && <p className="text-xs text-red-500 mt-1">{errors.data_prazo}</p>}
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Prioridade</label>
            <select
              value={form.prioridade}
              onChange={(e) => setField('prioridade', e.target.value as PrioridadePedido)}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
            >
              <option value="baixa">⚪ Baixa</option>
              <option value="normal">🔵 Normal</option>
              <option value="alta">🟠 Alta</option>
              <option value="urgente">🔴 Urgente</option>
            </select>
          </div>

          {/* Tipo entrega */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Tipo de Entrega</label>
            <select
              value={form.tipo_entrega}
              onChange={(e) => setField('tipo_entrega', e.target.value as 'retirada' | 'entrega' | 'correios' | '')}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
            >
              <option value="">Não definido</option>
              <option value="retirada">🏪 Retirada</option>
              <option value="entrega">🚚 Entrega</option>
              <option value="correios">📮 Correios</option>
            </select>
          </div>

          {/* Status (só editar) */}
          {modo === 'editar' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setField('status', e.target.value as StatusPedido)}
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
              >
                {(['novo','aguardando_aprovacao','aprovado','separacao','impressao_dtf','estamparia','revisao','embalagem','pronto','entregue','cancelado'] as StatusPedido[]).map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Itens */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">Itens do Pedido</h3>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar item
          </button>
        </div>

        {errors.itens && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5" /> {errors.itens}
          </div>
        )}

        <div className="space-y-4">
          {form.itens.map((item, idx) => {
            const qtdTotal = item.qtd_pp + item.qtd_p + item.qtd_m + item.qtd_g + item.qtd_gg + item.qtd_xgg
            const itemTotal = qtdTotal * item.valor_unitario
            return (
              <div key={item.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Item {idx + 1}</span>
                  {form.itens.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Descrição + modelo + cor */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-xs text-slate-500 mb-1">Descrição *</label>
                    <Input
                      value={item.descricao}
                      onChange={(e) => updateItem(item.id, 'descricao', e.target.value)}
                      placeholder="Ex: Camiseta Dry-Fit"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Modelo</label>
                    <Input
                      value={item.modelo}
                      onChange={(e) => updateItem(item.id, 'modelo', e.target.value)}
                      placeholder="baby look, básica..."
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Cor</label>
                    <Input
                      value={item.cor}
                      onChange={(e) => updateItem(item.id, 'cor', e.target.value)}
                      placeholder="preto, branco..."
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Estampa */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Tipo de estampa</label>
                    <select
                      value={item.tipo_estampa}
                      onChange={(e) => updateItem(item.id, 'tipo_estampa', e.target.value)}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
                    >
                      <option value="">Sem estampa</option>
                      {TIPOS_ESTAMPA.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Posição</label>
                    <Input
                      value={item.posicao_estampa}
                      onChange={(e) => updateItem(item.id, 'posicao_estampa', e.target.value)}
                      placeholder="frente, costas..."
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Nº de cores</label>
                    <Input
                      type="number"
                      min={1}
                      value={item.num_cores}
                      onChange={(e) => updateItem(item.id, 'num_cores', Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Valor unitário (R$)</label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.valor_unitario}
                      onChange={(e) => updateItem(item.id, 'valor_unitario', Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Grade de tamanhos */}
                <div>
                  <label className="block text-xs text-slate-500 mb-2">Quantidade por tamanho</label>
                  <div className="grid grid-cols-6 gap-2">
                    {TAMANHOS.map((tam) => (
                      <div key={tam} className="text-center">
                        <div className="text-xs font-semibold text-slate-500 mb-1 uppercase">{tam}</div>
                        <Input
                          type="number"
                          min={0}
                          value={(item as unknown as Record<string, number>)[`qtd_${tam}`]}
                          onChange={(e) => updateItem(item.id, `qtd_${tam}` as keyof ItemForm, Number(e.target.value))}
                          className="h-8 text-center text-sm px-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totais do item */}
                <div className="flex items-center justify-end gap-4 pt-1 border-t border-slate-100">
                  <span className="text-xs text-slate-400">{qtdTotal} peças</span>
                  <span className="text-sm font-semibold text-slate-700">
                    R$ {itemTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Valores e pagamento */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Valores e Pagamento</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Desconto (R$)</label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={form.valor_desconto}
              onChange={(e) => setField('valor_desconto', Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Forma de pagamento</label>
            <select
              value={form.forma_pagamento}
              onChange={(e) => setField('forma_pagamento', e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
            >
              <option value="">Não definido</option>
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="boleto">Boleto</option>
              <option value="transferencia">Transferência</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Status do pagamento</label>
            <select
              value={form.status_pagamento}
              onChange={(e) => setField('status_pagamento', e.target.value as StatusPagamento)}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
            >
              <option value="pendente">⏳ Pendente</option>
              <option value="parcial">◐ Parcial</option>
              <option value="pago">✅ Pago</option>
              <option value="cancelado">❌ Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Valor já pago (R$)</label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={form.valor_pago}
              onChange={(e) => setField('valor_pago', Number(e.target.value))}
            />
          </div>
        </div>

        {/* Resumo financeiro */}
        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          {form.valor_desconto > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>Desconto</span>
              <span>- R$ {form.valor_desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-slate-800 pt-1 border-t border-slate-200">
            <span>Total</span>
            <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          {form.valor_pago > 0 && (
            <div className="flex justify-between text-sm text-slate-500">
              <span>Restante</span>
              <span className="text-amber-600 font-medium">
                R$ {Math.max(0, total - form.valor_pago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Observações */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Observações</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Observações do cliente</label>
            <Textarea
              value={form.observacoes}
              onChange={(e) => setField('observacoes', e.target.value)}
              placeholder="Instruções do cliente, detalhes do pedido..."
              rows={2}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Observações internas</label>
            <Textarea
              value={form.observacoes_internas}
              onChange={(e) => setField('observacoes_internas', e.target.value)}
              placeholder="Notas internas da equipe..."
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 justify-end pb-4">
        <Button type="button" variant="outline" onClick={onCancelar} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-36"
        >
          {loading ? 'Salvando...' : modo === 'criar' ? 'Criar Pedido' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
