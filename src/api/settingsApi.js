import { apiFetch } from "./client";

export const settingsApi = {
    getSettings: () => apiFetch("/api/settings"),
};
