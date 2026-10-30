import type { Domain, Exercise, LocalAttempt } from '../types'
import { DOMAIN_META } from '../types'
import Icon, { domainIcon } from './Icon'

interface Props {
  attempts: LocalAttempt[]
  exercises: Exercise[]
  online: boolean
  onStart: (domain?: Domain) => void
  onGenerate: (domain: Domain, topic: string) => void
  generating: boolean
}

const domains = Object.keys(DOMAIN_META) as Domain[]

const focusCopy: Record<Domain, { title: string; topic: string }> = {
  sql: { title: 'Jointures & agrégation', topic: 'jointures et agrégation' },
  python: { title: 'Structures & fonctions', topic: 'fonctions et structures' },
  english: { title: 'Expression professionnelle', topic: 'présentation de projet' }
}

export default function Dashboard({ attempts, exercises, online, onStart, onGenerate, generating }: Props) {
  const stats = {} as Record<Domain, { count: number; score: number }>
  for (const domain of domains) stats[domain] = { count: 0, score: 0 }
  attempts.forEach(item => { stats[item.domain].count += 1; stats[item.domain].score += item.score })
  const focus = exercises.find(item => item.domain === 'sql') ?? exercises[0]
  const focusDomain = focus?.domain ?? 'sql'
  const overallScore = attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / attempts.length) : 0
  const answeredDomains = domains.filter(domain => stats[domain].count > 0).length

  return <main className="page home-page">
    <section className="hero reveal">
      <p className="eyebrow">VOTRE PROCHAIN TRAJET</p>
      <h1>{focusDomain === 'english' ? 'Votre prochain' : focusDomain === 'python' ? 'Votre prochain' : '5 minutes pour'}<br />{focusDomain === 'sql' ? 'consolider les jointures.' : focusDomain === 'python' ? 'renforcer votre code.' : 'mieux communiquer.'}</h1>
      <p className="hero-copy">Une session courte, ciblée sur vos lacunes. Vous pouvez avancer même sans connexion.</p>
      <button className="primary-cta" onClick={() => onStart()}><span>Commencer la session</span><Icon name="arrow" /></button>
      <p className="cta-note"><Icon name="clock" /> Environ 5 minutes · reprise automatique</p>
    </section>

    <section className="path-section reveal delay-1" aria-labelledby="path-title">
      <div className="section-heading"><div><p className="eyebrow">CHOISIR UNE DIRECTION</p><h2 id="path-title">Votre parcours</h2></div></div>
      <div className="domain-grid">
        {domains.map(domain => <button key={domain} className="domain-card" onClick={() => onStart(domain)}>
          <span className="domain-icon"><Icon name={domainIcon[domain]} /></span>
          <span className="domain-card-copy"><span className="domain-card-title">{DOMAIN_META[domain].label}</span><span className="domain-card-hint">{DOMAIN_META[domain].hint}</span></span>
          <span className="domain-card-arrow"><Icon name="arrow" /></span>
        </button>)}
      </div>
    </section>

    <section className="momentum-section reveal delay-1" aria-labelledby="momentum-title">
      <div className="section-heading"><div><p className="eyebrow">VOTRE ÉLAN</p><h2 id="momentum-title">Cette semaine</h2></div><span className="attempt-count">{attempts.length} réponse{attempts.length > 1 ? 's' : ''}</span></div>
      <div className="summary-strip">
        <div><strong>{overallScore || '—'}</strong><span>{overallScore ? '% de moyenne' : 'Pas encore de score'}</span></div>
        <div><strong>{answeredDomains}/3</strong><span>parcours actifs</span></div>
      </div>
      <div className="progress-list">
        {domains.map(domain => {
          const stat = stats[domain]
          const average = stat.count ? Math.round(stat.score / stat.count) : 0
          return <button className="progress-line" key={domain} onClick={() => onStart(domain)}>
            <span className="progress-domain"><Icon name={domainIcon[domain]} />{DOMAIN_META[domain].label}</span>
            <span className="progress-track"><span style={{ width: `${average}%` }} /></span>
            <strong>{stat.count ? `${average}%` : '—'}</strong>
          </button>
        })}
      </div>
    </section>

    <section className="focus-section reveal delay-2" aria-labelledby="focus-title">
      <div className="section-heading"><div><p className="eyebrow">À TRAITER</p><h2 id="focus-title">Priorité du jour</h2></div></div>
      <div className="focus-card">
        <div className="focus-topline"><span className="focus-number">{focusDomain.toUpperCase()}</span><span><Icon name="clock" /> 5 min</span></div>
        <h3>{focusCopy[focusDomain].title}</h3>
        <p>Quelques minutes suffisent pour consolider cette compétence.</p>
        <div className="focus-actions">
          <button className="primary-cta compact" onClick={() => onStart(focusDomain)}><span>Commencer</span><Icon name="arrow" /></button>
          <button className="secondary-cta" onClick={() => onGenerate(focusDomain, focusCopy[focusDomain].topic)} disabled={!online || generating}><Icon name="spark" />{generating ? 'Création…' : 'Variante IA'}</button>
        </div>
      </div>
    </section>
    {!online && <p className="offline-note"><Icon name="lock" /> Mode hors connexion · vos réponses restent enregistrées sur cet appareil.</p>}
  </main>
}
