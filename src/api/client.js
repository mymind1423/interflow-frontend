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

import axios from "axios";

export async function apiUploadWithProgress(path, formData, onProgress) {
  const token = await auth.currentUser?.getIdToken?.();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // axios sets Content-Type to multipart/form-data automatically with correct boundary
  };

  try {
    const response = await axios.post(`${API_BASE}${path}`, formData, {
      headers,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || "Upload failed";
    const err = new Error(message);
    err.status = error.response?.status;
    throw err;
  }
}
