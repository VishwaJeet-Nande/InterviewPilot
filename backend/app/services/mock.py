import json

from app.ai.gemini import client, generate_structured
from app.core.supabase import supabase
from app.schemas.mock import (
    MockInterviewPlan,
    MockEvaluation,
)


WHISPER_MODEL = "whisper-large-v3-turbo"


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

    interview_data = (
        getattr(
            interview_result,
            "data",
            None,
        )
        if interview_result is not None
        else None
    )

    interview = interview_data or {}

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

    dna_data = (
        getattr(
            dna_result,
            "data",
            None,
        )
        if dna_result is not None
        else None
    )

    dna = dna_data or {}

    if not dna:
        raise ValueError(
            "Interview DNA has not been generated yet."
        )

    system_prompt = """
You are the AI interviewer inside Curion.

Create a realistic technical interview for the
candidate based on their target role, job description,
and Interview DNA.

You must follow the requested response schema exactly.

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

Return exactly 6 questions.
"""

    user_prompt = f"""
TARGET ROLE:
{interview["job_title"]}

COMPANY:
{interview["company_name"]}

JOB DESCRIPTION:
{interview["job_description"]}

INTERVIEW DNA:
{json.dumps(dna, default=str)}

Generate the complete 6-question mock interview.
"""

    try:
        plan = await generate_structured(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=MockInterviewPlan,
        )
    except Exception as exc:
        raise RuntimeError(
            f"Mock interview generation failed: {exc}"
        ) from exc

    if not plan.questions:
        raise RuntimeError(
            "Groq returned an empty mock interview."
        )

    if len(plan.questions) != 6:
        raise RuntimeError(
            "Mock interview generation did not return exactly 6 questions."
        )

    return plan


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

    interview_data = (
        getattr(
            interview_result,
            "data",
            None,
        )
        if interview_result is not None
        else None
    )

    interview = interview_data or {}

    if not interview:
        raise ValueError("Interview not found.")

    system_prompt = """
You are evaluating a candidate's answer during a live
technical interview inside Curion.

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

Return the response using the requested schema.
"""

    user_prompt = f"""
TARGET ROLE:
{interview["job_title"]}

COMPANY:
{interview["company_name"]}

JOB DESCRIPTION:
{interview["job_description"]}

INTERVIEW QUESTION:
{question}

CANDIDATE ANSWER:
{answer}
"""

    try:
        evaluation = await generate_structured(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=MockEvaluation,
        )
    except Exception as exc:
        raise RuntimeError(
            f"Mock answer evaluation failed: {exc}"
        ) from exc

    return evaluation


async def evaluate_mock_voice_answer(
    interview_id: str,
    question: str,
    audio_bytes: bytes,
    content_type: str = "audio/webm",
) -> MockEvaluation:
    """
    Evaluate a spoken mock-interview answer.

    Pipeline:
        audio -> Groq Whisper -> transcript
        -> Groq structured evaluation -> MockEvaluation
    """

    if not audio_bytes:
        raise ValueError("Voice recording is empty.")

    interview_result = (
        supabase.table("interviews")
        .select(
            "job_title, company_name, job_description"
        )
        .eq("id", interview_id)
        .single()
        .execute()
    )

    interview_data = (
        getattr(
            interview_result,
            "data",
            None,
        )
        if interview_result is not None
        else None
    )

    interview = interview_data or {}

    if not interview:
        raise ValueError("Interview not found.")

    try:
        transcription = await client.audio.transcriptions.create(
            file=(
                "mock-answer.webm",
                audio_bytes,
            ),
            model=WHISPER_MODEL,
            response_format="json",
            temperature=0.0,
        )
    except Exception as exc:
        raise RuntimeError(
            f"Voice transcription failed: {exc}"
        ) from exc

    transcript = getattr(
        transcription,
        "text",
        None,
    )

    if not transcript or not transcript.strip():
        raise RuntimeError(
            "Groq Whisper returned an empty transcript."
        )

    system_prompt = """
You are evaluating a candidate's spoken answer during
a live technical interview inside Curion.

The answer has already been transcribed from audio.

Evaluate ONLY the actual spoken content.

Do not infer:
- personality
- intelligence
- confidence
- mental state
- accent
- voice quality
- age
- gender
- any other personal trait

Do not penalize the candidate merely because the answer
was spoken instead of typed.

Evaluate:
1. Technical accuracy
2. Completeness
3. Relevance
4. Structure and clarity
5. Overall quality

Look for:
- correct concepts
- practical engineering reasoning
- appropriate tradeoffs
- production awareness
- clarity
- directness
- missing important concepts

Return:
- transcript
- technical_accuracy
- completeness
- relevance
- structure
- overall_score
- strengths
- improvements
- missing_concepts
- better_answer

The better_answer should demonstrate what a strong
candidate answer could cover.

Return the response using the requested schema.
"""

    user_prompt = f"""
TARGET ROLE:
{interview["job_title"]}

COMPANY:
{interview["company_name"]}

JOB DESCRIPTION:
{interview["job_description"]}

INTERVIEW QUESTION:
{question}

TRANSCRIBED SPOKEN ANSWER:
{transcript}
"""

    try:
        evaluation = await generate_structured(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=MockEvaluation,
        )
    except Exception as exc:
        raise RuntimeError(
            f"Mock voice answer evaluation failed: {exc}"
        ) from exc

    return evaluation