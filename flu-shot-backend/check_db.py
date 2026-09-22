from app.database import SessionLocal
from app.models import Patient

db = SessionLocal()
total = db.query(Patient).count()
print(f'Total patients in DB: {total}')
print()

patients = db.query(Patient).order_by(Patient.id.desc()).limit(5).all()
for p in patients:
    print(f'ID {p.id}: {p.name} | {p.date}')
    print(f'  sex={p.sex}, age={p.age}, nystagmus={p.nystagmus}')
    print(f'  colour_perception={p.colour_perception}, delivery={p.delivery}')
    print(f'  visual_acuity_data:  {"STORED" if p.visual_acuity_data else "EMPTY"}')
    print(f'  cvi_screening_data:  {"STORED" if p.cvi_screening_data else "EMPTY"}')
    print(f'  cvi_range38_data:    {"STORED" if p.cvi_range38_data else "EMPTY"}')
    print(f'  cvi_range910_data:   {"STORED" if p.cvi_range910_data else "EMPTY"}')
    print(f'  icf_framework_data:  {"STORED" if p.icf_framework_data else "EMPTY"}')
    print(f'  pqcvi_data:          {"STORED" if p.pqcvi_data else "EMPTY"}')
    print()

db.close()
