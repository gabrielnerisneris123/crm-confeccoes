'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { OrcamentoForm, OrcamentoFormData } from '@/components/orcamentos/OrcamentoForm'
import { useOrcamentosStore } from '@/stores/orcamentosStore'
import { useClientesStore } from '@/stores/clientesStore'
import { ChevronLeft } from 'lucide-react'

export default function NovoOrcamentoPage() {
  const router = useRouter()
  const { adicionarOrcamento } = useOrcamentosStore()
  const { clientes } = useClientesStore()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (dados: OrcamentoFormData) => {
    setLoading(true)
    const cliente = clientes.find((c) => c.id === dados.cliente_id)
    const subtotal = dados.itens.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0)
    const validade = new Date(Date.now() + dados.validade_dias * 86400000).toISOString()

    setTimeout(() => {
      adicionarOrcamento({
        empresa_id: '1',
        cliente_id: dados.cliente_id,
        cliente,
        status: 'rascunho',
        validade_dias: dados.validade_dias,
        data_validade: validade,
        valor_total: subtotal,
        desconto: dados.desconto,
        valor_final: Math.max(0, subtotal - dados.desconto),
        observacoes: dados.observacoes || undefined,
        itens: dados.itens.map((i) => ({
          descricao: i.descricao,
          modelo: i.modelo || undefined,
          tipo_estampa: i.tipo_estampa || undefined,
          quantidade: i.quantidade,
          valor_unitario: i.valor_unitario,
          valor_total: i.quantidade * i.valor_unitario,
        })),
      })
      setLoading(false)
      router.push('/orcamentos')
    }, 400)
  }

  return (
    <div className="page-enter">
      <Header titulo="Novo Orçamento" subtitulo="Criar orçamento para cliente" />
      <div className="p-6 max-w-3xl mx-auto">
        <button onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <OrcamentoForm modo="criar" onSubmit={handleSubmit} onCancelar={() => router.push('/orcamentos')} loading={loading} />
      </div>
    </div>
  )
}
