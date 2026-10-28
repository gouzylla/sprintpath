from datetime import datetime, timezone

from app.services import schedule_review, score_answer


def test_perfect_sql_answer_gets_full_score():
    score, feedback = score_answer(
        "SELECT * FROM commandes WHERE montant > 100 ORDER BY date_commande DESC;",
        "SELECT * FROM commandes WHERE montant > 100 ORDER BY date_commande DESC;",
        "sql",
    )
    assert score == 100
    assert "correcte" in feedback


def test_empty_answer_is_rejected_with_guidance():
    score, feedback = score_answer("", "SELECT 1", "sql")
    assert score == 0
    assert "vide" in feedback


def test_failed_answer_is_scheduled_for_next_day():
    level, due_at = schedule_review(25, current_level=2)
    assert level == 1
    delta = due_at - datetime.now(timezone.utc)
    assert 23 <= delta.total_seconds() / 3600 <= 25


def test_perfect_answer_increases_level_and_delays_review():
    level, due_at = schedule_review(100, current_level=2)
    assert level == 3
    assert (due_at - datetime.now(timezone.utc)).days >= 14
