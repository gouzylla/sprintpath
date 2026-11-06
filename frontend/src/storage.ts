import type { Domain, Exercise, LocalAttempt } from './types'

const EXERCISE_KEY = 'sprintpath.exercises.v1'
const ATTEMPT_KEY = 'sprintpath.attempts.v1'

const sqlContext = 'commandes (id, client_id, montant, date_commande, pays)\nclients (id, nom)'

export const fallbackExercises: Exercise[] = [
  { id: 101, skill_id: 1, domain: 'sql', prompt: 'Écrivez une requête qui retourne les commandes dépassant 500 € passées au cours des 30 derniers jours, triées du montant le plus élevé au plus bas.', context: sqlContext, expected_answer: 'SELECT * FROM commandes WHERE montant > 500 AND date_commande >= CURRENT_DATE - INTERVAL \'30 days\' ORDER BY montant DESC;', explanation: 'Combinez deux conditions dans WHERE (montant et date), puis triez avec ORDER BY DESC pour avoir les montants les plus élevés en premier.', difficulty: 1, duration_seconds: 180 },
  { id: 102, skill_id: 2, domain: 'sql', prompt: 'Écrivez une requête qui retourne le nom du client, sa ville et le montant total de ses commandes. Incluez les clients n\'ayant jamais passé commande.', context: sqlContext, expected_answer: 'SELECT c.nom, c.ville, COALESCE(SUM(cmd.montant), 0) AS total FROM clients c LEFT JOIN commandes cmd ON cmd.client_id = c.id GROUP BY c.id, c.nom, c.ville;', explanation: 'LEFT JOIN conserve tous les clients même sans commande. COALESCE transforme le NULL en 0. GROUP BY doit inclure toutes les colonnes non agrégées.', difficulty: 2, duration_seconds: 240 },
  { id: 103, skill_id: 3, domain: 'sql', prompt: 'Écrivez une requête affichant les pays ayant plus de 10 commandes, avec leur nombre total de commandes et leur montant moyen.', context: sqlContext, expected_answer: 'SELECT pays, COUNT(*) AS nb_commandes, ROUND(AVG(montant), 2) AS montant_moyen FROM commandes GROUP BY pays HAVING COUNT(*) > 10 ORDER BY nb_commandes DESC;', explanation: 'HAVING filtre les groupes après GROUP BY, contrairement à WHERE qui filtre les lignes avant l\'agrégation.', difficulty: 2, duration_seconds: 240 },
  { id: 201, skill_id: 6, domain: 'python', prompt: 'Écrivez une fonction qui reçoit une liste d\'identifiants et retourne uniquement les identifiants uniques, tout en préservant leur ordre d\'apparition.', expected_answer: 'def unique_ordered(ids):\n    seen = set()\n    return [x for x in ids if not (x in seen or seen.add(x))]', explanation: 'Un ensemble (set) permet des recherches en O(1). La compréhension de liste filtre les doublons tout en préservant l\'ordre d\'apparition.', difficulty: 2, duration_seconds: 180 },
  { id: 202, skill_id: 7, domain: 'python', prompt: 'Écrivez une fonction qui vérifie si une chaîne est un palindrome, en ignorant la casse et les espaces.', expected_answer: 'def is_palindrome(s):\n    cleaned = \'\'.join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]', explanation: 'Normalisez la chaîne (minuscules, alphanumériques uniquement), puis comparez-la à son inverse avec le tranchage [::-1].', difficulty: 1, duration_seconds: 120 },
  { id: 203, skill_id: 8, domain: 'python', prompt: 'Écrivez une fonction qui reçoit une liste de mots et retourne le mot le plus fréquent, ou None si la liste est vide.', expected_answer: 'from collections import Counter\n\ndef most_frequent(words):\n    return Counter(words).most_common(1)[0][0] if words else None', explanation: 'Counter compte les occurrences en O(n). most_common(1) retourne l\'élément le plus fréquent. Le garde-fou if words évite l\'erreur sur liste vide.', difficulty: 2, duration_seconds: 180 },
  { id: 204, skill_id: 9, domain: 'python', prompt: 'Écrivez une fonction qui divise deux nombres et retourne None si le diviseur est zéro ou si les entrées ne sont pas numériques.', expected_answer: 'def safe_divide(a, b):\n    try:\n        return a / b\n    except (ZeroDivisionError, TypeError):\n        return None', explanation: 'Attrapez les exceptions spécifiques plutôt qu\'un except bare. Retournez une valeur sentinelle (None) pour les entrées invalides au lieu de faire planter le programme.', difficulty: 2, duration_seconds: 150 },
  { id: 205, skill_id: 10, domain: 'python', prompt: 'Écrivez un test pytest qui vérifie qu\'une fonction add(a, b) retourne la somme de ses deux arguments pour des entiers positifs et négatifs.', expected_answer: 'def test_add_positive_and_negative():\n    assert add(2, 3) == 5\n    assert add(-1, 1) == 0\n    assert add(0, 0) == 0', explanation: 'Testez plusieurs cas, y compris les cas limites (zéro, négatifs). Nommez les fonctions avec le préfixe test_ pour que pytest les découvre automatiquement.', difficulty: 1, duration_seconds: 120 },
  { id: 301, skill_id: 11, domain: 'english', prompt: "Complete this interview introduction: 'I currently work as a ______ at ______. My main responsibility is ______.'", expected_answer: "a software engineer ... a fintech startup ... building scalable payment processing systems", explanation: 'Use present simple for your current role and responsibilities. Be specific about your domain and the impact of your work.', difficulty: 1, duration_seconds: 90 },
  { id: 302, skill_id: 12, domain: 'english', prompt: "Choose the most professional way to say: 'J'ai créé une API qui gère les paiements.'", expected_answer: "I designed and implemented a payment processing API that handles transactions securely.", explanation: 'Use strong action verbs (designed, implemented, handles). Mention the purpose and a quality attribute (securely, scalably, reliably).', difficulty: 2, duration_seconds: 120 },
  { id: 303, skill_id: 13, domain: 'english', prompt: "Choose the most professional formulation for: 'On a utilisé PostgreSQL parce que c\'était mieux pour les jointures.'", expected_answer: "We chose PostgreSQL because it supports complex joins and ensures data integrity for relational workloads.", explanation: "Use 'We chose... because...' to explain a decision. Give a technical rationale (joins, data integrity) rather than a vague 'it was better'.", difficulty: 2, duration_seconds: 120 },
  { id: 304, skill_id: 14, domain: 'english', prompt: "Complete: 'This function uses a ______ to track seen elements, which gives us ______ lookup time.'", expected_answer: 'a hash set ... constant-time', explanation: 'Use precise complexity terminology (constant-time, O(1), linear-time) when discussing algorithms in English during an interview.', difficulty: 2, duration_seconds: 120 },
  { id: 305, skill_id: 15, domain: 'english', prompt: "Complete the Situation part of a STAR answer: 'In my last role, we faced ______ when ______.'", expected_answer: 'a critical performance issue ... our database queries were slowing down the checkout page', explanation: 'STAR = Situation, Task, Action, Result. Be specific about the context and the problem before explaining what you did.', difficulty: 2, duration_seconds: 120 }
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
