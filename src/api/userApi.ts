// src/api/userApi.ts
import api from "./axios";
export const fetchUserById = (id: string) => api.get(`/users/${id}`);
