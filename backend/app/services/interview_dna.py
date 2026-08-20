from app.schemas.interview import (
    InterviewAnalysisRequest,
    InterviewDNA,
    InterviewTopic,
    SkillGap,
)


def generate_interview_dna(
    request: InterviewAnalysisRequest,
) -> InterviewDNA:
    """
    Temporary deterministic Interview DNA engine.

    This is intentionally provider-independent.
    The production AI model will be connected here next.
    """

    jd = request.job_description.lower()
    resume = request.resume_text.lower()

    common_skills = [
        "python",
        "javascript",
        "typescript",
        "react",
        "next.js",
        "fastapi",
        "sql",
        "postgresql",
        "docker",
        "aws",
        "machine learning",
        "artificial intelligence",
        "llm",
        "nlp",
        "git",
        "rest api",
    ]

    matched_skills = [
        skill
        for skill in common_skills
        if skill in jd and skill in resume
    ]

    required_skills = [
        skill
        for skill in common_skills
        if skill in jd
    ]

    missing_skills = [
        skill
        for skill in required_skills
        if skill not in matched_skills
    ]

    if required_skills:
        skill_match_score = round(
            (len(matched_skills) / len(required_skills)) * 100
        )
    else:
        skill_match_score = 50

    role_fit_score = min(
        100,
        round(
            skill_match_score * 0.75
            + (25 if request.job_title.lower() in resume else 10)
        ),
    )

    experience_match_score = (
        80 if resume else 30
    )

    technical_readiness_score = round(
        (skill_match_score + experience_match_score) / 2
    )

    strengths = [
        f"Relevant skills matched: {', '.join(matched_skills[:6])}"
        if matched_skills
        else "Resume information is available for analysis."
    ]

    skill_gaps = [
        SkillGap(
            skill=skill,
            importance="high" if skill in required_skills[:5] else "medium",
            reason=f"{skill} appears in the target job description but was not clearly detected in the resume.",
        )
        for skill in missing_skills[:8]
    ]

    technical_focus = required_skills[:8]

    likely_topics = [
        InterviewTopic(
            topic="Technical fundamentals",
            category="technical",
            likelihood=90,
        ),
        InterviewTopic(
            topic=f"{request.job_title} role-specific questions",
            category="technical",
            likelihood=95,
        ),
        InterviewTopic(
            topic="Project deep dive",
            category="experience",
            likelihood=88,
        ),
        InterviewTopic(
            topic="Problem solving",
            category="technical",
            likelihood=85,
        ),
        InterviewTopic(
            topic="Behavioral and situational questions",
            category="behavioral",
            likelihood=82,
        ),
    ]

    behavioral_focus = [
        "Project ownership",
        "Problem solving",
        "Communication",
        "Handling ambiguity",
        "Working with teams",
    ]

    risk_areas = []

    if missing_skills:
        risk_areas.append(
            "Some job-required skills were not clearly demonstrated in the resume."
        )

    if not resume:
        risk_areas.append(
            "Resume content has not yet been extracted."
        )

    risk_areas.append(
        "Technical depth should be validated through a mock interview."
    )

    return InterviewDNA(
        role_fit_score=max(0, min(100, role_fit_score)),
        skill_match_score=max(0, min(100, skill_match_score)),
        experience_match_score=max(0, min(100, experience_match_score)),
        technical_readiness_score=max(
            0,
            min(100, technical_readiness_score),
        ),
        strengths=strengths,
        skill_gaps=skill_gaps,
        technical_focus=technical_focus,
        likely_topics=likely_topics,
        behavioral_focus=behavioral_focus,
        risk_areas=risk_areas,
    )