import { createSlice } from '@reduxjs/toolkit';

const postSlice = createSlice({
  name: 'post',
  initialState: {},
  reducers: {
    setPostProps: (state, action) => {
      const { key, data } = action.payload;
      // Split the key by '.' to handle nested properties
      const keys = key.split('.');
      let current = state;
      keys.forEach((k, index) => {
        if (index === keys.length - 1) {
          current[k] = data; // Set the data at the last key
        } else {
          if (!current[k]) {
            current[k] = {}; // Create nested object if it doesn't exist
          }
          current = current[k]; // Move deeper into the state
        }
      });
    },
  },
});

export const { setPostProps } = postSlice.actions; // Export actions
export default postSlice.reducer; // Export the reducer
