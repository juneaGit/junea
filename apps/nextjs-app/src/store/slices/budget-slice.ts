import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { budgetService, expenseService, dashboardService } from '@/services/supabase';
import type { 
  Budget, Expense, BudgetByCategory, ExpenseFormData,
  ApiResponse
} from '@/types/database';

// ===================================
// TYPES D'ÉTAT
// ===================================

interface BudgetState {
  budgets: Budget[];
  currentBudget: Budget | null;
  expenses: Expense[];
  expensesByCategory: BudgetByCategory[];
  totalSpent: number;
  remainingBudget: number;
  loading: {
    budgets: boolean;
    expenses: boolean;
    creating: boolean;
    updating: boolean;
  };
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  currentBudget: null,
  expenses: [],
  expensesByCategory: [],
  totalSpent: 0,
  remainingBudget: 0,
  loading: {
    budgets: false,
    expenses: false,
    creating: false,
    updating: false,
  },
  error: null,
};

// ===================================
// ACTIONS ASYNCHRONES - BUDGETS
// ===================================

export const fetchBudgets = createAsyncThunk(
  'budget/fetchBudgets',
  async (userId: string, { rejectWithValue }) => {
    try {
      const budgets = await budgetService.getBudgets(userId);
      return budgets;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch budgets');
    }
  }
);

export const createBudget = createAsyncThunk(
  'budget/createBudget',
  async (budgetData: { name: string; total_amount: number; user_id: string; wedding_date?: string }, { rejectWithValue, dispatch }) => {
    try {
      const budget = await budgetService.createBudget(budgetData);
      
      // Refresh dashboard stats après création
      dashboardService.refreshDashboardStats(budgetData.user_id);
      
      return budget;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create budget');
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budget/updateBudget',
  async (
    { budgetId, updates, userId }: { budgetId: string; updates: Partial<Budget>; userId: string }, 
    { rejectWithValue }
  ) => {
    try {
      const budget = await budgetService.updateBudget(budgetId, updates, userId);
      
      // Refresh dashboard stats
      dashboardService.refreshDashboardStats(userId);
      
      return budget;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update budget');
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budget/deleteBudget',
  async ({ budgetId, userId }: { budgetId: string; userId: string }, { rejectWithValue }) => {
    try {
      await budgetService.deleteBudget(budgetId, userId);
      dashboardService.refreshDashboardStats(userId);
      return budgetId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete budget');
    }
  }
);

// ===================================
// ACTIONS ASYNCHRONES - EXPENSES
// ===================================

export const fetchExpenses = createAsyncThunk(
  'budget/fetchExpenses',
  async ({ userId, budgetId }: { userId: string; budgetId?: string }, { rejectWithValue }) => {
    try {
      const expenses = await expenseService.getExpenses(userId, budgetId);
      const expensesByCategory = await expenseService.getExpensesByCategory(userId);
      
      return { expenses, expensesByCategory };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch expenses');
    }
  }
);

export const createExpense = createAsyncThunk(
  'budget/createExpense',
  async (
    { formData, budgetId, userId }: { formData: ExpenseFormData; budgetId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const expense = await expenseService.createExpenseFromForm(formData, budgetId, userId);
      
      // Refresh stats et catégories après création
      dashboardService.refreshDashboardStats(userId);
      
      return expense;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create expense');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'budget/updateExpense',
  async (
    { expenseId, updates, userId }: { expenseId: string; updates: Partial<Expense>; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const expense = await expenseService.updateExpense(expenseId, updates, userId);
      
      // Refresh dashboard si changement montant ou status payé
      if (updates.amount !== undefined || updates.paid !== undefined) {
        dashboardService.refreshDashboardStats(userId);
      }
      
      return expense;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update expense');
    }
  }
);

export const markExpenseAsPaid = createAsyncThunk(
  'budget/markExpenseAsPaid',
  async (
    { expenseId, userId, paymentDate }: { expenseId: string; userId: string; paymentDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const expense = await expenseService.markAsPaid(expenseId, userId, paymentDate);
      dashboardService.refreshDashboardStats(userId);
      return expense;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark expense as paid');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'budget/deleteExpense',
  async ({ expenseId, userId }: { expenseId: string; userId: string }, { rejectWithValue }) => {
    try {
      await expenseService.deleteExpense(expenseId, userId);
      dashboardService.refreshDashboardStats(userId);
      return expenseId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete expense');
    }
  }
);

// ===================================
// SLICE REDUX
// ===================================

export const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    // Actions synchrones
    setCurrentBudget: (state, action: PayloadAction<Budget>) => {
      state.currentBudget = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Actions pour les calculs locaux (optimistic updates)
    updateLocalTotals: (state) => {
      state.totalSpent = state.expenses
        .filter(expense => expense.paid)
        .reduce((sum, expense) => sum + expense.amount, 0);
        
      if (state.currentBudget) {
        state.remainingBudget = state.currentBudget.total_amount - state.totalSpent;
      }
    },

    // Réinitialisation
    reset: (state) => {
      return initialState;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // ===================================
      // FETCH BUDGETS
      // ===================================
      .addCase(fetchBudgets.pending, (state) => {
        state.loading.budgets = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading.budgets = false;
        state.budgets = action.payload;
        
        // Définir le budget actuel (premier actif)
        const activeBudget = action.payload.find(b => b.status === 'active');
        if (activeBudget && !state.currentBudget) {
          state.currentBudget = activeBudget;
        }
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading.budgets = false;
        state.error = action.payload as string;
      })

      // ===================================
      // CREATE BUDGET
      // ===================================
      .addCase(createBudget.pending, (state) => {
        state.loading.creating = true;
        state.error = null;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.budgets.unshift(action.payload);
        
        // Si c'est le premier budget, le définir comme courant
        if (!state.currentBudget) {
          state.currentBudget = action.payload;
        }
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.loading.creating = false;
        state.error = action.payload as string;
      })

      // ===================================
      // UPDATE BUDGET
      // ===================================
      .addCase(updateBudget.pending, (state) => {
        state.loading.updating = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.loading.updating = false;
        
        const index = state.budgets.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
        
        if (state.currentBudget?.id === action.payload.id) {
          state.currentBudget = action.payload;
        }
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.payload as string;
      })

      // ===================================
      // DELETE BUDGET
      // ===================================
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter(b => b.id !== action.payload);
        
        if (state.currentBudget?.id === action.payload) {
          state.currentBudget = state.budgets[0] || null;
        }
      })

      // ===================================
      // FETCH EXPENSES
      // ===================================
      .addCase(fetchExpenses.pending, (state) => {
        state.loading.expenses = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading.expenses = false;
        state.expenses = action.payload.expenses;
        state.expensesByCategory = action.payload.expensesByCategory;
        
        // Recalculer totaux
        budgetSlice.caseReducers.updateLocalTotals(state);
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading.expenses = false;
        state.error = action.payload as string;
      })

      // ===================================
      // CREATE EXPENSE
      // ===================================
      .addCase(createExpense.pending, (state) => {
        state.loading.creating = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.expenses.unshift(action.payload);
        
        // Recalculer totaux
        budgetSlice.caseReducers.updateLocalTotals(state);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading.creating = false;
        state.error = action.payload as string;
      })

      // ===================================
      // UPDATE EXPENSE
      // ===================================
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        
        // Recalculer totaux
        budgetSlice.caseReducers.updateLocalTotals(state);
      })

      // ===================================
      // MARK AS PAID
      // ===================================
      .addCase(markExpenseAsPaid.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        
        // Recalculer totaux
        budgetSlice.caseReducers.updateLocalTotals(state);
      })

      // ===================================
      // DELETE EXPENSE
      // ===================================
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(e => e.id !== action.payload);
        
        // Recalculer totaux
        budgetSlice.caseReducers.updateLocalTotals(state);
      });
  },
});

// ===================================
// EXPORTS
// ===================================

export const { setCurrentBudget, clearError, updateLocalTotals, reset } = budgetSlice.actions;

// Selectors
export const selectBudgets = (state: { budget: BudgetState }) => state.budget.budgets;
export const selectCurrentBudget = (state: { budget: BudgetState }) => state.budget.currentBudget;
export const selectExpenses = (state: { budget: BudgetState }) => state.budget.expenses;
export const selectExpensesByCategory = (state: { budget: BudgetState }) => state.budget.expensesByCategory;
export const selectTotalSpent = (state: { budget: BudgetState }) => state.budget.totalSpent;
export const selectRemainingBudget = (state: { budget: BudgetState }) => state.budget.remainingBudget;
export const selectBudgetLoading = (state: { budget: BudgetState }) => state.budget.loading;
export const selectBudgetError = (state: { budget: BudgetState }) => state.budget.error;

export default budgetSlice.reducer; 