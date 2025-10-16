import { createSlice } from '@reduxjs/toolkit';

const topSideNavLinksSlice = createSlice({
  name: 'topSideNavLinks',
  initialState: null, // Initial state can be null, indicating no sponser data yet
  reducers: {
    setTopSideNavLinks: (state, action) => {
      return action.payload; // Return the new state directly
    },
  },
});

export const { setTopSideNavLinks } = topSideNavLinksSlice.actions; // Export actions
export default topSideNavLinksSlice.reducer; // Export the reducer
