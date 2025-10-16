import { createSlice } from '@reduxjs/toolkit';

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {},
  reducers: {
    setCategoriesProps: (state, action) => {
      const { key, data } = action.payload; // Destructure the key and data from the payload
      state[key] = data;
    },
  },
});

export const { setCategoriesProps } = categoriesSlice.actions; // Export actions
export default categoriesSlice.reducer; // Export the reducer
