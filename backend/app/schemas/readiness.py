from pydantic import BaseModel, Field


class ReadinessBreakdown(BaseModel):
    interview_dna: int = Field(
        ge=0,
        le=100,
    )

    mock_interview: int = Field(
        ge=0,
        le=100,
    )

    preparation: int = Field(
        ge=0,
        le=100,
    )


class ReadinessArea(BaseModel):
    name: str

    score: int = Field(
        ge=0,
        le=100,
    )

    explanation: str


class ReadinessResponse(BaseModel):
    interview_id: str

    job_title: str

    company_name: str

    readiness_score: int = Field(
        ge=0,
        le=100,
    )

    level: str

    summary: str

    breakdown: ReadinessBreakdown

    strengths: list[str]

    priority_gaps: list[str]

    recommended_actions: list[str]

    areas: list[ReadinessArea]

    mock_score: int = Field(
        ge=0,
        le=100,
    )

    dna_score: int = Field(
        ge=0,
        le=100,
    )

    mock_completed: bool