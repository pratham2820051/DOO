from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth_routes, patient_routes, pqcvi_routes

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CVI Clinic API", version="1.0.0")

# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_routes.router)
app.include_router(patient_routes.router)
app.include_router(pqcvi_routes.router)


@app.get("/")
def root():
    return {"message": "CVI Clinic API is running"}
