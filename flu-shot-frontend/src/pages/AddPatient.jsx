import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicInfo from './forms/BasicInfo';
import VisualAcuity from './forms/VisualAcuity';
import CVIScreening from './forms/CVIScreening';
import CVIRange38 from './forms/CVIRange38';
import CVIRange910 from './forms/CVIRange910';
import ICFFramework from './forms/ICFFramework';
import PQCVI from './forms/PQCVI';
import { createPatient } from '../api/api';

const tabs = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'visual', label: 'Visual Acuity' },
  { id: 'screening', label: 'CVI Screening' },
  { id: 'range38', label: 'CVI Range 3-8' },
  { id: 'range910', label: 'CVI Range 9-10' },
  { id: 'icf', label: 'ICF Framework' },
  { id: 'pqcvi', label: 'PQCVI' },
];

function AddPatient() {
  const [activeTab, setActiveTab] = useState('basic');
  const [patientData, setPatientData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const navigate = useNavigate();

  const tabIds = tabs.map(t => t.id);
  const currentIndex = tabIds.indexOf(activeTab);
  const isLastTab = currentIndex === tabIds.length - 1;

  const goNext = () => {
    if (!isLastTab) setActiveTab(tabIds[currentIndex + 1]);
  };

  const handleBasicChange = (data) => setPatientData(prev => ({ ...prev, ...data }));
  const handleVisualChange = (json) => setPatientData(prev => ({ ...prev, visual_acuity_data: json }));
  const handleScreeningChange = (json) => setPatientData(prev => ({ ...prev, cvi_screening_data: json }));
  const handleRange38Change = (json) => setPatientData(prev => ({ ...prev, cvi_range38_data: json }));
  const handleRange910Change = (json) => setPatientData(prev => ({ ...prev, cvi_range910_data: json }));
  const handleICFChange = (json) => setPatientData(prev => ({ ...prev, icf_framework_data: json }));
  const handlePQCVIChange = (json) => setPatientData(prev => ({ ...prev, pqcvi_data: json }));

  const handleSave = async () => {
    const required = ['name', 'op_no', 'date', 'sex', 'age', 'guardian_name', 'address'];
    for (const field of required) {
      if (!patientData[field]) {
        setSaveMsg(`❌ Please fill Basic Info first (${field.replace(/_/g, ' ')} is required)`);
        setActiveTab('basic');
        return;
      }
    }
    setSaving(true);
    setSaveMsg('');
    try {
      await createPatient(patientData);
      setSaveMsg('✅ Patient saved successfully!');
      setTimeout(() => navigate('/patients'), 1500);
    } catch (err) {
      setSaveMsg('❌ Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'basic': return <BasicInfo onDataChange={handleBasicChange} />;
      case 'visual': return <VisualAcuity onDataChange={handleVisualChange} />;
      case 'screening': return <CVIScreening onDataChange={handleScreeningChange} />;
      case 'range38': return <CVIRange38 onDataChange={handleRange38Change} />;
      case 'range910': return <CVIRange910 onDataChange={handleRange910Change} />;
      case 'icf': return <ICFFramework onDataChange={handleICFChange} />;
      case 'pqcvi': return <PQCVI onDataChange={handlePQCVIChange} />;
      default: return <BasicInfo onDataChange={handleBasicChange} />;
    }
  };

  return (
    <div className="add-patient-page">
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Add New Patient Assessment</h2>
      </div>

      <div className="form-tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`form-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="form-content">{renderForm()}</div>

      {/* Next button for all tabs except last */}
      {!isLastTab && (
        <div className="form-nav-bar">
          <button onClick={goNext} className="next-btn">
            Next: {tabs[currentIndex + 1].label} →
          </button>
        </div>
      )}

      {/* Submit button only on last tab (PQCVI) */}
      {isLastTab && (
        <div className="submit-bar">
          {saveMsg && (
            <span style={{ fontSize: '14px', color: saveMsg.startsWith('✅') ? 'green' : 'red' }}>
              {saveMsg}
            </span>
          )}
          <button onClick={handleSave} disabled={saving} className="submit-btn">
            {saving ? 'Submitting...' : 'Submit Patient Assessment'}
          </button>
        </div>
      )}
    </div>
  );
}

export default AddPatient;
