import { apiFetch } from "./client";

export const notificationApi = {
    getAll: () => apiFetch("/api/notifications"),
    markRead: (id) => apiFetch(`/api/notifications/${id}/read`, { method: "PUT" }),
    markAllRead: () => apiFetch("/api/notifications/read-all", { method: "PUT" }),
    delete: (id) => apiFetch(`/api/notifications/${id}`, { method: "DELETE" })
};
