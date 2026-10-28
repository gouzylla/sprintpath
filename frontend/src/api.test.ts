import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { askCoach, generateExercise } from './api'

describe('helpers API IA', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => vi.unstubAllGlobals())

  it('envoie la demande de coach au bon endpoint', async () => {
    const coach = { title: 'Piste', message: 'Pense au GROUP BY', action: 'group_by' }
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(coach), { status: 200 }))

    await expect(askCoach('sql', 'Question SQL', 'ma réponse', 'SELECT', 'hint')).resolves.toEqual(coach)

    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toContain('/api/ai/coach')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toMatchObject({ domain: 'sql', mode: 'hint' })
  })

  it('demande une variante avec le domaine et le sujet', async () => {
    const exercise = { id: 42, skill_id: 1, domain: 'python', prompt: 'Exercise', difficulty: 2, duration_seconds: 180 }
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(exercise), { status: 200 }))

    await expect(generateExercise('python', 'listes', 2)).resolves.toEqual(exercise)

    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toContain('/api/ai/exercises/generate')
    expect(JSON.parse(String(init?.body))).toEqual({ domain: 'python', topic: 'listes', difficulty: 2 })
  })

  it('refuse les fonctions IA hors connexion', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
    await expect(askCoach('sql', 'Question', '', '', 'hint')).rejects.toThrow('connexion')
    await expect(generateExercise('sql', 'jointures')).rejects.toThrow('connexion')
    expect(fetch).not.toHaveBeenCalled()
  })
})
