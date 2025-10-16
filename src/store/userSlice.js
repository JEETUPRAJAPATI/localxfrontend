// userSlice.js

import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'users',
  initialState: [],
  reducers: {
    addUser: (state, action) => {
      state.push(action.payload);
    },
    removeUser: (state, action) => {
      return state.filter((user) => user.id !== action.payload.id);
    },
    // More reducers can go here
  },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
