import { configureStore } from '@reduxjs/toolkit';

import { authSlice } from './slices/auth-slice';
import { weddingSlice } from './slices/wedding-slice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    wedding: weddingSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setSession'],
        ignoredPaths: ['auth.session'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
