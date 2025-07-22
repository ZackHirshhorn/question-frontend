import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "~/api/axios";
import {
  saveUserId,
  getStoredUserId,
  clearStoredUserId,
} from "utils/localUser";

export interface User { id: string; name: string; email: string; }

interface AuthState {
  userId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  userId: getStoredUserId(),   // ← hydrate from localStorage
  loading: false,              // no spinner on boot
  error: null,
};

/* --- thunks ------------------------------------------------------------ */
export const login = createAsyncThunk<
  string,                                        // we just care about id
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (body, { rejectWithValue }) => {
  try {
    // server responds { id, name, email }
    const { data } = await axiosClient.post<User>("/api/auth/login", body);
    saveUserId(data.id);          // 🔐 persist
    return data.id;               // becomes action.payload
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message ?? "Login failed, try again"
    );
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await axiosClient.post("/api/auth/logout");
  clearStoredUserId();            // 🧹 remove
});

/* --- slice ------------------------------------------------------------- */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(login.pending,  (s) => { s.loading = true;  s.error = null; })
     .addCase(login.fulfilled,(s, a) => {
       s.userId  = a.payload;     // <- id from thunk
       s.loading = false;
     })
     .addCase(login.rejected,  (s, a) => {
       s.loading = false;
       s.error   = a.payload ?? "Unknown error";
     })
     .addCase(logout.fulfilled,(s) => { s.userId = null; });
  },
});

export default authSlice.reducer;
