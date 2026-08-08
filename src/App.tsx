import { AppLayout } from './components/layout/AppLayout'
import { GameBoard } from './components/game-board/GameBoard'
import { GameList } from './components/game-list/GameList'
import { useGames } from './hooks/useGames'
import { useTheme } from './hooks/useTheme'

function App() {
  const { games, activeId, createGame, loadGame, deleteGame, refreshGames } = useGames()
  const { theme, toggleTheme } = useTheme()

  return (
    <AppLayout 
      sidebar={
        <GameList 
          games={games} 
          activeId={activeId} 
          onSelect={loadGame}
          onDelete={deleteGame}
          onCreate={createGame}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      }
    >
      {activeId ? (
        <GameBoard gameId={activeId} onGameUpdate={refreshGames} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 h-full">
          <p className="text-xl font-medium text-slate-300">Seleccioná una partida para comenzar</p>
          {games.length === 0 && (
            <p className="text-sm text-slate-500">O creá una nueva desde el panel lateral</p>
          )}
        </div>
      )}
    </AppLayout>
  )
}

export default App
