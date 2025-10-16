import { createSlice } from '@reduxjs/toolkit';

const headSeoSlice = createSlice({
  name: 'headSeo',
  initialState: null, // Initial state can be null, indicating no sponser data yet
  reducers: {
    setHeadSeo_ACTION: (state, action) => {
      return action.payload; // Return the new state directly
    },
  },
});

export const { setHeadSeo_ACTION } = headSeoSlice.actions; // Export actions
export default headSeoSlice.reducer; // Export the reducer
