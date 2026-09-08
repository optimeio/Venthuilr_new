const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('venthulir_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.msg || `HTTP ${res.status}`);
  }
  return res.json();
};

export const api = {
  get:    (path) => fetch(`${API_BASE}${path}`, { headers: getHeaders() }).then(handleResponse),
  post:   (path, data) => fetch(`${API_BASE}${path}`, { method: 'POST',   headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  put:    (path, data) => fetch(`${API_BASE}${path}`, { method: 'PUT',    headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  delete: (path)       => fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
};

export default api;
