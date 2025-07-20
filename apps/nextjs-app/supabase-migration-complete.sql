-- ===================================
-- MIGRATION SUPABASE COMPLÈTE ET SÉCURISÉE
-- Script pour créer TOUTES les tables nécessaires
-- ===================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================
-- TABLE PROFILES (mise à jour avec colonne language)
-- ===================================

-- Vérifier si la table profiles existe, sinon la créer
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter la colonne language si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'language'
    ) THEN
        ALTER TABLE profiles ADD COLUMN language TEXT CHECK (language IN ('fr', 'en', 'es')) DEFAULT 'fr';
    END IF;
END $$;

-- ===================================
-- TABLE WEDDING_PROFILES
-- ===================================
CREATE TABLE IF NOT EXISTS wedding_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wedding_date DATE,
    wedding_type TEXT CHECK (wedding_type IN ('romantique', 'bohemien', 'oriental', 'bollywood', 'bonne_franquette', 'moderne', 'traditionnel')),
    venue_type TEXT,
    meal_format TEXT,
    dietary_restrictions TEXT[],
    estimated_guests INTEGER DEFAULT 0,
    estimated_budget DECIMAL(10,2) DEFAULT 0,
    partner_name TEXT,
    wedding_location TEXT,
    theme_colors TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABLE ADDITIONAL_SERVICES
-- ===================================
CREATE TABLE IF NOT EXISTS additional_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wedding_profile_id UUID REFERENCES wedding_profiles(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    provider_name TEXT,
    estimated_budget DECIMAL(10,2) DEFAULT 0,
    actual_cost DECIMAL(10,2),
    status TEXT CHECK (status IN ('recherche', 'contact', 'reserve', 'confirme', 'annule')) DEFAULT 'recherche',
    priority INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    notes TEXT,
    ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABLE DAY_PLANNING_EVENTS
-- ===================================
CREATE TABLE IF NOT EXISTS day_planning_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wedding_profile_id UUID REFERENCES wedding_profiles(id) ON DELETE CASCADE,
    event_title TEXT NOT NULL,
    event_start TIMESTAMP WITH TIME ZONE NOT NULL,
    event_end TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    responsible_person TEXT,
    location TEXT,
    color TEXT DEFAULT '#8B5CF6',
    ai_generated BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABLE TASKS (optionnelle pour le planning)
-- ===================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wedding_profile_id UUID REFERENCES wedding_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    category TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABLE GUESTS (optionnelle)
-- ===================================
CREATE TABLE IF NOT EXISTS guests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wedding_profile_id UUID REFERENCES wedding_profiles(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    rsvp_status TEXT CHECK (rsvp_status IN ('pending', 'confirmed', 'declined')) DEFAULT 'pending',
    meal_preference TEXT,
    plus_one BOOLEAN DEFAULT FALSE,
    table_assignment INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABLE BUDGET_ITEMS (optionnelle)
-- ===================================
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wedding_profile_id UUID REFERENCES wedding_profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    item_name TEXT NOT NULL,
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    actual_cost DECIMAL(10,2),
    vendor_name TEXT,
    vendor_contact TEXT,
    status TEXT CHECK (status IN ('planned', 'booked', 'paid', 'cancelled')) DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- RLS (ROW LEVEL SECURITY) - PROFILES
-- ===================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- ===================================
-- RLS (ROW LEVEL SECURITY) - WEDDING_PROFILES
-- ===================================
ALTER TABLE wedding_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own wedding profiles" ON wedding_profiles;
DROP POLICY IF EXISTS "Users can insert their own wedding profiles" ON wedding_profiles;
DROP POLICY IF EXISTS "Users can update their own wedding profiles" ON wedding_profiles;
DROP POLICY IF EXISTS "Users can delete their own wedding profiles" ON wedding_profiles;

CREATE POLICY "Users can view their own wedding profiles" ON wedding_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wedding profiles" ON wedding_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wedding profiles" ON wedding_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wedding profiles" ON wedding_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- ===================================
-- RLS (ROW LEVEL SECURITY) - ADDITIONAL_SERVICES
-- ===================================
ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own additional services" ON additional_services;
DROP POLICY IF EXISTS "Users can insert their own additional services" ON additional_services;
DROP POLICY IF EXISTS "Users can update their own additional services" ON additional_services;
DROP POLICY IF EXISTS "Users can delete their own additional services" ON additional_services;

CREATE POLICY "Users can view their own additional services" ON additional_services
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own additional services" ON additional_services
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own additional services" ON additional_services
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own additional services" ON additional_services
    FOR DELETE USING (auth.uid() = user_id);

-- ===================================
-- RLS (ROW LEVEL SECURITY) - DAY_PLANNING_EVENTS
-- ===================================
ALTER TABLE day_planning_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own planning events" ON day_planning_events;
DROP POLICY IF EXISTS "Users can insert their own planning events" ON day_planning_events;
DROP POLICY IF EXISTS "Users can update their own planning events" ON day_planning_events;
DROP POLICY IF EXISTS "Users can delete their own planning events" ON day_planning_events;

CREATE POLICY "Users can view their own planning events" ON day_planning_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planning events" ON day_planning_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planning events" ON day_planning_events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planning events" ON day_planning_events
    FOR DELETE USING (auth.uid() = user_id);

-- ===================================
-- RLS POUR LES AUTRES TABLES
-- ===================================

-- TASKS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
CREATE POLICY "Users can manage their own tasks" ON tasks
    FOR ALL USING (auth.uid() = user_id);

-- GUESTS
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own guests" ON guests;
CREATE POLICY "Users can manage their own guests" ON guests
    FOR ALL USING (auth.uid() = user_id);

-- BUDGET_ITEMS
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own budget items" ON budget_items;
CREATE POLICY "Users can manage their own budget items" ON budget_items
    FOR ALL USING (auth.uid() = user_id);

-- ===================================
-- FONCTIONS ET TRIGGERS
-- ===================================

-- Fonction pour créer automatiquement un profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, language)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Utilisateur'), 
        NEW.email,
        'fr' -- Langue par défaut
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        email = COALESCE(EXCLUDED.email, profiles.email),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer un profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers updated_at pour toutes les tables
DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_wedding_profiles ON wedding_profiles;
CREATE TRIGGER set_updated_at_wedding_profiles
    BEFORE UPDATE ON wedding_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_additional_services ON additional_services;
CREATE TRIGGER set_updated_at_additional_services
    BEFORE UPDATE ON additional_services
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_day_planning_events ON day_planning_events;
CREATE TRIGGER set_updated_at_day_planning_events
    BEFORE UPDATE ON day_planning_events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_tasks ON tasks;
CREATE TRIGGER set_updated_at_tasks
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_guests ON guests;
CREATE TRIGGER set_updated_at_guests
    BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_budget_items ON budget_items;
CREATE TRIGGER set_updated_at_budget_items
    BEFORE UPDATE ON budget_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===================================
-- INDEXES POUR PERFORMANCE
-- ===================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Wedding Profiles
CREATE INDEX IF NOT EXISTS idx_wedding_profiles_user_id ON wedding_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_profiles_wedding_date ON wedding_profiles(wedding_date);

-- Additional Services
CREATE INDEX IF NOT EXISTS idx_additional_services_user_id ON additional_services(user_id);
CREATE INDEX IF NOT EXISTS idx_additional_services_status ON additional_services(status);
CREATE INDEX IF NOT EXISTS idx_additional_services_sort_order ON additional_services(sort_order);

-- Day Planning Events
CREATE INDEX IF NOT EXISTS idx_day_planning_events_user_id ON day_planning_events(user_id);
CREATE INDEX IF NOT EXISTS idx_day_planning_events_start ON day_planning_events(event_start);
CREATE INDEX IF NOT EXISTS idx_day_planning_events_sort_order ON day_planning_events(sort_order);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks(is_completed);

-- Guests
CREATE INDEX IF NOT EXISTS idx_guests_user_id ON guests(user_id);
CREATE INDEX IF NOT EXISTS idx_guests_rsvp_status ON guests(rsvp_status);

-- Budget Items
CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON budget_items(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_category ON budget_items(category);

-- ===================================
-- VÉRIFICATIONS FINALES
-- ===================================

-- Vérifier que toutes les tables sont créées
DO $$
DECLARE
    required_tables TEXT[] := ARRAY['profiles', 'wedding_profiles', 'additional_services', 'day_planning_events', 'tasks', 'guests', 'budget_items'];
    table_name TEXT;
    missing_tables TEXT[] := '{}';
BEGIN
    FOREACH table_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Tables manquantes: %', array_to_string(missing_tables, ', ');
    END IF;
    
    RAISE NOTICE '✅ Migration complète réussie ! Toutes les tables sont créées et configurées.';
    RAISE NOTICE 'Tables créées: %', array_to_string(required_tables, ', ');
END $$; 