import type { AttemptResult, CoachResult, Dashboard, Domain, Exercise } from './types'

// En développement réseau, on cible l'hôte qui sert la page (et non localhost,
// qui désignerait le téléphone). VITE_API_URL permet de surcharger cette valeur.
const API = import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:8000/api`

export async function fetchExercises(domain?: Domain): Promise<Exercise[]> {
  if (!navigator.onLine) throw new Error('Mode hors connexion')
  const suffix = domain ? `?domain=${domain}` : ''
  const response = await fetch(`${API}/exercises${suffix}`)
  if (!response.ok) throw new Error('Impossible de charger les exercices')
  return response.json()
}

export async function fetchDashboard(): Promise<Dashboard> {
  if (!navigator.onLine) throw new Error('Mode hors connexion')
  const response = await fetch(`${API}/dashboard`)
  if (!response.ok) throw new Error('Impossible de charger la progression')
  return response.json()
}

export async function submitAttempt(exerciseId: number, answer: string, durationSeconds: number): Promise<AttemptResult> {
  if (!navigator.onLine) throw new Error('Mode hors connexion')
  const response = await fetch(`${API}/attempts?exercise_id=${exerciseId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer, duration_seconds: durationSeconds })
  })
  if (!response.ok) throw new Error('Impossible d’enregistrer la tentative')
  return response.json()
}

export async function askCoach(
  domain: Domain,
  question: string,
  context: string,
  answer: string,
  expectedAnswer: string,
  mode: 'hint' | 'explain' | 'interview'
): Promise<CoachResult> {
  if (!navigator.onLine) throw new Error('Le coach IA nécessite une connexion')
  const response = await fetch(`${API}/ai/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, question, context, answer, expected_answer: expectedAnswer, mode })
  })
  if (!response.ok) throw new Error('Le coach IA est indisponible')
  return response.json()
}

export async function generateExercise(domain: Domain, topic: string, difficulty = 2): Promise<Exercise> {
  if (!navigator.onLine) throw new Error('La génération IA nécessite une connexion')
  const response = await fetch(`${API}/ai/exercises/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, topic, difficulty })
  })
  if (!response.ok) throw new Error('Impossible de générer une variante')
  return response.json()
}
