// src/api/swapApi.ts
import api from "./axios";

export const getSwappableSlotsApi = () => api.get("/swappable-slots");
export const createSwapRequestApi = (payload: any) => api.post("/swap-request", payload);
export const respondSwapRequestApi = (payload: any) => api.post("/swap-response", payload);
export const getIncomingRequestsApi = () => api.get("/swap/requests/incoming");
export const getOutgoingRequestsApi = () => api.get("/swap/requests/outgoing");
