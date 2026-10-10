const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Check if JWT token is expired
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Call this before any authenticated request
const getValidToken = () => {
  const token = localStorage.getItem('token');
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
    return null;
  }
  return token;
};

// ===== AUTH =====

export const loginUser = async (username, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data;
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
  const token = getValidToken();
  if (!token) return;
  const res = await fetch(`${BASE_URL}/api/patients/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(patientData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to save patient');
  return data;
};

export const updatePatient = async (id, patientData) => {
  const token = getValidToken();
  if (!token) return;
  const res = await fetch(`${BASE_URL}/api/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(patientData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update patient');
  return data;
};

export const getAllPatients = async () => {
  const token = getValidToken();
  if (!token) return [];
  const res = await fetch(`${BASE_URL}/api/patients/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch patients');
  return data;
};

export const getPatient = async (id) => {
  const token = getValidToken();
  if (!token) return null;
  const res = await fetch(`${BASE_URL}/api/patients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch patient');
  return data;
};

export const getPatientCount = async () => {
  const res = await fetch(`${BASE_URL}/api/patients/count`);
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to fetch count');
  return data.count;
};

export const deletePatient = async (id) => {
  const token = getValidToken();
  if (!token) return;
  const res = await fetch(`${BASE_URL}/api/patients/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to delete patient');
  return data;
};

// ===== PQCVI PUBLIC SUBMIT =====

export const submitPQCVI = async (name, age, gender, answers) => {
  const res = await fetch(`${BASE_URL}/api/pqcvi/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, age: parseFloat(age), gender, answers }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to submit PQCVI');
  return data;
};
