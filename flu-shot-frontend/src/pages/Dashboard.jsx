import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getPatientCount } from '../api/api';

function Dashboard() {
  const [patientCount, setPatientCount] = useState(0);
  const username = localStorage.getItem('username') || 'Admin';

  useEffect(() => {
    getPatientCount()
      .then(count => setPatientCount(count))
      .catch(() => setPatientCount(0));
  }, []);

  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <div>
          <h2>Hello {username}, Welcome to the Admin Dashboard!</h2>
          <p>Department of Ophthalmology — CVI Clinic Proforma System</p>
        </div>
      </div> 

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{patientCount}</h3>
            <p>TOTAL PATIENTS</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/add-patient" className="action-btn-large">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Patient
        </Link>
        <Link to="/patients" className="action-btn-large secondary">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
          </svg>
          View All Patients
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
