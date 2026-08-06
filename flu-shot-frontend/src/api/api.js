const BASE_URL = 'http://127.0.0.1:8000';

// ===== AUTH =====

export const loginUser = async (username, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data; // { access_token, token_type }
};

export const registerUser = async (username, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Register failed');
  return data;
};

// ===== PATIENTS =====

export const createPatient = async (patientData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/api/patients/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(patientData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to save patient');
  return data;
};

export const getAllPatients = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/api/patients/`, {
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch patients');
  return data;
};

export const getPatientCount = async () => {
  const res = await fetch(`${BASE_URL}/api/patients/count`);
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to fetch count');
  return data.count;
};

export const deletePatient = async (id) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/api/patients/${id}`, {
    method: 'DELETE',
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to delete patient');
  return data;
};
