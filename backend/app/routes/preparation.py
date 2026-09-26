from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas.preparation import (
    AnswerEvaluation,
    PreparationPlan,
)
from app.services.preparation import (
    evaluate_text_answer,
    evaluate_voice_answer,
    generate_preparation_plan,
)


router = APIRouter(
    prefix="/api/v1/interviews",
    tags=["Interview Preparation"],
)


@router.post(
    "/{interview_id}/prepare",
    response_model=PreparationPlan,
)
async def create_preparation_plan(
    interview_id: str,
) -> PreparationPlan:

    try:
        return await generate_preparation_plan(
            interview_id
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
                "Preparation generation failed: "
                f"{str(exc)}"
            ),
        ) from exc


@router.post(
    "/{interview_id}/evaluate-answer",
    response_model=AnswerEvaluation,
)
async def evaluate_answer(
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

            return await evaluate_voice_answer(
                interview_id=interview_id,
                question=question,
                audio_bytes=audio_bytes,
                mime_type=(
                    audio.content_type
                    or "audio/webm"
                ),
            )

        if not answer.strip():
            raise ValueError(
                "Please provide a text or voice answer."
            )

        return await evaluate_text_answer(
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
                "Answer evaluation failed: "
                f"{str(exc)}"
            ),
        ) from exc