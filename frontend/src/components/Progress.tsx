import { DOMAIN_META, type Domain, type LocalAttempt } from '../types'
import Icon, { domainIcon } from './Icon'

interface Props { attempts: LocalAttempt[]; onHome: () => void }

const domains = Object.keys(DOMAIN_META) as Domain[]

export default function Progress({ attempts, onHome }: Props) {
  const stats = {} as Record<Domain, { count: number; score: number }>
  for (const domain of domains) stats[domain] = { count: 0, score: 0 }
  attempts.forEach(item => { stats[item.domain].count += 1; stats[item.domain].score += item.score })
  const average = attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / attempts.length) : 0
  const activeDays = new Set(attempts.map(item => item.createdAt.slice(0, 10))).size

  return <main className="page progress-page">
    <p className="eyebrow">VOTRE PROGRESSION</p><h1>Chaque réponse<br />vous fait avancer.</h1>
    <div className="progress-summary">
      <div><strong>{attempts.length}</strong><span>réponses accomplies</span></div>
      <div><strong>{average || '—'}</strong><span>score moyen</span></div>
      <div><strong>{activeDays}</strong><span>jour{activeDays > 1 ? 's' : ''} actif{activeDays > 1 ? 's' : ''}</span></div>
    </div>

    <section className="skills-section" aria-labelledby="skills-title">
      <div className="section-heading"><div><p className="eyebrow">VOS COMPÉTENCES</p><h2 id="skills-title">Où vous en êtes</h2></div></div>
      <div className="skill-list">
        {domains.map(domain => {
          const stat = stats[domain]
          const score = stat.count ? Math.round(stat.score / stat.count) : 0
          return <div className="skill-row" key={domain}>
            <span className="skill-icon"><Icon name={domainIcon[domain]} /></span>
            <div className="skill-copy"><strong>{DOMAIN_META[domain].label}</strong><span>{stat.count ? `${stat.count} exercice${stat.count > 1 ? 's' : ''}` : 'À commencer'}</span></div>
            <div className="skill-score"><strong>{stat.count ? `${score}%` : '—'}</strong><span className="skill-track"><span style={{ width: `${score}%` }} /></span></div>
          </div>
        })}
      </div>
    </section>

    <section className="review-section" aria-labelledby="review-title">
      <div className="section-heading"><div><p className="eyebrow">À REVIVR</p><h2 id="review-title">Votre prochaine priorité</h2></div></div>
      <div className="review-card"><Icon name="check" /><div><strong>{attempts.length ? 'Continuez sur votre priorité du jour' : 'Votre première session vous attend'}</strong><p>{attempts.length ? 'Une session de 5 minutes suffit à relancer votre progression.' : 'Choisissez un parcours pour commencer à construire vos habitudes.'}</p></div></div>
    </section>

    <section className="history" aria-labelledby="history-title">
      <div className="section-heading"><div><p className="eyebrow">JOURNAL</p><h2 id="history-title">Derniers exercices</h2></div></div>
      {attempts.length ? attempts.slice(0, 8).map((attempt, attemptIndex) => <article className="history-item" key={`${attempt.createdAt}-${attemptIndex}`}>
        <span className={`history-score ${attempt.score >= 80 ? 'good' : attempt.score >= 50 ? 'medium' : 'low'}`}>{attempt.score}</span>
        <div><strong>{DOMAIN_META[attempt.domain].label}</strong><p>{attempt.feedback}</p></div>
      </article>) : <p className="empty-state">Votre journal se remplira après votre première réponse.</p>}
    </section>
    <button className="primary-cta" onClick={onHome}><span>Revenir à l’accueil</span><Icon name="arrow" /></button>
  </main>
}
