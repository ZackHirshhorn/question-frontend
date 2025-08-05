import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
}

const storedUser = localStorage.getItem('user');
let user = null;
if (storedUser && storedUser !== 'undefined') {
  try {
    user = JSON.parse(storedUser);
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
    user = null;
  }
}

const initialState: UserState = {
  user,
  isAuthenticated: !!user,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ user: User }>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('user');
    },
  },
});

export const { loginSuccess, logout } = userSlice.actions;
export default userSlice.reducer;

