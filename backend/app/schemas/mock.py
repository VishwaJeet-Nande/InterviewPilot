from pydantic import BaseModel, Field


class MockQuestion(BaseModel):
    id: str
    question: str
    category: str
    difficulty: str


class MockInterviewPlan(BaseModel):
    questions: list[MockQuestion]


class MockEvaluation(BaseModel):
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