interface LastNumberProps {
  number: number | null
}

export function LastNumber({ number }: LastNumberProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-theme-surface rounded-2xl border border-theme-border h-full relative overflow-hidden shadow-lg">
      <h2 className="text-theme-text-muted font-semibold mb-4 uppercase text-xs tracking-wider z-10">
        Último Número
      </h2>
      {number !== null ? (
        <div className="relative group flex items-center justify-center z-10 mt-2">
          {/* Outer glow */}
          <div className="absolute inset-0 bg-blue-600 rounded-full blur-[40px] opacity-25"></div>
          {/* Sparkles mock */}
          <div className="absolute -inset-4 opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>
          
          <div className="relative text-7xl font-bold text-white w-32 h-32 rounded-full flex items-center justify-center border-[3px] border-blue-500/80 shadow-[0_0_40px_rgba(59,130,246,0.3)] bg-gradient-to-b from-[#1a2b4c] to-[#111928]">
            {number}
          </div>
        </div>
      ) : (
        <div className="text-3xl font-medium text-theme-text-muted w-32 h-32 rounded-full flex items-center justify-center border-2 border-dashed border-theme-border-strong z-10 mt-2">
          --
        </div>
      )}
    </div>
  )
}
