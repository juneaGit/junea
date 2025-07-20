// ===================================
// SERVICES SUPABASE - ARCHITECTURE DYNAMIQUE
// Services centralisés pour toutes les entités de l'app de mariage
// ===================================

import { supabase } from '@/config/supabase';
import type { 
  Budget, BudgetInsert, BudgetUpdate,
  Expense, ExpenseInsert, ExpenseUpdate,
  Guest, GuestInsert, GuestUpdate,  
  Task, TaskInsert, TaskUpdate,
  SeatingPlan, SeatingPlanInsert, SeatingPlanUpdate,
  SeatingTable, SeatingTableInsert, SeatingTableUpdate,
  DashboardStats, DashboardOverview, BudgetByCategory,
  Invitation, InvitationInsert, InvitationUpdate,
  DashboardSummary, ExpenseFormData, GuestFormData, TaskFormData
} from '@/types/database';

// ===================================
// SERVICES BUDGETS
// ===================================

export const budgetService = {
  // Récupérer tous les budgets d'un utilisateur
  async getBudgets(userId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch budgets: ${error.message}`);
    return data || [];
  },

  // Récupérer un budget par ID
  async getBudgetById(budgetId: string, userId: string): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .eq('user_id', userId)
      .single();

    if (error) throw new Error(`Failed to fetch budget: ${error.message}`);
    return data;
  },

  // Créer un nouveau budget
  async createBudget(budgetData: BudgetInsert): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert(budgetData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create budget: ${error.message}`);
    return data;
  },

  // Mettre à jour un budget
  async updateBudget(budgetId: string, updates: BudgetUpdate, userId: string): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', budgetId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update budget: ${error.message}`);
    return data;
  },

  // Supprimer un budget
  async deleteBudget(budgetId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete budget: ${error.message}`);
  }
};

// ===================================
// SERVICES EXPENSES
// ===================================

export const expenseService = {
  // Récupérer toutes les dépenses d'un utilisateur
  async getExpenses(userId: string, budgetId?: string): Promise<Expense[]> {
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId);

    if (budgetId) {
      query = query.eq('budget_id', budgetId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch expenses: ${error.message}`);
    return data || [];
  },

  // Récupérer les dépenses par catégorie pour graphiques
  async getExpensesByCategory(userId: string): Promise<BudgetByCategory[]> {
    const { data, error } = await supabase
      .from('budget_by_category')
      .select('*')
      .eq('user_id', userId)
      .order('total_amount', { ascending: false });

    if (error) throw new Error(`Failed to fetch expenses by category: ${error.message}`);
    return data || [];
  },

  // Créer une nouvelle dépense
  async createExpense(expenseData: ExpenseInsert): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expenseData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create expense: ${error.message}`);
    return data;
  },

  // Créer dépense depuis formulaire
  async createExpenseFromForm(
    formData: ExpenseFormData, 
    budgetId: string, 
    userId: string
  ): Promise<Expense> {
    const expenseData: ExpenseInsert = {
      budget_id: budgetId,
      user_id: userId,
      category: formData.category,
      name: formData.name,
      description: formData.description || null,
      amount: formData.amount,
      vendor_name: formData.vendor_name || null,
      vendor_contact: formData.vendor_contact || null,
      notes: formData.notes || null,
      ai_suggested: formData.ai_suggested || false,
      paid: false,
      priority: 0
    };

    return this.createExpense(expenseData);
  },

  // Mettre à jour une dépense
  async updateExpense(expenseId: string, updates: ExpenseUpdate, userId: string): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', expenseId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update expense: ${error.message}`);
    return data;
  },

  // Marquer une dépense comme payée
  async markAsPaid(expenseId: string, userId: string, paymentDate?: string): Promise<Expense> {
    return this.updateExpense(expenseId, {
      paid: true,
      payment_date: paymentDate || new Date().toISOString()
    }, userId);
  },

  // Supprimer une dépense
  async deleteExpense(expenseId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete expense: ${error.message}`);
  }
};

// ===================================
// SERVICES GUESTS
// ===================================

export const guestService = {
  // Récupérer tous les invités d'un utilisateur
  async getGuests(userId: string): Promise<Guest[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch guests: ${error.message}`);
    return data || [];
  },

  // Récupérer invités par catégorie
  async getGuestsByCategory(userId: string) {
    const guests = await this.getGuests(userId);
    
    return guests.reduce((acc, guest) => {
      const category = guest.category || 'Autre';
      if (!acc[category]) acc[category] = [];
      acc[category].push(guest);
      return acc;
    }, {} as Record<string, Guest[]>);
  },

  // Récupérer invités par statut RSVP
  async getGuestsByRsvpStatus(userId: string) {
    const guests = await this.getGuests(userId);
    
    return {
      pending: guests.filter(g => g.rsvp_status === 'pending'),
      confirmed: guests.filter(g => g.rsvp_status === 'confirmed'),
      declined: guests.filter(g => g.rsvp_status === 'declined')
    };
  },

  // Créer un nouvel invité
  async createGuest(guestData: GuestInsert): Promise<Guest> {
    const { data, error } = await supabase
      .from('guests')
      .insert(guestData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create guest: ${error.message}`);
    return data;
  },

  // Créer invité depuis formulaire
  async createGuestFromForm(formData: GuestFormData, userId: string): Promise<Guest> {
    const guestData: GuestInsert = {
      user_id: userId,
      first_name: formData.first_name,
      last_name: formData.last_name || null,
      email: formData.email || null,
      phone: formData.phone || null,
      category: formData.category,
      plus_one: formData.plus_one || false,
      meal_preference: formData.meal_preference || null,
      notes: formData.notes || null,
      rsvp_status: 'pending',
      invitation_sent: false
    };

    return this.createGuest(guestData);
  },

  // Mettre à jour un invité
  async updateGuest(guestId: string, updates: GuestUpdate, userId: string): Promise<Guest> {
    const { data, error } = await supabase
      .from('guests')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', guestId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update guest: ${error.message}`);
    return data;
  },

  // Assigner une table à un invité
  async assignTable(guestId: string, tableNumber: number, userId: string): Promise<Guest> {
    return this.updateGuest(guestId, { table_assignment: tableNumber }, userId);
  },

  // Mettre à jour le statut RSVP
  async updateRsvpStatus(guestId: string, status: 'pending' | 'confirmed' | 'declined', userId: string): Promise<Guest> {
    return this.updateGuest(guestId, { rsvp_status: status }, userId);
  },

  // Supprimer un invité
  async deleteGuest(guestId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete guest: ${error.message}`);
  }
};

// ===================================
// SERVICES TASKS
// ===================================

export const taskService = {
  // Récupérer toutes les tâches d'un utilisateur
  async getTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) throw new Error(`Failed to fetch tasks: ${error.message}`);
    return data || [];
  },

  // Récupérer tâches par catégorie
  async getTasksByCategory(userId: string) {
    const tasks = await this.getTasks(userId);
    
    return tasks.reduce((acc, task) => {
      const category = task.task_category || 'Autre';
      if (!acc[category]) acc[category] = [];
      acc[category].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  },

  // Créer une nouvelle tâche
  async createTask(taskData: TaskInsert): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create task: ${error.message}`);
    return data;
  },

  // Créer tâche depuis formulaire
  async createTaskFromForm(formData: TaskFormData, userId: string): Promise<Task> {
    const taskData: TaskInsert = {
      user_id: userId,
      title: formData.title,
      description: formData.description || null,
      task_category: formData.task_category,
      priority: formData.priority,
      due_date: formData.due_date || null,
      assigned_to_email: formData.assigned_to_email || null,
      is_completed: false,
      completion_percentage: 0
    };

    return this.createTask(taskData);
  },

  // Mettre à jour une tâche
  async updateTask(taskId: string, updates: TaskUpdate, userId: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update task: ${error.message}`);
    return data;
  },

  // Marquer tâche comme complétée
  async completeTask(taskId: string, userId: string): Promise<Task> {
    return this.updateTask(taskId, {
      is_completed: true,
      completion_percentage: 100
    }, userId);
  },

  // Mettre à jour le pourcentage de completion
  async updateProgress(taskId: string, percentage: number, userId: string): Promise<Task> {
    const isCompleted = percentage >= 100;
    return this.updateTask(taskId, {
      completion_percentage: Math.min(100, Math.max(0, percentage)),
      is_completed: isCompleted
    }, userId);
  },

  // Supprimer une tâche
  async deleteTask(taskId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete task: ${error.message}`);
  }
};

// ===================================
// SERVICES SEATING PLANS
// ===================================

export const seatingService = {
  // Récupérer tous les plans de table d'un utilisateur
  async getSeatingPlans(userId: string): Promise<SeatingPlan[]> {
    const { data, error } = await supabase
      .from('seating_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch seating plans: ${error.message}`);
    return data || [];
  },

  // Récupérer les tables d'un plan de table
  async getSeatingTables(seatingPlanId: string, userId: string): Promise<SeatingTable[]> {
    const { data, error } = await supabase
      .from('seating_tables')
      .select('*')
      .eq('seating_plan_id', seatingPlanId)
      .eq('user_id', userId)
      .order('table_number', { ascending: true });

    if (error) throw new Error(`Failed to fetch seating tables: ${error.message}`);
    return data || [];
  },

  // Créer un nouveau plan de table
  async createSeatingPlan(planData: SeatingPlanInsert): Promise<SeatingPlan> {
    const { data, error } = await supabase
      .from('seating_plans')
      .insert(planData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create seating plan: ${error.message}`);
    return data;
  },

  // Créer une nouvelle table
  async createSeatingTable(tableData: SeatingTableInsert): Promise<SeatingTable> {
    const { data, error } = await supabase
      .from('seating_tables')
      .insert(tableData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create seating table: ${error.message}`);
    return data;
  },

  // Mettre à jour position d'une table (drag-and-drop)
  async updateTablePosition(
    tableId: string, 
    position: { x: number; y: number }, 
    userId: string
  ): Promise<SeatingTable> {
    const { data, error } = await supabase
      .from('seating_tables')
      .update({ 
        position_x: position.x, 
        position_y: position.y,
        updated_at: new Date().toISOString()
      })
      .eq('id', tableId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update table position: ${error.message}`);
    return data;
  },

  // Supprimer une table
  async deleteSeatingTable(tableId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('seating_tables')
      .delete()
      .eq('id', tableId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete seating table: ${error.message}`);
  }
};

// ===================================
// SERVICES DASHBOARD
// ===================================

export const dashboardService = {
  // Récupérer vue complète dashboard
  async getDashboardOverview(userId: string): Promise<DashboardOverview> {
    const { data, error } = await supabase
      .from('dashboard_overview')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw new Error(`Failed to fetch dashboard overview: ${error.message}`);
    return data;
  },

  // Récupérer stats dashboard (version simplifiée)
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const { data, error } = await supabase
      .from('dashboard_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
    return data;
  },

  // Forcer recalcul des stats
  async refreshDashboardStats(userId: string): Promise<void> {
    const { error } = await supabase.rpc('refresh_dashboard_stats', {
      user_uuid: userId
    });

    if (error) throw new Error(`Failed to refresh dashboard stats: ${error.message}`);
  },

  // Construire résumé dashboard pour les composants
  async getDashboardSummary(userId: string): Promise<DashboardSummary> {
    const overview = await this.getDashboardOverview(userId);
    
    return {
      budget: {
        total: overview.budget_total,
        spent: overview.budget_spent,
        remaining: overview.budget_remaining,
        percentage: overview.budget_percentage
      },
      guests: {
        total: overview.guests_total,
        confirmed: overview.guests_confirmed,
        pending: overview.guests_pending,
        declined: overview.guests_declined
      },
      tasks: {
        total: overview.tasks_total,
        completed: overview.tasks_completed,
        pending: overview.tasks_pending,
        overdue: 0, // TODO: calculer avec les dates
        completionPercentage: overview.tasks_completion_percentage
      }
    };
  }
};

// ===================================
// SERVICES INVITATIONS
// ===================================

export const invitationService = {
  // Récupérer toutes les invitations d'un utilisateur
  async getInvitations(userId: string): Promise<Invitation[]> {
    const { data, error } = await supabase
      .from('invitations')
      .select(`
        *,
        guest:guests(first_name, last_name, email)
      `)
      .eq('user_id', userId)
      .order('sent_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch invitations: ${error.message}`);
    return data || [];
  },

  // Envoyer une invitation
  async sendInvitation(guestId: string, userId: string, type: 'save_the_date' | 'invitation' | 'reminder'): Promise<Invitation> {
    const invitationData: InvitationInsert = {
      user_id: userId,
      guest_id: guestId,
      invitation_type: type,
      email_sent: true,
      sent_date: new Date().toISOString(),
      subject_line: `Invitation de mariage - ${type}`,
      email_template: 'default' // TODO: templates personnalisés
    };

    const { data, error } = await supabase
      .from('invitations')
      .insert(invitationData)
      .select()
      .single();

    if (error) throw new Error(`Failed to send invitation: ${error.message}`);

    // Mettre à jour le guest
    await guestService.updateGuest(guestId, {
      invitation_sent: true,
      invitation_sent_date: new Date().toISOString()
    }, userId);

    return data;
  },

  // Marquer invitation comme ouverte
  async markAsOpened(invitationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('invitations')
      .update({
        email_opened: true,
        opened_date: new Date().toISOString()
      })
      .eq('id', invitationId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to mark invitation as opened: ${error.message}`);
  }
};

// ===================================
// SERVICES REALTIME
// ===================================

export const realtimeService = {
  // Subscribe aux changements de budget/expenses pour recalcul automatique
  subscribeToBudgetChanges(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`budget_changes_${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'expenses',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe aux changements d'invités pour plan de table
  subscribeToGuestChanges(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`guest_changes_${userId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guests',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe aux changements de tâches pour dashboard
  subscribeToTaskChanges(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`task_changes_${userId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe aux stats dashboard pour updates temps réel
  subscribeToDashboardStats(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`dashboard_stats_${userId}`)
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public', 
          table: 'dashboard_stats',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Unsubscribe de tous les channels
  unsubscribeAll(userId: string) {
    supabase.removeChannel(`budget_changes_${userId}`);
    supabase.removeChannel(`guest_changes_${userId}`);
    supabase.removeChannel(`task_changes_${userId}`);
    supabase.removeChannel(`dashboard_stats_${userId}`);
  }
};

// ===================================
// EXPORTS
// ===================================

export { 
  budgetService,
  expenseService, 
  guestService,
  taskService,
  seatingService,
  dashboardService,
  invitationService,
  realtimeService
}; 