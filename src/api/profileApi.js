import { apiFetch, apiUpload } from "./client";

export const profileApi = {
  get: () => apiFetch("/api/profile/get"),
  update: (payload) =>
    apiFetch("/api/profile/update", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiUpload("/api/upload/avatar", formData);
  },
  uploadCv: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiUpload("/api/upload/cv", formData);
  },
  uploadDiploma: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiUpload("/api/upload/diploma", formData);
  },
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiUpload("/api/upload/logo", formData);
  },
};
