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

export interface CreateSwapRequestDTO {
  requesterId: string;
  eventId: string;
  requestedSlot: string;
  offeredSlot: string;
}

export const createSwapRequestApi = async ({
  requesterId,
  eventId,
  requestedSlot,
  offeredSlot,
}: CreateSwapRequestDTO) => {
  const res = await api.post(
    `/swaps/request?requesterId=${requesterId}&eventId=${eventId}&requestedSlot=${requestedSlot}&offeredSlot=${offeredSlot}`
  );
  return res.data;
};

export const respondSwapRequestApi = async (payload: { id: string; accept: boolean }) => {
  const status = payload.accept ? "ACCEPTED" : "REJECTED";
  const res = await api.put(`/swaps/${payload.id}/status?status=${status}`);
  return res.data; // ✅ must return data
};

export const getAllSwapRequestsApi = async () => {
  const res = await api.get("/swaps/all");
  return res.data;
};
