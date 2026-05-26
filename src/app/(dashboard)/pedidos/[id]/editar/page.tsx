'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { PedidoForm, PedidoFormData } from '@/components/pedidos/PedidoForm'
import { usePedidosStore } from '@/stores/pedidosStore'
import { useClientesStore } from '@/stores/clientesStore'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function EditarPedidoPage() {
  const params = useParams()
  const router = useRouter()
  const { getPedidoById, atualizarPedido } = usePedidosStore()
  const { clientes } = useClientesStore()
  const [loading, setLoading] = useState(false)

  const pedido = getPedidoById(params.id as string)

  if (!pedido) {
    return (
      <div className="page-enter">
        <Header titulo="Pedido não encontrado" />
        <div className="p-6">
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Pedido não encontrado</h2>
            <Button onClick={() => router.push('/pedidos')} variant="outline">
              Voltar para pedidos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = (dados: PedidoFormData) => {
    setLoading(true)
    const cliente = clientes.find((c) => c.id === dados.cliente_id)
    const subtotal = dados.itens.reduce((acc, i) => {
      const qtd = i.qtd_pp + i.qtd_p + i.qtd_m + i.qtd_g + i.qtd_gg + i.qtd_xgg
      return acc + qtd * i.valor_unitario
    }, 0)

    setTimeout(() => {
      atualizarPedido(pedido.id, {
        cliente_id: dados.cliente_id,
        cliente,
        status: dados.status,
        prioridade: dados.prioridade,
        data_prazo: new Date(dados.data_prazo).toISOString(),
        tipo_entrega: dados.tipo_entrega || undefined,
        valor_total: subtotal,
        valor_desconto: dados.valor_desconto,
        valor_final: Math.max(0, subtotal - dados.valor_desconto),
        forma_pagamento: dados.forma_pagamento || undefined,
        status_pagamento: dados.status_pagamento,
        valor_pago: dados.valor_pago,
        observacoes: dados.observacoes || undefined,
        observacoes_internas: dados.observacoes_internas || undefined,
        itens: dados.itens.map((i) => ({
          id: i.id,
          pedido_id: pedido.id,
          descricao: i.descricao,
          modelo: i.modelo || undefined,
          cor: i.cor || undefined,
          tipo_estampa: i.tipo_estampa || undefined,
          posicao_estampa: i.posicao_estampa || undefined,
          num_cores: i.num_cores,
          qtd_pp: i.qtd_pp, qtd_p: i.qtd_p, qtd_m: i.qtd_m,
          qtd_g: i.qtd_g, qtd_gg: i.qtd_gg, qtd_xgg: i.qtd_xgg,
          qtd_total: i.qtd_pp + i.qtd_p + i.qtd_m + i.qtd_g + i.qtd_gg + i.qtd_xgg,
          valor_unitario: i.valor_unitario,
          valor_total: (i.qtd_pp + i.qtd_p + i.qtd_m + i.qtd_g + i.qtd_gg + i.qtd_xgg) * i.valor_unitario,
        })),
      })
      setLoading(false)
      router.push(`/pedidos/${pedido.id}`)
    }, 500)
  }

  return (
    <div className="page-enter">
      <Header titulo="Editar Pedido" subtitulo={`Editando: ${pedido.numero}`} />
      <div className="p-6 max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <PedidoForm
          pedidoInicial={pedido}
          modo="editar"
          onSubmit={handleSubmit}
          onCancelar={() => router.push(`/pedidos/${pedido.id}`)}
          loading={loading}
        />
      </div>
    </div>
  )
}
