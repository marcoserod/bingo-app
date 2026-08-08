import React, { useState } from 'react'

interface NewGameFormProps {
  onCreate: (name: string) => void
  onCancel: () => void
}

export function NewGameForm({ onCreate, onCancel }: NewGameFormProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed && trimmed.length <= 40) {
      onCreate(trimmed)
    }
  }

  return (
    <div className="p-4 border-b border-theme-border bg-theme-surface-alt">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la partida..."
          className="w-full px-4 py-2.5 rounded-lg bg-theme-bg border border-theme-border-strong text-theme-text focus:outline-none focus:border-blue-500 text-sm placeholder:text-theme-text-muted"
          autoFocus
          maxLength={40}
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
          >
            Crear
          </button>
        </div>
      </form>
    </div>
  )
}
