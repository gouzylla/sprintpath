import { DOMAIN_META, type Domain, type LocalAttempt } from '../types'

interface Props { attempts: LocalAttempt[]; onHome: () => void }

export default function Progress({ attempts, onHome }: Props) {
  const stats = {} as Record<Domain, { count: number; score: number }>
  for (const domain of Object.keys(DOMAIN_META) as Domain[]) stats[domain] = { count: 0, score: 0 }
  attempts.forEach(item => { stats[item.domain].count += 1; stats[item.domain].score += item.score })
  return <main className="page progress-page">
    <p className="eyebrow">SESSION TERMINÉE</p><h1>Chaque réponse<br />vous fait avancer.</h1>
    <div className="progress-summary"><strong>{attempts.length}</strong><span>réponses accomplies</span></div>
    <div className="score-bars">
      {(Object.keys(DOMAIN_META) as Domain[]).map(domain => {
        const stat = stats[domain]; const average = stat.count ? Math.round(stat.score / stat.count) : 0
        return <div className="score-row" key={domain}><div><span>{DOMAIN_META[domain].label}</span><strong>{average}%</strong></div><div className="bar"><span style={{ width: `${average}%` }} /></div></div>
      })}
    </div>
    <section className="history"><div className="section-heading"><div><p className="eyebrow">JOURNAL</p><h2>Derniers exercices</h2></div></div>
      {attempts.slice(0, 8).map((attempt, attemptIndex) => <div className="history-item" key={`${attempt.createdAt}-${attemptIndex}`}><span className={`history-score ${attempt.score >= 80 ? 'good' : ''}`}>{attempt.score}</span><div><strong>{DOMAIN_META[attempt.domain].label}</strong><p>{attempt.feedback}</p></div></div>)}
    </section>
    <button className="primary-cta" onClick={onHome}>Revenir à l’accueil <span>↗</span></button>
  </main>
}
