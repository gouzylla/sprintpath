from fastapi.testclient import TestClient

from app import main
from app.llm import NvidiaNIMError
from app.main import app

client = TestClient(app)


def test_coach_returns_structured_hint(monkeypatch):
    async def fake_chat_json(system: str, user: str):
        assert "hint" in user
        return {"title": "Piste utile", "message": "Regarde la condition de jointure.", "action": "review_join"}

    monkeypatch.setattr(main.nim, "chat_json", fake_chat_json)
    response = client.post("/api/ai/coach", json={
        "domain": "sql",
        "question": "Comment joindre deux tables ?",
        "answer": "SELECT * FROM a JOIN b",
        "expected_answer": "JOIN avec ON",
        "mode": "hint",
    })
    assert response.status_code == 200
    assert response.json()["title"] == "Piste utile"
    assert response.json()["action"] == "review_join"


def test_generated_exercise_is_validated_and_persisted(monkeypatch):
    async def fake_chat_json(system: str, user: str):
        return {
            "prompt": "Écrivez une CTE qui compte les commandes par client.",
            "context": "commandes (id, client_id, montant, date_commande, pays)\nclients (id, nom)",
            "expected_answer": "WITH orders AS (...) SELECT ...",
            "explanation": "WITH permet de nommer une relation intermédiaire.",
            "duration_seconds": 240,
        }

    monkeypatch.setattr(main.nim, "chat_json", fake_chat_json)
    response = client.post("/api/ai/exercises/generate", json={
        "domain": "sql",
        "topic": "CTE",
        "difficulty": 3,
    })
    assert response.status_code == 200
    exercise = response.json()
    assert exercise["domain"] == "sql"
    assert exercise["difficulty"] == 3
    assert exercise["id"] > 0


def test_invalid_nim_json_returns_502(monkeypatch):
    async def fake_chat_json(system: str, user: str):
        return {"unexpected": "missing required fields"}

    monkeypatch.setattr(main.nim, "chat_json", fake_chat_json)
    response = client.post("/api/ai/exercises/generate", json={
        "domain": "python",
        "topic": "functions",
        "difficulty": 2,
    })
    assert response.status_code == 502


def test_unexpected_nim_field_is_rejected(monkeypatch):
    async def fake_chat_json(system: str, user: str):
        return {
            "prompt": "Écrivez une fonction qui additionne deux nombres.",
            "context": "",
            "expected_answer": "def add(a, b): return a + b",
            "explanation": "La fonction retourne la somme des arguments.",
            "duration_seconds": 120,
            "unexpected": "must be rejected",
        }

    monkeypatch.setattr(main.nim, "chat_json", fake_chat_json)
    response = client.post("/api/ai/exercises/generate", json={
        "domain": "python",
        "topic": "functions",
        "difficulty": 2,
    })
    assert response.status_code == 502


def test_nim_failure_returns_service_error(monkeypatch):
    async def failing_chat_json(system: str, user: str):
        raise NvidiaNIMError("unavailable")

    monkeypatch.setattr(main.nim, "chat_json", failing_chat_json)
    response = client.post("/api/ai/coach", json={
        "domain": "english",
        "question": "Present your project",
        "answer": "",
        "mode": "interview",
    })
    assert response.status_code == 502
