// ================================================
// QUERIES SUPABASE — CRM Confecções
// ================================================
import { Cliente, Pedido, Orcamento, PedidoTimeline } from '@/types'

type SB = ReturnType<typeof import('./client').createClient>

// ---- CLIENTES ----

export async function getClientes(supabase: SB): Promise<Cliente[]> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('criado_em', { ascending: false })
  if (error) throw error
  return (data ?? []) as Cliente[]
}

export async function createClienteDB(supabase: SB, dados: Omit<Cliente, 'id' | 'criado_em' | 'atualizado_em'>): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .insert([{ ...dados }])
    .select('*')
    .single()
  if (error) throw error
  return data as Cliente
}

export async function updateClienteDB(supabase: SB, id: string, dados: Partial<Cliente>): Promise<void> {
  const { error } = await supabase
    .from('clientes')
    .update({ ...dados, atualizado_em: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteClienteDB(supabase: SB, id: string): Promise<void> {
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) throw error
}

// ---- PEDIDOS ----

export async function getPedidos(supabase: SB): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      cliente:clientes(*),
      itens:pedido_itens(*),
      timeline:pedido_timeline(*)
    `)
    .order('criado_em', { ascending: false })
  if (error) throw error
  // Ordenar timeline por data asc no client
  return ((data ?? []) as Pedido[]).map((p) => ({
    ...p,
    timeline: ((p.timeline ?? []) as PedidoTimeline[]).sort(
      (a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()
    ),
  }))
}

export async function createPedidoDB(
  supabase: SB,
  pedidoData: Omit<Pedido, 'id' | 'numero' | 'criado_em' | 'atualizado_em' | 'itens' | 'artes' | 'timeline' | 'cliente'>,
  itens: Pedido['itens'],
  numero: string,
  usuarioId?: string
): Promise<Pedido> {
  // 1. Inserir pedido
  const { data: novoPedido, error: pedErr } = await supabase
    .from('pedidos')
    .insert([{
      ...pedidoData,
      numero,
      criado_por: usuarioId ?? null,
    }])
    .select('*')
    .single()
  if (pedErr) throw pedErr

  // 2. Inserir itens
  if (itens && itens.length > 0) {
    const { error: itErr } = await supabase
      .from('pedido_itens')
      .insert(itens.map(({ id: _id, pedido_id: _pid, ...i }) => ({
        ...i,
        pedido_id: novoPedido.id,
      })))
    if (itErr) throw itErr
  }

  // 3. Timeline inicial
  await supabase.from('pedido_timeline').insert([{
    pedido_id: novoPedido.id,
    usuario_id: usuarioId ?? null,
    tipo: 'status_change',
    descricao: 'Pedido criado',
    status_novo: pedidoData.status,
    criado_em: new Date().toISOString(),
  }])

  // Retornar pedido completo
  const { data: completo } = await supabase
    .from('pedidos')
    .select(`*, cliente:clientes(*), itens:pedido_itens(*), timeline:pedido_timeline(*)`)
    .eq('id', novoPedido.id)
    .single()

  return completo as Pedido
}

export async function updatePedidoDB(supabase: SB, id: string, dados: Partial<Pedido>): Promise<void> {
  const { itens: _itens, artes: _artes, timeline: _tl, cliente: _cl, ...rest } = dados as Pedido
  const { error } = await supabase
    .from('pedidos')
    .update({ ...rest, atualizado_em: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function addTimelineEntryDB(supabase: SB, entry: Omit<PedidoTimeline, 'id'>): Promise<void> {
  const { error } = await supabase.from('pedido_timeline').insert([entry])
  if (error) throw error
}

export async function deletePedidoDB(supabase: SB, id: string): Promise<void> {
  const { error } = await supabase.from('pedidos').delete().eq('id', id)
  if (error) throw error
}

// ---- ORÇAMENTOS ----

export async function getOrcamentos(supabase: SB): Promise<Orcamento[]> {
  const { data, error } = await supabase
    .from('orcamentos')
    .select(`
      *,
      cliente:clientes(*),
      itens:orcamento_itens(*)
    `)
    .order('criado_em', { ascending: false })
  if (error) throw error
  return (data ?? []) as Orcamento[]
}

export async function createOrcamentoDB(
  supabase: SB,
  dados: Omit<Orcamento, 'id' | 'numero' | 'criado_em' | 'atualizado_em' | 'itens' | 'cliente'>,
  itens: Orcamento['itens'],
  numero: string,
  usuarioId?: string
): Promise<Orcamento> {
  const { data: novoOrc, error: orcErr } = await supabase
    .from('orcamentos')
    .insert([{ ...dados, numero, criado_por: usuarioId ?? null }])
    .select('*')
    .single()
  if (orcErr) throw orcErr

  if (itens && itens.length > 0) {
    const { error: itErr } = await supabase
      .from('orcamento_itens')
      .insert(itens.map(({ ...i }) => ({ ...i, orcamento_id: novoOrc.id })))
    if (itErr) throw itErr
  }

  const { data: completo } = await supabase
    .from('orcamentos')
    .select(`*, cliente:clientes(*), itens:orcamento_itens(*)`)
    .eq('id', novoOrc.id)
    .single()

  return completo as Orcamento
}

export async function updateOrcamentoDB(supabase: SB, id: string, dados: Partial<Orcamento>): Promise<void> {
  const { itens: _itens, cliente: _cl, ...rest } = dados as Orcamento
  const { error } = await supabase
    .from('orcamentos')
    .update({ ...rest, atualizado_em: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteOrcamentoDB(supabase: SB, id: string): Promise<void> {
  const { error } = await supabase.from('orcamentos').delete().eq('id', id)
  if (error) throw error
}

// ---- NUMERO SEQUENCIAL ----

export async function gerarNumeroPedido(supabase: SB): Promise<string> {
  const ano = new Date().getFullYear()
  const { count } = await supabase
    .from('pedidos')
    .select('*', { count: 'exact', head: true })
  const seq = String((count ?? 0) + 1).padStart(3, '0')
  return `PED-${ano}-${seq}`
}

export async function gerarNumeroOrcamento(supabase: SB): Promise<string> {
  const ano = new Date().getFullYear()
  const { count } = await supabase
    .from('orcamentos')
    .select('*', { count: 'exact', head: true })
  const seq = String((count ?? 0) + 1).padStart(3, '0')
  return `ORC-${ano}-${seq}`
}
