import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchGuests,
  createGuest,
  updateGuest,
  updateRsvpStatus,
  assignTable,
  deleteGuest,
  fetchInvitations,
  sendInvitation,
  sendBulkInvitations,
  clearError,
  filterByCategory,
  selectGuests,
  selectGuestsByCategory,
  selectGuestsByRsvp,
  selectGuestsStats,
  selectInvitations,
  selectGuestsLoading,
  selectGuestsError,
  selectGuestsByTable,
  selectConfirmedGuests,
  selectUnassignedGuests
} from '@/store/slices/guests-slice';
import type { GuestFormData, RsvpStatus, GuestCategory } from '@/types/database';

export const useGuests = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const guests = useAppSelector(selectGuests);
  const guestsByCategory = useAppSelector(selectGuestsByCategory);
  const guestsByRsvp = useAppSelector(selectGuestsByRsvp);
  const guestsByTable = useAppSelector(selectGuestsByTable);
  const stats = useAppSelector(selectGuestsStats);
  const invitations = useAppSelector(selectInvitations);
  const loading = useAppSelector(selectGuestsLoading);
  const error = useAppSelector(selectGuestsError);
  const confirmedGuests = useAppSelector(selectConfirmedGuests);
  const unassignedGuests = useAppSelector(selectUnassignedGuests);

  // Actions Invités
  const loadGuests = useCallback((userId: string) => {
    return dispatch(fetchGuests(userId));
  }, [dispatch]);

  const addGuest = useCallback((formData: GuestFormData, userId: string) => {
    return dispatch(createGuest({ formData, userId }));
  }, [dispatch]);

  const editGuest = useCallback((guestId: string, updates: any, userId: string) => {
    return dispatch(updateGuest({ guestId, updates, userId }));
  }, [dispatch]);

  const updateGuestRsvp = useCallback((guestId: string, status: RsvpStatus, userId: string) => {
    return dispatch(updateRsvpStatus({ guestId, status, userId }));
  }, [dispatch]);

  const assignGuestTable = useCallback((guestId: string, tableNumber: number, userId: string) => {
    return dispatch(assignTable({ guestId, tableNumber, userId }));
  }, [dispatch]);

  const removeGuest = useCallback((guestId: string, userId: string) => {
    return dispatch(deleteGuest({ guestId, userId }));
  }, [dispatch]);

  // Actions Invitations
  const loadInvitations = useCallback((userId: string) => {
    return dispatch(fetchInvitations(userId));
  }, [dispatch]);

  const sendGuestInvitation = useCallback((
    guestId: string, 
    userId: string, 
    type: 'save_the_date' | 'invitation' | 'reminder'
  ) => {
    return dispatch(sendInvitation({ guestId, userId, type }));
  }, [dispatch]);

  const sendMultipleInvitations = useCallback((
    guestIds: string[], 
    userId: string, 
    type: 'save_the_date' | 'invitation' | 'reminder'
  ) => {
    return dispatch(sendBulkInvitations({ guestIds, userId, type }));
  }, [dispatch]);

  // Filtres et utilitaires
  const filterGuestsByCategory = useCallback((category: GuestCategory | 'all') => {
    dispatch(filterByCategory(category));
  }, [dispatch]);

  const clearGuestsError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Fonctions utilitaires
  const getGuestsByStatus = useCallback((status: RsvpStatus) => {
    return guests.filter(guest => guest.rsvp_status === status);
  }, [guests]);

  const getGuestsByPlusOne = useCallback(() => {
    return {
      withPlusOne: guests.filter(guest => guest.plus_one),
      withoutPlusOne: guests.filter(guest => !guest.plus_one)
    };
  }, [guests]);

  const calculateTotalAttendees = useCallback(() => {
    const confirmed = confirmedGuests.length;
    const plusOnes = confirmedGuests.filter(guest => guest.plus_one).length;
    return confirmed + plusOnes;
  }, [confirmedGuests]);

  const getTableAssignmentStats = useCallback(() => {
    const assigned = guests.filter(guest => guest.table_assignment !== null).length;
    const unassigned = guests.filter(guest => guest.table_assignment === null).length;
    
    return {
      assigned,
      unassigned,
      assignmentPercentage: guests.length > 0 ? Math.round((assigned / guests.length) * 100) : 0
    };
  }, [guests]);

  // Stats formatées pour l'affichage
  const formattedStats = {
    ...stats,
    totalAttendees: calculateTotalAttendees(),
    tableAssignment: getTableAssignmentStats(),
    confirmationRate: stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0,
    responseRate: stats.total > 0 ? 
      Math.round(((stats.confirmed + stats.declined) / stats.total) * 100) : 0
  };

  // Données pour graphiques
  const chartData = {
    rsvpDistribution: [
      { name: 'Confirmés', value: stats.confirmed, color: '#10b981' },
      { name: 'En attente', value: stats.pending, color: '#f59e0b' },
      { name: 'Déclinés', value: stats.declined, color: '#ef4444' }
    ],
    categoryDistribution: Object.entries(guestsByCategory).map(([category, guestList]) => ({
      name: category,
      value: guestList.length,
      percentage: stats.total > 0 ? Math.round((guestList.length / stats.total) * 100) : 0
    })),
    tableAssignment: [
      { name: 'Assignés', value: formattedStats.tableAssignment.assigned, color: '#3b82f6' },
      { name: 'Non assignés', value: formattedStats.tableAssignment.unassigned, color: '#6b7280' }
    ]
  };

  // Fonctions de validation
  const validateGuestData = useCallback((formData: GuestFormData) => {
    const errors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'Le prénom est requis';
    }

    if (formData.email && !formData.email.includes('@')) {
      errors.email = 'Email invalide';
    }

    if (formData.phone && formData.phone.length < 10) {
      errors.phone = 'Numéro de téléphone invalide';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  // Recherche et filtres
  const searchGuests = useCallback((searchTerm: string, category?: GuestCategory | 'all') => {
    let filteredGuests = guests;

    // Filtre par terme de recherche
    if (searchTerm) {
      filteredGuests = filteredGuests.filter(guest => 
        guest.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (guest.last_name && guest.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par catégorie
    if (category && category !== 'all') {
      filteredGuests = filteredGuests.filter(guest => guest.category === category);
    }

    return filteredGuests;
  }, [guests]);

  return {
    // State
    guests,
    guestsByCategory,
    guestsByRsvp,
    guestsByTable,
    stats: formattedStats,
    invitations,
    loading,
    error,
    confirmedGuests,
    unassignedGuests,
    chartData,

    // Actions
    loadGuests,
    addGuest,
    editGuest,
    updateGuestRsvp,
    assignGuestTable,
    removeGuest,
    loadInvitations,
    sendGuestInvitation,
    sendMultipleInvitations,
    filterGuestsByCategory,
    clearGuestsError,

    // Utilities
    getGuestsByStatus,
    getGuestsByPlusOne,
    calculateTotalAttendees,
    getTableAssignmentStats,
    validateGuestData,
    searchGuests,
  };
}; 