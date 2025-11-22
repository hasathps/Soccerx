import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  user: null,
  isAuthenticated: false,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      try {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        AsyncStorage.setItem('user', JSON.stringify(action.payload.user)).catch(() => {});
        AsyncStorage.setItem('token', action.payload.token).catch(() => {});
      } catch (error) {
        // Error handling
      }
    },
    logout: (state) => {
      try {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        AsyncStorage.removeItem('user').catch(() => {});
        AsyncStorage.removeItem('token').catch(() => {});
      } catch (error) {
        // Error handling
      }
    },
    restoreUser: (state, action) => {
      try {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      } catch (error) {
        // Error handling
      }
    },
  },
});

export const { login, logout, restoreUser } = authSlice.actions;
export default authSlice.reducer;
