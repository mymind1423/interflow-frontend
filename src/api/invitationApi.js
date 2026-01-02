
import { apiFetch } from "./client";

export const invitationApi = {
    getInvitations: () => apiFetch("/api/student/invitations"),
    accept: (id) => apiFetch("/api/student/invitations/accept", { method: "POST", body: JSON.stringify({ id }) }),
    reject: (id) => apiFetch("/api/student/invitations/reject", { method: "POST", body: JSON.stringify({ id }) }),
};
