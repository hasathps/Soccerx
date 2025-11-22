import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  isDarkMode: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      AsyncStorage.setItem('isDarkMode', JSON.stringify(state.isDarkMode));
    },
    setTheme: (state, action) => {
      state.isDarkMode = action.payload;
      AsyncStorage.setItem('isDarkMode', JSON.stringify(state.isDarkMode));
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;

