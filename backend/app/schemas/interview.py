from pydantic import BaseModel, Field


class InterviewAnalysisRequest(BaseModel):
    interview_id: str
    job_title: str
    company_name: str
    job_description: str
    resume_text: str = ""


class SkillGap(BaseModel):
    skill: str
    importance: str
    reason: str


class InterviewTopic(BaseModel):
    topic: str
    category: str
    likelihood: int = Field(ge=0, le=100)


class InterviewDNA(BaseModel):
    overall_match: int = Field(ge=0, le=100)
    technical_match: int = Field(ge=0, le=100)
    backend_match: int = Field(ge=0, le=100)
    ai_ml_match: int = Field(ge=0, le=100)
    cloud_match: int = Field(ge=0, le=100)
    database_match: int = Field(ge=0, le=100)
    system_design_match: int = Field(ge=0, le=100)
    behavioral_match: int = Field(ge=0, le=100)

    likely_focus: list[InterviewTopic]
    high_risk_areas: list[str]
    medium_risk_areas: list[str]
    strong_areas: list[str]


class InterviewAnalysisResponse(BaseModel):
    interview_id: str
    status: str
    dna: InterviewDNA