import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { dashboardService } from '@/services/supabase';
import type { 
  DashboardOverview, DashboardStats, DashboardSummary, ChartDataPoint
} from '@/types/database';

// ===================================
// TYPES D'ÉTAT
// ===================================

interface DashboardState {
  overview: DashboardOverview | null;
  stats: DashboardStats | null;
  summary: DashboardSummary | null;
  chartData: {
    budgetByCategory: ChartDataPoint[];
    guestsDistribution: ChartDataPoint[];
    tasksProgress: ChartDataPoint[];
  };
  loading: {
    overview: boolean;
    stats: boolean;
    refreshing: boolean;
  };
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  overview: null,
  stats: null,
  summary: null,
  chartData: {
    budgetByCategory: [],
    guestsDistribution: [],
    tasksProgress: []
  },
  loading: {
    overview: false,
    stats: false,
    refreshing: false,
  },
  error: null,
  lastUpdated: null,
};

// ===================================
// ACTIONS ASYNCHRONES
// ===================================

export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async (userId: string, { rejectWithValue }) => {
    try {
      const overview = await dashboardService.getDashboardOverview(userId);
      return overview;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch dashboard overview');
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (userId: string, { rejectWithValue }) => {
    try {
      const stats = await dashboardService.getDashboardStats(userId);
      return stats;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (userId: string, { rejectWithValue }) => {
    try {
      const summary = await dashboardService.getDashboardSummary(userId);
      return summary;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch dashboard summary');
    }
  }
);

export const refreshDashboardStats = createAsyncThunk(
  'dashboard/refreshStats',
  async (userId: string, { rejectWithValue, dispatch }) => {
    try {
      await dashboardService.refreshDashboardStats(userId);
      
      // Rafraîchir les données après le recalcul
      await dispatch(fetchDashboardOverview(userId));
      await dispatch(fetchDashboardStats(userId));
      await dispatch(fetchDashboardSummary(userId));
      
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to refresh dashboard stats');
    }
  }
);

// Action pour charger toutes les données dashboard
export const loadDashboard = createAsyncThunk(
  'dashboard/loadAll',
  async (userId: string, { rejectWithValue, dispatch }) => {
    try {
      const [overview, stats, summary] = await Promise.all([
        dispatch(fetchDashboardOverview(userId)),
        dispatch(fetchDashboardStats(userId)),
        dispatch(fetchDashboardSummary(userId))
      ]);

      return {
        overview: overview.payload,
        stats: stats.payload,
        summary: summary.payload
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load dashboard');
    }
  }
);

// ===================================
// SLICE REDUX
// ===================================

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Actions synchrones
    clearError: (state) => {
      state.error = null;
    },

    // Génération des données de graphiques à partir des stats
    generateChartData: (state) => {
      if (state.summary) {
        // Données pour le graphique budget (pie chart)
        const budgetData = [
          {
            name: 'Dépensé',
            value: state.summary.budget.spent,
            color: '#ef4444', // red-500
            percentage: state.summary.budget.percentage
          },
          {
            name: 'Restant',
            value: state.summary.budget.remaining,
            color: '#22c55e', // green-500
            percentage: 100 - state.summary.budget.percentage
          }
        ];

        // Données pour la distribution des invités (donut chart)
        const guestsTotal = state.summary.guests.total;
        const guestsData = guestsTotal > 0 ? [
          {
            name: 'Confirmés',
            value: state.summary.guests.confirmed,
            color: '#10b981', // emerald-500
            percentage: (state.summary.guests.confirmed / guestsTotal) * 100
          },
          {
            name: 'En attente',
            value: state.summary.guests.pending,
            color: '#f59e0b', // amber-500
            percentage: (state.summary.guests.pending / guestsTotal) * 100
          },
          {
            name: 'Déclinés',
            value: state.summary.guests.declined,
            color: '#ef4444', // red-500
            percentage: (state.summary.guests.declined / guestsTotal) * 100
          }
        ] : [];

        // Données pour les tâches (progress chart)
        const tasksTotal = state.summary.tasks.total;
        const tasksData = tasksTotal > 0 ? [
          {
            name: 'Complétées',
            value: state.summary.tasks.completed,
            color: '#10b981', // emerald-500
            percentage: state.summary.tasks.completionPercentage
          },
          {
            name: 'En cours',
            value: state.summary.tasks.pending,
            color: '#3b82f6', // blue-500
            percentage: 100 - state.summary.tasks.completionPercentage
          }
        ] : [];

        state.chartData = {
          budgetByCategory: budgetData,
          guestsDistribution: guestsData,
          tasksProgress: tasksData
        };
      }
    },

    // Mise à jour timestamp
    updateLastRefreshed: (state) => {
      state.lastUpdated = new Date().toISOString();
    },

    // Réinitialisation
    reset: (state) => {
      return initialState;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // ===================================
      // FETCH OVERVIEW
      // ===================================
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.loading.overview = true;
        state.error = null;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading.overview = false;
        state.overview = action.payload;
        dashboardSlice.caseReducers.updateLastRefreshed(state);
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading.overview = false;
        state.error = action.payload as string;
      })

      // ===================================
      // FETCH STATS
      // ===================================
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading.stats = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
        dashboardSlice.caseReducers.updateLastRefreshed(state);
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error = action.payload as string;
      })

      // ===================================
      // FETCH SUMMARY
      // ===================================
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
        dashboardSlice.caseReducers.generateChartData(state);
        dashboardSlice.caseReducers.updateLastRefreshed(state);
      })

      // ===================================
      // REFRESH STATS
      // ===================================
      .addCase(refreshDashboardStats.pending, (state) => {
        state.loading.refreshing = true;
        state.error = null;
      })
      .addCase(refreshDashboardStats.fulfilled, (state) => {
        state.loading.refreshing = false;
        dashboardSlice.caseReducers.updateLastRefreshed(state);
      })
      .addCase(refreshDashboardStats.rejected, (state, action) => {
        state.loading.refreshing = false;
        state.error = action.payload as string;
      })

      // ===================================
      // LOAD ALL
      // ===================================
      .addCase(loadDashboard.pending, (state) => {
        state.loading.overview = true;
        state.loading.stats = true;
        state.error = null;
      })
      .addCase(loadDashboard.fulfilled, (state, action) => {
        state.loading.overview = false;
        state.loading.stats = false;
        
        if (action.payload && typeof action.payload === 'object') {
          const payload = action.payload as any;
          state.overview = payload.overview as DashboardOverview;
          state.stats = payload.stats as DashboardStats;
          state.summary = payload.summary as DashboardSummary;
          dashboardSlice.caseReducers.generateChartData(state);
          dashboardSlice.caseReducers.updateLastRefreshed(state);
        }
      })
      .addCase(loadDashboard.rejected, (state, action) => {
        state.loading.overview = false;
        state.loading.stats = false;
        state.error = action.payload as string;
      });
  },
});

// ===================================
// EXPORTS
// ===================================

export const { clearError, generateChartData, updateLastRefreshed, reset } = dashboardSlice.actions;

// Selectors
export const selectDashboardOverview = (state: { dashboard: DashboardState }) => state.dashboard.overview;
export const selectDashboardStats = (state: { dashboard: DashboardState }) => state.dashboard.stats;
export const selectDashboardSummary = (state: { dashboard: DashboardState }) => state.dashboard.summary;
export const selectDashboardChartData = (state: { dashboard: DashboardState }) => state.dashboard.chartData;
export const selectDashboardLoading = (state: { dashboard: DashboardState }) => state.dashboard.loading;
export const selectDashboardError = (state: { dashboard: DashboardState }) => state.dashboard.error;
export const selectDashboardLastUpdated = (state: { dashboard: DashboardState }) => state.dashboard.lastUpdated;

// Selectors spécialisés
export const selectBudgetProgress = (state: { dashboard: DashboardState }) => {
  if (!state.dashboard.summary) return null;
  
  const { budget } = state.dashboard.summary;
  return {
    percentage: budget.percentage,
    spent: budget.spent,
    remaining: budget.remaining,
    total: budget.total,
    isOverBudget: budget.spent > budget.total
  };
};

export const selectGuestsProgress = (state: { dashboard: DashboardState }) => {
  if (!state.dashboard.summary) return null;
  
  const { guests } = state.dashboard.summary;
  const confirmationRate = guests.total > 0 ? (guests.confirmed / guests.total) * 100 : 0;
  
  return {
    total: guests.total,
    confirmed: guests.confirmed,
    pending: guests.pending,
    declined: guests.declined,
    confirmationRate: Math.round(confirmationRate * 100) / 100
  };
};

export const selectTasksProgress = (state: { dashboard: DashboardState }) => {
  if (!state.dashboard.summary) return null;
  
  const { tasks } = state.dashboard.summary;
  
  return {
    total: tasks.total,
    completed: tasks.completed,
    pending: tasks.pending,
    overdue: tasks.overdue,
    completionPercentage: tasks.completionPercentage,
    isOnTrack: tasks.overdue === 0
  };
};

export const selectDashboardHealth = (state: { dashboard: DashboardState }) => {
  const budgetProgress = selectBudgetProgress(state);
  const guestsProgress = selectGuestsProgress(state);
  const tasksProgress = selectTasksProgress(state);
  
  if (!budgetProgress || !guestsProgress || !tasksProgress) {
    return { status: 'loading', score: 0 };
  }
  
  let score = 100;
  let issues: string[] = [];
  
  // Points négatifs pour dépassement budget
  if (budgetProgress.isOverBudget) {
    score -= 30;
    issues.push('Budget dépassé');
  } else if (budgetProgress.percentage > 90) {
    score -= 15;
    issues.push('Budget presque épuisé');
  }
  
  // Points négatifs pour taux de confirmation faible
  if (guestsProgress.confirmationRate < 50) {
    score -= 20;
    issues.push('Faible taux de confirmation');
  }
  
  // Points négatifs pour tâches en retard
  if (tasksProgress.overdue > 0) {
    score -= 25;
    issues.push(`${tasksProgress.overdue} tâches en retard`);
  } else if (tasksProgress.completionPercentage < 30) {
    score -= 10;
    issues.push('Planification en retard');
  }
  
  let status: 'excellent' | 'good' | 'warning' | 'critical';
  if (score >= 90) status = 'excellent';
  else if (score >= 70) status = 'good';
  else if (score >= 50) status = 'warning';
  else status = 'critical';
  
  return { status, score, issues };
};

export default dashboardSlice.reducer; 