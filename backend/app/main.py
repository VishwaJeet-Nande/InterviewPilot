from fastapi import FastAPI

app = FastAPI(
    title="InterviewPilot API",
    description="AI-powered interview preparation and simulation platform",
    version="0.1.0",
)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "InterviewPilot API",
        "version": "0.1.0",
    }

