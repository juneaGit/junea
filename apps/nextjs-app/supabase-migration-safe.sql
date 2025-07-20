-- ===================================
-- MIGRATION SUPABASE SÉCURISÉE
-- Script pour ajouter les nouvelles fonctionnalités sans conflits
-- ===================================

-- Activer les extensions nécessaires (si pas déjà fait)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- MISE À JOUR TABLE PROFILES (ajouter colonne language si manquante)
-- ===================================

-- Vérifier et ajouter la colonne language si elle n'existe pas
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
-- TABLE ADDITIONAL_SERVICES (créer si n'existe pas)
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
-- TABLE DAY_PLANNING_EVENTS (créer si n'existe pas)
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
-- RLS (ROW LEVEL SECURITY) - ADDITIONAL_SERVICES
-- ===================================

-- Activer RLS si pas déjà fait
ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view their own additional services" ON additional_services;
DROP POLICY IF EXISTS "Users can insert their own additional services" ON additional_services;
DROP POLICY IF EXISTS "Users can update their own additional services" ON additional_services;
DROP POLICY IF EXISTS "Users can delete their own additional services" ON additional_services;

-- Créer les nouvelles politiques
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

-- Activer RLS si pas déjà fait
ALTER TABLE day_planning_events ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view their own planning events" ON day_planning_events;
DROP POLICY IF EXISTS "Users can insert their own planning events" ON day_planning_events;
DROP POLICY IF EXISTS "Users can update their own planning events" ON day_planning_events;
DROP POLICY IF EXISTS "Users can delete their own planning events" ON day_planning_events;

-- Créer les nouvelles politiques
CREATE POLICY "Users can view their own planning events" ON day_planning_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planning events" ON day_planning_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planning events" ON day_planning_events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planning events" ON day_planning_events
    FOR DELETE USING (auth.uid() = user_id);

-- ===================================
-- FONCTION ET TRIGGER (mise à jour sécurisée)
-- ===================================

-- Recréer la fonction (remplace l'ancienne si elle existe)
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

-- Supprimer le trigger s'il existe déjà et le recréer
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===================================
-- FONCTION MISE À JOUR TIMESTAMP
-- ===================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS set_updated_at ON additional_services;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON additional_services
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON day_planning_events;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON day_planning_events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===================================
-- INDEXES POUR PERFORMANCE
-- ===================================

-- Index sur additional_services
CREATE INDEX IF NOT EXISTS idx_additional_services_user_id ON additional_services(user_id);
CREATE INDEX IF NOT EXISTS idx_additional_services_status ON additional_services(status);
CREATE INDEX IF NOT EXISTS idx_additional_services_sort_order ON additional_services(sort_order);

-- Index sur day_planning_events  
CREATE INDEX IF NOT EXISTS idx_day_planning_events_user_id ON day_planning_events(user_id);
CREATE INDEX IF NOT EXISTS idx_day_planning_events_start ON day_planning_events(event_start);
CREATE INDEX IF NOT EXISTS idx_day_planning_events_sort_order ON day_planning_events(sort_order);

-- ===================================
-- DONNÉES DE TEST (optionnel - à commenter en production)
-- ===================================

/*
-- Décommenter cette section si vous voulez des données de test
INSERT INTO additional_services (user_id, service_name, service_type, provider_name, estimated_budget, status, sort_order) 
VALUES 
  ((SELECT id FROM profiles LIMIT 1), 'DJ Mariage Premium', 'DJ', 'SoundWave Events', 800.00, 'confirme', 0),
  ((SELECT id FROM profiles LIMIT 1), 'Photographe Second Shooter', 'Photographe', 'Photo Dreams', 600.00, 'contact', 1),
  ((SELECT id FROM profiles LIMIT 1), 'Animation Enfants', 'Animation', 'Kids Party Pro', 300.00, 'recherche', 2)
ON CONFLICT DO NOTHING;
*/

-- ===================================
-- VÉRIFICATIONS FINALES
-- ===================================

-- Vérifier que les tables sont créées
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'additional_services') THEN
        RAISE EXCEPTION 'Table additional_services n''a pas été créée correctement';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'day_planning_events') THEN
        RAISE EXCEPTION 'Table day_planning_events n''a pas été créée correctement';
    END IF;
    
    RAISE NOTICE 'Migration réussie ! Tables créées : additional_services, day_planning_events';
END $$; 