// src/api/authApi.ts
import axios from "axios";
import api from "./axios";

export function loginApi(email: string, password: string) {
  return axios.post(
    `${import.meta.env.VITE_API_URL}/auth/login`,
    { email, password }, // ✅ send JSON
    {
      headers: {
        "Content-Type": "application/json", // ✅ match backend
      },
      withCredentials: true,
    }
  );
}

export function registerApi(name: string, email: string, password: string) {
  return api.post("/auth/register", null, {
    params: { name, email, password },
  });
}

export const meApi = () => api.get("/auth/me");
