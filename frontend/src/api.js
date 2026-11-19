import { API_URL } from './config';

// Función única para hablar con el backend
export async function api(ruta, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_URL}${ruta}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Ocurrió un error. Intenta de nuevo.');
    error.status = res.status;
    throw error;
  }
  return data;
}
