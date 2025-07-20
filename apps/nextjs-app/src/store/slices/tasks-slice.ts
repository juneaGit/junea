import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { taskService, dashboardService } from '@/services/supabase';
import type { 
  Task, TaskFormData, TaskCategory, TaskPriority
} from '@/types/database';

// ===================================
// TYPES D'ÉTAT
// ===================================

interface TasksState {
  tasks: Task[];
  tasksByCategory: Record<string, Task[]>;
  tasksByStatus: {
    pending: Task[];
    inProgress: Task[];
    completed: Task[];
    overdue: Task[];
  };
  filters: {
    category: TaskCategory | 'all';
    priority: TaskPriority | 'all';
    status: 'all' | 'pending' | 'completed' | 'overdue';
  };
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionPercentage: number;
  };
  loading: {
    tasks: boolean;
    creating: boolean;
    updating: boolean;
  };
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  tasksByCategory: {},
  tasksByStatus: {
    pending: [],
    inProgress: [],
    completed: [],
    overdue: []
  },
  filters: {
    category: 'all',
    priority: 'all',
    status: 'all'
  },
  stats: {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completionPercentage: 0
  },
  loading: {
    tasks: false,
    creating: false,
    updating: false,
  },
  error: null,
};

// ===================================
// ACTIONS ASYNCHRONES
// ===================================

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (userId: string, { rejectWithValue }) => {
    try {
      const tasks = await taskService.getTasks(userId);
      const tasksByCategory = await taskService.getTasksByCategory(userId);
      
      return { tasks, tasksByCategory };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (
    { formData, userId }: { formData: TaskFormData; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const task = await taskService.createTaskFromForm(formData, userId);
      
      // Refresh dashboard stats
      dashboardService.refreshDashboardStats(userId);
      
      return task;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (
    { taskId, updates, userId }: { taskId: string; updates: Partial<Task>; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const task = await taskService.updateTask(taskId, updates, userId);
      
      // Refresh stats si changement de status de completion
      if (updates.is_completed !== undefined || updates.completion_percentage !== undefined) {
        dashboardService.refreshDashboardStats(userId);
      }
      
      return task;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update task');
    }
  }
);

export const completeTask = createAsyncThunk(
  'tasks/completeTask',
  async (
    { taskId, userId }: { taskId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const task = await taskService.completeTask(taskId, userId);
      dashboardService.refreshDashboardStats(userId);
      return task;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to complete task');
    }
  }
);

export const updateTaskProgress = createAsyncThunk(
  'tasks/updateProgress',
  async (
    { taskId, percentage, userId }: { taskId: string; percentage: number; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const task = await taskService.updateProgress(taskId, percentage, userId);
      dashboardService.refreshDashboardStats(userId);
      return task;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update task progress');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async ({ taskId, userId }: { taskId: string; userId: string }, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(taskId, userId);
      dashboardService.refreshDashboardStats(userId);
      return taskId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete task');
    }
  }
);

// ===================================
// SLICE REDUX
// ===================================

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Actions synchrones
    clearError: (state) => {
      state.error = null;
    },

    // Filtres
    setCategoryFilter: (state, action: PayloadAction<TaskCategory | 'all'>) => {
      state.filters.category = action.payload;
    },

    setPriorityFilter: (state, action: PayloadAction<TaskPriority | 'all'>) => {
      state.filters.priority = action.payload;
    },

    setStatusFilter: (state, action: PayloadAction<'all' | 'pending' | 'completed' | 'overdue'>) => {
      state.filters.status = action.payload;
    },

    clearFilters: (state) => {
      state.filters = {
        category: 'all',
        priority: 'all',
        status: 'all'
      };
    },

    // Calcul des stats et groupements locaux
    updateLocalStats: (state) => {
      const tasks = state.tasks;
      const now = new Date();
      
      // Réorganiser par statut
      const overdue = tasks.filter(t => 
        !t.is_completed && 
        t.due_date && 
        new Date(t.due_date) < now
      );
      
      const inProgress = tasks.filter(t => 
        !t.is_completed && 
        t.completion_percentage > 0 &&
        (!t.due_date || new Date(t.due_date) >= now)
      );
      
      const pending = tasks.filter(t => 
        !t.is_completed && 
        t.completion_percentage === 0 &&
        (!t.due_date || new Date(t.due_date) >= now)
      );
      
      const completed = tasks.filter(t => t.is_completed);
      
      state.tasksByStatus = {
        pending,
        inProgress, 
        completed,
        overdue
      };
      
      // Calcul des stats
      const total = tasks.length;
      const completedCount = completed.length;
      const pendingCount = pending.length + inProgress.length;
      const overdueCount = overdue.length;
      
      state.stats = {
        total,
        completed: completedCount,
        pending: pendingCount,
        overdue: overdueCount,
        completionPercentage: total > 0 ? Math.round((completedCount / total) * 100) : 0
      };
    },

    // Réinitialisation
    reset: (state) => {
      return initialState;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // ===================================
      // FETCH TASKS
      // ===================================
      .addCase(fetchTasks.pending, (state) => {
        state.loading.tasks = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading.tasks = false;
        state.tasks = action.payload.tasks;
        state.tasksByCategory = action.payload.tasksByCategory;
        
        // Recalculer stats et groupements
        tasksSlice.caseReducers.updateLocalStats(state);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading.tasks = false;
        state.error = action.payload as string;
      })

      // ===================================
      // CREATE TASK
      // ===================================
      .addCase(createTask.pending, (state) => {
        state.loading.creating = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.tasks.unshift(action.payload);
        
        // Mettre à jour tasksByCategory
        const category = action.payload.task_category;
        if (!state.tasksByCategory[category]) {
          state.tasksByCategory[category] = [];
        }
        state.tasksByCategory[category].unshift(action.payload);
        
        // Recalculer stats
        tasksSlice.caseReducers.updateLocalStats(state);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading.creating = false;
        state.error = action.payload as string;
      })

      // ===================================
      // UPDATE TASK
      // ===================================
      .addCase(updateTask.pending, (state) => {
        state.loading.updating = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading.updating = false;
        
        const updatedTask = action.payload;
        const index = state.tasks.findIndex(t => t.id === updatedTask.id);
        
        if (index !== -1) {
          const oldTask = state.tasks[index];
          state.tasks[index] = updatedTask;
          
          // Mettre à jour tasksByCategory si la catégorie a changé
          if (oldTask.task_category !== updatedTask.task_category) {
            // Retirer de l'ancienne catégorie
            if (state.tasksByCategory[oldTask.task_category]) {
              state.tasksByCategory[oldTask.task_category] = 
                state.tasksByCategory[oldTask.task_category].filter(t => t.id !== updatedTask.id);
            }
            
            // Ajouter à la nouvelle catégorie
            if (!state.tasksByCategory[updatedTask.task_category]) {
              state.tasksByCategory[updatedTask.task_category] = [];
            }
            state.tasksByCategory[updatedTask.task_category].push(updatedTask);
          } else {
            // Mettre à jour dans la même catégorie
            if (state.tasksByCategory[updatedTask.task_category]) {
              const categoryIndex = state.tasksByCategory[updatedTask.task_category]
                .findIndex(t => t.id === updatedTask.id);
              if (categoryIndex !== -1) {
                state.tasksByCategory[updatedTask.task_category][categoryIndex] = updatedTask;
              }
            }
          }
        }
        
        // Recalculer stats
        tasksSlice.caseReducers.updateLocalStats(state);
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.payload as string;
      })

      // ===================================
      // COMPLETE TASK
      // ===================================
      .addCase(completeTask.fulfilled, (state, action) => {
        const completedTask = action.payload;
        const index = state.tasks.findIndex(t => t.id === completedTask.id);
        
        if (index !== -1) {
          state.tasks[index] = completedTask;
          
          // Mettre à jour dans la catégorie
          if (state.tasksByCategory[completedTask.task_category]) {
            const categoryIndex = state.tasksByCategory[completedTask.task_category]
              .findIndex(t => t.id === completedTask.id);
            if (categoryIndex !== -1) {
              state.tasksByCategory[completedTask.task_category][categoryIndex] = completedTask;
            }
          }
        }
        
        // Recalculer stats
        tasksSlice.caseReducers.updateLocalStats(state);
      })

      // ===================================
      // UPDATE PROGRESS
      // ===================================
      .addCase(updateTaskProgress.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        const index = state.tasks.findIndex(t => t.id === updatedTask.id);
        
        if (index !== -1) {
          state.tasks[index] = updatedTask;
          
          // Mettre à jour dans la catégorie
          if (state.tasksByCategory[updatedTask.task_category]) {
            const categoryIndex = state.tasksByCategory[updatedTask.task_category]
              .findIndex(t => t.id === updatedTask.id);
            if (categoryIndex !== -1) {
              state.tasksByCategory[updatedTask.task_category][categoryIndex] = updatedTask;
            }
          }
        }
        
        // Recalculer stats
        tasksSlice.caseReducers.updateLocalStats(state);
      })

      // ===================================
      // DELETE TASK
      // ===================================
      .addCase(deleteTask.fulfilled, (state, action) => {
        const taskId = action.payload;
        
        // Trouver et retirer de tasks
        const taskIndex = state.tasks.findIndex(t => t.id === taskId);
        let deletedTask: Task | null = null;
        
        if (taskIndex !== -1) {
          deletedTask = state.tasks[taskIndex];
          state.tasks.splice(taskIndex, 1);
        }
        
        if (deletedTask) {
          // Retirer de tasksByCategory
          if (state.tasksByCategory[deletedTask.task_category]) {
            state.tasksByCategory[deletedTask.task_category] = 
              state.tasksByCategory[deletedTask.task_category].filter(t => t.id !== taskId);
          }
        }
        
        // Recalculer stats
        tasksSlice.caseReducers.updateLocalStats(state);
      });
  },
});

// ===================================
// EXPORTS
// ===================================

export const { 
  clearError, 
  setCategoryFilter, 
  setPriorityFilter, 
  setStatusFilter, 
  clearFilters,
  updateLocalStats,
  reset 
} = tasksSlice.actions;

// Selectors
export const selectTasks = (state: { tasks: TasksState }) => state.tasks.tasks;
export const selectTasksByCategory = (state: { tasks: TasksState }) => state.tasks.tasksByCategory;
export const selectTasksByStatus = (state: { tasks: TasksState }) => state.tasks.tasksByStatus;
export const selectTasksFilters = (state: { tasks: TasksState }) => state.tasks.filters;
export const selectTasksStats = (state: { tasks: TasksState }) => state.tasks.stats;
export const selectTasksLoading = (state: { tasks: TasksState }) => state.tasks.loading;
export const selectTasksError = (state: { tasks: TasksState }) => state.tasks.error;

// Selectors avancés avec filtres appliqués
export const selectFilteredTasks = (state: { tasks: TasksState }) => {
  const { tasks, filters } = state.tasks;
  
  return tasks.filter(task => {
    // Filtre par catégorie
    if (filters.category !== 'all' && task.task_category !== filters.category) {
      return false;
    }
    
    // Filtre par priorité
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }
    
    // Filtre par statut
    if (filters.status !== 'all') {
      const now = new Date();
      const isOverdue = !task.is_completed && task.due_date && new Date(task.due_date) < now;
      
      if (filters.status === 'completed' && !task.is_completed) {
        return false;
      }
      if (filters.status === 'pending' && task.is_completed) {
        return false;
      }
      if (filters.status === 'overdue' && !isOverdue) {
        return false;
      }
    }
    
    return true;
  });
};

export const selectTasksPriority = (state: { tasks: TasksState }) => {
  const tasks = selectFilteredTasks(state);
  return {
    critical: tasks.filter(t => t.priority === 'critical'),
    high: tasks.filter(t => t.priority === 'high'),
    medium: tasks.filter(t => t.priority === 'medium'),
    low: tasks.filter(t => t.priority === 'low')
  };
};

export const selectUpcomingTasks = (state: { tasks: TasksState }) => {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return state.tasks.tasks.filter(task => 
    !task.is_completed &&
    task.due_date &&
    new Date(task.due_date) >= now &&
    new Date(task.due_date) <= nextWeek
  ).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
};

export default tasksSlice.reducer; 