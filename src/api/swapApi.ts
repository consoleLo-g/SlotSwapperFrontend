import api from "./axios";

export const getAllEventsApi = async () => {
  const res = await api.get("/events/all");
  return res.data;
};

export const getUserEventsApi = async (userId: string) => {
  const res = await api.get(`/events/user?userId=${userId}`);
  return res.data;
};

export const makeEventSwappableApi = (id: string) =>
  api.put(`/events/${id}/make-swappable`);

export const createSwapRequestApi = (payload: {
  requesterId: string;
  eventId: string;
  requestedSlot: string;
  offeredSlot: string;
}) => api.post("/swaps/request", payload);

export const respondSwapRequestApi = (payload: { id: string; accept: boolean }) =>
  api.put(`/swaps/${payload.id}/status?status=${payload.accept ? "ACCEPTED" : "REJECTED"}`);

export const getAllSwapRequestsApi = async () => {
  const res = await api.get("/swaps/all");
  return res.data;
};
