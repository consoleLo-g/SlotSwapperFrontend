// src/types/Event.ts
export type EventStatus = "BUSY" | "SWAPPABLE" | "CONFIRMED";

export interface AppEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO string
  end: string;   // ISO string
  status: EventStatus;
  ownerId?: string;
}
