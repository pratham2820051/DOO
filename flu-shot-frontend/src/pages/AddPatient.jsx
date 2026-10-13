import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BasicInfo from './forms/BasicInfo';
import VisualAcuity from './forms/VisualAcuity';
import CVIScreening from './forms/CVIScreening';
import CVIRange38 from './forms/CVIRange38';
import CVIRange910 from './forms/CVIRange910';
import ICFFramework from './forms/ICFFramework';
import { createPatient } from '../api/api';

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

function AddPatient() {
  const [activeTab, setActiveTab] = useState('basic');
  const [basicData, setBasicData] = useState({
    name: '', op_no: '', date: '', sex: '', age: '', guardian_name: '', address: '',
    colour_perception: '', moving_objects: '', longer_time: '', gaze_preference: '',
    looks_through: '', attention_span: '', squint: '', seizures: '', stumbling: '',
    favourite_things: '', difficulty_new: '',
    fever_rashes: '', pih: '', others_antenatal: '', gestation_weeks: '',
    gestation_type: '', birth_weight: '', delivery: '', cry: '',
    oxygen_therapy: '', jaundice: '', convulsions: '', hyperglycemia: '',
    chorioamnionitis: '', milestones: '',
    consanguinity: '', nutritional_status: '', cns: '', auditory_anomaly: '',
    eom: '', visual_axes: '', binocular: '', anterior_segment: '',
    posterior_segment: '', nystagmus: '', pedigree_image: '',
  });
  const [patientData, setPatientData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // PDF viewer state
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [showPdf, setShowPdf] = useState(false);
  const [ocrMessage, setOcrMessage] = useState('');

  useEffect(() => {
    // Check if PDF was passed from Patients page
    if (location.state?.pdfUrl) {
      console.log('AddPatient - Location state:', location.state);
      setPdfUrl(location.state.pdfUrl);
      setPdfName(location.state.pdfName || 'Patient Form');
      setShowPdf(true);
      
      // If OCR extracted data, pre-fill the form
      if (location.state?.extractedData) {
        const extracted = location.state.extractedData;
        console.log('AddPatient - Received extracted data:', extracted);
        setBasicData(prev => {
          const updated = { ...prev, ...extracted };
          console.log('AddPatient - Updated basicData:', updated);
          return updated;
        });
        setPatientData(prev => ({ ...prev, ...extracted }));
        setOcrMessage(location.state.ocrMessage || '');
      } else {
        console.log('AddPatient - No extracted data in location.state');
      }
    }
  }, [location]);

  const tabIds = tabs.map(t => t.id);
  const currentIndex = tabIds.indexOf(activeTab);
  const isLastTab = currentIndex === tabIds.length - 1;

  const goNext = () => {
    if (!isLastTab) setActiveTab(tabIds[currentIndex + 1]);
  };

  const handleBasicChange = (data) => {
    setBasicData(data);
    setPatientData(prev => ({ ...prev, ...data }));
  };
  const handleVisualChange = (json) => setPatientData(prev => ({ ...prev, visual_acuity_data: json }));
  const handleScreeningChange = (json) => setPatientData(prev => ({ ...prev, cvi_screening_data: json }));
  const handleRange38Change = (json) => setPatientData(prev => ({ ...prev, cvi_range38_data: json }));
  const handleRange910Change = (json) => setPatientData(prev => ({ ...prev, cvi_range910_data: json }));
  const handleICFChange = (json) => setPatientData(prev => ({ ...prev, icf_framework_data: json }));

  const handleSave = async () => {
    const required = ['name', 'op_no', 'date', 'sex', 'age', 'guardian_name', 'address'];
    const missing = required.filter(field => !patientData[field]);
    if (missing.length > 0) {
      setSaveMsg(`Missing required fields: ${missing.map(f => f.replace(/_/g, ' ')).join(', ')}`);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
      return;
    }
    setSaving(true);
    setSaveMsg('');
    try {
      await createPatient(patientData);
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); navigate('/patients'); }, 2200);
    } catch (err) {
      setSaveMsg('Failed to save: ' + err.message);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-patient-page" style={{ display: 'flex', gap: '20px' }}>
      <style>{successAnim}</style>

      {/* ===== PDF VIEWER SIDEBAR ===== */}
      {pdfUrl && (
        <div style={{
          width: showPdf ? '45%' : '0',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          borderRight: showPdf ? '2px solid #e5e7eb' : 'none',
          paddingRight: showPdf ? '20px' : '0',
        }}>
          <div style={{ position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#1b2a4a' }}>📄 {pdfName}</h3>
              <button
                onClick={() => setShowPdf(!showPdf)}
                style={{
                  background: '#f3f4f6', border: 'none', padding: '6px 12px',
                  borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600,
                }}
              >
                {showPdf ? '← Hide' : 'Show PDF'}
              </button>
            </div>
            <div style={{
              border: '2px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden',
              background: '#f9fafb', height: 'calc(100vh - 140px)',
            }}>
              <iframe
                src={pdfUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Patient Form PDF"
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN FORM AREA ===== */}
      <div style={{ flex: 1 }}>
      <style>{successAnim}</style>

      {/* ===== SUCCESS OVERLAY ===== */}
      {showSuccess && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '48px 56px',
            textAlign: 'center', animation: 'fadeSlideIn 0.4s ease',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#22c55e,#16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', animation: 'scaleIn 0.5s cubic-bezier(.36,.07,.19,.97)',
            }}>
              <svg width="46" height="46" viewBox="0 0 52 52" fill="none">
                <polyline points="14,27 22,36 38,18"
                  stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="80" strokeDashoffset="0"
                  style={{ animation: 'checkDraw 0.4s 0.3s ease forwards', strokeDashoffset: 80 }}
                />
              </svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '22px', color: '#1b2a4a', fontWeight: 700 }}>
              Patient Saved!
            </h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              Redirecting to patients list…
            </p>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Add New Patient Assessment</h2>
      </div>

      {/* OCR success message */}
      {ocrMessage && (
        <div style={{
          margin: '10px 0', padding: '12px 16px', borderRadius: '8px',
          fontSize: '14px', fontWeight: '600',
          background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac',
        }}>
          ✅ {ocrMessage}
        </div>
      )}

      {/* Error banner with shake */}
      {saveMsg && (
        <div style={{
          margin: '10px 0', padding: '12px 16px', borderRadius: '8px',
          fontSize: '14px', fontWeight: '600',
          background: '#fff1f2', color: '#b91c1c', border: '1px solid #fca5a5',
          animation: shakeError ? 'shake 0.5s ease' : 'none',
        }}>
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

      {/* Render all forms, only show active one — prevents remount/data loss */}
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

      {/* Next button for all tabs except last */}
      {!isLastTab && (
        <div className="form-nav-bar">
          <button onClick={goNext} className="next-btn">
            Next: {tabs[currentIndex + 1].label} →
          </button>
        </div>
      )}

      {/* Submit button only on last tab */}
      {isLastTab && (
        <div className="submit-bar">
          <button onClick={handleSave} disabled={saving} className="submit-btn">
            {saving ? '⏳ Submitting...' : 'Submit Patient Assessment'}
          </button>
        </div>
      )}
      </div> {/* Close main form area */}
    </div>
  );
}

export default AddPatient;
