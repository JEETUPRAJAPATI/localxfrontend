import { createSlice } from '@reduxjs/toolkit';

const pageSlice = createSlice({
  name: 'page',
  initialState: {},
  reducers: {
    setPageProps_ACTION: (state, action) => {
      const { key, data } = action.payload; // Destructure the key and data from the payload
      state[key] = data;
    },
  },
});

export const { setPageProps_ACTION } = pageSlice.actions; // Export actions
export default pageSlice.reducer; // Export the reducer
