import re
from datetime import datetime, timedelta, timezone


def normalize(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def score_answer(answer: str, expected: str, domain: str) -> tuple[float, str]:
    clean = normalize(answer)
    target = normalize(expected)
    if not clean:
        return 0, "Ta réponse est vide. Relis la consigne et donne une réponse précise."

    if domain == "sql":
        keywords = [word for word in re.findall(r"[a-z_]+", target) if len(word) > 2]
        matched = sum(word in clean for word in keywords)
        ratio = matched / max(len(keywords), 1)
        if ratio >= 0.8:
            return 100, "La structure principale de ta requête est correcte."
        if ratio >= 0.45:
            return 65, "Ta requête est sur la bonne piste, mais il lui manque une notion clé ou une étape de la logique."
        return 25, "La requête ne reprend pas encore les concepts attendus. Reprends la consigne et construis la réponse étape par étape."

    if domain == "python":
        keywords = [word for word in re.findall(r"[a-z_]+", target) if len(word) > 2]
        matched = sum(word in clean for word in keywords)
        ratio = matched / max(len(keywords), 1)
        if ratio >= 0.75:
            return 100, "Ta réponse contient les éléments Python attendus."
        if ratio >= 0.4:
            return 65, "Tu identifies l'idée, mais il manque une partie importante de la réponse."
        return 25, "Ta réponse ne montre pas encore le concept attendu. Reprends la question et donne un exemple précis."

    key_terms = [word for word in re.findall(r"[a-z]+", target) if len(word) > 3]
    matched = sum(word in clean for word in key_terms)
    ratio = matched / max(len(key_terms), 1)
    if ratio >= 0.75:
        return 95, "Ta formulation est claire et professionnelle."
    if ratio >= 0.45:
        return 70, "Ton message est compréhensible, mais certains mots-clés professional sont absents."
    return 40, "Le sens est compréhensible, mais reformule-la avec le vocabulaire professionnel attendu."


def schedule_review(score: float, current_level: int = 1) -> tuple[int, datetime]:
    if score < 50:
        level = max(1, current_level - 1)
        days = 1
    elif score < 80:
        level = current_level
        days = 3
    elif score < 100:
        level = current_level
        days = 7
    else:
        level = min(10, current_level + 1)
        days = 15
    return level, datetime.now(timezone.utc) + timedelta(days=days)
