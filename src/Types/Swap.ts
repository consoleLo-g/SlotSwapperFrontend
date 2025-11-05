// src/types/Swap.ts
export interface SwapRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  offeredEventId: string;
  requestedEventId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}
