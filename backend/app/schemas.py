from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class SkillOut(BaseModel):
    id: int
    domain: str
    name: str
    level: int
    next_review_at: datetime


class ExerciseOut(BaseModel):
    id: int
    skill_id: int
    domain: str
    prompt: str
    context: str | None = None
    difficulty: int
    duration_seconds: int


class AttemptIn(BaseModel):
    answer: str = Field(min_length=1, max_length=10_000)
    duration_seconds: int = Field(ge=0, le=7200)


class AttemptOut(BaseModel):
    attempt_id: int
    score: float
    feedback: str
    explanation: str
    expected_answer: str
    next_review_at: datetime


class CoachIn(BaseModel):
    domain: Literal["sql", "python", "english"]
    question: str = Field(min_length=3, max_length=5_000)
    context: str = Field(default="", max_length=5_000)
    answer: str = Field(default="", max_length=10_000)
    expected_answer: str = Field(default="", max_length=10_000)
    mode: Literal["hint", "explain", "interview"] = "hint"


class CoachOut(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=100)
    message: str = Field(min_length=1, max_length=3_000)
    action: str = Field(min_length=1, max_length=100)


class GeneratedExerciseIn(BaseModel):
    domain: Literal["sql", "python", "english"]
    topic: str = Field(min_length=2, max_length=160)
    difficulty: int = Field(default=1, ge=1, le=5)


class GeneratedExerciseData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    prompt: str = Field(min_length=5, max_length=5_000)
    context: str = Field(max_length=5_000)
    expected_answer: str = Field(min_length=1, max_length=10_000)
    explanation: str = Field(min_length=3, max_length=5_000)
    duration_seconds: int = Field(default=180, ge=30, le=1_800)
