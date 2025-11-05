// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import eventReducer from "./eventSlice";
import swapReducer from "./swapSlice";
import requestReducer from "./requestSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    swap: swapReducer,
    requests: requestReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
