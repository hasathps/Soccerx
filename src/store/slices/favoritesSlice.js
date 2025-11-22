import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  favorites: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavorite: (state, action) => {
      try {
        const item = action.payload;
        const itemId = item.idEvent || item.id;
        const exists = state.favorites.find((fav) => 
          (fav.idEvent || fav.id) === itemId
        );
        if (!exists) {
          state.favorites.push(item);
          AsyncStorage.setItem('favorites', JSON.stringify(state.favorites)).catch(() => {});
        }
      } catch (error) {
        // Error handling
      }
    },
    removeFavorite: (state, action) => {
      try {
        const itemId = action.payload;
        state.favorites = state.favorites.filter(
          (fav) => (fav.idEvent || fav.id) !== itemId
        );
        AsyncStorage.setItem('favorites', JSON.stringify(state.favorites)).catch(() => {});
      } catch (error) {
        // Error handling
      }
    },
    loadFavorites: (state, action) => {
      try {
        const favorites = action.payload;
        state.favorites = favorites || [];
      } catch (error) {
        // Error handling
      }
    },
  },
});

export const { addFavorite, removeFavorite, loadFavorites } =
  favoritesSlice.actions;
export default favoritesSlice.reducer;
