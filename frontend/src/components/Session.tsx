import { useState } from 'react'
import { askCoach, submitAttempt } from '../api'
import { localGrade } from '../storage'
import { DOMAIN_META, type AttemptResult, type CoachResult, type Exercise, type LocalAttempt } from '../types'

interface Props {
  exercises: Exercise[]
  onExit: () => void
  onFinish: (attempt: LocalAttempt) => void
}

export default function Session({ exercises, onExit, onFinish }: Props) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<AttemptResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [coachLoading, setCoachLoading] = useState(false)
  const [coach, setCoach] = useState<CoachResult | null>(null)
  const [coachError, setCoachError] = useState('')
  const [startedAt, useStartedAt] = useState(Date.now())
  const current = exercises[index]
  if (!current) return null
  const progress = ((index + (result ? 1 : 0)) / exercises.length) * 100

  async function submit() {
    if (!answer.trim()) return
    setLoading(true)
    try {
      let response: AttemptResult
      try {
        response = await submitAttempt(current.id, answer, Math.round((Date.now() - startedAt) / 1000))
      } catch {
        const grade = localGrade(current, answer)
        response = { attempt_id: Date.now(), score: grade.score, feedback: grade.feedback, explanation: current.explanation ?? 'Consulte la réponse attendue.', expected_answer: current.expected_answer ?? '', next_review_at: new Date().toISOString() }
      }
      setResult(response)
      onFinish({ exerciseId: current.id, domain: current.domain, answer, score: response.score, feedback: response.feedback, explanation: response.explanation, createdAt: new Date().toISOString() })
    } finally { setLoading(false) }
  }

  async function requestCoach(mode: 'hint' | 'explain' | 'interview') {
    setCoachLoading(true); setCoachError(''); setCoach(null)
    try {
      const response = await askCoach(current.domain, current.prompt, answer, result?.expected_answer ?? '', mode)
      setCoach(response)
    } catch (error) {
      setCoachError(error instanceof Error ? error.message : 'Le coach IA est indisponible')
    } finally { setCoachLoading(false) }
  }

  function next() {
    if (index < exercises.length - 1) { setIndex(value => value + 1); setAnswer(''); setResult(null); setCoach(null); setCoachError(''); useStartedAt(Date.now()) }
    else onExit()
  }

  return <main className="page session-page">
    <div className="session-head">
      <button className="back-button" onClick={onExit} aria-label="Quitter la session">←</button>
      <div className="session-progress"><span style={{ width: `${progress}%` }} /></div><span className="step-count">{index + 1}/{exercises.length}</span>
    </div>
    <div className="session-content">
      <div className="question-meta"><span>{DOMAIN_META[current.domain].code} / {DOMAIN_META[current.domain].label}</span><span>≈ {Math.ceil(current.duration_seconds / 60)} min</span></div>
      <h1 className="question-title">{current.prompt}</h1>
      {!result ? <>
        <label className="answer-label" htmlFor="answer">Votre réponse</label>
        <textarea id="answer" value={answer} onChange={event => setAnswer(event.target.value)} placeholder={current.domain === 'english' ? 'Écrivez votre réponse en anglais…' : 'Écrivez votre réponse…'} autoFocus />
        <div className="answer-hints"><span>Pas besoin d’être parfait</span><span>{answer.length} caractère{answer.length > 1 ? 's' : ''}</span></div>
        <button className="primary-cta session-submit" disabled={!answer.trim() || loading} onClick={submit}>{loading ? 'Évaluation…' : 'Vérifier ma réponse'} <span>→</span></button>
      </> : <div className="feedback-panel">
        <div className={`score-stamp ${result.score >= 80 ? 'good' : result.score >= 50 ? 'medium' : 'low'}`}><strong>{result.score}</strong><span>/ 100</span></div>
        <p className="eyebrow">VOTRE FEEDBACK</p><h2>{result.feedback}</h2>
        <div className="explanation"><span>À retenir</span><p>{result.explanation}</p></div>
        <details><summary>Voir la réponse attendue</summary><pre>{result.expected_answer}</pre></details>
        <section className="ai-coach" aria-live="polite">
          <div className="ai-coach-head"><span className="ai-mark">✦</span><div><p className="eyebrow">COACH IA</p><h3>Aller plus loin</h3></div></div>
          <div className="coach-actions">
            <button onClick={() => requestCoach('hint')} disabled={coachLoading}>Un indice</button>
            <button onClick={() => requestCoach('explain')} disabled={coachLoading}>Expliquer</button>
            <button onClick={() => requestCoach('interview')} disabled={coachLoading}>Question entretien</button>
          </div>
          {coachLoading && <p className="coach-status">Le coach réfléchit…</p>}
          {coachError && <p className="coach-error">{coachError}</p>}
          {coach && <div className="coach-answer"><strong>{coach.title}</strong><p>{coach.message}</p></div>}
        </section>
        <button className="primary-cta session-submit" onClick={next}>{index < exercises.length - 1 ? 'Question suivante' : 'Voir ma progression'} <span>→</span></button>
      </div>}
    </div>
  </main>
}
