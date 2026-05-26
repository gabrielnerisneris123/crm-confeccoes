'use client'

import { Header } from '@/components/shared/Header'
import { useOrcamentosStore } from '@/stores/orcamentosStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import {
  Calculator, Search, Plus, MoreHorizontal, Eye, Edit, Trash2,
  Send, CheckCircle, XCircle, TrendingUp, FileText,
} from 'lucide-react'
import { Orcamento } from '@/types'
import { format, parseISO, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const STATUS_CONFIG_ORC: Record<Orcamento['status'], { label: string; bg: string; cor: string; icone: string }> = {
  rascunho: { label: 'Rascunho', bg: 'bg-slate-100', cor: 'text-slate-600', icone: '📝' },
  enviado:  { label: 'Enviado',  bg: 'bg-blue-50',   cor: 'text-blue-700',  icone: '📤' },
  aprovado: { label: 'Aprovado', bg: 'bg-emerald-50', cor: 'text-emerald-700', icone: '✅' },
  rejeitado:{ label: 'Rejeitado',bg: 'bg-red-50',    cor: 'text-red-700',   icone: '❌' },
  expirado: { label: 'Expirado', bg: 'bg-amber-50',  cor: 'text-amber-700', icone: '⏰' },
}

const FILTROS = [
  { value: '', label: 'Todos' },
  { value: 'rascunho', label: '📝 Rascunho' },
  { value: 'enviado', label: '📤 Enviado' },
  { value: 'aprovado', label: '✅ Aprovado' },
  { value: 'rejeitado', label: '❌ Rejeitado' },
  { value: 'expirado', label: '⏰ Expirado' },
]

export default function OrcamentosPage() {
  const router = useRouter()
  const { orcamentos, busca, filtroStatus, setBusca, setFiltroStatus, alterarStatus, removerOrcamento, getOrcamentosFiltrados } = useOrcamentosStore()

  const filtrados = getOrcamentosFiltrados()

  const totalValor = orcamentos.filter((o) => o.status === 'aprovado').reduce((acc, o) => acc + o.valor_final, 0)
  const pendentes = orcamentos.filter((o) => o.status === 'enviado').length
  const aprovados = orcamentos.filter((o) => o.status === 'aprovado').length

  return (
    <div className="page-enter">
      <Header titulo="Orçamentos" subtitulo="Gere e gerencie orçamentos para clientes" />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<FileText className="w-5 h-5 text-indigo-600" />} bg="bg-indigo-50"
            label="Total" value={orcamentos.length} />
          <StatCard icon={<Send className="w-5 h-5 text-blue-600" />} bg="bg-blue-50"
            label="Aguardando Resposta" value={pendentes} />
          <StatCard icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} bg="bg-emerald-50"
            label="Aprovados" value={aprovados} />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-purple-600" />} bg="bg-purple-50"
            label="Valor Aprovado" value={`R$ ${totalValor.toLocaleString('pt-BR')}`} />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input value={busca} onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por número ou cliente..." className="pl-9 bg-slate-50 border-slate-200 h-9" />
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-9"
              onClick={() => router.push('/orcamentos/novo')}>
              <Plus className="w-4 h-4" /> Novo Orçamento
            </Button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {FILTROS.map((f) => (
              <button key={f.value} onClick={() => setFiltroStatus(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filtroStatus === f.value ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>{f.label}</button>
            ))}
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {filtrados.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-700 mb-1">Nenhum orçamento</h3>
              <p className="text-slate-400 text-sm">Crie o primeiro orçamento para um cliente.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="pl-5">Orçamento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="pr-5 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((orc) => {
                  const cfg = STATUS_CONFIG_ORC[orc.status]
                  const expirado = orc.data_validade && isPast(parseISO(orc.data_validade)) && orc.status === 'enviado'
                  return (
                    <TableRow key={orc.id} className="cursor-pointer" onClick={() => router.push(`/orcamentos/${orc.id}`)}>
                      <TableCell className="pl-5">
                        <div className="font-semibold text-sm text-slate-800">{orc.numero}</div>
                        <div className="text-xs text-slate-400">{format(parseISO(orc.criado_em), 'dd/MM/yyyy')}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-700">{orc.cliente?.nome ?? '—'}</div>
                        {orc.cliente?.empresa_nome && <div className="text-xs text-slate-400">{orc.cliente.empresa_nome}</div>}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.cor}`}>
                          {cfg.icone} {cfg.label}
                        </span>
                        {orc.convertido_pedido_id && (
                          <div className="text-xs text-emerald-600 mt-0.5">↗ Convertido em pedido</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {orc.data_validade ? (
                          <span className={`text-xs ${expirado ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                            {expirado && '⚠️ '}
                            {format(parseISO(orc.data_validade), 'dd/MM/yyyy')}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">{orc.validade_dias}d</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500">{(orc.itens ?? []).length} ite{(orc.itens ?? []).length !== 1 ? 'ns' : 'm'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-slate-800">R$ {orc.valor_final.toLocaleString('pt-BR')}</span>
                        {orc.desconto > 0 && (
                          <div className="text-xs text-red-500">- R$ {orc.desconto.toLocaleString('pt-BR')}</div>
                        )}
                      </TableCell>
                      <TableCell className="pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer inline-flex items-center justify-center">
                            <MoreHorizontal className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="bottom" align="end">
                            <DropdownMenuItem onClick={() => router.push(`/orcamentos/${orc.id}`)}>
                              <Eye className="w-3.5 h-3.5 mr-2" /> Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/orcamentos/${orc.id}/editar`)}>
                              <Edit className="w-3.5 h-3.5 mr-2" /> Editar
                            </DropdownMenuItem>
                            {orc.status === 'rascunho' && (
                              <DropdownMenuItem onClick={() => alterarStatus(orc.id, 'enviado')}>
                                <Send className="w-3.5 h-3.5 mr-2 text-blue-500" /> Marcar como Enviado
                              </DropdownMenuItem>
                            )}
                            {orc.status === 'enviado' && (
                              <>
                                <DropdownMenuItem onClick={() => alterarStatus(orc.id, 'aprovado')}>
                                  <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Marcar Aprovado
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alterarStatus(orc.id, 'rejeitado')}>
                                  <XCircle className="w-3.5 h-3.5 mr-2 text-red-500" /> Marcar Rejeitado
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                if (window.confirm(`Excluir orçamento "${orc.numero}"?`)) {
                                  removerOrcamento(orc.id)
                                }
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2 text-red-500" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, bg, label, value }: { icon: React.ReactNode; bg: string; label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </div>
  )
}
