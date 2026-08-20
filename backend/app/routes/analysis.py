from fastapi import APIRouter

from app.schemas.interview import (
    InterviewAnalysisRequest,
    InterviewAnalysisResponse,
)
from app.services.interview_dna import generate_interview_dna


router = APIRouter(
    prefix="/api/v1/interviews",
    tags=["Interview Analysis"],
)


@router.post(
    "/analyze",
    response_model=InterviewAnalysisResponse,
)
async def analyze_interview(
    request: InterviewAnalysisRequest,
) -> InterviewAnalysisResponse:

    dna = generate_interview_dna(request)

    return InterviewAnalysisResponse(
        interview_id=request.interview_id,
        status="ready",
        dna=dna,
    )