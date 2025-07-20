export interface AdditionalService {
  id: string;
  user_id: string;
  wedding_profile_id?: string;
  service_name: string;
  service_type: string;
  provider_name?: string;
  estimated_budget: number;
  actual_cost?: number;
  status: 'recherche' | 'contact' | 'reserve' | 'confirme' | 'annule';
  priority: number;
  sort_order: number;
  contact_info?: ContactInfo;
  notes?: string;
  ai_generated: boolean;
  ai_prompt?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  social_media?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export interface CreateAdditionalServiceData {
  service_name: string;
  service_type: string;
  provider_name?: string;
  estimated_budget: number;
  status?: AdditionalService['status'];
  priority?: number;
  contact_info?: ContactInfo;
  notes?: string;
}

export interface UpdateAdditionalServiceData extends Partial<CreateAdditionalServiceData> {
  id: string;
  actual_cost?: number;
  sort_order?: number;
}

export interface AIServiceSuggestion {
  service_name: string;
  service_type: string;
  description: string;
  estimated_budget_min: number;
  estimated_budget_max: number;
  tips: string[];
  providers_suggestions: string[];
  priority_level: number;
}

export interface AIServiceRecommendation {
  wedding_type: string;
  suggestions: AIServiceSuggestion[];
  reasoning: string;
  total_estimated_cost: number;
}

// Service types prédéfinis mais extensibles
export const DEFAULT_SERVICE_TYPES = [
  'Fleuriste',
  'Décoration',
  'Transport',
  'Coiffure & Maquillage',
  'Animation',
  'Sécurité',
  'Nettoyage',
  'Éclairage',
  'Sonorisation',
  'Wedding Planner',
  'Invitations',
  'Cadeaux Invités',
  'Location Matériel',
  'Autre',
] as const;

export type DefaultServiceType = typeof DEFAULT_SERVICE_TYPES[number];

// Statuts avec labels traduits
export const SERVICE_STATUS_LABELS = {
  recherche: { fr: 'En recherche', en: 'Searching', es: 'Buscando' },
  contact: { fr: 'Contacté', en: 'Contacted', es: 'Contactado' },
  reserve: { fr: 'Réservé', en: 'Reserved', es: 'Reservado' },
  confirme: { fr: 'Confirmé', en: 'Confirmed', es: 'Confirmado' },
  annule: { fr: 'Annulé', en: 'Cancelled', es: 'Cancelado' },
} as const;

// Priorités
export const PRIORITY_LEVELS = {
  1: { fr: 'Très faible', en: 'Very Low', es: 'Muy Baja' },
  2: { fr: 'Faible', en: 'Low', es: 'Baja' },
  3: { fr: 'Normale', en: 'Normal', es: 'Normal' },
  4: { fr: 'Élevée', en: 'High', es: 'Alta' },
  5: { fr: 'Critique', en: 'Critical', es: 'Crítica' },
} as const; 