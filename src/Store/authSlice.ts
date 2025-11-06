// src/store/authSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginApi, registerApi, meApi } from "../api/authApi";
import type { AuthState } from "../Types/Auth";

const initialState: AuthState = { 
  token: localStorage.getItem("token"), 
  user: null 
};

// ✅ Login thunk
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    const res = await loginApi(email, password);
    return res.data; // backend returns the JWT string directly
  }
);

// ✅ Register thunk
export const register = createAsyncThunk(
  "auth/register",
  async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const res = await registerApi(name, email, password);
    return res.data;
  }
);

// ✅ Fetch current user
export const fetchMe = createAsyncThunk("auth/me", async () => {
  const res = await meApi();
  return res.data;
});

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      state.token = null;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      const {token, userId} = action.payload; // ✅ action.payload is just the JWT string
      state.token = token;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      state.user = null; // fetchMe can be called separately to populate user info
    });
    builder.addCase(register.fulfilled, (state) => {
      // registration successful, login separately if needed
    });
    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { logout } = slice.actions;
export default slice.reducer;
