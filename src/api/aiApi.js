import { apiFetch } from "./client";

export const aiApi = {
    analyzeProfile: () => apiFetch("/api/ai/analyze-profile", { method: "POST" }),
    generatePitch: (jobDescription, studentId) => apiFetch("/api/ai/pitch", {
        method: "POST",
        body: JSON.stringify({ jobDescription, studentId })
    }),
};
