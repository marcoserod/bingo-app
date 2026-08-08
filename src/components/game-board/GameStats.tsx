interface GameStatsProps {
  calledCount: number
}

export function GameStats({ calledCount }: GameStatsProps) {
  const total = 90
  const available = total - calledCount
  const percentage = Math.round((calledCount / total) * 100)

  return (
    <div className="bg-theme-surface p-6 rounded-2xl border border-theme-border flex flex-col sm:flex-row items-center justify-around gap-6 sm:gap-4 w-full shadow-lg">
      
      {/* Bolas Salidas */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-900/40 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-theme-text-muted text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Bolas Salidas
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-theme-text">{calledCount}</span>
            <span className="text-sm text-theme-text-muted">de 90</span>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="hidden sm:block w-px h-12 bg-theme-border"></div>

      {/* Porcentaje */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-purple-900/40 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-theme-text-muted text-xs font-bold uppercase tracking-widest mb-1.5">PORCENTAJE</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-theme-text">{percentage}%</span>
            <span className="text-sm text-theme-text-muted">del juego</span>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="hidden sm:block w-px h-12 bg-theme-border"></div>

      {/* Disponibles */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-900/40 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-theme-text-muted text-xs font-bold uppercase tracking-widest mb-1.5">DISPONIBLES</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-theme-text">{available}</span>
            <span className="text-sm text-theme-text-muted">números restantes</span>
          </div>
        </div>
      </div>

    </div>
  )
}
