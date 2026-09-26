from typing import Optional, Union

from app.core.supabase import supabase

def _clamp(
    value: Optional[Union[int, float]],
) -> int:
    if value is None:
        return 0

    return max(
        0,
        min(
            100,
            int(round(value)),
        ),
    )


def _get_level(
    score: int,
) -> str:
    if score >= 85:
        return "Interview Ready"

    if score >= 70:
        return "Nearly Ready"

    if score >= 55:
        return "Needs Preparation"

    return "Early Preparation"


def _get_dna_areas(
    dna: dict,
) -> list[dict]:
    area_map = [
        (
            "Technical",
            "technical_match",
            "Overall technical alignment with the target role.",
        ),
        (
            "Backend",
            "backend_match",
            "Alignment with backend engineering requirements.",
        ),
        (
            "AI / ML",
            "ai_ml_match",
            "Alignment with AI, ML, LLM, and related requirements.",
        ),
        (
            "Cloud",
            "cloud_match",
            "Alignment with the cloud ecosystem expected by the role.",
        ),
        (
            "Database",
            "database_match",
            "Alignment with database and data-layer requirements.",
        ),
        (
            "System Design",
            "system_design_match",
            "Alignment with architecture and system-design expectations.",
        ),
        (
            "Behavioral",
            "behavioral_match",
            "Alignment with behavioral and communication expectations.",
        ),
    ]

    areas = []

    for name, key, explanation in area_map:
        score = dna.get(key)

        if score is None:
            continue

        areas.append(
            {
                "name": name,
                "score": _clamp(score),
                "explanation": explanation,
            }
        )

    return areas


def _unique_strings(
    values: list,
) -> list[str]:
    result: list[str] = []

    for value in values:
        if not isinstance(value, str):
            continue

        cleaned = value.strip()

        if cleaned and cleaned not in result:
            result.append(cleaned)

    return result


async def calculate_readiness(
    interview_id: str,
) -> dict:
    interview_result = (
        supabase.table("interviews")
        .select(
            "id, job_title, company_name"
        )
        .eq("id", interview_id)
        .single()
        .execute()
    )

    interview = interview_result.data

    if not interview:
        raise ValueError(
            "Interview not found."
        )

    dna_result = (
        supabase.table("interview_dna")
        .select(
            "overall_match, "
            "technical_match, "
            "backend_match, "
            "ai_ml_match, "
            "cloud_match, "
            "database_match, "
            "system_design_match, "
            "behavioral_match, "
            "high_risk_areas, "
            "medium_risk_areas, "
            "strong_areas"
        )
        .eq(
            "interview_id",
            interview_id,
        )
        .single()
        .execute()
    )

    dna = dna_result.data

    if not dna:
        raise ValueError(
            "Interview DNA has not been generated yet."
        )

    mock_result = (
        supabase.table(
            "mock_interview_sessions"
        )
        .select(
            "scores, evaluations, "
            "final_score, completed"
        )
        .eq(
            "interview_id",
            interview_id,
        )
        .maybe_single()
        .execute()
    )

    mock = mock_result.data or {}

    dna_score = _clamp(
        dna.get("overall_match")
    )

    mock_score = _clamp(
        mock.get("final_score")
    )

    mock_completed = bool(
        mock.get("completed")
    )

    scores = mock.get("scores") or []

    evaluated_scores = [
        _clamp(score)
        for score in scores
        if score is not None
    ]

    if (
        evaluated_scores
        and not mock_score
    ):
        mock_score = _clamp(
            sum(evaluated_scores)
            / len(evaluated_scores)
        )

    # Preparation progress is not persisted
    # separately yet. Therefore we use the
    # Interview DNA score as the preparation
    # baseline rather than inventing progress.
    preparation_score = dna_score

    if (
        mock_completed
        and mock_score > 0
    ):
        readiness_score = round(
            dna_score * 0.40
            + mock_score * 0.50
            + preparation_score * 0.10
        )

    else:
        readiness_score = round(
            dna_score * 0.80
            + preparation_score * 0.20
        )

    readiness_score = _clamp(
        readiness_score
    )

    high_risk = _unique_strings(
        dna.get("high_risk_areas")
        or []
    )

    medium_risk = _unique_strings(
        dna.get("medium_risk_areas")
        or []
    )

    strong_areas = _unique_strings(
        dna.get("strong_areas")
        or []
    )

    priority_gaps = (
        high_risk + medium_risk
    )[:6]

    strengths = strong_areas[:6]

    areas = _get_dna_areas(
        dna
    )

    weak_areas = sorted(
        areas,
        key=lambda area: area["score"],
    )

    recommended_actions: list[str] = []

    for gap in priority_gaps[:3]:
        recommended_actions.append(
            f"Practice and review: {gap}"
        )

    if weak_areas:
        weakest = weak_areas[0]

        recommended_actions.append(
            f"Raise your "
            f"{weakest['name']} readiness "
            f"from {weakest['score']}/100 "
            f"through targeted practice."
        )

    if (
        mock_completed
        and mock_score < 75
    ):
        recommended_actions.append(
            "Repeat the mock interview and "
            "focus on answer structure, "
            "completeness, and technical depth."
        )

    elif not mock_completed:
        recommended_actions.append(
            "Complete a full mock interview "
            "so readiness includes demonstrated "
            "interview performance."
        )

    if dna.get(
        "cloud_match",
        100,
    ) < 60:
        recommended_actions.append(
            "Strengthen the cloud technologies "
            "specifically mentioned in the job description."
        )

    if dna.get(
        "system_design_match",
        100,
    ) < 65:
        recommended_actions.append(
            "Practice system-design questions "
            "using architecture patterns relevant "
            "to the target role."
        )

    if not recommended_actions:
        recommended_actions.append(
            "Run another mock interview "
            "to validate consistency across questions."
        )

    recommended_actions = _unique_strings(
        recommended_actions
    )[:6]

    job_title = (
        interview.get("job_title")
        or "target"
    )

    company_name = (
        interview.get("company_name")
        or "the target company"
    )

    summary = (
        f"Your current readiness for the "
        f"{job_title} role at "
        f"{company_name} is "
        f"{readiness_score}/100."
    )

    if mock_completed:
        summary += (
            f" Your latest mock interview "
            f"score was {mock_score}/100."
        )

    else:
        summary += (
            " Complete a mock interview to "
            "make this score more representative."
        )

    return {
        "interview_id": interview_id,
        "job_title": job_title,
        "company_name": company_name,
        "readiness_score": readiness_score,
        "level": _get_level(
            readiness_score
        ),
        "summary": summary,
        "breakdown": {
            "interview_dna": dna_score,
            "mock_interview": mock_score,
            "preparation": preparation_score,
        },
        "strengths": strengths,
        "priority_gaps": priority_gaps,
        "recommended_actions": (
            recommended_actions
        ),
        "areas": areas,
        "mock_score": mock_score,
        "dna_score": dna_score,
        "mock_completed": mock_completed,
    }