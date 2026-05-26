'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { ClienteForm, ClienteFormData } from '@/components/clientes/ClienteForm'
import { useClientesStore } from '@/stores/clientesStore'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function EditarClientePage() {
  const params = useParams()
  const router = useRouter()
  const { getClienteById, atualizarCliente } = useClientesStore()
  const [loading, setLoading] = useState(false)

  const cliente = getClienteById(params.id as string)

  if (!cliente) {
    return (
      <div className="page-enter">
        <Header titulo="Cliente não encontrado" />
        <div className="p-6">
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <h2 className="text-slate-800 font-bold text-xl mb-2">
              Cliente não encontrado
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              O cliente solicitado não existe ou foi removido.
            </p>
            <Button
              onClick={() => router.push('/clientes')}
              variant="outline"
            >
              Voltar para clientes
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = (dados: ClienteFormData) => {
    setLoading(true)
    setTimeout(() => {
      atualizarCliente(cliente.id, {
        nome: dados.nome,
        telefone: dados.telefone || undefined,
        whatsapp: dados.whatsapp || undefined,
        email: dados.email || undefined,
        empresa_nome: dados.empresa_nome || undefined,
        instagram: dados.instagram || undefined,
        cidade: dados.cidade || undefined,
        estado: dados.estado || undefined,
        cep: dados.cep || undefined,
        endereco: dados.endereco || undefined,
        observacoes: dados.observacoes || undefined,
        tag: dados.tag || undefined,
        ativo: dados.ativo,
      })
      setLoading(false)
      router.push(`/clientes/${cliente.id}`)
    }, 500)
  }

  return (
    <div className="page-enter">
      <Header
        titulo="Editar Cliente"
        subtitulo={`Editando: ${cliente.nome}`}
      />

      <div className="p-6 max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </button>

        <ClienteForm
          clienteInicial={cliente}
          modo="editar"
          onSubmit={handleSubmit}
          onCancelar={() => router.push(`/clientes/${cliente.id}`)}
          loading={loading}
        />
      </div>
    </div>
  )
}
