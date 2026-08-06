import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPatients, deletePatient } from '../api/api';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);

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
        <Link to="/add-patient" className="add-patient-btn">+ Add Patient</Link>
      </div>

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
