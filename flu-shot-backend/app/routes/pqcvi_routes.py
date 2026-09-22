from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Optional
from sqlalchemy.orm import Session
from fastapi import Depends
from ..database import get_db
from ..models import Patient
import json

router = APIRouter(prefix="/api/pqcvi", tags=["PQCVI"])

TOTAL_QUESTIONS = 23
MAX_SCORE = TOTAL_QUESTIONS * 4  # 92

OVERALL_CUTOFFS = {"3-4": 59.87, "4-5": 75.84, "5-6": 73.70}

STREAMS = [
    {
        "key": "ventral",
        "label": "Ventral-stream Function",
        "questions": [1, 4, 5, 10, 11, 13, 19, 20, 21],
        "cutoffs": {"3-4": 21.54, "4-5": 25.32, "5-6": 28.00},
    },
    {
        "key": "dorsal",
        "label": "Dorsal-stream Function",
        "questions": [2, 3, 6, 7, 8, 9, 12, 14, 15, 16, 17, 18, 22, 23],
        "cutoffs": {"3-4": 36.28, "4-5": 48.67, "5-6": 44.37},
    },
]


class PQCVIRequest(BaseModel):
    age: float
    answers: Dict[str, int]


class PQCVIPublicSubmit(BaseModel):
    name: str
    age: float
    gender: str
    answers: Dict[str, int]


def get_age_group(age: float):
    if 3.0 <= age < 4.0: return "3-4"
    if 4.0 <= age < 5.0: return "4-5"
    if 5.0 <= age <= 6.0: return "5-6"
    return None


@router.post("/score")
def calculate_score(data: PQCVIRequest):
    age_group = get_age_group(data.age)
    if not age_group:
        return {"error": "Age must be between 3 and 6 years."}

    unanswered = [i for i in range(1, 24) if f"q{i}" not in data.answers]
    if unanswered:
        return {"error": f"Please answer questions: {', '.join(map(str, unanswered))}"}

    for i in range(1, 24):
        if data.answers.get(f"q{i}") not in (1, 2, 3, 4):
            return {"error": f"Answer for q{i} must be 1-4."}

    total_score = sum(data.answers.values())
    average_score = round(total_score / TOTAL_QUESTIONS, 2)
    overall_cutoff = OVERALL_CUTOFFS[age_group]
    overall_result = "ISSUE DETECTED" if total_score >= overall_cutoff else "NO ISSUE"

    stream_results = {}
    for stream in STREAMS:
        qs = stream["questions"]
        s_total = sum(data.answers[f"q{q}"] for q in qs)
        cutoff = stream["cutoffs"][age_group]
        stream_results[stream["key"]] = {
            "label": stream["label"],
            "total": s_total,
            "maximum": len(qs) * 4,
            "average": round(s_total / len(qs), 2),
            "cutoff": cutoff,
            "result": "ISSUE DETECTED" if s_total >= cutoff else "NO ISSUE",
        }

    return {
        "age": data.age,
        "age_group": age_group,
        "total_score": total_score,
        "maximum_score": MAX_SCORE,
        "average_score": average_score,
        "overall_cutoff": overall_cutoff,
        "overall_result": overall_result,
        "streams": stream_results,
    }


@router.post("/submit")
def submit_public_pqcvi(data: PQCVIPublicSubmit, db: Session = Depends(get_db)):
    """Save public PQCVI examination results to the patients table."""
    age_group = get_age_group(data.age)
    if not age_group:
        return {"error": "Age must be between 3 and 6 years."}

    # Calculate scores
    total_score = sum(data.answers.values())
    average_score = round(total_score / TOTAL_QUESTIONS, 2)
    overall_cutoff = OVERALL_CUTOFFS[age_group]
    overall_result = "ISSUE DETECTED" if total_score >= overall_cutoff else "NO ISSUE"

    stream_results = {}
    for stream in STREAMS:
        qs = stream["questions"]
        s_total = sum(data.answers.get(f"q{q}", 0) for q in qs)
        cutoff = stream["cutoffs"][age_group]
        stream_results[stream["key"]] = {
            "label": stream["label"],
            "total": s_total,
            "cutoff": cutoff,
            "result": "ISSUE DETECTED" if s_total >= cutoff else "NO ISSUE",
        }

    pqcvi_payload = {
        "name": data.name,
        "age": data.age,
        "gender": data.gender,
        "age_group": age_group,
        "answers": data.answers,
        "total_score": total_score,
        "max_score": MAX_SCORE,
        "average_score": average_score,
        "overall_cutoff": overall_cutoff,
        "overall_result": overall_result,
        "streams": stream_results,
    }

    # Save to patients table
    new_patient = Patient(
        name=data.name,
        op_no="PQCVI-PUBLIC",
        date=str(__import__('datetime').date.today()),
        sex=data.gender,
        age=str(data.age),
        guardian_name="-",
        address="-",
        pqcvi_data=json.dumps(pqcvi_payload),
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return {
        "id": new_patient.id,
        "message": "PQCVI submitted and saved successfully",
        **pqcvi_payload,
    }
