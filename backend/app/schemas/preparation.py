from pydantic import BaseModel, Field


class YouTubeResource(BaseModel):
    title: str
    channel: str
    url: str
    thumbnail: str = ""


class PreparationModule(BaseModel):
    id: str
    title: str
    priority: str
    current_score: int = Field(ge=0, le=100)
    why_this_matters: str
    current_gap: str
    learning_objectives: list[str]
    practice_questions: list[str]
    youtube_query: str
    resources: list[YouTubeResource] = []


class PreparationPlan(BaseModel):
    summary: str
    estimated_hours: int = Field(ge=1, le=40)
    modules: list[PreparationModule]


class AnswerEvaluation(BaseModel):
    transcript: str
    technical_accuracy: int = Field(ge=0, le=100)
    completeness: int = Field(ge=0, le=100)
    relevance: int = Field(ge=0, le=100)
    structure: int = Field(ge=0, le=100)
    overall_score: int = Field(ge=0, le=100)
    strengths: list[str]
    improvements: list[str]
    missing_concepts: list[str]
    better_answer: str