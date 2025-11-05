// src/store/requestSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getIncomingRequestsApi, getOutgoingRequestsApi, respondSwapRequestApi } from "../api/swapApi";

export const fetchIncoming = createAsyncThunk("requests/incoming", async () => {
  const res = await getIncomingRequestsApi();
  return res.data;
});
export const fetchOutgoing = createAsyncThunk("requests/outgoing", async () => {
  const res = await getOutgoingRequestsApi();
  return res.data;
});
export const respondRequest = createAsyncThunk("requests/respond", async (payload: any) => {
  const res = await respondSwapRequestApi(payload);
  return res.data;
});

const slice = createSlice({
  name: "requests",
  initialState: { incoming: [] as any[], outgoing: [] as any[], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchIncoming.fulfilled, (s, a) => { s.incoming = a.payload; });
    builder.addCase(fetchOutgoing.fulfilled, (s, a) => { s.outgoing = a.payload; });
    builder.addCase(respondRequest.fulfilled, (s) => {
      // after response we'll refresh lists in pages
    });
  },
});

export default slice.reducer;
