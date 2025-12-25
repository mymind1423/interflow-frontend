import { apiFetch, apiUpload } from "./client";

export const signupApi = {
  verifyEmail: (email) => apiFetch(`/api/verify/email?email=${encodeURIComponent(email)}`),
  verifyPhone: (phone) => apiFetch(`/api/verify/phone?phone=${encodeURIComponent(phone)}`),
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
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiUpload("/api/upload/avatar", formData);
  },
  signupStudent: (payload) =>
    apiFetch("/api/signup/student", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  signupCompany: (payload) =>
    apiFetch("/api/signup/company", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
