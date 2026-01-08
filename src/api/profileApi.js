import { apiFetch, apiUploadWithProgress } from "./client";

export const profileApi = {
  get: () => apiFetch("/api/profile/get"),
  update: (payload) =>
    apiFetch("/api/profile/update", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  uploadAvatar: (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiUploadWithProgress("/api/upload/avatar", formData, onProgress);
  },
  uploadCv: (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiUploadWithProgress("/api/upload/cv", formData, onProgress);
  },
  uploadDiploma: (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiUploadWithProgress("/api/upload/diploma", formData, onProgress);
  },
  uploadLogo: (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiUploadWithProgress("/api/upload/logo", formData, onProgress);
  },
};
