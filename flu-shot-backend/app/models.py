from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="admin")
    created_at = Column(DateTime, server_default=func.now())


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    # Basic Info - required
    name = Column(String(200), nullable=False)
    op_no = Column(String(50), nullable=False)
    date = Column(String(20), nullable=False)
    sex = Column(String(10), nullable=False)
    age = Column(String(20), nullable=False)
    guardian_name = Column(String(200), nullable=False)
    address = Column(Text, nullable=False)

    # Chief Complaints
    colour_perception = Column(String(5))
    moving_objects = Column(String(5))
    longer_time = Column(String(5))
    gaze_preference = Column(String(5))
    looks_through = Column(String(5))
    attention_span = Column(String(20))
    squint = Column(String(5))
    seizures = Column(String(5))
    stumbling = Column(String(5))
    favourite_things = Column(String(5))
    difficulty_new = Column(String(5))

    # Birth History
    fever_rashes = Column(String(5))
    pih = Column(String(5))
    others_antenatal = Column(String(5))
    gestation_weeks = Column(String(10))
    gestation_type = Column(String(20))
    birth_weight = Column(String(20))
    delivery = Column(String(5))
    cry = Column(String(5))

    # APGAR
    oxygen_therapy = Column(String(5))
    jaundice = Column(String(5))
    convulsions = Column(String(5))
    hyperglycemia = Column(String(5))
    chorioamnionitis = Column(String(5))
    milestones = Column(String(5))

    # Family History
    consanguinity = Column(String(5))
    nutritional_status = Column(Text)
    auditory_anomaly = Column(String(5))

    # Ocular Examination
    eom = Column(String(5))
    visual_axes = Column(String(5))
    binocular = Column(String(5))
    anterior_segment = Column(String(5))
    posterior_segment = Column(String(5))
    nystagmus = Column(String(5))

    # Pedigree drawing (base64 image)
    pedigree_image = Column(Text)

    # All other forms stored as JSON text
    visual_acuity_data = Column(Text)    # JSON string
    cvi_screening_data = Column(Text)    # JSON string
    cvi_range38_data = Column(Text)      # JSON string
    cvi_range910_data = Column(Text)     # JSON string
    icf_framework_data = Column(Text)    # JSON string
    pqcvi_data = Column(Text)            # JSON string - PQCVI questionnaire + scores

    created_at = Column(DateTime, server_default=func.now())
