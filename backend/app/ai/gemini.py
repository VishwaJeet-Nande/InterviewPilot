import asyncio
import json
import os
from typing import Any, Type

from dotenv import load_dotenv
from groq import AsyncGroq
from pydantic import BaseModel

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is missing. Add it to backend/.env."
    )

client = AsyncGroq(api_key=GROQ_API_KEY)

MODEL_NAME = "openai/gpt-oss-120b"

MAX_RETRIES = 3
RETRY_DELAYS = (2, 5, 10)


def _is_retryable_error(exc: Exception) -> bool:
    message = str(exc).lower()

    retryable_markers = (
        "429",
        "rate limit",
        "too many requests",
        "500",
        "502",
        "503",
        "504",
        "timeout",
        "timed out",
        "temporarily unavailable",
        "service unavailable",
        "connection",
        "internal server error",
    )

    return any(marker in message for marker in retryable_markers)


def _schema_for_model(model: Type[BaseModel]) -> dict[str, Any]:
    """
    Convert a Pydantic model into JSON Schema for Groq structured output.
    """

    schema = model.model_json_schema()

    # Groq best-effort structured outputs are more tolerant than strict mode.
    # We intentionally keep this non-strict because some of Curion's existing
    # Pydantic schemas contain optional/default fields.
    return schema


async def generate_structured(
    *,
    system_prompt: str,
    user_prompt: str,
    response_model: Type[BaseModel],
    model_name: str = MODEL_NAME,
) -> BaseModel:
    """
    Generate a structured response from Groq and validate it with Pydantic.

    This function is intentionally provider-focused so the rest of Curion
    doesn't need to know whether the underlying model is Gemini, Groq,
    OpenRouter, etc.
    """

    schema = _schema_for_model(response_model)

    last_error = None

    for attempt in range(MAX_RETRIES + 1):
        try:
            response = await client.chat.completions.create(
                model=model_name,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": user_prompt,
                    },
                ],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": response_model.__name__.lower(),
                        "schema": schema,
                    },
                },
                temperature=0.2,
            )

            content = response.choices[0].message.content

            if not content:
                raise RuntimeError(
                    "Groq returned an empty response."
                )

            try:
                data = json.loads(content)
            except json.JSONDecodeError as exc:
                raise RuntimeError(
                    "Groq returned invalid JSON."
                ) from exc

            try:
                return response_model.model_validate(data)
            except Exception as exc:
                raise RuntimeError(
                    f"Groq response did not match the expected "
                    f"{response_model.__name__} schema: {exc}"
                ) from exc

        except Exception as exc:
            last_error = exc

            if attempt >= MAX_RETRIES or not _is_retryable_error(exc):
                raise RuntimeError(
                    f"Groq AI generation failed: {exc}"
                ) from exc

            delay = RETRY_DELAYS[min(attempt, len(RETRY_DELAYS) - 1)]

            print(
                f"Groq temporary failure "
                f"(attempt {attempt + 1}/{MAX_RETRIES + 1}). "
                f"Retrying in {delay}s..."
            )

            await asyncio.sleep(delay)

    raise RuntimeError(
        f"Groq AI generation failed: {last_error}"
    )


async def analyze_candidate(
    *,
    job_title: str,
    company_name: str,
    job_description: str,
    resume_text: str,
):
    """
    Generate Interview DNA from the candidate resume + target job.
    """

    from app.schemas.interview import InterviewDNA

    system_prompt = """
You are Curion AI's Interview Intelligence Engine.

Curion analyzes a candidate's resume against a specific job description.

Your task is to produce an evidence-based Interview DNA analysis.

Evaluate the candidate only from the information provided.

Do not invent technologies, experience, employers, projects, certifications,
or achievements that are not present in the resume.

Identify:
- overall role match
- technical match
- backend match
- AI/ML match
- cloud match
- database match
- system design match
- behavioral readiness
- likely interview focus
- high-risk areas
- medium-risk areas
- strong areas

The output must be structured according to the provided schema.
"""

    user_prompt = f"""
TARGET ROLE:
{job_title}

COMPANY:
{company_name}

JOB DESCRIPTION:
{job_description}

CANDIDATE RESUME:
{resume_text}

Analyze the candidate for this exact role.

Pay particular attention to:

1. Explicit technology overlap.
2. Missing technologies explicitly requested by the job.
3. Depth of experience versus keyword-only overlap.
4. Relevant projects.
5. Backend engineering capability.
6. AI/ML capability.
7. Cloud/platform exposure.
8. Database knowledge.
9. System design exposure.
10. Behavioral/interview risk areas.

Return only the structured analysis.
"""

    return await generate_structured(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_model=InterviewDNA,
    )