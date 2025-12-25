import { auth } from "../firebase";

const hostname = window.location.hostname;
const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${hostname}:5000`;

async function buildHeaders(customHeaders = {}, includeJson = true) {
  const token = await auth.currentUser?.getIdToken?.();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const baseHeaders = includeJson ? { "Content-Type": "application/json" } : {};
  return {
    ...baseHeaders,
    ...authHeaders,
    ...customHeaders,
  };
}

export async function apiFetch(path, options = {}) {
  const headers = await buildHeaders(options.headers, options.body instanceof FormData ? false : true);
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = body?.error || body || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return body;
}

export { API_BASE };

export async function apiUpload(path, formData) {
  const headers = await buildHeaders({}, false);
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const body = await response.json();
  if (!response.ok) {
    const message = body?.error || "Upload failed";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return body;
}
