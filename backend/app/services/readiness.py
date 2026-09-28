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


def _calculate_preparation_progress(
    attempts: list[dict],
) -> dict:
    if not attempts:
        return {
            "score": 0,
            "questions_practiced": 0,
            "average_score": 0,
            "completion_percentage": 0,
        }

    unique_questions = {
        str(attempt.get("question", "")).strip()
        for attempt in attempts
        if attempt.get("question")
    }

    questions_practiced = len(
        unique_questions
    )

    scores = [
        _clamp(attempt.get("score"))
        for attempt in attempts
        if attempt.get("score") is not None
    ]

    average_score = (
        round(
            sum(scores) / len(scores)
        )
        if scores
        else 0
    )

    completion_percentage = min(
        100,
        round(
            (questions_practiced / 10) * 100
        ),
    )

    preparation_score = round(
        completion_percentage * 0.50
        + average_score * 0.50
    )

    return {
        "score": _clamp(
            preparation_score
        ),
        "questions_practiced": (
            questions_practiced
        ),
        "average_score": average_score,
        "completion_percentage": (
            completion_percentage
        ),
    }


def _get_practice_signal(
    preparation_progress: dict,
) -> str:
    questions = preparation_progress[
        "questions_practiced"
    ]

    average = preparation_progress[
        "average_score"
    ]

    completion = preparation_progress[
        "completion_percentage"
    ]

    if questions == 0:
        return "not_started"

    if average < 55:
        return "low_quality"

    if average < 70:
        return "developing"

    if completion < 50:
        return "limited_coverage"

    if average >= 80 and completion >= 70:
        return "strong"

    return "progressing"


def _build_recommended_actions(
    *,
    priority_gaps: list[str],
    weak_areas: list[dict],
    preparation_progress: dict,
    mock_completed: bool,
    mock_score: int,
    dna: dict,
) -> list[str]:
    actions: list[str] = []

    practice_signal = _get_practice_signal(
        preparation_progress
    )

    questions = preparation_progress[
        "questions_practiced"
    ]

    average = preparation_progress[
        "average_score"
    ]

    completion = preparation_progress[
        "completion_percentage"
    ]

    # --------------------------------------------------
    # 1. Missing mock milestone
    # --------------------------------------------------

    if not mock_completed:
        actions.append(
            "Complete a full AI mock interview so "
            "InterviewPilot can measure your demonstrated "
            "interview performance."
        )

    # --------------------------------------------------
    # 2. Practice quality
    # --------------------------------------------------

    if practice_signal == "not_started":
        actions.append(
            "Start personalized practice with at least "
            "5 role-specific questions before relying on "
            "your readiness score."
        )

    elif practice_signal == "low_quality":
        actions.append(
            f"Improve answer quality before increasing "
            f"practice volume. Your current practice "
            f"average is {average}/100."
        )

    elif practice_signal == "developing":
        actions.append(
            f"Keep practicing until your answer average "
            f"moves above 70/100. Current average: "
            f"{average}/100."
        )

    elif practice_signal == "limited_coverage":
        actions.append(
            f"Expand your question coverage. You have "
            f"practiced {questions} unique questions "
            f"({completion}% coverage)."
        )

    elif practice_signal == "strong":
        actions.append(
            "Maintain your practice performance and "
            "validate consistency with another mock interview."
        )

    # --------------------------------------------------
    # 3. Interview DNA gaps
    # --------------------------------------------------

    for gap in priority_gaps[:3]:
        actions.append(
            f"Target the identified gap: {gap}."
        )

    # --------------------------------------------------
    # 4. Weakest technical area
    # --------------------------------------------------

    if weak_areas:
        weakest = weak_areas[0]

        actions.append(
            f"Raise {weakest['name']} from "
            f"{weakest['score']}/100 through targeted "
            f"questions and review."
        )

    # --------------------------------------------------
    # 5. Completed mock performance
    # --------------------------------------------------

    if mock_completed:
        if mock_score < 55:
            actions.append(
                f"Repeat the mock after focused preparation. "
                f"Your current mock score is {mock_score}/100."
            )

        elif mock_score < 75:
            actions.append(
                f"Improve mock-interview consistency. "
                f"Your latest mock score is {mock_score}/100."
            )

        elif mock_score >= 85:
            actions.append(
                "Run another mock under realistic conditions "
                "to validate that your strong performance is consistent."
            )

    # --------------------------------------------------
    # 6. Specific DNA dimensions
    # --------------------------------------------------

    if dna.get(
        "cloud_match",
        100,
    ) < 60:
        actions.append(
            "Strengthen the cloud technologies specifically "
            "mentioned in the target job description."
        )

    if dna.get(
        "system_design_match",
        100,
    ) < 65:
        actions.append(
            "Practice system-design questions using "
            "architecture patterns relevant to the target role."
        )

    if dna.get(
        "behavioral_match",
        100,
    ) < 65:
        actions.append(
            "Prepare structured behavioral stories using "
            "STAR-style answer framing."
        )

    if dna.get(
        "ai_ml_match",
        100,
    ) < 65:
        actions.append(
            "Review the AI/ML concepts and technologies "
            "explicitly required by the role."
        )

    actions = _unique_strings(
        actions
    )

    if not actions:
        actions.append(
            "Run another mock interview to validate "
            "consistency across questions."
        )

    return actions[:6]


async def calculate_readiness(
    interview_id: str,
) -> dict:
    # --------------------------------------------------
    # INTERVIEW
    # --------------------------------------------------

    interview_result = (
        supabase
        .table("interviews")
        .select(
            "id, job_title, company_name"
        )
        .eq(
            "id",
            interview_id,
        )
        .single()
        .execute()
    )

    interview = interview_result.data

    if not interview:
        raise ValueError(
            "Interview not found."
        )

    # --------------------------------------------------
    # INTERVIEW DNA
    # --------------------------------------------------

    dna_result = (
        supabase
        .table("interview_dna")
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

    # --------------------------------------------------
    # MOCK
    # --------------------------------------------------

    mock_result = (
        supabase
        .table("mock_interview_sessions")
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

    mock_completed = bool(
        mock.get("completed")
    )

    # IMPORTANT:
    # Never expose partial mock scores as a
    # readiness signal.
    #
    # An incomplete mock is not an assessment.
    # The score becomes meaningful only after
    # the mock session is completed.
    mock_score = 0

    if mock_completed:
        mock_score = _clamp(
            mock.get("final_score")
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

    # --------------------------------------------------
    # PRACTICE
    # --------------------------------------------------

    practice_result = (
        supabase
        .table("practice_attempts")
        .select(
            "question, score, answer_mode, created_at"
        )
        .eq(
            "interview_id",
            interview_id,
        )
        .order(
            "created_at",
            desc=True,
        )
        .execute()
    )

    practice_attempts = (
        practice_result.data or []
    )

    preparation_progress = (
        _calculate_preparation_progress(
            practice_attempts
        )
    )

    # --------------------------------------------------
    # BASE SCORES
    # --------------------------------------------------

    dna_score = _clamp(
        dna.get("overall_match")
    )

    preparation_score = (
        preparation_progress["score"]
    )

    # --------------------------------------------------
    # READINESS FORMULA
    # --------------------------------------------------

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

    # --------------------------------------------------
    # DNA SIGNALS
    # --------------------------------------------------

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

    # --------------------------------------------------
    # TECHNICAL AREAS
    # --------------------------------------------------

    areas = _get_dna_areas(
        dna
    )

    weak_areas = sorted(
        areas,
        key=lambda area: area["score"],
    )

    # --------------------------------------------------
    # INTELLIGENT ACTION ENGINE
    # --------------------------------------------------

    recommended_actions = (
        _build_recommended_actions(
            priority_gaps=priority_gaps,
            weak_areas=weak_areas,
            preparation_progress=(
                preparation_progress
            ),
            mock_completed=mock_completed,
            mock_score=mock_score,
            dna=dna,
        )
    )

    # --------------------------------------------------
    # SUMMARY
    # --------------------------------------------------

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

    if (
        preparation_progress["questions_practiced"]
        > 0
    ):
        summary += (
            f" You have practiced "
            f"{preparation_progress['questions_practiced']} "
            f"unique questions with an average answer "
            f"score of "
            f"{preparation_progress['average_score']}/100."
        )

    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

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
        "preparation_progress": {
            "score": preparation_progress[
                "score"
            ],
            "questions_practiced": (
                preparation_progress[
                    "questions_practiced"
                ]
            ),
            "average_score": (
                preparation_progress[
                    "average_score"
                ]
            ),
            "completion_percentage": (
                preparation_progress[
                    "completion_percentage"
                ]
            ),
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