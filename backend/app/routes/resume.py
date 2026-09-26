from fastapi import APIRouter, HTTPException

from app.core.supabase import supabase
from app.services.resume_parser import extract_pdf_text


router = APIRouter(
    prefix="/api/v1/resumes",
    tags=["Resume"],
)


@router.get("/{file_path:path}/text")
async def extract_resume_text(file_path: str):
    """
    Download a private resume from Supabase Storage
    and extract its text.
    """

    try:
        file_bytes = supabase.storage.from_(
            "resumes"
        ).download(file_path)

        text = extract_pdf_text(file_bytes)

        return {
            "status": "success",
            "file_path": file_path,
            "character_count": len(text),
            "text": text,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Resume extraction failed: {str(exc)}",
        )