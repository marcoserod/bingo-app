import React, { useState } from 'react'

interface NumberInputProps {
  onAddNumber: (num: number) => { success: boolean, error?: string }
  isComplete?: boolean
}

export function NumberInput({ onAddNumber, isComplete = false }: NumberInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isComplete) return
    
    setError(null)

    const trimmed = inputValue.trim()
    if (!trimmed) {
      setError('Ingresá un número.')
      return
    }

    const num = Number(trimmed)
    if (isNaN(num) || !Number.isInteger(num)) {
      setError('Número inválido.')
      return
    }

    const result = onAddNumber(num)
    if (!result.success) {
      setError(result.error || 'Error al ingresar el número.')
      return
    }

    setInputValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-theme-surface p-6 rounded-2xl border border-theme-border h-full flex flex-col justify-center relative shadow-lg">
      <div className="mb-4">
        <label htmlFor="number-input" className="text-theme-text-muted font-bold tracking-widest text-sm mb-4 uppercase z-10 text-center block">
          {isComplete ? 'Partida Finalizada' : 'Ingresar Número'}
        </label>
        <p className="text-slate-400 text-xs mt-1">Entre 1 y 90</p>
      </div>
      
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <input
            id="number-input"
            type="number"
            min="1"
            max="90"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              if (error) setError(null)
            }}
            className={`w-full px-4 py-3 h-[60px] text-2xl font-medium rounded-xl bg-theme-bg border border-theme-border-strong text-theme-text focus:outline-none focus:border-blue-500 text-center transition-colors placeholder:text-theme-text-muted appearance-none ${
              isComplete ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            placeholder={isComplete ? "-" : "--"}
            autoFocus={!isComplete}
            disabled={isComplete}
          />
        </div>
        <button
          type="submit"
          disabled={isComplete}
          className={`px-6 py-3 h-[60px] font-medium text-sm rounded-xl transition-colors flex items-center gap-2 ${
            isComplete 
              ? 'bg-theme-surface-alt text-theme-text-muted cursor-not-allowed border-theme-border opacity-50' 
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]'
          }`}
        >
          Ingresar <span>→</span>
        </button>
      </div>
      
      <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
        <span className="border border-theme-border-strong rounded px-1.5 py-0.5 bg-theme-bg">⌨</span> 
        Presioná Enter para ingresar
      </div>

      {error && (
        <p className="absolute bottom-4 right-6 text-red-400 font-medium text-xs animate-pulse">
          {error}
        </p>
      )}
    </form>
  )
}
