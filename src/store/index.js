import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { createLogger } from 'redux-logger';
import { createWrapper } from 'next-redux-wrapper';

const nodeEnv = process.env.NEXT_PUBLIC_NODE_ENV || 'development';

const makeStore = () => configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      // Disable serializable check for actions with large data
      serializableCheck: {
        ignoredActions: ['home/setHomeProps_ACTION', 'partners/setPartners_ACTION', 'sponsers/setSponsers_ACTION'],
        warnAfter: 100,
      },
      immutableCheck: {
        warnAfter: 100,
      },
    });

    // Only add logger in development, exclude large data actions
    if (nodeEnv === 'development') {
      middleware.push(
        createLogger({
          collapsed: true,
          duration: true,
          timestamp: false,
          predicate: (getState, action) =>
            !['home/setHomeProps_ACTION', 'partners/setPartners_ACTION', 'sponsers/setSponsers_ACTION'].includes(action.type),
        })
      );
    }

    return middleware;
  },
  devTools: nodeEnv !== 'production',
});

export const wrapper = createWrapper(makeStore);