import { beforeEach, describe, expect, it } from 'vitest'
import { cacheExercises, fallbackExercises, loadAttempts, localGrade, saveAttempt } from './storage'

describe('stockage local SprintPath', () => {
  beforeEach(() => localStorage.clear())

  it('conserve une tentative après rechargement logique', () => {
    saveAttempt({
      exerciseId: 101,
      domain: 'sql',
      answer: 'SELECT * FROM commandes',
      score: 65,
      feedback: 'Bonne piste',
      explanation: 'Complétez le filtre',
      createdAt: '2026-10-28T10:00:00Z'
    })
    expect(loadAttempts()).toHaveLength(1)
    expect(loadAttempts()[0].score).toBe(65)
  })

  it('évalue correctement une réponse SQL complète', () => {
    const exercise = fallbackExercises[0]
    const result = localGrade(exercise, exercise.expected_answer ?? '')
    expect(result.score).toBeGreaterThanOrEqual(95)
  })

  it('conserve la solution hors connexion après mise à jour du cache API', () => {
    const apiExercise = { ...fallbackExercises[0], expected_answer: undefined, explanation: undefined }
    cacheExercises([apiExercise])
    const cached = JSON.parse(localStorage.getItem('sprintpath.exercises.v1') || '[]')[0]
    expect(cached.expected_answer).toContain('SELECT')
    expect(localGrade(cached, fallbackExercises[0].expected_answer ?? '').score).toBeGreaterThanOrEqual(95)
  })
})
