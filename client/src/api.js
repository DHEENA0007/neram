async function apiFetch(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === 'object' && data && 'error' in data
        ? data.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

// ── Auth ──────────────────────────────────────────
export function login(username, password) {
  return apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
}
export function logout() {
  return apiFetch('/api/auth/logout', { method: 'POST' });
}
export function me() {
  return apiFetch('/api/auth/me');
}

// ── Places ────────────────────────────────────────
export function searchPlaces(query) {
  const url = new URL('/api/places', window.location.origin);
  url.searchParams.set('q', query);
  return apiFetch(url.pathname + url.search);
}

// ── Prediction ────────────────────────────────────
export function requestPrediction(payload) {
  return apiFetch('/api/prediction', { method: 'POST', body: JSON.stringify(payload) });
}

// ── Admin: Users ──────────────────────────────────
export function loadAdminUsers() {
  return apiFetch('/api/admin/users');
}
export function createAdminUser(payload) {
  return apiFetch('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) });
}
export function updateAdminUser(id, payload) {
  return apiFetch(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

// ── Admin: Palangal ───────────────────────────────
export async function loadPalangal() {
  return apiFetch('/api/admin/palangal');
}

export async function createPalangal(data) {
  return apiFetch('/api/admin/palangal', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function savePalangal(id, data) {
  const body = typeof data === 'string' ? { text: data } : data;
  return apiFetch(`/api/admin/palangal/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deletePalangal(id) {
  return apiFetch(`/api/admin/palangal/${id}`, {
    method: 'DELETE',
  });
}

// ── Admin: Profile ────────────────────────────────
export function updateAdminProfile(payload) {
  return apiFetch('/api/admin/profile', { method: 'PUT', body: JSON.stringify(payload) });
}

// ── Admin: Ollama Models ───────────────────────────
export function loadOllamaModels() {
  return apiFetch('/api/admin/ollama/models');
}

export function deleteOllamaModel(name) {
  return apiFetch(`/api/admin/ollama/models/${encodeURIComponent(name)}`, { method: 'DELETE' });
}

export async function pullOllamaModel(name, onProgress) {
  const response = await fetch('/api/admin/ollama/pull', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split('\n').filter(Boolean);
    for (const line of lines) {
      try { onProgress(JSON.parse(line)); } catch { /* ignore */ }
    }
  }
}
