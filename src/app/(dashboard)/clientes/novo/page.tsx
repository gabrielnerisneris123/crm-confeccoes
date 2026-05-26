'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { ClienteForm, ClienteFormData } from '@/components/clientes/ClienteForm'
import { useClientesStore } from '@/stores/clientesStore'
import { ChevronLeft } from 'lucide-react'

export default function NovoClientePage() {
  const router = useRouter()
  const { adicionarCliente } = useClientesStore()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (dados: ClienteFormData) => {
    setLoading(true)
    setTimeout(() => {
      adicionarCliente({
        empresa_id: '1',
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
        ativo: true,
      })
      setLoading(false)
      router.push('/clientes')
    }, 500)
  }

  return (
    <div className="page-enter">
      <Header titulo="Novo Cliente" subtitulo="Adicionar novo cliente à base" />

      <div className="p-6 max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </button>

        <ClienteForm
          modo="criar"
          onSubmit={handleSubmit}
          onCancelar={() => router.push('/clientes')}
          loading={loading}
        />
      </div>
    </div>
  )
}
