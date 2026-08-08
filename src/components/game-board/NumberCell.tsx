interface NumberCellProps {
  number: number
  isCalled: boolean
  onClick?: () => void
}

export function NumberCell({ number, isCalled, onClick }: NumberCellProps) {
  const Component = isCalled ? 'button' : 'div'
  
  return (
    <Component
      onClick={isCalled ? onClick : undefined}
      aria-label={isCalled ? `Eliminar número ${number}` : `Número ${number}`}
      className={`relative flex items-center justify-center rounded-lg text-lg aspect-square transition-all duration-200 ${
        isCalled
          ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border-blue-400 font-bold transform scale-105 ring-2 ring-blue-500 ring-offset-2 ring-offset-theme-surface z-10 cursor-pointer hover:bg-blue-500 hover:scale-110 focus:outline-none focus:ring-4'
          : 'bg-theme-surface-alt text-theme-text-muted border border-theme-border-strong font-normal cursor-default'
      }`}
    >
      {number}
      {isCalled && (
        <span className="absolute bottom-1.5 w-1 h-1 bg-white rounded-full"></span>
      )}
    </Component>
  )
}
