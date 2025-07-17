import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { weddingSlice } from './slices/weddingSlice';

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