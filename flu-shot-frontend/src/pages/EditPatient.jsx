import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BasicInfo from './forms/BasicInfo';
import VisualAcuity from './forms/VisualAcuity';
import CVIScreening from './forms/CVIScreening';
import CVIRange38 from './forms/CVIRange38';
import CVIRange910 from './forms/CVIRange910';
import ICFFramework from './forms/ICFFramework';
import { getPatient, updatePatient } from '../api/api';

const tabs = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'visual', label: 'Visual Acuity' },
  { id: 'screening', label: 'CVI Screening' },
  { id: 'range38', label: 'CVI Range 3-8' },
  { id: 'range910', label: 'CVI Range 9-10' },
  { id: 'icf', label: 'ICF Framework' },
];

const successAnim = `
@keyframes scaleIn {
  0%   { transform: scale(0.4); opacity: 0; }
  70%  { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1);   opacity: 1; }
}
@keyframes checkDraw {
  0%   { stroke-dashoffset: 80; }
  100% { stroke-dashoffset: 0;  }
}
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(-8px); }
  40%     { transform: translateX(8px); }
  60%     { transform: translateX(-6px); }
  80%     { transform: translateX(6px); }
}
`;

const BASIC_FIELDS = [
  'name','op_no','date','sex','age','guardian_name','address',
  'colour_perception','moving_objects','longer_time','gaze_preference',
  'looks_through','attention_span','squint','seizures','stumbling',
  'favourite_things','difficulty_new',
  'fever_rashes','pih','others_antenatal','gestation_weeks',
  'gestation_type','birth_weight','delivery','cry',
  'oxygen_therapy','jaundice','convulsions','hyperglycemia',
  'chorioamnionitis','milestones',
  'consanguinity','nutritional_status','cns','auditory_anomaly',
  'eom','visual_axes','binocular','anterior_segment',
  'posterior_segment','nystagmus','pedigree_image',
];

function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [basicData, setBasicData] = useState({});
  const [patientData, setPatientData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  useEffect(() => {
    getPatient(id)
      .then(data => {
        if (!data) { navigate('/patients'); return; }
        // Separate basic fields from JSON blobs
        const basic = {};
        BASIC_FIELDS.forEach(f => { basic[f] = data[f] || ''; });
        setBasicData(basic);
        setPatientData({
          ...basic,
          visual_acuity_data: data.visual_acuity_data || '',
          cvi_screening_data: data.cvi_screening_data || '',
          cvi_range38_data: data.cvi_range38_data || '',
          cvi_range910_data: data.cvi_range910_data || '',
          icf_framework_data: data.icf_framework_data || '',
          pqcvi_data: data.pqcvi_data || '',
        });
        setLoading(false);
      })
      .catch(() => { navigate('/patients'); });
  }, [id]);

  const tabIds = tabs.map(t => t.id);
  const currentIndex = tabIds.indexOf(activeTab);
  const isLastTab = currentIndex === tabIds.length - 1;

  const goNext = () => { if (!isLastTab) setActiveTab(tabIds[currentIndex + 1]); };

  const handleBasicChange = (data) => {
    setBasicData(data);
    setPatientData(prev => ({ ...prev, ...data }));
  };
  const handleVisualChange   = (json) => setPatientData(prev => ({ ...prev, visual_acuity_data: json }));
  const handleScreeningChange = (json) => setPatientData(prev => ({ ...prev, cvi_screening_data: json }));
  const handleRange38Change  = (json) => setPatientData(prev => ({ ...prev, cvi_range38_data: json }));
  const handleRange910Change = (json) => setPatientData(prev => ({ ...prev, cvi_range910_data: json }));
  const handleICFChange      = (json) => setPatientData(prev => ({ ...prev, icf_framework_data: json }));

  const handleSave = async () => {
    const required = ['name', 'op_no', 'date', 'sex', 'age', 'guardian_name', 'address'];
    const missing = required.filter(f => !patientData[f]);
    if (missing.length > 0) {
      setSaveMsg(`Missing required fields: ${missing.map(f => f.replace(/_/g, ' ')).join(', ')}`);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
      return;
    }
    setSaving(true);
    setSaveMsg('');
    try {
      await updatePatient(id, patientData);
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); navigate('/patients'); }, 2200);
    } catch (err) {
      setSaveMsg('Failed to update: ' + err.message);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', color: '#888' }}>
      Loading patient data...
    </div>
  );

  return (
    <div className="add-patient-page">
      <style>{successAnim}</style>

      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '48px 56px', textAlign: 'center', animation: 'fadeSlideIn 0.4s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'scaleIn 0.5s cubic-bezier(.36,.07,.19,.97)' }}>
              <svg width="46" height="46" viewBox="0 0 52 52" fill="none">
                <polyline points="14,27 22,36 38,18" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="80" strokeDashoffset="0" style={{ animation: 'checkDraw 0.4s 0.3s ease forwards', strokeDashoffset: 80 }} />
              </svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '22px', color: '#1b2a4a', fontWeight: 700 }}>Patient Updated!</h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Redirecting to patients list…</p>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/patients')} style={{ padding: '8px 16px', background: '#e9ecef', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>Edit Patient: <span style={{ color: '#1e40af' }}>{basicData.name}</span></h2>
      </div>

      {saveMsg && (
        <div style={{ margin: '10px 0', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', background: '#fff1f2', color: '#b91c1c', border: '1px solid #fca5a5', animation: shakeError ? 'shake 0.5s ease' : 'none' }}>
          ❌ {saveMsg}
        </div>
      )}

      <div className="form-tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`form-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="form-content">
        <div style={{ display: activeTab === 'basic' ? 'block' : 'none' }}>
          <BasicInfo onDataChange={handleBasicChange} initialData={basicData} />
        </div>
        <div style={{ display: activeTab === 'visual' ? 'block' : 'none' }}>
          <VisualAcuity onDataChange={handleVisualChange} />
        </div>
        <div style={{ display: activeTab === 'screening' ? 'block' : 'none' }}>
          <CVIScreening onDataChange={handleScreeningChange} />
        </div>
        <div style={{ display: activeTab === 'range38' ? 'block' : 'none' }}>
          <CVIRange38 onDataChange={handleRange38Change} />
        </div>
        <div style={{ display: activeTab === 'range910' ? 'block' : 'none' }}>
          <CVIRange910 onDataChange={handleRange910Change} />
        </div>
        <div style={{ display: activeTab === 'icf' ? 'block' : 'none' }}>
          <ICFFramework onDataChange={handleICFChange} />
        </div>
      </div>

      {!isLastTab && (
        <div className="form-nav-bar">
          <button onClick={goNext} className="next-btn">
            Next: {tabs[currentIndex + 1].label} →
          </button>
        </div>
      )}

      {isLastTab && (
        <div className="submit-bar">
          <button onClick={handleSave} disabled={saving} className="submit-btn">
            {saving ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}

export default EditPatient;
