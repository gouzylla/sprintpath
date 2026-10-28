import json
import os
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv()


class NvidiaNIMError(RuntimeError):
    """Raised when NVIDIA NIM cannot provide a usable response."""


class NvidiaNIM:
    """OpenAI-compatible NVIDIA NIM adapter with deterministic local fallback."""

    def __init__(self) -> None:
        self.base_url = os.getenv("NVIDIA_NIM_BASE_URL", "https://integrate.api.nvidia.com/v1").rstrip("/")
        self.api_key = os.getenv("NVIDIA_API_KEY")
        self.model = os.getenv("NVIDIA_NIM_MODEL", "nvidia/nemotron-3.5-super-vl-120b-a12b")
        self.timeout_seconds = float(os.getenv("NVIDIA_NIM_TIMEOUT_SECONDS", "120"))

    @property
    def enabled(self) -> bool:
        return bool(self.api_key)

    async def _chat(self, messages: list[dict[str, str]], *, json_mode: bool = False, max_tokens: int = 700) -> str:
        if not self.enabled:
            raise NvidiaNIMError("NVIDIA_API_KEY non configurée")
        payload: dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": max_tokens,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json=payload,
                )
                response.raise_for_status()
                message = response.json()["choices"][0]["message"]
                content = (message.get("content") or "").strip()
                if not content:
                    raise NvidiaNIMError("Réponse NVIDIA NIM vide")
                return content
        except (httpx.HTTPError, KeyError, IndexError, TypeError) as exc:
            raise NvidiaNIMError(f"Erreur NVIDIA NIM: {type(exc).__name__}") from exc

    async def chat_json(self, system: str, user: str) -> dict[str, Any]:
        content = await self._chat(
            [{"role": "system", "content": system}, {"role": "user", "content": user}],
            json_mode=True,
            max_tokens=900,
        )
        try:
            data = json.loads(content)
        except json.JSONDecodeError as exc:
            raise NvidiaNIMError("Réponse NVIDIA NIM non JSON") from exc
        if not isinstance(data, dict):
            raise NvidiaNIMError("Réponse NVIDIA NIM inattendue")
        return data

    async def enrich_feedback(self, prompt: str, answer: str, expected: str, local_feedback: str) -> str:
        if not self.enabled:
            return local_feedback
        try:
            content = await self._chat(
                [
                    {"role": "system", "content": "Give concise, encouraging technical feedback in French. Do not reveal credentials. Max 80 words. Do not output JSON."},
                    {"role": "user", "content": f"Question: {prompt}\nAnswer: {answer}\nExpected: {expected}\nLocal feedback: {local_feedback}"},
                ],
                max_tokens=700,
            )
            return content.strip() or local_feedback
        except NvidiaNIMError:
            return local_feedback
