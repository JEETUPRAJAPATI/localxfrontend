import { createSlice } from '@reduxjs/toolkit';

const friendsSlice = createSlice({
  name: 'friends',
  initialState: {},
  reducers: {
    setFriendsProps: (state, action) => {
      const { key, data } = action.payload; // Destructure the key and data from the payload
      state[key] = data;
    },
  },
});

export const { setFriendsProps } = friendsSlice.actions; // Export actions
export default friendsSlice.reducer; // Export the reducer
