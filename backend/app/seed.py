from sqlalchemy import inspect, text

from .database import Base, SessionLocal, engine
from .models import Exercise, Skill

SQL_CONTEXT = "commandes (id, client_id, montant, date_commande, pays)\nclients (id, nom)"

SKILLS = [
    ("sql", "Filtrer et trier"),
    ("sql", "Agréger des données"),
    ("sql", "Relier des tables"),
    ("sql", "Regrouper avec GROUP BY"),
    ("sql", "Sous-requêtes et CTE"),
    ("python", "Structures de données"),
    ("python", "Fonctions"),
    ("python", "Listes en compréhension"),
    ("python", "Gestion des erreurs"),
    ("python", "Tests avec pytest"),
    ("english", "Se présenter"),
    ("english", "Présenter un projet"),
    ("english", "Expliquer une décision"),
]

EXERCISES = [
    ("sql", "Filtrer et trier", "Affichez les commandes de plus de 100 € triées de la plus récente à la plus ancienne.", "SELECT * FROM commandes WHERE montant > 100 ORDER BY date_commande DESC;", "Le filtre numérique doit précéder le tri. ORDER BY DESC inverse l'ordre chronologique.", 1),
    ("sql", "Agréger des données", "Quel total de commandes calcule cette requête ? SELECT COUNT(*) FROM commandes;", "Le nombre total de lignes dans la table commandes.", "COUNT(*) compte les lignes, y compris celles dont d'autres colonnes sont NULL.", 1),
    ("sql", "Relier des tables", "Comment conserver tous les clients, y compris ceux sans commande ?", "SELECT clients.*, commandes.id FROM clients LEFT JOIN commandes ON commandes.client_id = clients.id;", "LEFT JOIN conserve la table de gauche. INNER JOIN exclurait les clients sans commande.", 1),
    ("sql", "Regrouper avec GROUP BY", "Écrivez une requête affichant le nombre de commandes par pays.", "SELECT pays, COUNT(*) AS total FROM commandes GROUP BY pays;", "COUNT est appliqué à chaque groupe défini par pays.", 2),
    ("sql", "Sous-requêtes et CTE", "Utilisez un CTE pour compter les commandes par client, puis ne garder que ceux dépassant 3.", "WITH c AS (SELECT client_id, COUNT(*) n FROM commandes GROUP BY client_id) SELECT * FROM c WHERE n > 3;", "WITH crée une relation nommée réutilisable dans la requête principale.", 2),
    ("python", "Structures de données", "Quel résultat produit {1, 2, 2, 3} ?", "{1, 2, 3}", "Un ensemble supprime les doublons et n'autorise pas les doublons.", 1),
    ("python", "Fonctions", "Que retourne cette fonction ? def double(x): return x * 2", "Le double de x", "return termine la fonction et renvoie la valeur calculée.", 1),
    ("python", "Listes en compréhension", "Transformez la liste ['a', 'b'] en ['A', 'B'].", "[s.upper() for s in ['a', 'b']]", "Une compréhension construit une nouvelle liste en appliquant une expression à chaque élément.", 1),
    ("python", "Gestion des erreurs", "Quel bloc utilise-t-on pour intercepter une erreur d'ouverture de fichier ?", "try:\n    open('data.txt')\nexcept FileNotFoundError:\n    pass", "except FileNotFoundError cible précisément l'erreur attendue.", 2),
    ("python", "Tests avec pytest", "Quel nom donne pytest à une fonction de test ?", "Une fonction dont le nom commence par test_", "pytest découvre automatiquement les fonctions préfixées par test_.", 1),
    ("english", "Se présenter", "Complétez : 'I currently work as a ... and my main responsibility is ...'.", "a data developer ... building SQL pipelines", "Pour se présenter, on utilise l'article a ou an puis on relie les informations par and.", 1),
    ("english", "Présenter un projet", "Comment dire 'J'ai optimisé la requête' en anglais professionnel ?", "I optimized the query.", "Au passé simple, un verbe terminé par -ed devient -ied pour les verbes en -y consonantique.", 2),
    ("english", "Expliquer une décision", "Choisissez la formulation la plus professionnelle.", "We chose this approach because it is easier to maintain.", "We chose this approach because... explique clairement la conséquence d'une décision.", 2),
]


def seed_database() -> None:
    Base.metadata.create_all(bind=engine)
    columns = {column["name"] for column in inspect(engine).get_columns("exercises")}
    if "context" not in columns:
        with engine.begin() as connection:
            connection.execute(text("alter table exercises add column context text"))
    with SessionLocal() as db:
        if db.query(Skill).count():
            db.query(Exercise).filter(Exercise.domain == "sql").update({Exercise.context: SQL_CONTEXT}, synchronize_session=False)
            db.commit()
            return
        skills: dict[tuple[str, str], Skill] = {}
        for domain, name in SKILLS:
            skill = Skill(domain=domain, name=name)
            db.add(skill)
            skills[(domain, name)] = skill
        db.flush()
        for domain, skill_name, prompt, expected, explanation, difficulty in EXERCISES:
            db.add(Exercise(skill_id=skills[(domain, skill_name)].id, domain=domain, prompt=prompt, context=SQL_CONTEXT if domain == "sql" else None, expected_answer=expected, explanation=explanation, difficulty=difficulty))
        db.commit()
