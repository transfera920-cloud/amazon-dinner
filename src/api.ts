const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `請求失敗 (${res.status})`) as Error & { code?: string; details?: any };
    err.code = data.code;
    err.details = data.details;
    throw err;
  }
  return data;
}

export const api = {
  getCategories: () => request('/categories'),
  getDriveTimeOptions: () => request('/drive-time-options'),
  getSiteText: () => request('/site-text'),
  search: (payload: { trailhead: string; keyword: string; maxMinutes: number }) =>
    request('/search', { method: 'POST', body: JSON.stringify(payload) }),

  authStatus: () => request('/auth/status'),
  authSetup: (payload: { username: string; password: string }) =>
    request('/auth/setup', { method: 'POST', body: JSON.stringify(payload) }),
  authLogin: (payload: { username: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  adminGetCategories: () => request('/categories/admin'),
  adminCreateCategory: (payload: any) =>
    request('/categories/admin', { method: 'POST', body: JSON.stringify(payload) }),
  adminUpdateCategory: (id: string | number, payload: any) =>
    request(`/categories/admin/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  adminDeleteCategory: (id: string | number) => request(`/categories/admin/${id}`, { method: 'DELETE' }),

  adminGetDriveTimeOptions: () => request('/drive-time-options/admin'),
  adminCreateDriveTimeOption: (payload: any) =>
    request('/drive-time-options/admin', { method: 'POST', body: JSON.stringify(payload) }),
  adminUpdateDriveTimeOption: (id: string | number, payload: any) =>
    request(`/drive-time-options/admin/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  adminDeleteDriveTimeOption: (id: string | number) =>
    request(`/drive-time-options/admin/${id}`, { method: 'DELETE' }),

  adminUpdateSiteText: (payload: Record<string, string>) =>
    request('/site-text/admin', { method: 'PUT', body: JSON.stringify(payload) }),
};
