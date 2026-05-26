'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { PedidoForm, PedidoFormData } from '@/components/pedidos/PedidoForm'
import { usePedidosStore } from '@/stores/pedidosStore'
import { useClientesStore } from '@/stores/clientesStore'
import { ChevronLeft } from 'lucide-react'

export default function NovoPedidoPage() {
  const router = useRouter()
  const { adicionarPedido } = usePedidosStore()
  const { clientes } = useClientesStore()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (dados: PedidoFormData) => {
    setLoading(true)
    const cliente = clientes.find((c) => c.id === dados.cliente_id)

    setTimeout(() => {
      adicionarPedido({
        empresa_id: '1',
        cliente_id: dados.cliente_id,
        cliente,
        status: 'novo',
        prioridade: dados.prioridade,
        data_pedido: new Date().toISOString(),
        data_prazo: new Date(dados.data_prazo).toISOString(),
        tipo_entrega: dados.tipo_entrega || undefined,
        valor_total: dados.itens.reduce((acc, i) => {
          const qtd = i.qtd_pp + i.qtd_p + i.qtd_m + i.qtd_g + i.qtd_gg + i.qtd_xgg
          return acc + qtd * i.valor_unitario
        }, 0),
        valor_desconto: dados.valor_desconto,
        valor_final: Math.max(0, dados.itens.reduce((acc, i) => {
          const qtd = i.qtd_pp + i.qtd_p + i.qtd_m + i.qtd_g + i.qtd_gg + i.qtd_xgg
          return acc + qtd * i.valor_unitario
        }, 0) - dados.valor_desconto),
        forma_pagamento: dados.forma_pagamento || undefined,
        status_pagamento: dados.status_pagamento,
        valor_pago: dados.valor_pago,
        observacoes: dados.observacoes || undefined,
        observacoes_internas: dados.observacoes_internas || undefined,
        itens: dados.itens.map((i) => ({
          id: i.id,
          pedido_id: '',
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
      router.push('/pedidos')
    }, 500)
  }

  return (
    <div className="page-enter">
      <Header titulo="Novo Pedido" subtitulo="Registrar novo pedido de produção" />
      <div className="p-6 max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <PedidoForm
          modo="criar"
          onSubmit={handleSubmit}
          onCancelar={() => router.push('/pedidos')}
          loading={loading}
        />
      </div>
    </div>
  )
}
