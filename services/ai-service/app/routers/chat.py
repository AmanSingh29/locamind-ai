from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

from app.config import OLLAMA_BASE_URL, OLLAMA_MODEL

router = APIRouter(prefix="/api/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    model: str


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            result = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": [
                        {
                            "role": "user",
                            "content": request.message
                        }
                    ],
                    "stream": False
                }
            )

            result.raise_for_status()
            data = result.json()

            return ChatResponse(
                response=data["message"]["content"],
                model=OLLAMA_MODEL
            )

    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail=f"Ollama connection failed: {str(error)}"
        )