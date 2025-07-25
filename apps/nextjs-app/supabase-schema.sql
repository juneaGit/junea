-- ===================================
-- SCHEMA SUPABASE POUR APPLICATION MARIAGE
-- ===================================

-- Supprimer les tables existantes si elles existent (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS additional_services CASCADE;
DROP TABLE IF EXISTS ai_recommendations CASCADE;
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS budget_items CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS wedding_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ===================================
-- TABLE PROFILES (complète auth.users)
-- ===================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    language TEXT CHECK (language IN ('fr', 'en', 'es')) DEFAULT 'fr',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABLE WEDDING_PROFILES
-- ===================================
CREATE TABLE wedding_profiles (
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
-- TABLE ADDITIONAL_SERVICES (nouvelles prestations)
-- ===================================
CREATE TABLE additional_services (
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
    contact_info JSONB,
    notes TEXT,
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABLE TASKS (pour le rétro-planning)
-- ===================================
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wedding_profile_id UUID REFERENCES wedding_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    timeline TEXT,
    urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('todo', 'inprogress', 'done')) DEFAULT 'todo',
    due_date DATE,
    completed_date DATE,
    estimated_duration TEXT,
    tips TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABLE BUDGET_ITEMS
-- ===================================
CREATE TABLE budget_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wedding_profile_id UUID REFERENCES wedding_profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    item_name TEXT NOT NULL,
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    actual_cost DECIMAL(10,2),
    paid BOOLEAN DEFAULT FALSE,
    payment_date DATE,
    provider TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABLE GUESTS
-- ===================================
CREATE TABLE guests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wedding_profile_id UUID REFERENCES wedding_profiles(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    relationship TEXT,
    side TEXT CHECK (side IN ('bride', 'groom', 'both')),
    invited BOOLEAN DEFAULT TRUE,
    rsvp_status TEXT CHECK (rsvp_status IN ('pending', 'yes', 'no', 'maybe')) DEFAULT 'pending',
    dietary_restrictions TEXT[],
    plus_one BOOLEAN DEFAULT FALSE,
    plus_one_name TEXT,
    table_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABLE AI_RECOMMENDATIONS
-- ===================================
CREATE TABLE ai_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    prompt TEXT NOT NULL,
    response JSONB NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- INDEXES POUR OPTIMISER LES PERFORMANCES
-- ===================================
CREATE INDEX idx_profiles_user_id ON profiles(id);
CREATE INDEX idx_wedding_profiles_user_id ON wedding_profiles(user_id);
CREATE INDEX idx_additional_services_user_id ON additional_services(user_id);
CREATE INDEX idx_additional_services_wedding_profile_id ON additional_services(wedding_profile_id);
CREATE INDEX idx_additional_services_sort_order ON additional_services(sort_order);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_wedding_profile_id ON tasks(wedding_profile_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_budget_items_user_id ON budget_items(user_id);
CREATE INDEX idx_budget_items_wedding_profile_id ON budget_items(wedding_profile_id);
CREATE INDEX idx_guests_user_id ON guests(user_id);
CREATE INDEX idx_guests_wedding_profile_id ON guests(wedding_profile_id);
CREATE INDEX idx_ai_recommendations_user_id ON ai_recommendations(user_id);

-- ===================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques RLS pour wedding_profiles
CREATE POLICY "Users can view their own wedding profiles" ON wedding_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wedding profiles" ON wedding_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wedding profiles" ON wedding_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wedding profiles" ON wedding_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour additional_services
CREATE POLICY "Users can view their own additional services" ON additional_services
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own additional services" ON additional_services
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own additional services" ON additional_services
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own additional services" ON additional_services
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour tasks
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour budget_items
CREATE POLICY "Users can view their own budget items" ON budget_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget items" ON budget_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget items" ON budget_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget items" ON budget_items
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour guests
CREATE POLICY "Users can view their own guests" ON guests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own guests" ON guests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own guests" ON guests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own guests" ON guests
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour ai_recommendations
CREATE POLICY "Users can view their own AI recommendations" ON ai_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI recommendations" ON ai_recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI recommendations" ON ai_recommendations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI recommendations" ON ai_recommendations
    FOR DELETE USING (auth.uid() = user_id);

-- ===================================
-- TRIGGERS POUR AUTO-UPDATES
-- ===================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wedding_profiles_updated_at BEFORE UPDATE ON wedding_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_additional_services_updated_at BEFORE UPDATE ON additional_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_recommendations_updated_at BEFORE UPDATE ON ai_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- FONCTION POUR CRÉER UN PROFIL AUTOMATIQUEMENT
-- ===================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===================================
-- VUES UTILES (OPTIONNEL)
-- ===================================

-- Vue pour avoir un aperçu complet du mariage
CREATE VIEW wedding_overview AS
SELECT 
    wp.*,
    p.full_name as user_name,
    p.email as user_email,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.is_completed = true THEN t.id END) as completed_tasks,
    COUNT(DISTINCT g.id) as total_guests,
    SUM(bi.estimated_cost) as total_estimated_budget,
    SUM(bi.actual_cost) as total_actual_spent
FROM wedding_profiles wp
LEFT JOIN profiles p ON wp.user_id = p.id
LEFT JOIN tasks t ON wp.id = t.wedding_profile_id
LEFT JOIN guests g ON wp.id = g.wedding_profile_id
LEFT JOIN budget_items bi ON wp.id = bi.wedding_profile_id
GROUP BY wp.id, p.full_name, p.email; 