// src/api/eventApi.ts
import api from "./axios"; // ✅ use the interceptor version
import type { AppEvent } from "../Types/Event";

// Fetch events for the current user
export const fetchMyEventsApi = (userId: string) =>
  api.get<AppEvent[]>(`/events/user?userId=${userId}`);

// Create a new event
export const createEventApi = (payload: any) =>
  api.post("/events/create", payload, {
    headers: { "Content-Type": "application/json" }
  });

// Update an event by ID
export const updateEventApi = (id: string, payload: Partial<AppEvent>) =>
  api.put<AppEvent>(`/events/${id}`, payload);

// Make an event swappable
export const makeSwappableApi = (id: string) =>
  api.put<AppEvent>(`/events/${id}/make-swappable`);
