import { apiFetch } from "./client";

export const studentApi = {
    getStats: () => apiFetch("/api/student/stats"),
    getCompanies: () => apiFetch("/api/student/companies"),
    getRecentJobs: () => apiFetch("/api/student/jobs"),
    apply: (jobId) => apiFetch("/api/student/apply", { method: "POST", body: JSON.stringify({ jobId }) }),
    getApplications: () => apiFetch("/api/student/applications"),
    getCompanyJobs: (companyId) => apiFetch(`/api/student/companies/${companyId}/jobs`),
    saveJob: (jobId) => apiFetch("/api/student/save-job", { method: "POST", body: JSON.stringify({ jobId }) }),
    getSavedJobs: () => apiFetch("/api/student/saved-jobs"),
    getInterviews: () => apiFetch("/api/student/interviews"),
    deleteApplication: (id) => apiFetch("/api/student/applications/delete", { method: "POST", body: JSON.stringify({ id }) }),
};
