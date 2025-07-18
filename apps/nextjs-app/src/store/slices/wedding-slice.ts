import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { WeddingProfile, Task, BudgetItem, Guest } from '@/config/supabase';

interface WeddingState {
  profile: WeddingProfile | null;
  tasks: Task[];
  budgetItems: BudgetItem[];
  guests: Guest[];
  loading: boolean;
  error: string | null;
}

const initialState: WeddingState = {
  profile: null,
  tasks: [],
  budgetItems: [],
  guests: [],
  loading: false,
  error: null,
};

// Actions asynchrones (à implémenter plus tard avec les services)
export const createWeddingProfile = createAsyncThunk(
  'wedding/createProfile',
  async (profileData: Partial<WeddingProfile>, { rejectWithValue }) => {
    try {
      // TODO: Implémenter l'appel au service
      return profileData as WeddingProfile;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la création du profil',
      );
    }
  },
);

export const updateWeddingProfile = createAsyncThunk(
  'wedding/updateProfile',
  async (updates: Partial<WeddingProfile>, { rejectWithValue }) => {
    try {
      // TODO: Implémenter l'appel au service
      return updates as WeddingProfile;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour',
      );
    }
  },
);

export const weddingSlice = createSlice({
  name: 'wedding',
  initialState,
  reducers: {
    setWeddingProfile: (state, action: PayloadAction<WeddingProfile>) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<WeddingProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Task> }>,
    ) => {
      const taskIndex = state.tasks.findIndex(
        (task) => task.id === action.payload.id,
      );
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = {
          ...state.tasks[taskIndex],
          ...action.payload.updates,
        };
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
    setBudgetItems: (state, action: PayloadAction<BudgetItem[]>) => {
      state.budgetItems = action.payload;
    },
    addBudgetItem: (state, action: PayloadAction<BudgetItem>) => {
      state.budgetItems.push(action.payload);
    },
    updateBudgetItem: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<BudgetItem> }>,
    ) => {
      const itemIndex = state.budgetItems.findIndex(
        (item) => item.id === action.payload.id,
      );
      if (itemIndex !== -1) {
        state.budgetItems[itemIndex] = {
          ...state.budgetItems[itemIndex],
          ...action.payload.updates,
        };
      }
    },
    removeBudgetItem: (state, action: PayloadAction<string>) => {
      state.budgetItems = state.budgetItems.filter(
        (item) => item.id !== action.payload,
      );
    },
    setGuests: (state, action: PayloadAction<Guest[]>) => {
      state.guests = action.payload;
    },
    addGuest: (state, action: PayloadAction<Guest>) => {
      state.guests.push(action.payload);
    },
    updateGuest: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Guest> }>,
    ) => {
      const guestIndex = state.guests.findIndex(
        (guest) => guest.id === action.payload.id,
      );
      if (guestIndex !== -1) {
        state.guests[guestIndex] = {
          ...state.guests[guestIndex],
          ...action.payload.updates,
        };
      }
    },
    removeGuest: (state, action: PayloadAction<string>) => {
      state.guests = state.guests.filter(
        (guest) => guest.id !== action.payload,
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Create Wedding Profile
      .addCase(createWeddingProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWeddingProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(createWeddingProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Wedding Profile
      .addCase(updateWeddingProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWeddingProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile) {
          state.profile = { ...state.profile, ...action.payload };
        }
      })
      .addCase(updateWeddingProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setWeddingProfile,
  updateProfile,
  setTasks,
  addTask,
  updateTask,
  removeTask,
  setBudgetItems,
  addBudgetItem,
  updateBudgetItem,
  removeBudgetItem,
  setGuests,
  addGuest,
  updateGuest,
  removeGuest,
  setLoading,
  setError,
  clearError,
  reset,
} = weddingSlice.actions;
