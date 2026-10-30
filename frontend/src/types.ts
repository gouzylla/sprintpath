export type Domain = 'sql' | 'python' | 'english'

export interface Exercise {
  id: number
  skill_id: number
  domain: Domain
  prompt: string
  context?: string
  expected_answer?: string
  explanation?: string
  difficulty: number
  duration_seconds: number
}

export interface AttemptResult {
  attempt_id: number
  score: number
  feedback: string
  explanation: string
  expected_answer: string
  next_review_at: string
}

export interface CoachResult {
  title: string
  message: string
  action: string
}

export interface LocalAttempt {
  exerciseId: number
  domain: Domain
  answer: string
  score: number
  feedback: string
  explanation: string
  createdAt: string
}

export interface DomainStat {
  domain: Domain
  attempts: number
  average_score: number
}

export interface FocusSkill {
  name: string
  domain: Domain
  level: number
  average_score: number
  due: boolean
}

export interface Dashboard {
  domains: DomainStat[]
  focus: FocusSkill[]
  total_attempts: number
  nvidia_nim: boolean
}

export const DOMAIN_META: Record<Domain, { label: string; short: string; code: string; hint: string }> = {
  sql: { label: 'SQL', short: 'Requêtes', code: '01', hint: 'Interroger et modéliser les données' },
  python: { label: 'Python', short: 'Code', code: '02', hint: 'Écrire, tester et automatiser' },
  english: { label: 'Anglais pro', short: 'Communication', code: '03', hint: 'Exprimer et argumenter au travail' }
}
