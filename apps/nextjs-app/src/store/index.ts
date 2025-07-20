import { configureStore } from '@reduxjs/toolkit';

import { authSlice } from './slices/auth-slice';
import { weddingSlice } from './slices/wedding-slice';
import { languageSlice } from './slices/language-slice';
import budgetReducer from './slices/budget-slice';
import guestsReducer from './slices/guests-slice';
import dashboardReducer from './slices/dashboard-slice';
import tasksReducer from './slices/tasks-slice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    wedding: weddingSlice.reducer,
    language: languageSlice.reducer,
    budget: budgetReducer,
    guests: guestsReducer,
    dashboard: dashboardReducer,
    tasks: tasksReducer,
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
