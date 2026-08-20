from fastapi import FastAPI

from app.routes.analysis import router as analysis_router


app = FastAPI(
    title="InterviewPilot API",
    description="AI-powered interview preparation and simulation platform",
    version="0.2.0",
)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "InterviewPilot API",
        "version": "0.2.0",
    }


app.include_router(analysis_router)