// src/store/swapSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getSwappableSlotsApi, createSwapRequestApi } from "../api/swapApi";

export const fetchMarketplace = createAsyncThunk("swap/marketplace", async () => {
  const res = await getSwappableSlotsApi();
  return res.data;
});

export const createSwapRequest = createAsyncThunk("swap/createRequest", async (payload: any) => {
  const res = await createSwapRequestApi(payload);
  return res.data;
});

const slice = createSlice({
  name: "swap",
  initialState: { marketplace: [] as any[], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMarketplace.pending, (s) => { s.loading = true; });
    builder.addCase(fetchMarketplace.fulfilled, (s, a) => { s.marketplace = a.payload; s.loading = false; });
    builder.addCase(fetchMarketplace.rejected, (s) => { s.loading = false; });
  },
});

export default slice.reducer;
