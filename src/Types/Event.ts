// src/types/Event.ts
export type EventStatus = "BUSY" | "SWAPPABLE" | "CONFIRMED";

export interface AppEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  swappable: boolean;

  // Used for rendering
  start: string;
  end: string;

  // Original backend fields
  date: string;
  startTime: string;
  endTime: string;
   status?: string;
  ownerId?: string;
}

