from app.ai.gemini import analyze_candidate
from app.schemas.interview import InterviewAnalysisRequest, InterviewDNA


async def generate_interview_dna(
    request: InterviewAnalysisRequest,
) -> InterviewDNA:
    return await analyze_candidate(
        job_title=request.job_title,
        company_name=request.company_name,
        job_description=request.job_description,
        resume_text=request.resume_text,
    )