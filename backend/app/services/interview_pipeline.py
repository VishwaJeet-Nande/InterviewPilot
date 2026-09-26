from app.ai.gemini import analyze_candidate
from app.core.supabase import supabase
from app.schemas.interview import InterviewDNA
from app.services.resume_parser import extract_pdf_text


RESUME_BUCKET = "resumes"


async def generate_dna_for_interview(
    interview_id: str,
) -> InterviewDNA:

    # 1. Fetch interview
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

    if not interview.get("resume_id"):
        raise ValueError("No resume is attached to this interview.")

    # 2. Fetch resume record
    resume_result = (
        supabase
        .table("resumes")
        .select(
            "id, file_name, file_path, file_type"
        )
        .eq("id", interview["resume_id"])
        .single()
        .execute()
    )

    resume = resume_result.data

    if not resume:
        raise ValueError("Resume record not found.")

    file_path = resume.get("file_path")

    if not file_path:
        raise ValueError("Resume file path is missing.")

    # 3. Download PDF from Supabase Storage
    try:
        file_bytes = (
            supabase
            .storage
            .from_(RESUME_BUCKET)
            .download(file_path)
        )
    except Exception as exc:
        raise ValueError(
            "Unable to download the resume from storage."
        ) from exc

    # 4. Extract resume text
    resume_text = extract_pdf_text(file_bytes)

    if not resume_text.strip():
        raise ValueError(
            "No readable text was found in the resume."
        )

    # 5. Generate Interview DNA with Gemini
    dna = await analyze_candidate(
        job_title=interview["job_title"],
        company_name=interview["company_name"],
        job_description=interview["job_description"],
        resume_text=resume_text,
    )

    # 6. Persist Interview DNA
    payload = {
        "interview_id": interview_id,
        "overall_match": dna.overall_match,
        "technical_match": dna.technical_match,
        "backend_match": dna.backend_match,
        "ai_ml_match": dna.ai_ml_match,
        "cloud_match": dna.cloud_match,
        "database_match": dna.database_match,
        "system_design_match": dna.system_design_match,
        "behavioral_match": dna.behavioral_match,
        "likely_focus": [
            item.model_dump()
            for item in dna.likely_focus
        ],
        "high_risk_areas": dna.high_risk_areas,
        "medium_risk_areas": dna.medium_risk_areas,
        "strong_areas": dna.strong_areas,
        "raw_analysis": dna.model_dump(),
    }

    try:
        supabase.table("interview_dna").upsert(
            payload,
            on_conflict="interview_id",
        ).execute()
    except Exception as exc:
        raise RuntimeError(
            "Interview DNA was generated but could not be saved."
        ) from exc

    return dna