import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import AddPatient from './pages/AddPatient';
import PatientPrint from './pages/PatientPrint';
import PQCVIExamine from './pages/PQCVIExamine';
import Register from './pages/Register';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import './styles/global.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  return (
    <Router>
      {!isLoggedIn ? (
        <Routes>
          {/* Public routes - no login needed */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pqcvi-examine" element={<PQCVIExamine />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <div className={`app-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
          <Sidebar isOpen={sidebarOpen} />
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
          <div className="app-main">
            <TopBar
              onLogout={() => { localStorage.removeItem('token'); localStorage.removeItem('username'); setIsLoggedIn(false); }}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />
            <div className="app-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/add-patient" element={<AddPatient />} />
                <Route path="/patient/:id/print" element={<PatientPrint />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
