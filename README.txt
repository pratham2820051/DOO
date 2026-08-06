================================================================
  DOO - DEPARTMENT OF OPHTHALMOLOGY
  CVI Clinic Proforma System
  GitHub: https://github.com/pratham2820051/DOO.git
================================================================

TECH STACK
----------
  Frontend  : React.js + Vite
  Backend   : Python FastAPI
  Database  : PostgreSQL (local)
  ORM       : SQLAlchemy


================================================================
  PREREQUISITES - INSTALL THESE FIRST
================================================================

1. Node.js (v18 or above)
   Download: https://nodejs.org/

2. Python 3.14 (already tested with this version)
   Download: https://www.python.org/downloads/

3. PostgreSQL 16
   Download: https://www.postgresql.org/download/windows/
   - During install, set a password (e.g. admin123)
   - Keep default port: 5432
   - Skip Stack Builder at the end

4. Git
   Download: https://git-scm.com/downloads


================================================================
  STEP 1 - CLONE THE REPOSITORY
================================================================

  Open terminal / command prompt and run:

    git clone https://github.com/pratham2820051/DOO.git
    cd DOO


================================================================
  STEP 2 - SET UP THE DATABASE
================================================================

  1. Open pgAdmin 4 (installed with PostgreSQL)
  2. Connect to PostgreSQL 16 (enter your password)
  3. Right-click Databases → Create → Database
  4. Name it:  DOO
  5. Click Save

  OR use SQL Shell (psql):
    CREATE DATABASE DOO;


================================================================
  STEP 3 - SET UP THE BACKEND
================================================================

  Open terminal, navigate to the backend folder:

    cd flu-shot-backend

  Create the .env file (create this manually, do NOT push to GitHub):

    Create a file named .env inside flu-shot-backend/ with this content:

      DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/DOO
      SECRET_KEY=cvi-clinic-super-secret-key-2024

    Replace YOUR_PASSWORD with your PostgreSQL password.

  Install Python dependencies:

    py -m pip install -r requirements.txt

  Run the backend server:

    py run.py

  Backend will start at: http://127.0.0.1:8000
  API Docs available at: http://127.0.0.1:8000/docs

  NOTE: The database tables (patients, users) are created
        automatically when you first run the backend.


================================================================
  STEP 4 - CREATE ADMIN USER
================================================================

  After the backend is running, open a new terminal and run:

    Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'

  OR open http://127.0.0.1:8000/docs in browser:
    - Click /api/auth/register
    - Click "Try it out"
    - Enter: { "username": "admin", "password": "admin123" }
    - Click Execute

  Default login credentials:
    Username: admin
    Password: admin123


================================================================
  STEP 5 - SET UP THE FRONTEND
================================================================

  Open a new terminal, navigate to the frontend folder:

    cd flu-shot-frontend

  Install Node.js dependencies:

    npm install

  Run the frontend:

    npm run dev

  Frontend will open at: http://localhost:5173/


================================================================
  HOW TO RUN (AFTER SETUP)
================================================================

  Every time you want to run the project, open 2 terminals:

  Terminal 1 - Backend:
    cd flu-shot-backend
    py run.py

  Terminal 2 - Frontend:
    cd flu-shot-frontend
    npm run dev

  Then open browser: http://localhost:5173/
  Login with: admin / admin123


================================================================
  PROJECT STRUCTURE
================================================================

  DOO/
  |
  |-- flu-shot-backend/         FastAPI Python Backend
  |   |-- app/
  |   |   |-- main.py           FastAPI app entry point
  |   |   |-- database.py       PostgreSQL connection
  |   |   |-- models.py         Database table models
  |   |   |-- schemas.py        Request/response schemas
  |   |   |-- auth.py           JWT authentication
  |   |   |-- routes/
  |   |       |-- auth_routes.py    Login/Register endpoints
  |   |       |-- patient_routes.py Patient CRUD endpoints
  |   |-- run.py                Start server script
  |   |-- requirements.txt      Python dependencies
  |   |-- .env                  (CREATE THIS - not in git)
  |   |-- .gitignore
  |
  |-- flu-shot-frontend/        React.js Frontend
  |   |-- src/
  |   |   |-- pages/
  |   |   |   |-- forms/        All 6 assessment forms
  |   |   |   |-- Dashboard.jsx
  |   |   |   |-- Patients.jsx
  |   |   |   |-- AddPatient.jsx
  |   |   |   |-- PatientPrint.jsx  PDF print view
  |   |   |   |-- Login.jsx
  |   |   |-- components/
  |   |   |   |-- Sidebar.jsx
  |   |   |   |-- TopBar.jsx
  |   |   |   |-- DrawingCanvas.jsx
  |   |   |-- api/api.js        All API calls
  |   |   |-- styles/global.css All CSS styles
  |   |-- package.json
  |
  |-- README.txt                This file


================================================================
  FEATURES
================================================================

  - Login / Logout with JWT authentication
  - Add new patient assessment (6-tab form)
  - Full form tabs:
      1. Basic Info (patient details, complaints, birth history)
      2. Visual Acuity (teller card, refraction, diagnosis)
      3. CVI Screening (screening questions, Rating I)
      4. CVI Range 3-8 (behaviour assessment)
      5. CVI Range 9-10 (behaviour + Rating II scoring)
      6. ICF Framework (body structure, activity, environment)
  - Pedigree drawing canvas (draw & save)
  - View all patients list
  - Delete patient (with confirmation modal)
  - Print / Save as PDF (all 6 pages)
  - Dashboard with real-time patient count
  - Real-time clock in topbar
  - Sidebar toggle (desktop + mobile)
  - Fully responsive design


================================================================
  SWITCHING TO CLOUD DATABASE (NEON / SUPABASE)
================================================================

  When ready to deploy, change ONE line in flu-shot-backend/.env:

    From:
      DATABASE_URL=postgresql://postgres:password@localhost:5432/DOO

    To (example using Neon):
      DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/DOO

  Everything else stays the same.


================================================================
  IMPORTANT NOTES
================================================================

  - NEVER push the .env file to GitHub (already in .gitignore)
  - The .env file contains your database password
  - Each developer must create their own .env file
  - Patient data is sensitive - keep database secure


================================================================
  SUPPORT
================================================================

  GitHub: https://github.com/pratham2820051/DOO.git

================================================================
