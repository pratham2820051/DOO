import { useNavigate } from 'react-router-dom';
import PQCVI from './forms/PQCVI';

function PQCVIExamine() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f0fe 100%)', padding: '20px 16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', background: '#fff', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 24px rgba(30,64,175,0.10)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '8px 18px', background: '#1b2a4a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          >
            ← Back to Login
          </button>
          <span style={{ fontSize: '13px', color: '#888' }}>Public Examination — No login required</span>
        </div>
        <PQCVI />
      </div>
    </div>
  );
}

export default PQCVIExamine;
