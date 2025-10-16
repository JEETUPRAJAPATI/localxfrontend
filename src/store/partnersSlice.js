import { createSlice } from '@reduxjs/toolkit';

const partnersSlice = createSlice({
  name: 'partners',
  initialState: null, // Initial state can be null, indicating no sponser data yet
  reducers: {
    setPartners_ACTION: (state, action) => {
      return action.payload; // Return the new state directly
    },
  },
});

export const { setPartners_ACTION } = partnersSlice.actions; // Export actions
export default partnersSlice.reducer; // Export the reducer
