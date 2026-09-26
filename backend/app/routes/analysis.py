from fastapi import APIRouter, HTTPException

from app.services.interview_pipeline import (
    generate_dna_for_interview,
)
from app.schemas.interview import (
    InterviewAnalysisResponse,
)


router = APIRouter(
    prefix="/api/v1/interviews",
    tags=["Interview Analysis"],
)


@router.post(
    "/{interview_id}/generate-dna",
    response_model=InterviewAnalysisResponse,
)
async def generate_interview_dna(
    interview_id: str,
) -> InterviewAnalysisResponse:

    try:
        dna = await generate_dna_for_interview(
            interview_id
        )

        return InterviewAnalysisResponse(
            interview_id=interview_id,
            status="ready",
            dna=dna,
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
                "Interview DNA generation failed: "
                f"{str(exc)}"
            ),
        ) from exc