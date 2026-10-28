import type { Domain, Exercise, LocalAttempt } from '../types'
import { DOMAIN_META } from '../types'

interface Props {
  attempts: LocalAttempt[]
  exercises: Exercise[]
  online: boolean
  onStart: (domain?: Domain) => void
  onGenerate: (domain: Domain, topic: string) => void
  generating: boolean
}

const icons: Record<Domain, string> = { sql: '⌁', python: '◆', english: 'Aa' }

export default function Dashboard({ attempts, exercises, online, onStart, onGenerate, generating }: Props) {
  const stats = {} as Record<Domain, { count: number; score: number }>
  for (const domain of Object.keys(DOMAIN_META) as Domain[]) stats[domain] = { count: 0, score: 0 }
  attempts.forEach(item => { stats[item.domain].count += 1; stats[item.domain].score += item.score })
  const focus = exercises.find(item => item.domain === 'sql') ?? exercises[0]

  return <main className="page home-page">
    <section className="hero reveal">
      <p className="eyebrow">VOTRE PROCHAIN DÉPART</p>
      <h1>Chaque trajet<br />compte.</h1>
      <p className="hero-copy">Une session courte, ciblée sur vos lacunes. SQL, Python et anglais professionnel.</p>
      <button className="primary-cta" onClick={() => onStart()}><span>Commencer une session</span><span aria-hidden="true">↗</span></button>
      <div className="session-options" aria-label="Choisir un parcours">
        {(Object.keys(DOMAIN_META) as Domain[]).map(domain => <button key={domain} className="domain-chip" onClick={() => onStart(domain)}><span className="domain-code">{DOMAIN_META[domain].code}</span><span>{DOMAIN_META[domain].label}</span></button>)}
      </div>
    </section>

    <section className="momentum-section reveal delay-1">
      <div className="section-heading"><div><p className="eyebrow">VOTRE ÉLAN</p><h2>Cette semaine</h2></div><span className="attempt-count">{attempts.length} réponses</span></div>
      <div className="domain-grid">
        {(Object.keys(DOMAIN_META) as Domain[]).map(domain => {
          const stat = stats[domain]
          const average = stat.count ? Math.round(stat.score / stat.count) : 0
          return <button className="domain-card" key={domain} onClick={() => onStart(domain)}>
            <span className="domain-icon">{icons[domain]}</span><span className="domain-card-title">{DOMAIN_META[domain].label}</span><span className="domain-card-hint">{DOMAIN_META[domain].hint}</span><span className="domain-card-score">{stat.count ? `${average}%` : '—'}<small>{stat.count ? 'moyenne' : 'à commencer'}</small></span>
          </button>
        })}
      </div>
    </section>

    <section className="focus-section reveal delay-2">
      <div className="section-heading"><div><p className="eyebrow">À TRAITER</p><h2>Priorité du jour</h2></div></div>
      <div className="focus-card">
        <span className="focus-number">{focus?.domain.toUpperCase() ?? 'SQL'}</span>
        <div><h3>{focus?.domain === 'python' ? 'Structures & fonctions' : focus?.domain === 'english' ? 'Expression professionnelle' : 'Jointures & agrégation'}</h3><p>5 minutes suffisent pour consolider cette compétence.</p></div>
        <div className="focus-actions"><button onClick={() => onStart(focus?.domain)} aria-label="Commencer la priorité">→</button><button className="ai-variant" onClick={() => onGenerate(focus?.domain ?? 'sql', focus?.domain === 'english' ? 'présentation de projet' : focus?.domain === 'python' ? 'fonctions et structures' : 'jointures et agrégation')} disabled={!online || generating}>{generating ? 'Création…' : 'Variante IA'}</button></div>
      </div>
    </section>
    {!online && <p className="offline-note">Mode hors connexion · vos réponses restent enregistrées sur cet appareil.</p>}
  </main>
}
