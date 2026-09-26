import json

from app.ai.gemini import client, MODEL_NAME
from app.core.supabase import supabase
from app.schemas.mock import (
    MockInterviewPlan,
    MockEvaluation,
)


async def generate_mock_interview(
    interview_id: str,
) -> MockInterviewPlan:
    interview_result = (
        supabase.table("interviews")
        .select(
            "id, job_title, company_name, job_description, resume_id"
        )
        .eq("id", interview_id)
        .single()
        .execute()
    )

    interview = interview_result.data

    if not interview:
        raise ValueError("Interview not found.")

    dna_result = (
        supabase.table("interview_dna")
        .select(
            "overall_match, technical_match, "
            "backend_match, ai_ml_match, cloud_match, "
            "database_match, system_design_match, "
            "behavioral_match, likely_focus, "
            "high_risk_areas, medium_risk_areas, "
            "strong_areas"
        )
        .eq("interview_id", interview_id)
        .single()
        .execute()
    )

    dna = dna_result.data

    if not dna:
        raise ValueError(
            "Interview DNA has not been generated yet."
        )

    prompt = f"""
You are the AI interviewer inside InterviewPilot.

Create a realistic 6-question technical interview
for this candidate.

TARGET ROLE:
{interview["job_title"]}

COMPANY:
{interview["company_name"]}

JOB DESCRIPTION:
{interview["job_description"]}

INTERVIEW DNA:
{json.dumps(dna, default=str)}

Create exactly 6 questions.

Question distribution:
1. One fundamentals question.
2. One role-specific technical question.
3. One system/design question.
4. One AI/ML or LLM engineering question when relevant.
5. One production/cloud/security question when relevant.
6. One behavioral/project-depth question connected to the candidate's likely experience.

Rules:
- Questions must be realistic interview questions.
- Questions must be based on the target role.
- Prioritize high-risk areas from Interview DNA.
- Do not ask generic trivia.
- Gradually increase difficulty.
- Do not reveal the expected answer.
- Each question needs:
  id
  question
  category
  difficulty

Return ONLY valid JSON matching the requested schema.
"""

    response = await client.aio.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": MockInterviewPlan,
            "temperature": 0.4,
        },
    )

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty mock interview."
        )

    try:
        data = json.loads(response.text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "Gemini returned invalid mock interview JSON."
        ) from exc

    return MockInterviewPlan.model_validate(data)


async def evaluate_mock_answer(
    interview_id: str,
    question: str,
    answer: str,
) -> MockEvaluation:
    interview_result = (
        supabase.table("interviews")
        .select(
            "job_title, company_name, job_description"
        )
        .eq("id", interview_id)
        .single()
        .execute()
    )

    interview = interview_result.data

    if not interview:
        raise ValueError("Interview not found.")

    prompt = f"""
You are evaluating a candidate's answer during a live
technical interview.

TARGET ROLE:
{interview["job_title"]}

COMPANY:
{interview["company_name"]}

INTERVIEW QUESTION:
{question}

CANDIDATE ANSWER:
{answer}

Evaluate ONLY what is observable in the answer.

Evaluate:
- technical accuracy
- completeness
- relevance
- structure
- overall quality

Do not infer personality, intelligence, confidence,
mental state, or other traits.

Look for:
- correct concepts
- practical engineering reasoning
- appropriate tradeoffs
- production awareness
- clarity
- directness
- missing important concepts

Return:
- transcript: the supplied answer
- four 0-100 category scores
- overall_score
- strengths
- improvements
- missing_concepts
- better_answer

The better_answer should demonstrate what a strong
candidate answer could cover.

Return ONLY valid JSON matching the requested schema.
"""

    response = await client.aio.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": MockEvaluation,
            "temperature": 0.2,
        },
    )

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty evaluation."
        )

    try:
        data = json.loads(response.text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "Gemini returned invalid evaluation JSON."
        ) from exc

    return MockEvaluation.model_validate(data)