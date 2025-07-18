import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Session } from '@supabase/supabase-js';

import { authService, AuthUser } from '@/services/auth';

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

// Actions asynchrones
export const signIn = createAsyncThunk(
  'auth/signIn',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const result = await authService.signIn(email, password);
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de connexion',
      );
    }
  },
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (
    {
      email,
      password,
      fullName,
    }: { email: string; password: string; fullName?: string },
    { rejectWithValue },
  ) => {
    try {
      const result = await authService.signUp(email, password, fullName);
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Erreur d'inscription",
      );
    }
  },
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await authService.signOut();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de déconnexion',
      );
    }
  },
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    const user = await authService.getCurrentUser();
    const session = await authService.getCurrentSession();
    return { user, session };
  },
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    reset: (state) => {
      state.user = null;
      state.session = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user
          ? {
              id: action.payload.user.id,
              email: action.payload.user.email!,
              full_name: action.payload.user.user_metadata?.full_name,
              avatar_url: action.payload.user.user_metadata?.avatar_url,
            }
          : null;
        state.session = action.payload.session;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user
          ? {
              id: action.payload.user.id,
              email: action.payload.user.email!,
              full_name: action.payload.user.user_metadata?.full_name,
              avatar_url: action.payload.user.user_metadata?.avatar_url,
            }
          : null;
        state.session = action.payload.session;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sign Out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.session = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user
          ? {
              id: action.payload.user.id,
              email: action.payload.user.email!,
              full_name: action.payload.user.user_metadata?.full_name,
              avatar_url: action.payload.user.user_metadata?.avatar_url,
            }
          : null;
        state.session = action.payload.session;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, setSession, setLoading, clearError, reset } =
  authSlice.actions;
