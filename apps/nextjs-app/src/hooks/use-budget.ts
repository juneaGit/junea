import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  fetchExpenses,
  createExpense,
  updateExpense,
  markExpenseAsPaid,
  deleteExpense,
  setCurrentBudget,
  clearError,
  selectBudgets,
  selectCurrentBudget,
  selectExpenses,
  selectExpensesByCategory,
  selectTotalSpent,
  selectRemainingBudget,
  selectBudgetLoading,
  selectBudgetError
} from '@/store/slices/budget-slice';
import type { ExpenseFormData } from '@/types/database';

export const useBudget = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const budgets = useAppSelector(selectBudgets);
  const currentBudget = useAppSelector(selectCurrentBudget);
  const expenses = useAppSelector(selectExpenses);
  const expensesByCategory = useAppSelector(selectExpensesByCategory);
  const totalSpent = useAppSelector(selectTotalSpent);
  const remainingBudget = useAppSelector(selectRemainingBudget);
  const loading = useAppSelector(selectBudgetLoading);
  const error = useAppSelector(selectBudgetError);

  // Actions Budget
  const loadBudgets = useCallback((userId: string) => {
    return dispatch(fetchBudgets(userId));
  }, [dispatch]);

  const addBudget = useCallback((budgetData: { name: string; total_amount: number; user_id: string; wedding_date?: string }) => {
    return dispatch(createBudget(budgetData));
  }, [dispatch]);

  const editBudget = useCallback((budgetId: string, updates: any, userId: string) => {
    return dispatch(updateBudget({ budgetId, updates, userId }));
  }, [dispatch]);

  const removeBudget = useCallback((budgetId: string, userId: string) => {
    return dispatch(deleteBudget({ budgetId, userId }));
  }, [dispatch]);

  const setActiveBudget = useCallback((budget: any) => {
    dispatch(setCurrentBudget(budget));
  }, [dispatch]);

  // Actions Expenses
  const loadExpenses = useCallback((userId: string, budgetId?: string) => {
    return dispatch(fetchExpenses({ userId, budgetId }));
  }, [dispatch]);

  const addExpense = useCallback((formData: ExpenseFormData, budgetId: string, userId: string) => {
    return dispatch(createExpense({ formData, budgetId, userId }));
  }, [dispatch]);

  const editExpense = useCallback((expenseId: string, updates: any, userId: string) => {
    return dispatch(updateExpense({ expenseId, updates, userId }));
  }, [dispatch]);

  const markPaid = useCallback((expenseId: string, userId: string, paymentDate?: string) => {
    return dispatch(markExpenseAsPaid({ expenseId, userId, paymentDate }));
  }, [dispatch]);

  const removeExpense = useCallback((expenseId: string, userId: string) => {
    return dispatch(deleteExpense({ expenseId, userId }));
  }, [dispatch]);

  // Utilitaires
  const clearBudgetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Stats calculées
  const budgetStats = {
    total: currentBudget?.total_amount || 0,
    spent: totalSpent,
    remaining: remainingBudget,
    percentage: currentBudget ? Math.round((totalSpent / currentBudget.total_amount) * 100) : 0,
    isOverBudget: totalSpent > (currentBudget?.total_amount || 0)
  };

  // Données pour graphiques
  const chartData = expensesByCategory.map(category => ({
    name: category.category,
    value: category.total_amount,
    percentage: budgetStats.total > 0 ? Math.round((category.total_amount / budgetStats.total) * 100) : 0,
    count: category.expense_count
  }));

  return {
    // State
    budgets,
    currentBudget,
    expenses,
    expensesByCategory,
    totalSpent,
    remainingBudget,
    loading,
    error,
    budgetStats,
    chartData,

    // Actions
    loadBudgets,
    addBudget,
    editBudget,
    removeBudget,
    setActiveBudget,
    loadExpenses,
    addExpense,
    editExpense,
    markPaid,
    removeExpense,
    clearBudgetError,
  };
}; 