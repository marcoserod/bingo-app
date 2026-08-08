interface CalledHistoryProps {
  calledNumbers: number[]
  onReset: () => void
}

export function CalledHistory({ calledNumbers, onReset }: CalledHistoryProps) {
  const history = [...calledNumbers].reverse()

  return (
    <div className="flex flex-col h-full bg-theme-surface rounded-2xl border border-theme-border overflow-hidden">
      <div className="px-6 py-5 border-b border-theme-border flex items-center gap-2">
        <h2 className="text-theme-text font-bold tracking-wide">Historial</h2>
        <span className="bg-theme-bg border border-theme-border px-2.5 py-1 rounded-lg text-xs font-bold text-blue-500 ml-auto">
          {history.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {history.length === 0 ? (
          <p className="text-slate-600 text-center text-sm mt-6">
            Aún no hay números
          </p>
        ) : (
          <ul className="space-y-2">
            {history.map((num, index) => (
              <li 
                key={`${num}-${index}`} 
                className={`flex items-center rounded-lg font-medium text-lg px-6 py-3 transition-colors ${
                  index === 0 
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20 border border-blue-500 justify-center text-lg' 
                    : 'bg-theme-surface-alt text-theme-text-muted border border-theme-border-strong justify-start hover:bg-theme-border'
                }`}
              >
                <span>{num}</span>
                {index === 0 && <span className="text-xs bg-white/20 px-2 py-1 rounded ml-2">Último</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-theme-border">
        <button 
          onClick={onReset}
          className="w-full py-3 rounded-lg bg-theme-surface-alt border border-theme-border-strong text-red-500 text-sm flex justify-center items-center gap-2 hover:bg-red-500 hover:text-white transition-colors shadow-sm cursor-pointer font-medium"
        >
          <span className="text-red-400">🗑</span> Reiniciar tablero
        </button>
      </div>
    </div>
  )
}
