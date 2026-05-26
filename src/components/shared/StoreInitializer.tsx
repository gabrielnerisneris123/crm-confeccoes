'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useClientesStore } from '@/stores/clientesStore'
import { usePedidosStore } from '@/stores/pedidosStore'
import { useOrcamentosStore } from '@/stores/orcamentosStore'

/**
 * Componente invisível que inicializa as stores com dados do Supabase.
 * Deve ser renderizado uma única vez dentro do layout do dashboard.
 */
export function StoreInitializer() {
  const initialized = useRef(false)
  const inicializarClientes = useClientesStore((s) => s.inicializar)
  const inicializarPedidos = usePedidosStore((s) => s.inicializar)
  const inicializarOrcamentos = useOrcamentosStore((s) => s.inicializar)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (!isSupabaseConfigured()) {
      // Modo dev sem Supabase — usar mock data (já inicializado nas stores)
      return
    }

    const supabase = createClient()
    inicializarClientes(supabase)
    inicializarPedidos(supabase)
    inicializarOrcamentos(supabase)
  }, [inicializarClientes, inicializarPedidos, inicializarOrcamentos])

  return null
}
