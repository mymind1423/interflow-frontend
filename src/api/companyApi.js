
import { apiFetch } from "./client";

export const companyApi = {
    getJobs: () => apiFetch("/api/company/jobs"),
    createJob: (job) => apiFetch("/api/company/jobs", { method: "POST", body: JSON.stringify(job) }),
    deleteJob: (id) => apiFetch("/api/company/jobs", { method: "DELETE", body: JSON.stringify({ id }) }),
    updateJob: (job) => apiFetch("/api/company/jobs", { method: "PUT", body: JSON.stringify(job) }),
    getApplications: () => apiFetch("/api/company/applications"),
    updateApplicationStatus: (id, status, interviewData) => apiFetch("/api/company/applications/status", { method: "POST", body: JSON.stringify({ id, status, interviewData }) }),
    getInterviews: () => apiFetch("/api/company/interviews"),

    // Live Interview Manager
    notifyStudent: (interviewId, type) => apiFetch(`/api/company/interviews/${interviewId}/notify`, { method: "POST", body: JSON.stringify({ type }) }),
    updateInterviewStatus: (interviewId, status) => apiFetch(`/api/company/interviews/${interviewId}/status`, { method: "POST", body: JSON.stringify({ status }) }),

    // Previous features
    getStudentProfile: (id) => apiFetch(`/api/company/student-profile/${id}`),
    saveEvaluation: (data) => apiFetch("/api/company/evaluation", { method: "POST", body: JSON.stringify(data) }),
    getEvaluation: (studentId) => apiFetch(`/api/company/evaluation/${studentId}`),
    getProfile: () => apiFetch("/api/profile/get"),
    getTalents: () => apiFetch("/api/company/talents"),
    inviteStudent: (studentId, jobId) => apiFetch("/api/company/invite", { method: "POST", body: JSON.stringify({ studentId, jobId }) }),
    getStudentInterviews: (studentId) => apiFetch(`/api/company/student-interviews/${studentId}`),
};
