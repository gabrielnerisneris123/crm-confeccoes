'use client'

import { useState, useRef } from 'react'
import { Upload, X, CheckCircle, Clock, ImageIcon, FileImage } from 'lucide-react'
import { PedidoArte } from '@/types'
import { Button } from '@/components/ui/button'

interface ArteUploaderProps {
  pedidoId: string
  artes: PedidoArte[]
  onAddArte: (arte: PedidoArte) => void
  onToggleAprovacao: (arteId: string) => void
  onRemoverArte: (arteId: string) => void
}

const TIPOS: PedidoArte['tipo'][] = ['arte_final', 'mockup', 'referencia', 'aprovacao']
const TIPO_LABELS: Record<PedidoArte['tipo'], string> = {
  arte_final: '🎨 Arte Final',
  mockup: '👕 Mockup',
  referencia: '📌 Referência',
  aprovacao: '✅ Aprovação',
}

export function ArteUploader({ pedidoId, artes, onAddArte, onToggleAprovacao, onRemoverArte }: ArteUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const [tipoSelecionado, setTipoSelecionado] = useState<PedidoArte['tipo']>('arte_final')
  const inputRef = useRef<HTMLInputElement>(null)

  const processarArquivo = (file: File) => {
    const url = URL.createObjectURL(file)
    const arte: PedidoArte = {
      id: `arte-${Date.now()}`,
      pedido_id: pedidoId,
      nome: file.name,
      tipo: tipoSelecionado,
      url,
      formato: file.type,
      tamanho_bytes: file.size,
      aprovado: false,
      criado_em: new Date().toISOString(),
    }
    onAddArte(arte)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    Array.from(e.dataTransfer.files).forEach(processarArquivo)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(processarArquivo)
    e.target.value = ''
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <div className="space-y-4">
      {/* Tipo selector */}
      <div className="flex gap-2 flex-wrap">
        {TIPOS.map((t) => (
          <button key={t} type="button" onClick={() => setTipoSelecionado(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tipoSelecionado === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            {TIPO_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
        }`}
      >
        <Upload className={`w-8 h-8 mx-auto mb-2 ${dragOver ? 'text-indigo-500' : 'text-slate-300'}`} />
        <p className="text-sm font-medium text-slate-600">
          Arraste imagens ou <span className="text-indigo-600">clique para selecionar</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF, AI — máx. 10MB por arquivo</p>
        <p className="text-xs text-indigo-500 mt-2 font-medium">Tipo: {TIPO_LABELS[tipoSelecionado]}</p>
        <input ref={inputRef} type="file" accept="image/*,.pdf,.ai,.eps" multiple className="hidden" onChange={handleFileInput} />
      </div>

      {/* Gallery */}
      {artes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {artes.map((arte) => (
            <div key={arte.id} className={`relative group rounded-xl border overflow-hidden ${
              arte.aprovado ? 'border-emerald-300 ring-1 ring-emerald-300' : 'border-slate-200'
            }`}>
              {/* Preview */}
              <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                {arte.formato?.startsWith('image/') ? (
                  <img src={arte.url} alt={arte.nome} className="w-full h-full object-cover" />
                ) : (
                  <FileImage className="w-10 h-10 text-slate-400" />
                )}
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => onToggleAprovacao(arte.id)}
                  className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
                  title={arte.aprovado ? 'Remover aprovação' : 'Aprovar'}>
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button onClick={() => onRemoverArte(arte.id)}
                  className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                  title="Remover">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Info bar */}
              <div className="p-2 bg-white">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs text-slate-500 truncate">{arte.nome}</span>
                  {arte.aprovado
                    ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    : <Clock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  }
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs text-indigo-500 font-medium">{TIPO_LABELS[arte.tipo].split(' ')[1]}</span>
                  {arte.tamanho_bytes && (
                    <span className="text-xs text-slate-400">{formatBytes(arte.tamanho_bytes)}</span>
                  )}
                </div>
              </div>

              {arte.aprovado && (
                <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                  ✓ Aprovada
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {artes.length === 0 && (
        <div className="text-center py-4 text-slate-400 text-sm">
          <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
          Nenhuma arte adicionada
        </div>
      )}
    </div>
  )
}
