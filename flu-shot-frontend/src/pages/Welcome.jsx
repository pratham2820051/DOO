import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ name: '', age: '', gender: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleStart = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!userInfo.name.trim()) newErrors.name = 'Name is required';
    if (!userInfo.age || isNaN(userInfo.age) || userInfo.age <= 0)
      newErrors.age = 'Valid age is required';
    if (!userInfo.gender) newErrors.gender = 'Gender is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    // Pass user info to examine page via state
    navigate('/pqcvi-examine', { state: userInfo });
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '460px' }}>

        {/* Header */}
        <div className="login-card-header">
          <div className="login-lock-icon">
            <span style={{ fontSize: '32px' }}>👁️</span>
          </div>
          <div>
            <h2>CVI Clinic Portal</h2>
            <p>PQCVI Assessment System</p>
          </div>
        </div>

        {/* Subtitle */}
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px', lineHeight: '1.5' }}>
          Enter the child's details to begin the Parental Questionnaire for Cerebral Visual Impairment.
        </p>

        <form onSubmit={handleStart}>
          {/* Name */}
          <div className="login-field">
            <label>Child's Name</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input type="text" name="name" placeholder="Enter child's name" value={userInfo.name} onChange={handleChange} />
            </div>
            {errors.name && <p className="login-error" style={{ marginTop: '4px' }}>{errors.name}</p>}
          </div>

          {/* Age */}
          <div className="login-field">
            <label>Child's Age (years)</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </span>
              <input type="number" name="age" placeholder="e.g. 4.5  (supported: 3–6 years)" step="0.1" min="1" max="18" value={userInfo.age} onChange={handleChange} />
            </div>
            {errors.age && <p className="login-error" style={{ marginTop: '4px' }}>{errors.age}</p>}
          </div>

          {/* Gender */}
          <div className="login-field">
            <label>Gender</label>
            <div className="login-input-wrapper" style={{ padding: '0 12px' }}>
              <span className="login-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"></path>
                </svg>
              </span>
              <select name="gender" value={userInfo.gender} onChange={handleChange}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '15px', padding: '12px 0', color: userInfo.gender ? '#333' : '#aaa' }}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {errors.gender && <p className="login-error" style={{ marginTop: '4px' }}>{errors.gender}</p>}
          </div>

          {/* Start button */}
          <button type="submit" className="login-btn">
            🔍 Start PQCVI Examination
          </button>

          {/* Divider */}
          <div className="login-examine-divider" style={{ margin: '18px 0 14px' }}>
            <span>are you a doctor / admin?</span>
          </div>

          {/* Admin login */}
          <button type="button" className="login-examine-btn" onClick={() => navigate('/login')}>
            🔐 Admin Login
          </button>
        </form>

        <div className="login-secure-note" style={{ marginTop: '18px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1b2a4a" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>Your data is encrypted and secure</span>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
