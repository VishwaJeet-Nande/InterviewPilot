import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.schemas.interview import InterviewDNA


load_dotenv()


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured.")


client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-3.5-flash-lite"


async def analyze_candidate(
    *,
    job_title: str,
    company_name: str,
    job_description: str,
    resume_text: str,
) -> InterviewDNA:

    prompt = f"""
You are InterviewPilot's Interview Intelligence Engine.

Analyze a candidate against a specific job and produce an
evidence-based Interview DNA profile.

IMPORTANT RULES:

1. Use ONLY the supplied resume and job description.
2. Never invent experience, skills, projects, employers,
   degrees, certifications, or achievements.
3. All scores must be integers from 0 to 100.
4. Evaluate each domain independently.
5. Be realistic and critical.
6. The purpose is interview preparation, not resume praise.
7. Identify areas where an interviewer is likely to challenge
   the candidate.
8. Prioritize technical areas according to the target role.
9. Generate topics genuinely relevant to this candidate and job.
10. High-risk areas are gaps or weaknesses that could materially
    hurt the candidate during an interview.
11. Medium-risk areas are meaningful concerns but less severe.
12. Strong areas must be supported by evidence in the resume.
13. likely_focus must contain the most probable interview topics.

SCORING:

overall_match:
Overall suitability of the candidate for this specific job.

technical_match:
Overall technical skill alignment with the job requirements.

backend_match:
Alignment with backend engineering, APIs, services,
FastAPI, microservices, scalability, and related requirements.

ai_ml_match:
Alignment with AI, machine learning, NLP, LLM, RAG,
agents, inference, and related requirements.

cloud_match:
Alignment with cloud platforms, containers, Kubernetes,
deployment, infrastructure, and cloud-native requirements.

database_match:
Alignment with SQL, PostgreSQL, MongoDB, vector databases,
data modeling, optimization, and related requirements.

system_design_match:
Alignment with architecture, distributed systems,
scalability, reliability, security, and system design.

behavioral_match:
Evidence of communication, collaboration, ownership,
leadership, problem-solving, and professional maturity.

Return ONLY the structured JSON matching the provided schema.

TARGET ROLE:
{job_title}

COMPANY:
{company_name}

JOB DESCRIPTION:
{job_description}

CANDIDATE RESUME:
{resume_text}
"""

    response = await client.aio.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=InterviewDNA,
            temperature=0.2,
        ),
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    try:
        data = json.loads(response.text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "Gemini returned invalid JSON."
        ) from exc

    return InterviewDNA.model_validate(data)