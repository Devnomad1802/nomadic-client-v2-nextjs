import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  themeMode: "dark",
  userDbData: null,
  isAuthenticated: false,
  favoriteArray: [],
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    changeTheme: (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.themeMode = action.payload;
    },
    setUserDbData: (state, { payload }) => {
      state.userDbData = payload;
    },
    setFavArray: (state, { payload }) => {
      console.log("gloabla favtrip.....", payload);
      state.favoriteArray = payload;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
});

export const { changeTheme, setUserDbData, setAuthenticated, setFavArray } =
  globalSlice.actions;

export const selectCurrentUser = (state) => state.global.userDbData;
export const selectIsAuthenticated = (state) => state.global.isAuthenticated;
