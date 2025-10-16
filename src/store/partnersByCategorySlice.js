import { createSlice } from '@reduxjs/toolkit';

const partnersByCategorySlice = createSlice({
  name: 'partnersByCategory',
  initialState: {},
  reducers: {
    setPartnersByCategoryProps: (state, action) => {
      const { key, data } = action.payload; // Destructure the key and data from the payload
      state[key] = data;
    },
  },
});

export const { setPartnersByCategoryProps } = partnersByCategorySlice.actions; // Export actions
export default partnersByCategorySlice.reducer; // Export the reducer
