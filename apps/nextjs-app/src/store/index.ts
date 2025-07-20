import { configureStore } from '@reduxjs/toolkit';

import { authSlice } from './slices/auth-slice';
import { weddingSlice } from './slices/wedding-slice';
import { languageSlice } from './slices/language-slice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    wedding: weddingSlice.reducer,
    language: languageSlice.reducer,
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
