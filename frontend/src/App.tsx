import { useEffect, useMemo, useState } from 'react'
import { fetchDashboard, fetchExercises, generateExercise } from './api'
import Dashboard from './components/Dashboard'
import Progress from './components/Progress'
import Session from './components/Session'
import { cacheExercises, loadAttempts, loadExercises, pickExercises, saveAttempt } from './storage'
import type { Domain, Exercise, LocalAttempt } from './types'
import Icon from './components/Icon'

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

  return <div className={`app-shell ${view === 'session' ? 'session-mode' : ''}`}>
    <a className="skip-link" href="#main-content">Aller au contenu</a>
    <header className="topbar">
      <button className="brand" onClick={() => setView('home')} aria-label="Retour à l’accueil SprintPath"><span className="brand-mark" aria-hidden="true">S</span><span className="brand-name">SprintPath</span></button>
      <span className={`network-pill ${online ? 'online' : ''}`}><span className="network-dot" aria-hidden="true" />{online ? 'En ligne' : 'Hors ligne'}</span>
    </header>
    <div id="main-content">
      {view === 'home' && <Dashboard attempts={attempts} exercises={exercises} online={online} onStart={start} onGenerate={startGenerated} generating={generating} />}
      {generationError && <div className="generation-toast" role="alert"><span>{generationError}</span><button onClick={() => setGenerationError('')} aria-label="Fermer le message">×</button></div>}
      {view === 'session' && hasSession && <Session exercises={session} onExit={() => setView('progress')} onFinish={record} />}
      {view === 'progress' && <Progress attempts={attempts} onHome={() => setView('home')} />}
    </div>
    {view !== 'session' && <nav className="bottom-nav" aria-label="Navigation principale">
      <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><Icon name="home" /><span>Accueil</span></button>
      <button onClick={() => start()} disabled={!hasSession}><Icon name="session" /><span>Session</span></button>
      <button className={view === 'progress' ? 'active' : ''} onClick={() => setView('progress')}><Icon name="progress" /><span>Progrès</span></button>
    </nav>}
  </div>
}
