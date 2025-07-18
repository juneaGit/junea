import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "❌ Variables d'environnement Supabase manquantes. Créez un fichier .env.local avec:",
  );
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  console.error(
    'Et configurez-les aussi sur Vercel dans Settings > Environment Variables',
  );
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Types pour la base de données
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface WeddingProfile {
  id: string;
  user_id: string;
  couple_name: string;
  wedding_date?: string;
  wedding_type:
    | 'romantique'
    | 'bohemien'
    | 'oriental'
    | 'bollywood'
    | 'bonne_franquette'
    | 'autre';
  venue_type?: string;
  meal_format?: string;
  dietary_restrictions?: string[];
  guest_count?: number;
  budget_total?: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  wedding_id: string;
  title: string;
  description?: string;
  due_date: string;
  completed: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  wedding_id: string;
  category: string;
  description: string;
  estimated_cost: number;
  actual_cost?: number;
  paid: boolean;
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  email?: string;
  phone?: string;
  dietary_restrictions?: string[];
  table_assignment?: number;
  rsvp_status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}
