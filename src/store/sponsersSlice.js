import { createSlice } from '@reduxjs/toolkit';

const sponsersSlice = createSlice({
  name: 'sponsers',
  initialState: null, // Initial state can be null, indicating no sponser data yet
  reducers: {
    setSponsers_ACTION: (state, action) => {
      return action.payload; // Return the new state directly
    },
  },
});

export const { setSponsers_ACTION } = sponsersSlice.actions; // Export actions
export default sponsersSlice.reducer; // Export the reducer
