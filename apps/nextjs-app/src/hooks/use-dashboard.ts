import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDashboardOverview,
  fetchDashboardStats,
  fetchDashboardSummary,
  refreshDashboardStats,
  loadDashboard,
  clearError,
  selectDashboardOverview,
  selectDashboardStats,
  selectDashboardSummary,
  selectDashboardChartData,
  selectDashboardLoading,
  selectDashboardError,
  selectDashboardLastUpdated,
  selectBudgetProgress,
  selectGuestsProgress,
  selectTasksProgress,
  selectDashboardHealth
} from '@/store/slices/dashboard-slice';

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const overview = useAppSelector(selectDashboardOverview);
  const stats = useAppSelector(selectDashboardStats);
  const summary = useAppSelector(selectDashboardSummary);
  const chartData = useAppSelector(selectDashboardChartData);
  const loading = useAppSelector(selectDashboardLoading);
  const error = useAppSelector(selectDashboardError);
  const lastUpdated = useAppSelector(selectDashboardLastUpdated);
  const budgetProgress = useAppSelector(selectBudgetProgress);
  const guestsProgress = useAppSelector(selectGuestsProgress);
  const tasksProgress = useAppSelector(selectTasksProgress);
  const healthStatus = useAppSelector(selectDashboardHealth);

  // Actions
  const loadOverview = useCallback((userId: string) => {
    return dispatch(fetchDashboardOverview(userId));
  }, [dispatch]);

  const loadStats = useCallback((userId: string) => {
    return dispatch(fetchDashboardStats(userId));
  }, [dispatch]);

  const loadSummary = useCallback((userId: string) => {
    return dispatch(fetchDashboardSummary(userId));
  }, [dispatch]);

  const refreshStats = useCallback((userId: string) => {
    return dispatch(refreshDashboardStats(userId));
  }, [dispatch]);

  const loadAllData = useCallback((userId: string) => {
    return dispatch(loadDashboard(userId));
  }, [dispatch]);

  const clearDashboardError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Utilitaires
  const isDataStale = (maxAgeMinutes: number = 5) => {
    if (!lastUpdated) return true;
    const now = new Date();
    const lastUpdate = new Date(lastUpdated);
    const ageMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    return ageMinutes > maxAgeMinutes;
  };

  const getHealthColor = () => {
    switch (healthStatus.status) {
      case 'excellent': return '#10b981'; // green-500
      case 'good': return '#3b82f6'; // blue-500
      case 'warning': return '#f59e0b'; // amber-500
      case 'critical': return '#ef4444'; // red-500
      default: return '#6b7280'; // gray-500
    }
  };

  const getHealthMessage = () => {
    switch (healthStatus.status) {
      case 'excellent': return 'Tout va parfaitement bien ! 🎉';
      case 'good': return 'Bonne progression 👍';
      case 'warning': return 'Quelques points d\'attention ⚠️';
      case 'critical': return 'Attention requise ! 🚨';
      default: return 'Chargement...';
    }
  };

  // Stats formatées pour l'affichage
  const formattedStats = {
    budget: budgetProgress ? {
      ...budgetProgress,
      percentageColor: budgetProgress.isOverBudget ? '#ef4444' : '#10b981',
      statusText: budgetProgress.isOverBudget ? 'Dépassé' : 'Dans les limites'
    } : null,
    
    guests: guestsProgress ? {
      ...guestsProgress,
      confirmationColor: guestsProgress.confirmationRate > 70 ? '#10b981' : 
                        guestsProgress.confirmationRate > 50 ? '#f59e0b' : '#ef4444',
      statusText: guestsProgress.confirmationRate > 70 ? 'Excellent taux' :
                 guestsProgress.confirmationRate > 50 ? 'Bon taux' : 'Faible taux'
    } : null,
    
    tasks: tasksProgress ? {
      ...tasksProgress,
      progressColor: tasksProgress.isOnTrack ? '#10b981' : '#f59e0b',
      statusText: tasksProgress.isOnTrack ? 'Dans les temps' : 'En retard'
    } : null
  };

  return {
    // State
    overview,
    stats,
    summary,
    chartData,
    loading,
    error,
    lastUpdated,
    budgetProgress,
    guestsProgress,
    tasksProgress,
    healthStatus,
    formattedStats,

    // Actions
    loadOverview,
    loadStats,
    loadSummary,
    refreshStats,
    loadAllData,
    clearDashboardError,

    // Utilities
    isDataStale,
    getHealthColor,
    getHealthMessage,
  };
}; 