import { useUsuario } from '@/contexts/UsuarioContext'

/**
 * Hook de permissões baseado no cargo do usuário logado.
 *
 * Cargos:
 * - admin      → acesso total
 * - vendedor   → clientes, pedidos, orçamentos (sem excluir, sem financeiro)
 * - producao   → kanban, ver pedidos e avançar status (sem criar/editar/excluir)
 * - financeiro → financeiro, ver clientes e pedidos (sem criar/editar/excluir)
 */
export function usePermissao() {
  const { usuario } = useUsuario()
  const cargo = usuario?.cargo ?? 'vendedor'

  return {
    // Pode criar e editar registros
    podeCriarEditar: ['admin', 'vendedor'].includes(cargo),

    // Pode excluir registros (somente admin)
    podeExcluir: cargo === 'admin',

    // Pode avançar status de pedido / mover cards no Kanban
    podeAvancarStatus: ['admin', 'vendedor', 'producao'].includes(cargo),

    // Pode ver módulo financeiro
    podeVerFinanceiro: ['admin', 'financeiro'].includes(cargo),

    // Pode ver orçamentos
    podeVerOrcamentos: ['admin', 'vendedor', 'financeiro'].includes(cargo),

    // Pode acessar Kanban / produção
    podeVerKanban: ['admin', 'vendedor', 'producao'].includes(cargo),

    // Pode ver configurações
    podeVerConfiguracoes: cargo === 'admin',

    // É administrador
    isAdmin: cargo === 'admin',

    // Cargo atual (para exibir na sidebar etc)
    cargo,
  }
}
