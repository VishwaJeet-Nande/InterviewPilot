from typing import Optional

from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from pydantic import BaseModel

from app.ai.gemini import client, MODEL_NAME
from app.core.supabase import supabase
from app.schemas.mock import (
    MockEvaluation,
    MockInterviewPlan,
)
from app.services.mock import (
    evaluate_mock_answer,
    generate_mock_interview,
)


router = APIRouter(
    prefix="/api/v1/interviews",
    tags=["Mock Interview"],
)


class MockAnswerSaveRequest(BaseModel):
    question: str
    category: str
    difficulty: str
    score: int
    evaluation: dict


@router.post(
    "/{interview_id}/mock/start",
    response_model=MockInterviewPlan,
)
async def start_mock_interview(
    interview_id: str,
):
    try:
        plan = await generate_mock_interview(
            interview_id
        )

        # Start a fresh mock session for this interview.
        supabase.table(
            "mock_interview_sessions"
        ).upsert(
            {
                "interview_id": interview_id,
                "scores": [],
                "evaluations": [],
                "final_score": None,
                "completed": False,
            },
            on_conflict="interview_id",
        ).execute()

        return plan

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Mock interview generation failed: "
                f"{str(exc)}"
            ),
        ) from exc


@router.post(
    "/{interview_id}/mock/evaluate",
    response_model=MockEvaluation,
)
async def evaluate_mock_interview_answer(
    interview_id: str,
    question: str = Form(...),
    answer: str = Form(""),
    audio: Optional[UploadFile] = File(None),
):
    try:
        if audio:
            audio_bytes = await audio.read()

            if not audio_bytes:
                raise ValueError(
                    "Voice recording is empty."
                )

            from google.genai import types
            import json

            prompt = f"""
You are evaluating a candidate's spoken answer during
a live technical interview.

QUESTION:
{question}

Evaluate the actual spoken content only.

Evaluate:

1. Technical accuracy
2. Completeness
3. Relevance to the question
4. Structure and clarity of the answer

Return:

- transcript
- technical_accuracy
- completeness
- relevance
- structure
- overall_score
- strengths
- improvements
- missing_concepts
- better_answer

Do not infer personality, intelligence, confidence,
mental state, or other traits.

Do not penalize the candidate merely because the answer
was spoken rather than typed.

Return ONLY valid JSON.
"""

            response = await client.aio.models.generate_content(
                model=MODEL_NAME,
                contents=[
                    prompt,
                    types.Part.from_bytes(
                        data=audio_bytes,
                        mime_type=(
                            audio.content_type
                            or "audio/webm"
                        ),
                    ),
                ],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": MockEvaluation,
                    "temperature": 0.2,
                },
            )

            if not response.text:
                raise RuntimeError(
                    "Gemini returned an empty evaluation."
                )

            data = json.loads(
                response.text
            )

            return MockEvaluation.model_validate(
                data
            )

        if not answer.strip():
            raise ValueError(
                "Please provide a text or voice answer."
            )

        return await evaluate_mock_answer(
            interview_id=interview_id,
            question=question,
            answer=answer,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Mock answer evaluation failed: "
                f"{str(exc)}"
            ),
        ) from exc


@router.post(
    "/{interview_id}/mock/save",
)
async def save_mock_answer(
    interview_id: str,
    payload: MockAnswerSaveRequest,
):
    try:
        if payload.score < 0 or payload.score > 100:
            raise ValueError(
                "Mock answer score must be between 0 and 100."
            )

        session_result = (
            supabase.table(
                "mock_interview_sessions"
            )
            .select(
                "id, scores, evaluations, completed"
            )
            .eq(
                "interview_id",
                interview_id,
            )
            .maybe_single()
            .execute()
        )

        session = session_result.data

        if not session:
            raise ValueError(
                "Mock interview session not found. "
                "Please restart the mock interview."
            )

        scores = session.get(
            "scores"
        ) or []

        evaluations = session.get(
            "evaluations"
        ) or []

        scores = list(scores)
        evaluations = list(evaluations)

        scores.append(
            payload.score
        )

        evaluations.append(
            {
                "question": payload.question,
                "category": payload.category,
                "difficulty": payload.difficulty,
                "score": payload.score,
                "evaluation": payload.evaluation,
            }
        )

        final_score = round(
            sum(scores) / len(scores)
        )

        completed = len(scores) >= 6

        (
            supabase.table(
                "mock_interview_sessions"
            )
            .update(
                {
                    "scores": scores,
                    "evaluations": evaluations,
                    "final_score": final_score,
                    "completed": completed,
                }
            )
            .eq(
                "interview_id",
                interview_id,
            )
            .execute()
        )

        return {
            "status": "saved",
            "interview_id": interview_id,
            "answer_number": len(scores),
            "final_score": final_score,
            "completed": completed,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Mock answer could not be saved: "
                f"{str(exc)}"
            ),
        ) from exc