from typing import Optional

from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from pydantic import BaseModel

from app.core.supabase import supabase
from app.schemas.mock import (
    MockEvaluation,
    MockInterviewPlan,
)
from app.services.mock import (
    evaluate_mock_answer,
    evaluate_mock_voice_answer,
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


def get_interview_status(completed: bool) -> str:
    """Return the parent interview status for the mock session."""
    return "completed" if completed else "in_progress"


@router.post(
    "/{interview_id}/mock/start",
    response_model=MockInterviewPlan,
)
async def start_mock_interview(
    interview_id: str,
):
    try:
        # Confirm the interview exists.
        interview_result = (
            supabase.table("interviews")
            .select("id")
            .eq("id", interview_id)
            .maybe_single()
            .execute()
        )

        if not interview_result.data:
            raise ValueError("Interview not found.")

        # Generate the plan.
        plan = await generate_mock_interview(
            interview_id
        )

        # Preserve an existing session and its saved answers.
        session_result = (
            supabase.table("mock_interview_sessions")
            .select("id, completed")
            .eq("interview_id", interview_id)
            .maybe_single()
            .execute()
        )

        session = session_result.data

        if not session:
            # Create a session only if one doesn't exist.
            supabase.table(
                "mock_interview_sessions"
            ).insert(
                {
                    "interview_id": interview_id,
                    "scores": [],
                    "evaluations": [],
                    "final_score": None,
                    "completed": False,
                }
            ).execute()

        elif session.get("completed") is True:
            # Keep a completed mock reflected on its interview.
            supabase.table("interviews").update(
                {"status": "completed"}
            ).eq(
                "id", interview_id
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

            return await evaluate_mock_voice_answer(
                interview_id=interview_id,
                question=question,
                audio_bytes=audio_bytes,
                content_type=(
                    audio.content_type or "audio/webm"
                ),
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
        if not 0 <= payload.score <= 100:
            raise ValueError(
                "Mock answer score must be between 0 and 100."
            )

        # Confirm the interview exists.
        interview_result = (
            supabase.table("interviews")
            .select("id")
            .eq("id", interview_id)
            .maybe_single()
            .execute()
        )

        if not interview_result.data:
            raise ValueError("Interview not found.")

        # Load the existing mock session.
        session_result = (
            supabase.table("mock_interview_sessions")
            .select(
                "id, scores, evaluations, completed"
            )
            .eq("interview_id", interview_id)
            .maybe_single()
            .execute()
        )

        session = session_result.data

        if not session:
            raise ValueError(
                "Mock interview session not found. "
                "Please start the mock interview first."
            )

        # Do not append duplicate answers after completion.
        scores = list(session.get("scores") or [])
        evaluations = list(
            session.get("evaluations") or []
        )

        if session.get("completed") is True:
            return {
                "status": "already_completed",
                "interview_id": interview_id,
                "answer_number": len(scores),
                "final_score": (
                    round(sum(scores) / len(scores))
                    if scores
                    else None
                ),
                "completed": True,
            }

        # Enforce the six-question limit.
        if len(scores) >= 6:
            raise ValueError(
                "All six mock interview answers have already been saved."
            )

        scores.append(payload.score)

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

        # Save mock-session progress first.
        update_result = (
            supabase.table("mock_interview_sessions")
            .update(
                {
                    "scores": scores,
                    "evaluations": evaluations,
                    "final_score": final_score,
                    "completed": completed,
                }
            )
            .eq("interview_id", interview_id)
            .execute()
        )

        if not update_result.data:
            raise RuntimeError(
                "Mock session progress could not be confirmed."
            )

        # Synchronize the parent interview status.
        supabase.table("interviews").update(
            {
                "status": get_interview_status(completed)
            }
        ).eq(
            "id", interview_id
        ).execute()

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