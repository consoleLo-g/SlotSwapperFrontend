// src/api/eventApi.ts
import api from "./axios";
import type { AppEvent } from "../Types/Event";

export const fetchMyEventsApi = () => api.get<AppEvent[]>("/events/my-events");
export const createEventApi = (payload: Partial<AppEvent>) => api.post<AppEvent>("/events", payload);
export const updateEventApi = (id: string, payload: Partial<AppEvent>) =>
  api.put<AppEvent>(`/events/${id}`, payload);
export const makeSwappableApi = (id: string) => api.put<AppEvent>(`/events/${id}/make-swappable`);
