'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { OrcamentoForm, OrcamentoFormData } from '@/components/orcamentos/OrcamentoForm'
import { useOrcamentosStore } from '@/stores/orcamentosStore'
import { useClientesStore } from '@/stores/clientesStore'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function EditarOrcamentoPage() {
  const params = useParams()
  const router = useRouter()
  const { getOrcamentoById, atualizarOrcamento } = useOrcamentosStore()
  const { clientes } = useClientesStore()
  const [loading, setLoading] = useState(false)

  const orc = getOrcamentoById(params.id as string)

  if (!orc) {
    return (
      <div className="page-enter">
        <Header titulo="Orçamento não encontrado" />
        <div className="p-6">
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Orçamento não encontrado</h2>
            <Button onClick={() => router.push('/orcamentos')} variant="outline">Voltar</Button>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = (dados: OrcamentoFormData) => {
    setLoading(true)
    const cliente = clientes.find((c) => c.id === dados.cliente_id)
    const subtotal = dados.itens.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0)

    setTimeout(() => {
      atualizarOrcamento(orc.id, {
        cliente_id: dados.cliente_id,
        cliente,
        validade_dias: dados.validade_dias,
        data_validade: new Date(Date.now() + dados.validade_dias * 86400000).toISOString(),
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
      router.push(`/orcamentos/${orc.id}`)
    }, 400)
  }

  return (
    <div className="page-enter">
      <Header titulo="Editar Orçamento" subtitulo={`Editando: ${orc.numero}`} />
      <div className="p-6 max-w-3xl mx-auto">
        <button onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <OrcamentoForm orcamentoInicial={orc} modo="editar"
          onSubmit={handleSubmit} onCancelar={() => router.push(`/orcamentos/${orc.id}`)} loading={loading} />
      </div>
    </div>
  )
}
