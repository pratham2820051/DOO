import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllPatients, deletePatient, extractPatientFromPDF, createPatient } from '../api/api';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // OCR state
  const [showOCR, setShowOCR] = useState(false);
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [ocrError, setOcrError] = useState('');
  const [ocrSaving, setOcrSaving] = useState(false);
  const [ocrSaveMsg, setOcrSaveMsg] = useState('');

  const fetchPatients = () => {
    setLoading(true);
    getAllPatients()
      .then(data => { setPatients(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deletePatient(confirmId);
      setConfirmId(null);
      fetchPatients();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleOCRUpload = async () => {
    if (!ocrFile) { setOcrError('Please select a PDF file'); return; }
    setOcrLoading(true);
    setOcrError('');
    setOcrResult(null);
    setOcrSaveMsg('');
    try {
      const res = await extractPatientFromPDF(ocrFile);
      
      // Debug logging
      console.log('OCR Response:', res);
      console.log('Extracted Data:', res.data);
      if (res.debug_extraction) {
        console.log('Debug Info:', res.debug_extraction);
      }
      
      // Create PDF blob URL
      const pdfUrl = URL.createObjectURL(ocrFile);
      
      if (res.requires_manual_entry) {
        // OCR not available, manual entry only
        console.log('Manual entry mode - no OCR data');
        navigate('/add-patient', { state: { pdfUrl, pdfName: ocrFile.name } });
      } else {
        // OCR extracted data successfully
        console.log('Navigating with extracted data:', res.data);
        navigate('/add-patient', { 
          state: { 
            pdfUrl, 
            pdfName: ocrFile.name,
            extractedData: res.data,
            ocrMessage: res.message 
          } 
        });
      }
    } catch (err) {
      setOcrError('Upload failed: ' + err.message);
      console.error('OCR Error:', err);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleOCRSave = async () => {
    if (!ocrResult) return;
    setOcrSaving(true);
    setOcrSaveMsg('');
    try {
      await createPatient(ocrResult);
      setOcrSaveMsg('✅ Patient saved successfully!');
      fetchPatients();
      setTimeout(() => { setShowOCR(false); setOcrFile(null); setOcrResult(null); setOcrSaveMsg(''); }, 1800);
    } catch (err) {
      setOcrSaveMsg('❌ Failed to save: ' + err.message);
    } finally {
      setOcrSaving(false);
    }
  };

  return (
    <div className="patients-page">
      {/* Confirm Delete Modal */}
      {confirmId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon">🗑️</div>
            <h3>Delete Patient?</h3>
            <p>Are you sure you want to delete <strong>"{confirmName}"</strong>?<br />This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setConfirmId(null)} disabled={deleting}>Cancel</button>
              <button className="modal-btn delete" onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="patients-header">
        <h2>All Patients</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { setShowOCR(true); setOcrFile(null); setOcrResult(null); setOcrError(''); setOcrSaveMsg(''); }}
            style={{ padding: '10px 18px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          >
            📄 Import from PDF
          </button>
          <Link to="/add-patient" className="add-patient-btn">+ Add Patient</Link>
        </div>
      </div>

      {/* ===== OCR MODAL ===== */}
      {showOCR && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '580px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1b2a4a', fontSize: '18px' }}>📄 Import Patient from Scanned PDF</h3>
              <button onClick={() => setShowOCR(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888' }}>✕</button>
            </div>

            <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px', lineHeight: 1.6 }}>
              Upload a scanned CVI Clinic Proforma PDF. The system will verify the PDF is readable, then guide you to enter the patient data manually while viewing the form.
            </p>

            {/* File picker */}
            <div style={{ border: '2px dashed #c4b5fd', borderRadius: '10px', padding: '24px', textAlign: 'center', marginBottom: '16px', background: '#faf5ff', cursor: 'pointer' }}
              onClick={() => document.getElementById('ocrFileInput').click()}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📂</div>
              <p style={{ margin: 0, fontWeight: 600, color: '#7c3aed' }}>
                {ocrFile ? ocrFile.name : 'Click to select PDF'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>Scanned CVI Proforma, max 20MB</p>
              <input id="ocrFileInput" type="file" accept=".pdf" style={{ display: 'none' }}
                onChange={e => { setOcrFile(e.target.files[0]); setOcrResult(null); setOcrError(''); }} />
            </div>

            {ocrError && (
              <div style={{ background: '#fff1f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                ❌ {ocrError}
              </div>
            )}

            <button onClick={handleOCRUpload} disabled={ocrLoading || !ocrFile}
              style={{ width: '100%', padding: '12px', background: ocrLoading ? '#a78bfa' : '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: ocrLoading ? 'not-allowed' : 'pointer', marginBottom: '16px' }}>
              {ocrLoading ? '📄 Verifying PDF...' : '✅ Upload & Continue to Form'}
            </button>

            {/* Extracted data preview */}
            {ocrResult && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 12px', color: '#15803d', fontSize: '14px' }}>✅ Extracted Data — Review before saving:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: '13px' }}>
                  {[
                    ['Name', ocrResult.name],
                    ['OP No', ocrResult.op_no],
                    ['Date', ocrResult.date],
                    ['Sex', ocrResult.sex],
                    ['Age', ocrResult.age],
                    ['Guardian', ocrResult.guardian_name],
                    ['Address', ocrResult.address],
                    ['Consanguinity', ocrResult.consanguinity === '1' ? 'Present' : ocrResult.consanguinity === '0' ? 'Absent' : '-'],
                    ['CNS', ocrResult.cns || '-'],
                    ['Nystagmus', ocrResult.nystagmus === '1' ? 'Present' : ocrResult.nystagmus === '0' ? 'Absent' : '-'],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <span style={{ color: '#666', fontSize: '11px', display: 'block' }}>{label}</span>
                      <span style={{ fontWeight: 600, color: '#1b2a4a' }}>{val || '-'}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: '#666', margin: '10px 0 0' }}>
                  ℹ️ You can edit this data later using the Edit button.
                </p>
              </div>
            )}

            {ocrSaveMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '12px', background: ocrSaveMsg.startsWith('✅') ? '#f0fdf4' : '#fff1f2', color: ocrSaveMsg.startsWith('✅') ? '#15803d' : '#b91c1c', border: `1px solid ${ocrSaveMsg.startsWith('✅') ? '#86efac' : '#fca5a5'}` }}>
                {ocrSaveMsg}
              </div>
            )}

            {ocrResult && !ocrSaveMsg && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => navigate(`/add-patient`)} style={{ flex: 1, padding: '10px', background: '#e9ecef', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#333' }}>
                  ✏️ Edit Before Saving
                </button>
                <button onClick={handleOCRSave} disabled={ocrSaving}
                  style={{ flex: 1, padding: '10px', background: '#1b2a4a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                  {ocrSaving ? 'Saving...' : '💾 Save to Database'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

      <div className="patients-table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Age</th>
              <th>Sex</th>
              <th>OP No</th>
              <th>Date</th>
              <th>Guardian</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>Loading...</td></tr>
            ) : patients.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No patients added yet. Click "+ Add Patient" to begin.</td></tr>
            ) : (
              patients.map((p, index) => (
                <tr key={p.id}>
                  <td>{index + 1}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.age}</td>
                  <td>{p.sex}</td>
                  <td>{p.op_no}</td>
                  <td>{p.date}</td>
                  <td>{p.guardian_name}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Link
                        to={`/patient/${p.id}/edit`}
                        style={{ padding: '5px 12px', background: '#1e40af', color: '#fff', borderRadius: '4px', fontSize: '13px', textDecoration: 'none' }}
                      >
                        ✏️ Edit
                      </Link>
                      <Link
                        to={`/patient/${p.id}/print`}
                        style={{ padding: '5px 12px', background: '#1b2a4a', color: '#fff', borderRadius: '4px', fontSize: '13px', textDecoration: 'none' }}
                      >
                        🖨 Print PDF
                      </Link>
                      <button
                        onClick={() => { setConfirmId(p.id); setConfirmName(p.name); }}
                        style={{ padding: '5px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Patients;
