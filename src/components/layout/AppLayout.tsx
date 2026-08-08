import { ReactNode } from 'react'

interface AppLayoutProps {
  sidebar?: ReactNode
  children: ReactNode
}

export function AppLayout({ sidebar, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-theme-bg flex flex-col md:flex-row font-sans text-theme-text selection:bg-blue-500/30 transition-colors duration-200">
      {/* Sidebar */}
      {sidebar && (
        <aside className="w-full md:w-64 lg:w-72 border-b md:border-b-0 md:border-r border-theme-border flex-shrink-0 h-auto md:h-screen">
          {sidebar}
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {!sidebar && (
          <header className="border-b border-theme-border px-6 lg:px-8 py-4 sticky top-0 z-10 bg-theme-bg transition-colors duration-200">
            <div className="max-w-[1600px] mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                  B
                </div>
                <h1 className="text-lg font-bold tracking-wide text-theme-text">
                  BINGO
                </h1>
              </div>
            </div>
          </header>
        )}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
