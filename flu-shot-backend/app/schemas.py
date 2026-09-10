from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class PatientCreate(BaseModel):
    # Required fields
    name: str
    op_no: str
    date: str
    sex: str
    age: str
    guardian_name: str
    address: str

    # Chief Complaints
    colour_perception: Optional[str] = None
    moving_objects: Optional[str] = None
    longer_time: Optional[str] = None
    gaze_preference: Optional[str] = None
    looks_through: Optional[str] = None
    attention_span: Optional[str] = None
    squint: Optional[str] = None
    seizures: Optional[str] = None
    stumbling: Optional[str] = None
    favourite_things: Optional[str] = None
    difficulty_new: Optional[str] = None

    # Birth History
    fever_rashes: Optional[str] = None
    pih: Optional[str] = None
    others_antenatal: Optional[str] = None
    gestation_weeks: Optional[str] = None
    gestation_type: Optional[str] = None
    birth_weight: Optional[str] = None
    delivery: Optional[str] = None
    cry: Optional[str] = None

    # APGAR
    oxygen_therapy: Optional[str] = None
    jaundice: Optional[str] = None
    convulsions: Optional[str] = None
    hyperglycemia: Optional[str] = None
    chorioamnionitis: Optional[str] = None
    milestones: Optional[str] = None

    # Family History
    consanguinity: Optional[str] = None
    nutritional_status: Optional[str] = None
    auditory_anomaly: Optional[str] = None

    # Ocular Examination
    eom: Optional[str] = None
    visual_axes: Optional[str] = None
    binocular: Optional[str] = None
    anterior_segment: Optional[str] = None
    posterior_segment: Optional[str] = None
    nystagmus: Optional[str] = None

    # Pedigree
    pedigree_image: Optional[str] = None

    # Other form JSON data
    visual_acuity_data: Optional[str] = None
    cvi_screening_data: Optional[str] = None
    cvi_range38_data: Optional[str] = None
    cvi_range910_data: Optional[str] = None
    icf_framework_data: Optional[str] = None
    pqcvi_data: Optional[str] = None


class PatientResponse(PatientCreate):
    id: int
    created_at: Optional[datetime] = None

    @field_serializer('created_at')
    def serialize_dt(self, dt, _info):
        return dt.isoformat() if dt else None

    class Config:
        from_attributes = True
