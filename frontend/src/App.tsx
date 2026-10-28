import { useEffect, useMemo, useState } from 'react'
import { fetchDashboard, fetchExercises, generateExercise } from './api'
import Dashboard from './components/Dashboard'
import Progress from './components/Progress'
import Session from './components/Session'
import { cacheExercises, loadAttempts, loadExercises, pickExercises, saveAttempt } from './storage'
import type { Domain, Exercise, LocalAttempt } from './types'

type View = 'home' | 'session' | 'progress'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [exercises, setExercises] = useState<Exercise[]>(loadExercises)
  const [session, setSession] = useState<Exercise[]>([])
  const [attempts, setAttempts] = useState<LocalAttempt[]>(loadAttempts)
  const [online, setOnline] = useState(navigator.onLine)
  const [generating, setGenerating] = useState(false)
  const [generationError, setGenerationError] = useState('')

  useEffect(() => {
    const refreshRemoteData = () => {
      if (!navigator.onLine) return
      fetchExercises().then(data => { setExercises(data); cacheExercises(data) }).catch(() => undefined)
      fetchDashboard().catch(() => undefined)
    }
    const update = () => {
      setOnline(navigator.onLine)
      if (navigator.onLine) refreshRemoteData()
    }
    window.addEventListener('online', update); window.addEventListener('offline', update)
    refreshRemoteData()
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update) }
  }, [])

  function start(domain?: Domain) {
    const available = exercises.length ? exercises : loadExercises()
    setSession(pickExercises(available, domain)); setView('session')
  }

  function record(attempt: LocalAttempt) { setAttempts(saveAttempt(attempt)) }

  async function startGenerated(domain: Domain, topic: string) {
    if (!navigator.onLine) { setGenerationError('La génération IA nécessite une connexion.'); return }
    setGenerating(true); setGenerationError('')
    try {
      const exercise = await generateExercise(domain, topic, 2)
      setSession([exercise]); setView('session')
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Impossible de générer la variante')
    } finally { setGenerating(false) }
  }

  const hasSession = useMemo(() => session.length > 0, [session])

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setView('home')} aria-label="Accueil SprintPath"><span className="brand-mark">S</span><span>SprintPath</span></button>
      <span className={`network-pill ${online ? 'online' : ''}`}>{online ? '● en ligne' : '● hors ligne'}</span>
    </header>
    {view === 'home' && <Dashboard attempts={attempts} exercises={exercises} online={online} onStart={start} onGenerate={startGenerated} generating={generating} />}
    {generationError && <div className="generation-toast" role="alert">{generationError}<button onClick={() => setGenerationError('')}>×</button></div>}
    {view === 'session' && hasSession && <Session exercises={session} onExit={() => setView('progress')} onFinish={record} />}
    {view === 'progress' && <Progress attempts={attempts} onHome={() => setView('home')} />}
    <nav className="bottom-nav" aria-label="Navigation principale">
      <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><span>⌂</span>Accueil</button>
      <button className={view === 'session' ? 'active' : ''} onClick={() => start()} disabled={!hasSession}><span>◎</span>Session</button>
      <button className={view === 'progress' ? 'active' : ''} onClick={() => setView('progress')}><span>↗</span>Progrès</button>
    </nav>
  </div>
}
