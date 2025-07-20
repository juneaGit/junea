import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { guestService, invitationService, dashboardService } from '@/services/supabase';
import type { 
  Guest, GuestFormData, Invitation, GuestCategory, RsvpStatus
} from '@/types/database';

// ===================================
// TYPES D'ÉTAT
// ===================================

interface GuestsState {
  guests: Guest[];
  guestsByCategory: Record<string, Guest[]>;
  guestsByRsvp: {
    pending: Guest[];
    confirmed: Guest[];
    declined: Guest[];
  };
  invitations: Invitation[];
  stats: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
    withTable: number;
    withoutTable: number;
  };
  loading: {
    guests: boolean;
    creating: boolean;
    updating: boolean;
    invitations: boolean;
    sending: boolean;
  };
  error: string | null;
}

const initialState: GuestsState = {
  guests: [],
  guestsByCategory: {},
  guestsByRsvp: {
    pending: [],
    confirmed: [],
    declined: []
  },
  invitations: [],
  stats: {
    total: 0,
    confirmed: 0,
    pending: 0,
    declined: 0,
    withTable: 0,
    withoutTable: 0
  },
  loading: {
    guests: false,
    creating: false,
    updating: false,
    invitations: false,
    sending: false,
  },
  error: null,
};

// ===================================
// ACTIONS ASYNCHRONES - GUESTS
// ===================================

export const fetchGuests = createAsyncThunk(
  'guests/fetchGuests',
  async (userId: string, { rejectWithValue }) => {
    try {
      const guests = await guestService.getGuests(userId);
      const guestsByCategory = await guestService.getGuestsByCategory(userId);
      const guestsByRsvp = await guestService.getGuestsByRsvpStatus(userId);
      
      return { guests, guestsByCategory, guestsByRsvp };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch guests');
    }
  }
);

export const createGuest = createAsyncThunk(
  'guests/createGuest',
  async (
    { formData, userId }: { formData: GuestFormData; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const guest = await guestService.createGuestFromForm(formData, userId);
      
      // Refresh dashboard stats
      dashboardService.refreshDashboardStats(userId);
      
      return guest;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create guest');
    }
  }
);

export const updateGuest = createAsyncThunk(
  'guests/updateGuest',
  async (
    { guestId, updates, userId }: { guestId: string; updates: Partial<Guest>; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const guest = await guestService.updateGuest(guestId, updates, userId);
      
      // Refresh stats si changement RSVP
      if (updates.rsvp_status !== undefined) {
        dashboardService.refreshDashboardStats(userId);
      }
      
      return guest;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update guest');
    }
  }
);

export const updateRsvpStatus = createAsyncThunk(
  'guests/updateRsvpStatus',
  async (
    { guestId, status, userId }: { guestId: string; status: RsvpStatus; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const guest = await guestService.updateRsvpStatus(guestId, status, userId);
      dashboardService.refreshDashboardStats(userId);
      return guest;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update RSVP status');
    }
  }
);

export const assignTable = createAsyncThunk(
  'guests/assignTable',
  async (
    { guestId, tableNumber, userId }: { guestId: string; tableNumber: number; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const guest = await guestService.assignTable(guestId, tableNumber, userId);
      return guest;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to assign table');
    }
  }
);

export const deleteGuest = createAsyncThunk(
  'guests/deleteGuest',
  async ({ guestId, userId }: { guestId: string; userId: string }, { rejectWithValue }) => {
    try {
      await guestService.deleteGuest(guestId, userId);
      dashboardService.refreshDashboardStats(userId);
      return guestId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete guest');
    }
  }
);

// ===================================
// ACTIONS ASYNCHRONES - INVITATIONS
// ===================================

export const fetchInvitations = createAsyncThunk(
  'guests/fetchInvitations',
  async (userId: string, { rejectWithValue }) => {
    try {
      const invitations = await invitationService.getInvitations(userId);
      return invitations;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch invitations');
    }
  }
);

export const sendInvitation = createAsyncThunk(
  'guests/sendInvitation',
  async (
    { guestId, userId, type }: { 
      guestId: string; 
      userId: string; 
      type: 'save_the_date' | 'invitation' | 'reminder' 
    },
    { rejectWithValue }
  ) => {
    try {
      const invitation = await invitationService.sendInvitation(guestId, userId, type);
      return { invitation, guestId };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send invitation');
    }
  }
);

export const sendBulkInvitations = createAsyncThunk(
  'guests/sendBulkInvitations',
  async (
    { guestIds, userId, type }: { 
      guestIds: string[]; 
      userId: string; 
      type: 'save_the_date' | 'invitation' | 'reminder' 
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const results = [];
      
      for (const guestId of guestIds) {
        try {
          const invitation = await invitationService.sendInvitation(guestId, userId, type);
          results.push({ success: true, invitation, guestId });
        } catch (error) {
          results.push({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to send invitation',
            guestId 
          });
        }
      }
      
      return results;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send bulk invitations');
    }
  }
);

// ===================================
// SLICE REDUX
// ===================================

export const guestsSlice = createSlice({
  name: 'guests',
  initialState,
  reducers: {
    // Actions synchrones
    clearError: (state) => {
      state.error = null;
    },

    // Calcul des stats locales
    updateLocalStats: (state) => {
      const guests = state.guests;
      
      state.stats = {
        total: guests.length,
        confirmed: guests.filter(g => g.rsvp_status === 'confirmed').length,
        pending: guests.filter(g => g.rsvp_status === 'pending').length,
        declined: guests.filter(g => g.rsvp_status === 'declined').length,
        withTable: guests.filter(g => g.table_assignment !== null).length,
        withoutTable: guests.filter(g => g.table_assignment === null).length,
      };
    },

    // Filtre par catégorie
    filterByCategory: (state, action: PayloadAction<GuestCategory | 'all'>) => {
      if (action.payload === 'all') {
        // Reset aux invités complets
        return;
      }
      
      // Cette action peut être utilisée par les composants pour filtrer côté client
    },

    // Réinitialisation
    reset: (state) => {
      return initialState;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // ===================================
      // FETCH GUESTS
      // ===================================
      .addCase(fetchGuests.pending, (state) => {
        state.loading.guests = true;
        state.error = null;
      })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.loading.guests = false;
        state.guests = action.payload.guests;
        state.guestsByCategory = action.payload.guestsByCategory;
        state.guestsByRsvp = action.payload.guestsByRsvp;
        
        // Recalculer stats
        guestsSlice.caseReducers.updateLocalStats(state);
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        state.loading.guests = false;
        state.error = action.payload as string;
      })

      // ===================================
      // CREATE GUEST
      // ===================================
      .addCase(createGuest.pending, (state) => {
        state.loading.creating = true;
        state.error = null;
      })
      .addCase(createGuest.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.guests.unshift(action.payload);
        
        // Mettre à jour guestsByCategory
        const category = action.payload.category;
        if (!state.guestsByCategory[category]) {
          state.guestsByCategory[category] = [];
        }
        state.guestsByCategory[category].unshift(action.payload);
        
        // Mettre à jour guestsByRsvp
        const rsvpStatus = action.payload.rsvp_status;
        state.guestsByRsvp[rsvpStatus].unshift(action.payload);
        
        // Recalculer stats
        guestsSlice.caseReducers.updateLocalStats(state);
      })
      .addCase(createGuest.rejected, (state, action) => {
        state.loading.creating = false;
        state.error = action.payload as string;
      })

      // ===================================
      // UPDATE GUEST
      // ===================================
      .addCase(updateGuest.pending, (state) => {
        state.loading.updating = true;
        state.error = null;
      })
      .addCase(updateGuest.fulfilled, (state, action) => {
        state.loading.updating = false;
        
        const updatedGuest = action.payload;
        const index = state.guests.findIndex(g => g.id === updatedGuest.id);
        
        if (index !== -1) {
          const oldGuest = state.guests[index];
          state.guests[index] = updatedGuest;
          
          // Mettre à jour guestsByCategory si la catégorie a changé
          if (oldGuest.category !== updatedGuest.category) {
            // Retirer de l'ancienne catégorie
            if (state.guestsByCategory[oldGuest.category]) {
              state.guestsByCategory[oldGuest.category] = 
                state.guestsByCategory[oldGuest.category].filter(g => g.id !== updatedGuest.id);
            }
            
            // Ajouter à la nouvelle catégorie
            if (!state.guestsByCategory[updatedGuest.category]) {
              state.guestsByCategory[updatedGuest.category] = [];
            }
            state.guestsByCategory[updatedGuest.category].push(updatedGuest);
          } else {
            // Mettre à jour dans la même catégorie
            if (state.guestsByCategory[updatedGuest.category]) {
              const categoryIndex = state.guestsByCategory[updatedGuest.category]
                .findIndex(g => g.id === updatedGuest.id);
              if (categoryIndex !== -1) {
                state.guestsByCategory[updatedGuest.category][categoryIndex] = updatedGuest;
              }
            }
          }
          
          // Mettre à jour guestsByRsvp si le status a changé
          if (oldGuest.rsvp_status !== updatedGuest.rsvp_status) {
            // Retirer de l'ancien status
            state.guestsByRsvp[oldGuest.rsvp_status] = 
              state.guestsByRsvp[oldGuest.rsvp_status].filter(g => g.id !== updatedGuest.id);
            
            // Ajouter au nouveau status
            state.guestsByRsvp[updatedGuest.rsvp_status].push(updatedGuest);
          } else {
            // Mettre à jour dans le même status
            const rsvpIndex = state.guestsByRsvp[updatedGuest.rsvp_status]
              .findIndex(g => g.id === updatedGuest.id);
            if (rsvpIndex !== -1) {
              state.guestsByRsvp[updatedGuest.rsvp_status][rsvpIndex] = updatedGuest;
            }
          }
        }
        
        // Recalculer stats
        guestsSlice.caseReducers.updateLocalStats(state);
      })
      .addCase(updateGuest.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.payload as string;
      })

      // ===================================
      // UPDATE RSVP STATUS
      // ===================================
      .addCase(updateRsvpStatus.fulfilled, (state, action) => {
        const updatedGuest = action.payload;
        
        // Même logique que updateGuest mais spécifique au RSVP
        const index = state.guests.findIndex(g => g.id === updatedGuest.id);
        if (index !== -1) {
          const oldRsvpStatus = state.guests[index].rsvp_status;
          state.guests[index] = updatedGuest;
          
          // Mettre à jour guestsByRsvp
          if (oldRsvpStatus !== updatedGuest.rsvp_status) {
            state.guestsByRsvp[oldRsvpStatus] = 
              state.guestsByRsvp[oldRsvpStatus].filter(g => g.id !== updatedGuest.id);
            state.guestsByRsvp[updatedGuest.rsvp_status].push(updatedGuest);
          }
          
          // Mettre à jour dans la catégorie
          if (state.guestsByCategory[updatedGuest.category]) {
            const categoryIndex = state.guestsByCategory[updatedGuest.category]
              .findIndex(g => g.id === updatedGuest.id);
            if (categoryIndex !== -1) {
              state.guestsByCategory[updatedGuest.category][categoryIndex] = updatedGuest;
            }
          }
        }
        
        // Recalculer stats
        guestsSlice.caseReducers.updateLocalStats(state);
      })

      // ===================================
      // ASSIGN TABLE
      // ===================================
      .addCase(assignTable.fulfilled, (state, action) => {
        const updatedGuest = action.payload;
        const index = state.guests.findIndex(g => g.id === updatedGuest.id);
        
        if (index !== -1) {
          state.guests[index] = updatedGuest;
          
          // Mettre à jour dans tous les groupings
          if (state.guestsByCategory[updatedGuest.category]) {
            const categoryIndex = state.guestsByCategory[updatedGuest.category]
              .findIndex(g => g.id === updatedGuest.id);
            if (categoryIndex !== -1) {
              state.guestsByCategory[updatedGuest.category][categoryIndex] = updatedGuest;
            }
          }
          
          const rsvpIndex = state.guestsByRsvp[updatedGuest.rsvp_status]
            .findIndex(g => g.id === updatedGuest.id);
          if (rsvpIndex !== -1) {
            state.guestsByRsvp[updatedGuest.rsvp_status][rsvpIndex] = updatedGuest;
          }
        }
        
        // Recalculer stats
        guestsSlice.caseReducers.updateLocalStats(state);
      })

      // ===================================
      // DELETE GUEST
      // ===================================
      .addCase(deleteGuest.fulfilled, (state, action) => {
        const guestId = action.payload;
        
        // Trouver et retirer de guests
        const guestIndex = state.guests.findIndex(g => g.id === guestId);
        let deletedGuest: Guest | null = null;
        
        if (guestIndex !== -1) {
          deletedGuest = state.guests[guestIndex];
          state.guests.splice(guestIndex, 1);
        }
        
        if (deletedGuest) {
          // Retirer de guestsByCategory
          if (state.guestsByCategory[deletedGuest.category]) {
            state.guestsByCategory[deletedGuest.category] = 
              state.guestsByCategory[deletedGuest.category].filter(g => g.id !== guestId);
          }
          
          // Retirer de guestsByRsvp
          state.guestsByRsvp[deletedGuest.rsvp_status] = 
            state.guestsByRsvp[deletedGuest.rsvp_status].filter(g => g.id !== guestId);
        }
        
        // Recalculer stats
        guestsSlice.caseReducers.updateLocalStats(state);
      })

      // ===================================
      // FETCH INVITATIONS
      // ===================================
      .addCase(fetchInvitations.pending, (state) => {
        state.loading.invitations = true;
        state.error = null;
      })
      .addCase(fetchInvitations.fulfilled, (state, action) => {
        state.loading.invitations = false;
        state.invitations = action.payload;
      })
      .addCase(fetchInvitations.rejected, (state, action) => {
        state.loading.invitations = false;
        state.error = action.payload as string;
      })

      // ===================================
      // SEND INVITATION
      // ===================================
      .addCase(sendInvitation.pending, (state) => {
        state.loading.sending = true;
        state.error = null;
      })
      .addCase(sendInvitation.fulfilled, (state, action) => {
        state.loading.sending = false;
        state.invitations.unshift(action.payload.invitation);
        
        // Mettre à jour le guest correspondant
        const guestId = action.payload.guestId;
        const guestIndex = state.guests.findIndex(g => g.id === guestId);
        if (guestIndex !== -1) {
          state.guests[guestIndex].invitation_sent = true;
          state.guests[guestIndex].invitation_sent_date = new Date().toISOString();
        }
      })
      .addCase(sendInvitation.rejected, (state, action) => {
        state.loading.sending = false;
        state.error = action.payload as string;
      })

      // ===================================
      // SEND BULK INVITATIONS
      // ===================================
      .addCase(sendBulkInvitations.fulfilled, (state, action) => {
        state.loading.sending = false;
        
        // Traiter les résultats du bulk
        action.payload.forEach(result => {
          if (result.success) {
            state.invitations.unshift(result.invitation);
            
            // Mettre à jour le guest
            const guestIndex = state.guests.findIndex(g => g.id === result.guestId);
            if (guestIndex !== -1) {
              state.guests[guestIndex].invitation_sent = true;
              state.guests[guestIndex].invitation_sent_date = new Date().toISOString();
            }
          }
        });
      });
  },
});

// ===================================
// EXPORTS
// ===================================

export const { clearError, updateLocalStats, filterByCategory, reset } = guestsSlice.actions;

// Selectors
export const selectGuests = (state: { guests: GuestsState }) => state.guests.guests;
export const selectGuestsByCategory = (state: { guests: GuestsState }) => state.guests.guestsByCategory;
export const selectGuestsByRsvp = (state: { guests: GuestsState }) => state.guests.guestsByRsvp;
export const selectGuestsStats = (state: { guests: GuestsState }) => state.guests.stats;
export const selectInvitations = (state: { guests: GuestsState }) => state.guests.invitations;
export const selectGuestsLoading = (state: { guests: GuestsState }) => state.guests.loading;
export const selectGuestsError = (state: { guests: GuestsState }) => state.guests.error;

// Selectors avancés
export const selectGuestsByTable = (state: { guests: GuestsState }) => {
  return state.guests.guests.reduce((acc, guest) => {
    const tableNumber = guest.table_assignment;
    if (tableNumber !== null) {
      if (!acc[tableNumber]) acc[tableNumber] = [];
      acc[tableNumber].push(guest);
    } else {
      if (!acc['unassigned']) acc['unassigned'] = [];
      acc['unassigned'].push(guest);
    }
    return acc;
  }, {} as Record<string | number, Guest[]>);
};

export const selectConfirmedGuests = (state: { guests: GuestsState }) => 
  state.guests.guests.filter(g => g.rsvp_status === 'confirmed');

export const selectUnassignedGuests = (state: { guests: GuestsState }) =>
  state.guests.guests.filter(g => g.table_assignment === null);

export default guestsSlice.reducer; 