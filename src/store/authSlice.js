import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {},
  reducers: {
    setAuthProps: (state, action) => {
      const { key, data, type } = action.payload;

      // Split the key by '.' to handle nested properties
      const keys = key.split('.');
      let current = state;

      keys.forEach((k, index) => {
        if (index === keys.length - 1) {
          // Handle different types of updates
          switch (type) {
            case 'update_read_notification': {
              if (key === 'user.notifications.list') {
                const notificationId = data;
                current[k] = current[k].map((item) =>
                  item.id === notificationId ? { ...item, read_yn: 'Y' } : item,
                );
              }
              break;
            }

            case 'update_profile_notification_count': {
              if (key === 'user.profile') {
                current[k] = {
                  ...current[k],
                  totalUnreadNotificationCount: data,
                };
              }
              break;
            }

            case 'update_profile_pic': {
              if (key === 'user.profile') {
                const { path, fullPath } = data;
                current[k] = { ...current[k], path, fullPath };
              }
              break;
            }

            case 'update_profile_email': {
              if (key === 'user.profile') {
                current[k] = { ...current[k], email: data.email };
              }
              break;
            }

            case 'update_profile_username': {
              if (key === 'user.profile') {
                current[k] = { ...current[k], username: data.username };
              }
              break;
            }

            case 'load_more_notifications': {
              if (key === 'user.notifications.list') {
                const existingList = current[k] || [];
                const newList = data || [];
                const existingIds = new Set(existingList.map((item) => item.id));

                current[k] = [
                  ...existingList,
                  ...newList.filter((item) => !existingIds.has(item.id)),
                ];
              }
              break;
            }

            default: {
              // Default update for any other case
              current[k] = data;
              break;
            }
          }
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

export const { setAuthProps } = authSlice.actions; // Export actions
export default authSlice.reducer; // Export the reducer
