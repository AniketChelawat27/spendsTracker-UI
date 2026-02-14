/**
 * Returns the full API URL for the given path.
 * When VITE_API_URL is set (production), uses the backend base URL.
 * When not set (dev), returns the relative path for Vite proxy.
 */
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  if (!API_BASE) return path.startsWith('/') ? path : `/${path}`;
  const clean = path.replace(/^\/?api\/?/, '');
  return `${API_BASE}/${clean}`;
}
