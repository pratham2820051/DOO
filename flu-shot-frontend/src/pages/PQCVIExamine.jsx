import { useNavigate, useLocation } from 'react-router-dom';
import PQCVI from './forms/PQCVI';

function PQCVIExamine() {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = location.state || { name: 'Unknown', age: '-', gender: '-' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f0fe 100%)', padding: '20px 16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', background: '#fff', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 24px rgba(30,64,175,0.10)' }}>

        {/* User info bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px 16px', background: '#f0f6ff', borderRadius: '8px', border: '1px solid #dbeafe' }}>
          <div style={{ fontSize: '14px', color: '#1b2a4a' }}>
            <strong>👤 {userInfo.name}</strong>
            <span style={{ margin: '0 12px', color: '#aaa' }}>|</span>
            <span>Age: <strong>{userInfo.age} yrs</strong></span>
            <span style={{ margin: '0 12px', color: '#aaa' }}>|</span>
            <span>Gender: <strong>{userInfo.gender}</strong></span>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '6px 14px', background: '#1b2a4a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            ← Back
          </button>
        </div>

        <PQCVI userInfo={userInfo} />
      </div>
    </div>
  );
}

export default PQCVIExamine;
