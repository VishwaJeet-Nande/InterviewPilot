import json
import os
from urllib.parse import quote_plus

import httpx
from dotenv import load_dotenv
from google.genai import types

from app.ai.gemini import client, MODEL_NAME
from app.core.supabase import supabase
from app.schemas.preparation import (
    AnswerEvaluation,
    PreparationPlan,
    YouTubeResource,
)
from app.services.resume_parser import extract_pdf_text


load_dotenv()


RESUME_BUCKET = "resumes"
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


async def _get_interview_context(interview_id: str):
    interview_result = (
        supabase
        .table("interviews")
        .select(
            "id, job_title, company_name, "
            "job_description, resume_id"
        )
        .eq("id", interview_id)
        .single()
        .execute()
    )

    interview = interview_result.data

    if not interview:
        raise ValueError("Interview not found.")

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
        .eq("interview_id", interview_id)
        .single()
        .execute()
    )

    dna = dna_result.data

    if not dna:
        raise ValueError(
            "Interview DNA has not been generated yet."
        )

    resume_result = (
        supabase
        .table("resumes")
        .select("file_path, file_name")
        .eq("id", interview["resume_id"])
        .single()
        .execute()
    )

    resume = resume_result.data

    if not resume:
        raise ValueError("Resume record not found.")

    file_bytes = (
        supabase
        .storage
        .from_(RESUME_BUCKET)
        .download(resume["file_path"])
    )

    resume_text = extract_pdf_text(file_bytes)

    return interview, dna, resume_text


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

    for item in data.get("items", []):
        video_id = (
            item.get("id", {})
            .get("videoId")
        )

        snippet = item.get("snippet", {})

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
                    .get("thumbnails", {})
                    .get("medium", {})
                    .get("url", "")
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

    prompt = f"""
You are InterviewPilot's Personalized Preparation Engine.

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

    response = await client.aio.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=PreparationPlan,
            temperature=0.25,
        ),
    )

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty preparation plan."
        )

    plan = PreparationPlan.model_validate_json(
        response.text
    )

    for module in plan.modules:
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

    prompt = f"""
You are InterviewPilot's Interview Answer Evaluator.

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

    response = await client.aio.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=AnswerEvaluation,
            temperature=0.2,
        ),
    )

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty answer evaluation."
        )

    return AnswerEvaluation.model_validate_json(
        response.text
    )


async def evaluate_voice_answer(
    *,
    interview_id: str,
    question: str,
    audio_bytes: bytes,
    mime_type: str,
) -> AnswerEvaluation:

    interview, dna, resume_text = (
        await _get_interview_context(
            interview_id
        )
    )

    prompt = f"""
You are InterviewPilot's Interview Answer Evaluator.

The candidate answered the interview question using voice.

First transcribe the spoken answer accurately.

Then evaluate the answer against:
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

Focus on the content of the answer and observable answer
structure.

Identify missing concepts.

Provide a better answer direction without inventing
candidate experience.

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
"""

    audio_part = types.Part.from_bytes(
        data=audio_bytes,
        mime_type=mime_type,
    )

    response = await client.aio.models.generate_content(
        model=MODEL_NAME,
        contents=[
            prompt,
            audio_part,
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=AnswerEvaluation,
            temperature=0.2,
        ),
    )

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty voice evaluation."
        )

    return AnswerEvaluation.model_validate_json(
        response.text
    )