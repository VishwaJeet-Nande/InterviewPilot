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
    role_fit_score: int = Field(ge=0, le=100)
    skill_match_score: int = Field(ge=0, le=100)
    experience_match_score: int = Field(ge=0, le=100)
    technical_readiness_score: int = Field(ge=0, le=100)

    strengths: list[str]
    skill_gaps: list[SkillGap]
    technical_focus: list[str]
    likely_topics: list[InterviewTopic]
    behavioral_focus: list[str]
    risk_areas: list[str]


class InterviewAnalysisResponse(BaseModel):
    interview_id: str
    status: str
    dna: InterviewDNA