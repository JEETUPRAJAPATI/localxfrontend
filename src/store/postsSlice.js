import { createSlice } from '@reduxjs/toolkit';

const postsSlice = createSlice({
  name: 'posts',
  initialState: {},
  reducers: {
    setPostsProps: (state, action) => {
      const { key, data } = action.payload;
      
      // Validate key before processing
      if (!key || typeof key !== 'string') {
        console.warn('Invalid key provided to setPostsProps:', key);
        return;
      }
      
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

export const { setPostsProps } = postsSlice.actions; // Export actions
export default postsSlice.reducer; // Export the reducer
