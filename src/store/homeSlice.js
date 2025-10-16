import { createSlice } from '@reduxjs/toolkit';

const homeSlice = createSlice({
  name: 'home',
  initialState: {},
  reducers: {
    setHomeProps_ACTION: (state, action) => {
      const { key, data } = action.payload; // Destructure the key and data from the payload
      state[key] = data;
    },
  },
});

export const { setHomeProps_ACTION } = homeSlice.actions; // Export actions
export default homeSlice.reducer; // Export the reducer
