// ===================================
// TYPES SUPABASE - ARCHITECTURE DYNAMIQUE COMPLÈTE
// Types générés pour l'application de mariage dynamique
// ===================================

// ===================================
// TYPES DE BASE
// ===================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      budgets: {
        Row: Budget;
        Insert: BudgetInsert;
        Update: BudgetUpdate;
      };
      expenses: {
        Row: Expense;
        Insert: ExpenseInsert;
        Update: ExpenseUpdate;
      };
      guests: {
        Row: Guest;
        Insert: GuestInsert;
        Update: GuestUpdate;
      };
      seating_plans: {
        Row: SeatingPlan;
        Insert: SeatingPlanInsert;
        Update: SeatingPlanUpdate;
      };
      seating_tables: {
        Row: SeatingTable;
        Insert: SeatingTableInsert;
        Update: SeatingTableUpdate;
      };
      tasks: {
        Row: Task;
        Insert: TaskInsert;
        Update: TaskUpdate;
      };
      dashboard_stats: {
        Row: DashboardStats;
        Insert: DashboardStatsInsert;
        Update: DashboardStatsUpdate;
      };
      invitations: {
        Row: Invitation;
        Insert: InvitationInsert;
        Update: InvitationUpdate;
      };
    };
    Views: {
      dashboard_overview: {
        Row: DashboardOverview;
      };
      budget_by_category: {
        Row: BudgetByCategory;
      };
    };
    Functions: {
      refresh_dashboard_stats: {
        Args: { user_uuid: string };
        Returns: void;
      };
      create_demo_data: {
        Args: { target_user_id: string };
        Returns: void;
      };
    };
  };
};

// ===================================
// TYPES PROFILES (Utilisateurs)
// ===================================

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  language: 'fr' | 'en' | 'es' | null;
  wedding_date: string | null;
  total_budget: number | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  language?: 'fr' | 'en' | 'es' | null;
  wedding_date?: string | null;
  total_budget?: number | null;
  onboarding_completed?: boolean;
}

export interface ProfileUpdate {
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  language?: 'fr' | 'en' | 'es' | null;
  wedding_date?: string | null;
  total_budget?: number | null;
  onboarding_completed?: boolean;
  updated_at?: string;
}

// ===================================
// TYPES BUDGETS
// ===================================

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  spent_amount: number;
  status: 'draft' | 'active' | 'completed';
  wedding_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetInsert {
  user_id: string;
  name?: string;
  total_amount?: number;
  spent_amount?: number;
  status?: 'draft' | 'active' | 'completed';
  wedding_date?: string | null;
}

export interface BudgetUpdate {
  name?: string;
  total_amount?: number;
  spent_amount?: number;
  status?: 'draft' | 'active' | 'completed';
  wedding_date?: string | null;
  updated_at?: string;
}

// ===================================
// TYPES EXPENSES (Dépenses)
// ===================================

export type ExpenseCategory = 
  | 'Lieu' 
  | 'Traiteur' 
  | 'Photographe' 
  | 'Videographe' 
  | 'DJ/Musique'
  | 'Fleurs' 
  | 'Decoration' 
  | 'Robe' 
  | 'Costume' 
  | 'Transport'
  | 'Invitations' 
  | 'Coiffure' 
  | 'Maquillage' 
  | 'Bijoux' 
  | 'Autre';

export interface Expense {
  id: string;
  budget_id: string;
  user_id: string;
  category: ExpenseCategory;
  name: string;
  description: string | null;
  amount: number;
  paid: boolean;
  payment_date: string | null;
  vendor_name: string | null;
  vendor_contact: string | null;
  priority: number;
  ai_suggested: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInsert {
  budget_id: string;
  user_id: string;
  category: ExpenseCategory;
  name: string;
  description?: string | null;
  amount: number;
  paid?: boolean;
  payment_date?: string | null;
  vendor_name?: string | null;
  vendor_contact?: string | null;
  priority?: number;
  ai_suggested?: boolean;
  notes?: string | null;
}

export interface ExpenseUpdate {
  budget_id?: string;
  category?: ExpenseCategory;
  name?: string;
  description?: string | null;
  amount?: number;
  paid?: boolean;
  payment_date?: string | null;
  vendor_name?: string | null;
  vendor_contact?: string | null;
  priority?: number;
  ai_suggested?: boolean;
  notes?: string | null;
  updated_at?: string;
}

// ===================================
// TYPES GUESTS (Invités)
// ===================================

export type GuestCategory = 'Famille' | 'Amis' | 'Collegues' | 'Autre';
export type RsvpStatus = 'pending' | 'confirmed' | 'declined';

export interface Guest {
  id: string;
  user_id: string;
  wedding_profile_id: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  category: GuestCategory;
  rsvp_status: RsvpStatus;
  meal_preference: string | null;
  plus_one: boolean;
  table_assignment: number | null;
  notes: string | null;
  invitation_sent: boolean;
  invitation_sent_date: string | null;
  rsvp_token: string;
  created_at: string;
  updated_at: string;
}

export interface GuestInsert {
  user_id: string;
  wedding_profile_id?: string | null;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  category?: GuestCategory;
  rsvp_status?: RsvpStatus;
  meal_preference?: string | null;
  plus_one?: boolean;
  table_assignment?: number | null;
  notes?: string | null;
  invitation_sent?: boolean;
  invitation_sent_date?: string | null;
}

export interface GuestUpdate {
  first_name?: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  category?: GuestCategory;
  rsvp_status?: RsvpStatus;
  meal_preference?: string | null;
  plus_one?: boolean;
  table_assignment?: number | null;
  notes?: string | null;
  invitation_sent?: boolean;
  invitation_sent_date?: string | null;
  updated_at?: string;
}

// ===================================
// TYPES SEATING PLANS (Plan de Table)
// ===================================

export interface SeatingPlan {
  id: string;
  user_id: string;
  name: string;
  wedding_date: string | null;
  venue_layout: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeatingPlanInsert {
  user_id: string;
  name?: string;
  wedding_date?: string | null;
  venue_layout?: string | null;
}

export interface SeatingPlanUpdate {
  name?: string;
  wedding_date?: string | null;
  venue_layout?: string | null;
  updated_at?: string;
}

export type TableType = 'round' | 'rectangular' | 'square';

export interface SeatingTable {
  id: string;
  seating_plan_id: string;
  user_id: string;
  table_number: number;
  table_name: string | null;
  max_seats: number;
  table_type: TableType;
  position_x: number;
  position_y: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeatingTableInsert {
  seating_plan_id: string;
  user_id: string;
  table_number: number;
  table_name?: string | null;
  max_seats?: number;
  table_type?: TableType;
  position_x?: number;
  position_y?: number;
  notes?: string | null;
}

export interface SeatingTableUpdate {
  table_number?: number;
  table_name?: string | null;
  max_seats?: number;
  table_type?: TableType;
  position_x?: number;
  position_y?: number;
  notes?: string | null;
  updated_at?: string;
}

// ===================================
// TYPES TASKS (Tâches)
// ===================================

export type TaskCategory = 
  | 'Administratif' 
  | 'Lieu' 
  | 'Traiteur' 
  | 'Decoration' 
  | 'Invitations'
  | 'Musique' 
  | 'Photo/Video' 
  | 'Transport' 
  | 'Autre';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  user_id: string;
  wedding_profile_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  task_category: TaskCategory;
  is_completed: boolean;
  completion_percentage: number;
  assigned_to: string | null;
  assigned_to_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  user_id: string;
  wedding_profile_id?: string | null;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: TaskPriority;
  task_category?: TaskCategory;
  is_completed?: boolean;
  completion_percentage?: number;
  assigned_to?: string | null;
  assigned_to_email?: string | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  due_date?: string | null;
  priority?: TaskPriority;
  task_category?: TaskCategory;
  is_completed?: boolean;
  completion_percentage?: number;
  assigned_to?: string | null;
  assigned_to_email?: string | null;
  updated_at?: string;
}

// ===================================
// TYPES DASHBOARD STATS (Statistiques)
// ===================================

export interface DashboardStats {
  id: string;
  user_id: string;
  total_budget: number;
  spent_amount: number;
  remaining_budget: number;
  budget_percentage: number;
  total_guests: number;
  confirmed_guests: number;
  pending_guests: number;
  declined_guests: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  last_calculated: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStatsInsert {
  user_id: string;
  total_budget?: number;
  spent_amount?: number;
  remaining_budget?: number;
  budget_percentage?: number;
  total_guests?: number;
  confirmed_guests?: number;
  pending_guests?: number;
  declined_guests?: number;
  total_tasks?: number;
  completed_tasks?: number;
  pending_tasks?: number;
  overdue_tasks?: number;
  last_calculated?: string;
}

export interface DashboardStatsUpdate {
  total_budget?: number;
  spent_amount?: number;
  remaining_budget?: number;
  budget_percentage?: number;
  total_guests?: number;
  confirmed_guests?: number;
  pending_guests?: number;
  declined_guests?: number;
  total_tasks?: number;
  completed_tasks?: number;
  pending_tasks?: number;
  overdue_tasks?: number;
  last_calculated?: string;
  updated_at?: string;
}

// ===================================
// TYPES INVITATIONS
// ===================================

export type InvitationType = 'save_the_date' | 'invitation' | 'reminder';

export interface Invitation {
  id: string;
  user_id: string;
  guest_id: string;
  invitation_type: InvitationType;
  email_sent: boolean;
  email_opened: boolean;
  email_clicked: boolean;
  sent_date: string | null;
  opened_date: string | null;
  clicked_date: string | null;
  rsvp_date: string | null;
  email_template: string | null;
  subject_line: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvitationInsert {
  user_id: string;
  guest_id: string;
  invitation_type?: InvitationType;
  email_sent?: boolean;
  email_opened?: boolean;
  email_clicked?: boolean;
  sent_date?: string | null;
  opened_date?: string | null;
  clicked_date?: string | null;
  rsvp_date?: string | null;
  email_template?: string | null;
  subject_line?: string | null;
}

export interface InvitationUpdate {
  invitation_type?: InvitationType;
  email_sent?: boolean;
  email_opened?: boolean;
  email_clicked?: boolean;
  sent_date?: string | null;
  opened_date?: string | null;
  clicked_date?: string | null;
  rsvp_date?: string | null;
  email_template?: string | null;
  subject_line?: string | null;
  updated_at?: string;
}

// ===================================
// TYPES VUES (Views)
// ===================================

export interface DashboardOverview {
  user_id: string;
  full_name: string | null;
  wedding_date: string | null;
  profile_budget: number | null;
  budget_total: number;
  budget_spent: number;
  budget_remaining: number;
  budget_percentage: number;
  guests_total: number;
  guests_confirmed: number;
  guests_pending: number;
  guests_declined: number;
  tasks_total: number;
  tasks_completed: number;
  tasks_pending: number;
  tasks_completion_percentage: number;
}

export interface BudgetByCategory {
  user_id: string;
  category: ExpenseCategory;
  expense_count: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  avg_expense: number;
  min_expense: number;
  max_expense: number;
}

// ===================================
// TYPES UTILITAIRES
// ===================================

// Type pour les formulaires d'ajout de dépenses
export interface ExpenseFormData {
  category: ExpenseCategory;
  name: string;
  description?: string;
  amount: number;
  vendor_name?: string;
  vendor_contact?: string;
  notes?: string;
  ai_suggested?: boolean;
}

// Type pour les formulaires d'ajout d'invités
export interface GuestFormData {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  category: GuestCategory;
  plus_one?: boolean;
  meal_preference?: string;
  notes?: string;
}

// Type pour les formulaires de tâches
export interface TaskFormData {
  title: string;
  description?: string;
  task_category: TaskCategory;
  priority: TaskPriority;
  due_date?: string;
  assigned_to_email?: string;
}

// Type pour les stats du dashboard (version allégée)
export interface DashboardSummary {
  budget: {
    total: number;
    spent: number;
    remaining: number;
    percentage: number;
  };
  guests: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionPercentage: number;
  };
}

// Type pour les charts/graphiques
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

// Type pour les options de drag-and-drop (plan de table)
export interface DragDropResult {
  guestId: string;
  sourceTableId?: string;
  destinationTableId?: string;
  position?: { x: number; y: number };
}

// Type pour les filtres et tri
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

export interface FilterOption {
  field: string;
  value: any;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  label: string;
}

// ===================================
// TYPES POUR L'API REDUX
// ===================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===================================
// EXPORTS
// ===================================

export type Tables = Database['public']['Tables'];
export type Views = Database['public']['Views'];
export type Functions = Database['public']['Functions']; 