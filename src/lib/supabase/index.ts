import { createClient } from './client'

// Verificar se Supabase está configurado (não placeholder)
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(
    url && key &&
    !url.includes('your_supabase') &&
    url.startsWith('https://')
  )
}

// Singleton do cliente Supabase (browser)
let _client: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!_client) {
    _client = createClient()
  }
  return _client
}
