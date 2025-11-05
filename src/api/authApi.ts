// src/api/authApi.ts
import api from "./axios";

export const loginApi = (email: string, password: string) =>
  api.post("/auth/login", { email, password });

export const registerApi = (name: string, email: string, password: string) =>
  api.post("/auth/register", { name, email, password });

export const meApi = () => api.get("/auth/me");
