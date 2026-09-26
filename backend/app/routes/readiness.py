from fastapi import APIRouter, HTTPException

from app.schemas.readiness import ReadinessResponse
from app.services.readiness import calculate_readiness


router = APIRouter(
    prefix="/api/v1/interviews",
    tags=["Interview Readiness"],
)


@router.get(
    "/{interview_id}/readiness",
    response_model=ReadinessResponse,
)
async def get_readiness(
    interview_id: str,
) -> ReadinessResponse:
    try:
        return await calculate_readiness(
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
                "Readiness calculation failed: "
                f"{str(exc)}"
            ),
        ) from exc