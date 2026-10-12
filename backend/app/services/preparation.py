import json
import os
from urllib.parse import quote_plus

import httpx
from dotenv import load_dotenv

from app.ai.gemini import client, generate_structured
from app.core.supabase import supabase
from app.schemas.preparation import (
    AnswerEvaluation,
    PreparationPlan,
    YouTubeResource,
)
from app.services.interview_pipeline import generate_dna_for_interview
from app.services.resume_parser import extract_pdf_text


load_dotenv()


RESUME_BUCKET = "resumes"
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

WHISPER_MODEL = "whisper-large-v3-turbo"


async def _get_interview_context(
    interview_id: str,
):
    # ---------------------------------------------------------
    # 1. Fetch interview
    # ---------------------------------------------------------
    interview_result = (
        supabase
        .table("interviews")
        .select(
            "id, job_title, company_name, "
            "job_description, resume_id"
        )
        .eq("id", interview_id)
        .execute()
    )

    interviews = interview_result.data or []

    if not interviews:
        raise ValueError("Interview not found.")

    interview = interviews[0]

    # ---------------------------------------------------------
    # 2. Fetch Interview DNA
    #
    # A new interview may not have DNA yet.
    # Generate it automatically if necessary.
    # ---------------------------------------------------------
    dna_result = (
        supabase
        .table("interview_dna")
        .select(
            "overall_match, technical_match, backend_match, "
            "ai_ml_match, cloud_match, database_match, "
            "system_design_match, behavioral_match, "
            "likely_focus, high_risk_areas, "
            "medium_risk_areas, strong_areas"
        )
        .eq(
            "interview_id",
            interview_id,
        )
        .execute()
    )

    dna_rows = dna_result.data or []

    if dna_rows:
        dna = dna_rows[0]

    else:
        await generate_dna_for_interview(
            interview_id
        )

        dna_result = (
            supabase
            .table("interview_dna")
            .select(
                "overall_match, technical_match, backend_match, "
                "ai_ml_match, cloud_match, database_match, "
                "system_design_match, behavioral_match, "
                "likely_focus, high_risk_areas, "
                "medium_risk_areas, strong_areas"
            )
            .eq(
                "interview_id",
                interview_id,
            )
            .execute()
        )

        dna_rows = dna_result.data or []

        if not dna_rows:
            raise RuntimeError(
                "Interview DNA was generated but could not be loaded."
            )

        dna = dna_rows[0]

    # ---------------------------------------------------------
    # 3. Fetch resume record
    # ---------------------------------------------------------
    resume_id = interview.get("resume_id")

    if not resume_id:
        raise ValueError(
            "No resume is attached to this interview."
        )

    resume_result = (
        supabase
        .table("resumes")
        .select(
            "id, file_path, file_name, file_type"
        )
        .eq(
            "id",
            resume_id,
        )
        .execute()
    )

    resumes = resume_result.data or []

    if not resumes:
        raise ValueError(
            "Resume record not found."
        )

    resume = resumes[0]

    file_path = resume.get("file_path")

    if not file_path:
        raise ValueError(
            "Resume file path is missing."
        )

    # ---------------------------------------------------------
    # 4. Download resume from private Supabase Storage
    # ---------------------------------------------------------
    try:
        file_bytes = (
            supabase
            .storage
            .from_(RESUME_BUCKET)
            .download(file_path)
        )
    except Exception as exc:
        raise RuntimeError(
            "Unable to download the resume from storage."
        ) from exc

    # ---------------------------------------------------------
    # 5. Extract resume text
    # ---------------------------------------------------------
    try:
        resume_text = extract_pdf_text(
            file_bytes
        )
    except Exception as exc:
        raise ValueError(
            "Unable to extract text from the uploaded resume. "
            "Please make sure the uploaded resume is a readable PDF."
        ) from exc

    if not resume_text.strip():
        raise ValueError(
            "No readable text was found in the resume."
        )

    return (
        interview,
        dna,
        resume_text,
    )


async def _search_youtube(
    query: str,
) -> list[YouTubeResource]:

    fallback_url = (
        "https://www.youtube.com/results?search_query="
        + quote_plus(query)
    )

    if not YOUTUBE_API_KEY:
        return [
            YouTubeResource(
                title=f"Search YouTube: {query}",
                channel="YouTube",
                url=fallback_url,
                thumbnail="",
            )
        ]

    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 3,
        "regionCode": "IN",
        "relevanceLanguage": "en",
        "videoEmbeddable": "true",
        "key": YOUTUBE_API_KEY,
    }

    try:
        async with httpx.AsyncClient(
            timeout=15.0
        ) as http_client:

            response = await http_client.get(
                "https://www.googleapis.com/youtube/v3/search",
                params=params,
            )

            response.raise_for_status()

            data = response.json()

    except Exception:
        return [
            YouTubeResource(
                title=f"Search YouTube: {query}",
                channel="YouTube",
                url=fallback_url,
                thumbnail="",
            )
        ]

    resources = []

    for item in data.get(
        "items",
        [],
    ):
        video_id = (
            item
            .get("id", {})
            .get("videoId")
        )

        snippet = item.get(
            "snippet",
            {}
        )

        if not video_id:
            continue

        resources.append(
            YouTubeResource(
                title=snippet.get(
                    "title",
                    "YouTube video",
                ),
                channel=snippet.get(
                    "channelTitle",
                    "YouTube",
                ),
                url=(
                    "https://www.youtube.com/watch?v="
                    f"{video_id}"
                ),
                thumbnail=(
                    snippet
                    .get(
                        "thumbnails",
                        {},
                    )
                    .get(
                        "medium",
                        {},
                    )
                    .get(
                        "url",
                        "",
                    )
                ),
            )
        )

    if not resources:
        resources.append(
            YouTubeResource(
                title=f"Search YouTube: {query}",
                channel="YouTube",
                url=fallback_url,
                thumbnail="",
            )
        )

    return resources


async def generate_preparation_plan(
    interview_id: str,
) -> PreparationPlan:

    interview, dna, resume_text = (
        await _get_interview_context(
            interview_id
        )
    )

    system_prompt = """
You are Curion's Personalized Preparation Engine.

Create a focused interview preparation roadmap for this
specific candidate and role.

The candidate should NOT receive a generic course.

The roadmap must be based on:
1. The actual job description.
2. The actual resume.
3. The Interview DNA.
4. The identified risks.
5. The likely interview focus.

Prioritize weaknesses that are most likely to matter during
the interview.

Do not invent candidate experience.

For each preparation module:
- Give it a unique short id.
- Give it a clear topic title.
- Set priority to HIGH, MEDIUM, or LOW.
- Use the relevant Interview DNA score as current_score.
- Explain why the topic matters for this exact interview.
- Explain the candidate's current gap.
- Give 3-6 learning objectives.
- Give 3-5 interview practice questions.
- Create a concise YouTube search query that would find
  high-quality educational videos about this exact topic.

Create 4-6 modules.

Do not generate YouTube URLs yourself.
Only generate the search query.

Return only the structured response.
"""

    user_prompt = f"""
INTERVIEW:

Role:
{interview["job_title"]}

Company:
{interview["company_name"]}

JOB DESCRIPTION:
{interview["job_description"]}

RESUME:
{resume_text}

INTERVIEW DNA:
{json.dumps(dna, indent=2)}
"""

    plan = await generate_structured(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_model=PreparationPlan,
    )

    for module in plan.modules:
       if not module.youtube_query.strip():
           module.youtube_query = (
               f"{module.title} interview preparation tutorial"
           )

       module.resources = await _search_youtube(
           module.youtube_query
       )

    return plan


async def evaluate_text_answer(
    *,
    interview_id: str,
    question: str,
    answer: str,
) -> AnswerEvaluation:

    interview, dna, resume_text = (
        await _get_interview_context(
            interview_id
        )
    )

    system_prompt = """
You are Curion's Interview Answer Evaluator.

Evaluate the candidate's answer to a specific interview
question.

Evaluate it against:
- the target role
- the company
- the job description
- the candidate's actual resume
- the Interview DNA

Do not reward confidence without evidence.

Evaluate:
1. Technical accuracy.
2. Completeness.
3. Relevance to the question and role.
4. Structure and clarity.
5. Overall interview quality.

Identify missing concepts.

Provide a better answer direction, but do not fabricate
candidate experience.

Return only the structured response.
"""

    user_prompt = f"""
ROLE:
{interview["job_title"]}

COMPANY:
{interview["company_name"]}

JOB DESCRIPTION:
{interview["job_description"]}

RESUME:
{resume_text}

INTERVIEW DNA:
{json.dumps(dna, indent=2)}

QUESTION:
{question}

CANDIDATE ANSWER:
{answer}
"""

    return await generate_structured(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_model=AnswerEvaluation,
    )


async def evaluate_voice_answer(
    *,
    interview_id: str,
    question: str,
    audio_bytes: bytes,
    mime_type: str,
) -> AnswerEvaluation:

    if not audio_bytes:
        raise ValueError(
            "Voice answer audio is empty."
        )

    interview, dna, resume_text = (
        await _get_interview_context(
            interview_id
        )
    )

    # ---------------------------------------------------------
    # 1. Transcribe voice with Groq Whisper
    # ---------------------------------------------------------
    try:
        transcription = await client.audio.transcriptions.create(
            file=(
                "answer.webm",
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
            "Voice transcription returned no text."
        )

    # ---------------------------------------------------------
    # 2. Evaluate the transcript with GPT-OSS 120B
    # ---------------------------------------------------------
    system_prompt = """
You are Curion's Interview Answer Evaluator.

The candidate answered the interview question using voice.

The spoken answer has already been transcribed.

Evaluate the CONTENT of the transcript against:
- the target role
- the company
- the job description
- the candidate's actual resume
- the Interview DNA

Evaluate:
1. Technical accuracy.
2. Completeness.
3. Relevance.
4. Structure and clarity.
5. Overall interview quality.

Do not infer personality, intelligence, competence, or mental
state from the voice.

Focus only on the answer content and observable structure.

Identify missing concepts.

Provide a better answer direction without inventing
candidate experience.

Return only the structured response.
"""

    user_prompt = f"""
ROLE:
{interview["job_title"]}

COMPANY:
{interview["company_name"]}

JOB DESCRIPTION:
{interview["job_description"]}

RESUME:
{resume_text}

INTERVIEW DNA:
{json.dumps(dna, indent=2)}

QUESTION:
{question}

TRANSCRIBED CANDIDATE ANSWER:
{transcript}
"""

    evaluation = await generate_structured(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_model=AnswerEvaluation,
    )

    return evaluation


async def save_practice_attempt(
    *,
    interview_id: str,
    module_id: str,
    question: str,
    answer_mode: str,
    score: int,
    evaluation,
) -> dict:

    if answer_mode not in {
        "text",
        "voice",
    }:
        raise ValueError(
            "Answer mode must be 'text' or 'voice'."
        )

    if not question.strip():
        raise ValueError(
            "Practice question is required."
        )

    if score < 0 or score > 100:
        raise ValueError(
            "Practice score must be between 0 and 100."
        )

    if isinstance(
        evaluation,
        AnswerEvaluation,
    ):
        evaluation_data = evaluation.model_dump(
            mode="json"
        )

    elif isinstance(
        evaluation,
        dict,
    ):
        evaluation_data = evaluation

    else:
        raise ValueError(
            "Practice evaluation has an invalid format."
        )

    result = (
        supabase
        .table("practice_attempts")
        .insert(
            {
                "interview_id": interview_id,
                "module_id": module_id,
                "question": question,
                "answer_mode": answer_mode,
                "score": score,
                "evaluation": evaluation_data,
            }
        )
        .execute()
    )

    if not result.data:
        raise RuntimeError(
            "Practice attempt was not saved."
        )

    return {
        "status": "saved",
        "attempt": result.data[0],
    }