from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_and_seed_content():
    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["status"] == "ok"

    exercises = client.get("/api/exercises?domain=sql").json()
    assert len(exercises) >= 3
    assert all(exercise["domain"] == "sql" for exercise in exercises)


def test_attempt_updates_dashboard():
    exercise = client.get("/api/exercises?domain=python").json()[0]
    response = client.post(
        f"/api/attempts?exercise_id={exercise['id']}",
        json={"answer": "Python set comprehension", "duration_seconds": 42},
    )
    assert response.status_code == 200
    assert 0 <= response.json()["score"] <= 100
    dashboard = client.get("/api/dashboard").json()
    assert dashboard["total_attempts"] >= 1
    assert any(item["domain"] == "python" for item in dashboard["domains"])
