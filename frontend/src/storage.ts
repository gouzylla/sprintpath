import type { Domain, Exercise, LocalAttempt } from './types'

const EXERCISE_KEY = 'sprintpath.exercises.v1'
const ATTEMPT_KEY = 'sprintpath.attempts.v1'

const sqlContext = 'commandes (id, client_id, montant, date_commande, pays)\nclients (id, nom)'

export const fallbackExercises: Exercise[] = [
  { id: 101, skill_id: 1, domain: 'sql', prompt: 'Affichez les commandes de plus de 100 € triées de la plus récente à la plus ancienne.', context: sqlContext, expected_answer: 'SELECT * FROM commandes WHERE montant > 100 ORDER BY date_commande DESC;', explanation: 'Le filtre numérique précède le tri. DESC inverse l’ordre chronologique.', difficulty: 1, duration_seconds: 180 },
  { id: 102, skill_id: 2, domain: 'sql', prompt: 'Comment conserver tous les clients, y compris ceux sans commande ?', context: sqlContext, expected_answer: 'SELECT clients.*, commandes.id FROM clients LEFT JOIN commandes ON commandes.client_id = clients.id;', explanation: 'LEFT JOIN conserve la table de gauche. INNER JOIN exclurait les clients sans commande.', difficulty: 1, duration_seconds: 180 },
  { id: 103, skill_id: 4, domain: 'sql', prompt: 'Écrivez une requête affichant le nombre de commandes par pays.', context: sqlContext, expected_answer: 'SELECT pays, COUNT(*) AS total FROM commandes GROUP BY pays;', explanation: 'COUNT est appliqué à chaque groupe défini par pays.', difficulty: 2, duration_seconds: 240 },
  { id: 201, skill_id: 6, domain: 'python', prompt: 'Quel résultat produit {1, 2, 2, 3} ?', expected_answer: '{1, 2, 3}', explanation: 'Un ensemble supprime les doublons.', difficulty: 1, duration_seconds: 90 },
  { id: 202, skill_id: 7, domain: 'python', prompt: 'Que retourne cette fonction ? def double(x): return x * 2', expected_answer: 'Le double de x', explanation: 'return termine la fonction et renvoie la valeur calculée.', difficulty: 1, duration_seconds: 120 },
  { id: 203, skill_id: 8, domain: 'python', prompt: 'Transformez la liste [\'a\', \'b\'] en [\'A\', \'B\'].', expected_answer: "[s.upper() for s in ['a', 'b']]", explanation: 'Une compréhension construit une nouvelle liste.', difficulty: 1, duration_seconds: 150 },
  { id: 301, skill_id: 11, domain: 'english', prompt: 'Complétez : “I currently work as a … and my main responsibility is …”.', expected_answer: 'a data developer ... building SQL pipelines', explanation: 'Reliez les informations avec and.', difficulty: 1, duration_seconds: 90 },
  { id: 302, skill_id: 12, domain: 'english', prompt: 'Comment dire “J’ai optimisé la requête” en anglais professionnel ?', expected_answer: 'I optimized the query.', explanation: 'Le passé simple est adapté au récit professionnel.', difficulty: 2, duration_seconds: 90 },
  { id: 303, skill_id: 13, domain: 'english', prompt: 'Choisissez la formulation la plus professionnelle.', expected_answer: 'We chose this approach because it is easier to maintain.', explanation: 'La justification claire est essentielle.', difficulty: 2, duration_seconds: 120 }
]

export function loadExercises(): Exercise[] {
  try {
    const stored = localStorage.getItem(EXERCISE_KEY)
    if (stored) return JSON.parse(stored) as Exercise[]
  } catch { /* local data is optional */ }
  localStorage.setItem(EXERCISE_KEY, JSON.stringify(fallbackExercises))
  return fallbackExercises
}

export function cacheExercises(exercises: Exercise[]): void {
  const withOfflineSolutions = exercises.map(exercise => {
    const local = fallbackExercises.find(item => item.prompt === exercise.prompt)
    return local ? { ...exercise, context: exercise.context ?? local.context, expected_answer: local.expected_answer, explanation: local.explanation } : exercise
  })
  localStorage.setItem(EXERCISE_KEY, JSON.stringify(withOfflineSolutions))
}

export function loadAttempts(): LocalAttempt[] {
  try {
    const stored = localStorage.getItem(ATTEMPT_KEY)
    return stored ? JSON.parse(stored) as LocalAttempt[] : []
  } catch {
    return []
  }
}

export function saveAttempt(attempt: LocalAttempt): LocalAttempt[] {
  const attempts = [attempt, ...loadAttempts()].slice(0, 200)
  localStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempts))
  return attempts
}

export function localGrade(exercise: Exercise, answer: string): { score: number; feedback: string } {
  const clean = answer.toLowerCase()
  const target = (exercise.expected_answer ?? '').toLowerCase()
  const words = target.match(/[a-z_]{3,}/g) ?? []
  const matches = words.filter(word => clean.includes(word)).length
  const ratio = words.length ? matches / words.length : 0
  if (ratio >= 0.75) return { score: 95, feedback: 'Ta réponse reprend les éléments attendus. Continue avec confiance.' }
  if (ratio >= 0.4) return { score: 65, feedback: 'Tu es sur la bonne piste, mais une notion clé manque encore.' }
  return { score: 30, feedback: 'Reprends la consigne et construis ta réponse avec les termes techniques attendus.' }
}

export function pickExercises(exercises: Exercise[], domain?: Domain): Exercise[] {
  const source = domain ? exercises.filter(exercise => exercise.domain === domain) : exercises
  return [...source].sort((a, b) => a.difficulty - b.difficulty).slice(0, 5)
}
