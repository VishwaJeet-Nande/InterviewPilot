from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analysis import router as analysis_router
from app.routes.mock import router as mock_router
from app.routes.preparation import router as preparation_router
from app.routes.resume import router as resume_router
from app.routes.readiness import router as readiness_router

app = FastAPI(
    title="InterviewPilot API",
    description=(
        "AI-powered interview preparation "
        "and simulation platform"
    ),
    version="0.5.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "InterviewPilot API",
        "version": "0.5.0",
    }


app.include_router(analysis_router)
app.include_router(preparation_router)
app.include_router(mock_router)
app.include_router(resume_router)
app.include_router(readiness_router)