'use client'

import { UsuarioProvider } from '@/contexts/UsuarioContext'
import { StoreInitializer } from './StoreInitializer'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UsuarioProvider>
      <StoreInitializer />
      {children}
    </UsuarioProvider>
  )
}
