import { apiFetch } from "./client";

export const authApi = {
  getUserInfo: () => apiFetch("/api/userinfo"),
  profileExists: () => apiFetch("/api/profile/exist"),
  pendingStatus: () => apiFetch("/api/profile/pending"),
};
