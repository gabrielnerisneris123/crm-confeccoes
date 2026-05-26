'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Usuario } from '@/types'
import { useRouter } from 'next/navigation'

interface UsuarioContextType {
  usuario: Usuario | null
  isLoading: boolean
  logout: () => Promise<void>
}

const UsuarioContext = createContext<UsuarioContextType>({
  usuario: null,
  isLoading: true,
  logout: async () => {},
})

// Usuário mock para quando Supabase não está configurado
const USUARIO_MOCK: Usuario = {
  id: 'mock-admin',
  empresa_id: '1',
  nome: 'Admin',
  email: 'admin@confeccoes.com',
  cargo: 'admin',
  ativo: true,
  criado_em: new Date().toISOString(),
}

export function UsuarioProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const fetchPerfil = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setUsuario(USUARIO_MOCK)
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setUsuario(null)
        setIsLoading(false)
        return
      }

      const { data: perfil, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !perfil) {
        // Perfil ainda não criado pelo trigger — usar dados básicos do auth
        setUsuario({
          id: user.id,
          empresa_id: '1',
          nome: user.email?.split('@')[0] ?? 'Usuário',
          email: user.email ?? '',
          cargo: 'vendedor',
          ativo: true,
          criado_em: user.created_at,
        } as Usuario)
      } else {
        setUsuario(perfil as Usuario)
      }
    } catch {
      setUsuario(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPerfil()

    if (!isSupabaseConfigured()) return

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event) => {
      fetchPerfil()
    })

    return () => subscription.unsubscribe()
  }, [fetchPerfil])

  const logout = async () => {
    if (!isSupabaseConfigured()) {
      return
    }
    const supabase = createClient()
    await supabase.auth.signOut()
    setUsuario(null)
    router.push('/login')
  }

  return (
    <UsuarioContext.Provider value={{ usuario, isLoading, logout }}>
      {children}
    </UsuarioContext.Provider>
  )
}

export const useUsuario = () => useContext(UsuarioContext)
