-- ===================================
-- MIGRATION DYNAMIQUE - SUPABASE WEDDING APP
-- Architecture optimisée pour app entièrement dynamique avec tables interconnectées
-- Complète le schema existant pour pages Dashboard, Budget, Invités, Plan de Table
-- ===================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================
-- AMÉLIORATION TABLE PROFILES - Stats Dashboard  
-- ===================================

-- Ajouter colonnes pour stats dashboard si elles n'existent pas
DO $$ 
BEGIN
    -- Colonne pour date de mariage (utile pour dashboard)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'wedding_date'
    ) THEN
        ALTER TABLE profiles ADD COLUMN wedding_date DATE;
    END IF;
    
    -- Budget total prévu (pour calculs rapides dashboard)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'total_budget'
    ) THEN
        ALTER TABLE profiles ADD COLUMN total_budget DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Statut onboarding (nouveau utilisateur ou complet)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- ===================================
-- TABLE BUDGETS - Budget Principal (Parent de tous les expenses)
-- ===================================
CREATE TABLE IF NOT EXISTS budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL DEFAULT 'Budget Principal',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(10,2) DEFAULT 0,
    status TEXT CHECK (status IN ('draft', 'active', 'completed')) DEFAULT 'active',
    wedding_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABLE EXPENSES - Dépenses détaillées (remplace budget_items)
-- ===================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Lieu', 'Traiteur', 'Photographe', 'Videographe', 'DJ/Musique', 
        'Fleurs', 'Decoration', 'Robe', 'Costume', 'Transport', 
        'Invitations', 'Coiffure', 'Maquillage', 'Bijoux', 'Autre'
    )),
    name TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    paid BOOLEAN DEFAULT FALSE,
    payment_date DATE,
    vendor_name TEXT,
    vendor_contact TEXT,
    priority INTEGER DEFAULT 0,
    ai_suggested BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================  
-- TABLE GUESTS - Invités optimisée pour Plan de Table
-- ===================================

-- Améliorer table guests existante si nécessaire
DO $$ 
BEGIN
    -- Ajouter colonne category si manquante (pour grouping)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guests' AND column_name = 'category'
    ) THEN
        ALTER TABLE guests ADD COLUMN category TEXT CHECK (category IN ('Famille', 'Amis', 'Collegues', 'Autre')) DEFAULT 'Autre';
    END IF;
    
    -- Colonne invitation_sent pour tracking envoi invitations
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guests' AND column_name = 'invitation_sent'
    ) THEN
        ALTER TABLE guests ADD COLUMN invitation_sent BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Date envoi invitation
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guests' AND column_name = 'invitation_sent_date'
    ) THEN
        ALTER TABLE guests ADD COLUMN invitation_sent_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Token unique pour RSVP
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guests' AND column_name = 'rsvp_token'
    ) THEN
        ALTER TABLE guests ADD COLUMN rsvp_token UUID DEFAULT gen_random_uuid();
    END IF;
END $$;

-- ===================================
-- TABLE SEATING_PLANS - Plan de Table Dynamique
-- ===================================
CREATE TABLE IF NOT EXISTS seating_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL DEFAULT 'Plan de Table Principal',
    wedding_date DATE,
    venue_layout TEXT, -- Description layout salle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABLE SEATING_TABLES - Tables du plan de table
-- ===================================
CREATE TABLE IF NOT EXISTS seating_tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seating_plan_id UUID REFERENCES seating_plans(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    table_number INTEGER NOT NULL,
    table_name TEXT,
    max_seats INTEGER DEFAULT 8,
    table_type TEXT CHECK (table_type IN ('round', 'rectangular', 'square')) DEFAULT 'round',
    position_x DECIMAL(10,2) DEFAULT 0, -- Position X pour drag-and-drop
    position_y DECIMAL(10,2) DEFAULT 0, -- Position Y pour drag-and-drop
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(seating_plan_id, table_number)
);

-- ===================================
-- TABLE TASKS - Améliorée pour Dashboard Stats
-- ===================================

-- Améliorer table tasks existante
DO $$ 
BEGIN
    -- Colonne pour catégorie de tâche
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'task_category'
    ) THEN
        ALTER TABLE tasks ADD COLUMN task_category TEXT CHECK (task_category IN (
            'Administratif', 'Lieu', 'Traiteur', 'Decoration', 'Invitations', 
            'Musique', 'Photo/Video', 'Transport', 'Autre'
        )) DEFAULT 'Autre';
    END IF;
    
    -- Pourcentage de completion (0-100)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'completion_percentage'
    ) THEN
        ALTER TABLE tasks ADD COLUMN completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
    END IF;
    
    -- Assigné à (email/nom)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'assigned_to_email'
    ) THEN
        ALTER TABLE tasks ADD COLUMN assigned_to_email TEXT;
    END IF;
END $$;

-- ===================================
-- TABLE DASHBOARD_STATS - Cache des statistiques pour performance
-- ===================================
CREATE TABLE IF NOT EXISTS dashboard_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    total_budget DECIMAL(10,2) DEFAULT 0,
    spent_amount DECIMAL(10,2) DEFAULT 0,
    remaining_budget DECIMAL(10,2) DEFAULT 0,
    budget_percentage DECIMAL(5,2) DEFAULT 0,
    
    total_guests INTEGER DEFAULT 0,
    confirmed_guests INTEGER DEFAULT 0,
    pending_guests INTEGER DEFAULT 0,
    declined_guests INTEGER DEFAULT 0,
    
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    pending_tasks INTEGER DEFAULT 0,
    overdue_tasks INTEGER DEFAULT 0,
    
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABLE INVITATIONS - Tracking des invitations envoyées
-- ===================================
CREATE TABLE IF NOT EXISTS invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE NOT NULL,
    invitation_type TEXT CHECK (invitation_type IN ('save_the_date', 'invitation', 'reminder')) DEFAULT 'invitation',
    email_sent BOOLEAN DEFAULT FALSE,
    email_opened BOOLEAN DEFAULT FALSE,
    email_clicked BOOLEAN DEFAULT FALSE,
    sent_date TIMESTAMP WITH TIME ZONE,
    opened_date TIMESTAMP WITH TIME ZONE,
    clicked_date TIMESTAMP WITH TIME ZONE,
    rsvp_date TIMESTAMP WITH TIME ZONE,
    email_template TEXT,
    subject_line TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- RLS (ROW LEVEL SECURITY) - Toutes les nouvelles tables
-- ===================================

-- BUDGETS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own budgets" ON budgets;
CREATE POLICY "Users can manage their own budgets" ON budgets
    FOR ALL USING (auth.uid() = user_id);

-- EXPENSES  
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own expenses" ON expenses;
CREATE POLICY "Users can manage their own expenses" ON expenses
    FOR ALL USING (auth.uid() = user_id);

-- SEATING_PLANS
ALTER TABLE seating_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own seating plans" ON seating_plans;
CREATE POLICY "Users can manage their own seating plans" ON seating_plans
    FOR ALL USING (auth.uid() = user_id);

-- SEATING_TABLES
ALTER TABLE seating_tables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own seating tables" ON seating_tables;
CREATE POLICY "Users can manage their own seating tables" ON seating_tables
    FOR ALL USING (auth.uid() = user_id);

-- DASHBOARD_STATS
ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own dashboard stats" ON dashboard_stats;
CREATE POLICY "Users can manage their own dashboard stats" ON dashboard_stats
    FOR ALL USING (auth.uid() = user_id);

-- INVITATIONS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own invitations" ON invitations;
CREATE POLICY "Users can manage their own invitations" ON invitations
    FOR ALL USING (auth.uid() = user_id);

-- ===================================
-- FONCTIONS UTILITAIRES - Calcul automatique stats
-- ===================================

-- Fonction pour recalculer automatiquement spent_amount dans budgets
CREATE OR REPLACE FUNCTION update_budget_spent_amount()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculer le montant dépensé pour ce budget
    UPDATE budgets 
    SET spent_amount = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM expenses 
        WHERE budget_id = COALESCE(NEW.budget_id, OLD.budget_id)
        AND paid = true
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.budget_id, OLD.budget_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-update budget spent_amount
DROP TRIGGER IF EXISTS update_budget_on_expense_change ON expenses;
CREATE TRIGGER update_budget_on_expense_change
    AFTER INSERT OR UPDATE OR DELETE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_budget_spent_amount();

-- Fonction pour recalculer stats dashboard
CREATE OR REPLACE FUNCTION refresh_dashboard_stats(user_uuid UUID)
RETURNS void AS $$
DECLARE
    budget_total DECIMAL(10,2);
    budget_spent DECIMAL(10,2);
    guest_counts RECORD;
    task_counts RECORD;
BEGIN
    -- Calculs budget
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COALESCE(SUM(spent_amount), 0)
    INTO budget_total, budget_spent
    FROM budgets WHERE user_id = user_uuid;
    
    -- Calculs invités
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE rsvp_status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE rsvp_status = 'pending') as pending,
        COUNT(*) FILTER (WHERE rsvp_status = 'declined') as declined
    INTO guest_counts
    FROM guests WHERE user_id = user_uuid;
    
    -- Calculs tâches  
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_completed = true) as completed,
        COUNT(*) FILTER (WHERE is_completed = false) as pending,
        COUNT(*) FILTER (WHERE is_completed = false AND due_date < NOW()) as overdue
    INTO task_counts
    FROM tasks WHERE user_id = user_uuid;
    
    -- Insérer ou mettre à jour les stats
    INSERT INTO dashboard_stats (
        user_id, total_budget, spent_amount, remaining_budget, budget_percentage,
        total_guests, confirmed_guests, pending_guests, declined_guests,
        total_tasks, completed_tasks, pending_tasks, overdue_tasks,
        last_calculated
    ) VALUES (
        user_uuid, budget_total, budget_spent, 
        budget_total - budget_spent,
        CASE WHEN budget_total > 0 THEN (budget_spent / budget_total * 100) ELSE 0 END,
        guest_counts.total, guest_counts.confirmed, guest_counts.pending, guest_counts.declined,
        task_counts.total, task_counts.completed, task_counts.pending, task_counts.overdue,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_budget = EXCLUDED.total_budget,
        spent_amount = EXCLUDED.spent_amount,
        remaining_budget = EXCLUDED.remaining_budget,
        budget_percentage = EXCLUDED.budget_percentage,
        total_guests = EXCLUDED.total_guests,
        confirmed_guests = EXCLUDED.confirmed_guests,
        pending_guests = EXCLUDED.pending_guests,
        declined_guests = EXCLUDED.declined_guests,
        total_tasks = EXCLUDED.total_tasks,
        completed_tasks = EXCLUDED.completed_tasks,
        pending_tasks = EXCLUDED.pending_tasks,
        overdue_tasks = EXCLUDED.overdue_tasks,
        last_calculated = EXCLUDED.last_calculated,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- TRIGGERS POUR UPDATED_AT - Nouvelles tables
-- ===================================

-- Fonction updated_at réutilisable
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour toutes les nouvelles tables
DROP TRIGGER IF EXISTS set_updated_at_budgets ON budgets;
CREATE TRIGGER set_updated_at_budgets
    BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_expenses ON expenses;
CREATE TRIGGER set_updated_at_expenses
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_seating_plans ON seating_plans;
CREATE TRIGGER set_updated_at_seating_plans
    BEFORE UPDATE ON seating_plans
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_seating_tables ON seating_tables;
CREATE TRIGGER set_updated_at_seating_tables
    BEFORE UPDATE ON seating_tables
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_dashboard_stats ON dashboard_stats;
CREATE TRIGGER set_updated_at_dashboard_stats
    BEFORE UPDATE ON dashboard_stats
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_invitations ON invitations;
CREATE TRIGGER set_updated_at_invitations
    BEFORE UPDATE ON invitations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===================================
-- INDEXES POUR PERFORMANCE OPTIMALE
-- ===================================

-- Budgets
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);

-- Expenses (très important pour dashboard performance)
CREATE INDEX IF NOT EXISTS idx_expenses_budget_id ON expenses(budget_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_paid ON expenses(paid);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);

-- Guests (pour plan de table et stats)
CREATE INDEX IF NOT EXISTS idx_guests_user_id_rsvp ON guests(user_id, rsvp_status);
CREATE INDEX IF NOT EXISTS idx_guests_table_assignment ON guests(table_assignment);
CREATE INDEX IF NOT EXISTS idx_guests_category ON guests(category);

-- Seating Plans
CREATE INDEX IF NOT EXISTS idx_seating_plans_user_id ON seating_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_seating_tables_plan_id ON seating_tables(seating_plan_id);
CREATE INDEX IF NOT EXISTS idx_seating_tables_user_id ON seating_tables(user_id);

-- Tasks (pour stats dashboard)
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON tasks(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(task_category);

-- Dashboard Stats
CREATE INDEX IF NOT EXISTS idx_dashboard_stats_user_id ON dashboard_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_stats_last_calculated ON dashboard_stats(last_calculated);

-- Invitations
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_guest_id ON invitations(guest_id);
CREATE INDEX IF NOT EXISTS idx_invitations_sent_date ON invitations(sent_date);

-- ===================================
-- FONCTIONS INITIALISATION UTILISATEUR
-- ===================================

-- Fonction pour créer budget initial et plan de table lors de l'inscription
CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS TRIGGER AS $$
DECLARE
    new_budget_id UUID;
    new_seating_plan_id UUID;
BEGIN
    -- Créer budget principal
    INSERT INTO budgets (user_id, name, total_amount)
    VALUES (NEW.id, 'Budget Principal', 0)
    RETURNING id INTO new_budget_id;
    
    -- Créer plan de table principal
    INSERT INTO seating_plans (user_id, name)
    VALUES (NEW.id, 'Plan de Table Principal')
    RETURNING id INTO new_seating_plan_id;
    
    -- Créer quelques tables par défaut (8 tables rondes de 8 personnes)
    INSERT INTO seating_tables (seating_plan_id, user_id, table_number, table_name, max_seats)
    SELECT 
        new_seating_plan_id, 
        NEW.id,
        generate_series(1, 8),
        'Table ' || generate_series(1, 8),
        8;
    
    -- Initialiser les stats dashboard
    PERFORM refresh_dashboard_stats(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour initialisation automatique
DROP TRIGGER IF EXISTS initialize_user_data_trigger ON profiles;
CREATE TRIGGER initialize_user_data_trigger
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION initialize_user_data();

-- ===================================
-- VUES UTILES POUR QUERIES COMPLEXES
-- ===================================

-- Vue complète dashboard avec toutes les stats
CREATE OR REPLACE VIEW dashboard_overview AS
SELECT 
    p.id as user_id,
    p.full_name,
    p.wedding_date,
    p.total_budget as profile_budget,
    
    -- Stats Budget
    COALESCE(b.total_budget, 0) as budget_total,
    COALESCE(b.spent_amount, 0) as budget_spent,
    COALESCE(b.total_budget - b.spent_amount, 0) as budget_remaining,
    CASE 
        WHEN b.total_budget > 0 THEN ROUND((b.spent_amount / b.total_budget * 100)::numeric, 2)
        ELSE 0 
    END as budget_percentage,
    
    -- Stats Invités  
    COALESCE(g.total_guests, 0) as guests_total,
    COALESCE(g.confirmed_guests, 0) as guests_confirmed,
    COALESCE(g.pending_guests, 0) as guests_pending,
    COALESCE(g.declined_guests, 0) as guests_declined,
    
    -- Stats Tâches
    COALESCE(t.total_tasks, 0) as tasks_total,
    COALESCE(t.completed_tasks, 0) as tasks_completed,
    COALESCE(t.pending_tasks, 0) as tasks_pending,
    CASE 
        WHEN t.total_tasks > 0 THEN ROUND((t.completed_tasks::numeric / t.total_tasks * 100), 2)
        ELSE 0 
    END as tasks_completion_percentage

FROM profiles p

-- Agrégation budget  
LEFT JOIN (
    SELECT 
        user_id,
        SUM(total_amount) as total_budget,
        SUM(spent_amount) as spent_amount
    FROM budgets 
    WHERE status = 'active'
    GROUP BY user_id
) b ON p.id = b.user_id

-- Agrégation invités
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_guests,
        COUNT(*) FILTER (WHERE rsvp_status = 'confirmed') as confirmed_guests,
        COUNT(*) FILTER (WHERE rsvp_status = 'pending') as pending_guests,
        COUNT(*) FILTER (WHERE rsvp_status = 'declined') as declined_guests
    FROM guests
    GROUP BY user_id
) g ON p.id = g.user_id

-- Agrégation tâches
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE is_completed = true) as completed_tasks,
        COUNT(*) FILTER (WHERE is_completed = false) as pending_tasks
    FROM tasks
    GROUP BY user_id
) t ON p.id = t.user_id;

-- Vue détails budget par catégorie (pour charts)
CREATE OR REPLACE VIEW budget_by_category AS
SELECT 
    e.user_id,
    e.category,
    COUNT(*) as expense_count,
    SUM(e.amount) as total_amount,
    SUM(CASE WHEN e.paid THEN e.amount ELSE 0 END) as paid_amount,
    SUM(CASE WHEN NOT e.paid THEN e.amount ELSE 0 END) as pending_amount,
    ROUND(AVG(e.amount)::numeric, 2) as avg_expense,
    MIN(e.amount) as min_expense,
    MAX(e.amount) as max_expense
FROM expenses e
GROUP BY e.user_id, e.category
ORDER BY total_amount DESC;

-- ===================================
-- RÉALTIME SUBSCRIPTIONS SETUP
-- ===================================

-- Activer réaltime pour toutes les tables critiques
ALTER PUBLICATION supabase_realtime ADD TABLE budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;  
ALTER PUBLICATION supabase_realtime ADD TABLE guests;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE dashboard_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE seating_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE invitations;

-- ===================================
-- DONNÉES DÉMO (OPTIONNEL - pour développement uniquement)
-- ===================================

-- Fonction pour créer des données démo pour un utilisateur
CREATE OR REPLACE FUNCTION create_demo_data(target_user_id UUID)
RETURNS void AS $$
DECLARE
    demo_budget_id UUID;
    demo_seating_plan_id UUID;
BEGIN
    -- Budget démo avec quelques dépenses
    INSERT INTO budgets (user_id, name, total_amount) 
    VALUES (target_user_id, 'Budget Mariage Démo', 25000)
    RETURNING id INTO demo_budget_id;
    
    -- Dépenses démo
    INSERT INTO expenses (budget_id, user_id, category, name, amount, paid) VALUES
    (demo_budget_id, target_user_id, 'Lieu', 'Salle de réception Château', 8000, true),
    (demo_budget_id, target_user_id, 'Traiteur', 'Menu gastronomique', 6500, false),
    (demo_budget_id, target_user_id, 'Photographe', 'Photographe professionnel', 2500, true),
    (demo_budget_id, target_user_id, 'Fleurs', 'Bouquet et décoration florale', 1200, false),
    (demo_budget_id, target_user_id, 'DJ/Musique', 'DJ et sound system', 800, false);
    
    -- Invités démo
    INSERT INTO guests (user_id, first_name, last_name, email, category, rsvp_status, table_assignment) VALUES
    (target_user_id, 'Pierre', 'Martin', 'pierre.martin@email.com', 'Famille', 'confirmed', 1),
    (target_user_id, 'Marie', 'Dubois', 'marie.dubois@email.com', 'Amis', 'confirmed', 1),
    (target_user_id, 'Jean', 'Bernard', 'jean.bernard@email.com', 'Famille', 'pending', 2),
    (target_user_id, 'Sophie', 'Leroy', 'sophie.leroy@email.com', 'Collegues', 'confirmed', 2),
    (target_user_id, 'Antoine', 'Moreau', 'antoine.moreau@email.com', 'Amis', 'declined', NULL);
    
    -- Tâches démo
    INSERT INTO tasks (user_id, title, description, task_category, due_date, is_completed, priority) VALUES
    (target_user_id, 'Réserver la salle', 'Appeler le château pour confirmer', 'Lieu', CURRENT_DATE + INTERVAL '30 days', true, 'high'),
    (target_user_id, 'Choisir le menu', 'Rdv dégustation avec le traiteur', 'Traiteur', CURRENT_DATE + INTERVAL '60 days', false, 'high'),
    (target_user_id, 'Envoyer les faire-parts', 'Design et impression terminés', 'Invitations', CURRENT_DATE + INTERVAL '90 days', false, 'medium');
    
    -- Recalculer les stats
    PERFORM refresh_dashboard_stats(target_user_id);
    
    RAISE NOTICE 'Données démo créées pour utilisateur %', target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- VÉRIFICATIONS FINALES ET VALIDATION
-- ===================================

-- Vérifier que toutes les nouvelles tables sont créées
DO $$
DECLARE
    required_tables TEXT[] := ARRAY[
        'budgets', 'expenses', 'seating_plans', 'seating_tables', 
        'dashboard_stats', 'invitations'
    ];
    current_table TEXT;
    missing_tables TEXT[] := '{}';
BEGIN
    FOREACH current_table IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE information_schema.tables.table_name = current_table) THEN
            missing_tables := array_append(missing_tables, current_table);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Tables manquantes: %', array_to_string(missing_tables, ', ');
    END IF;
    
    RAISE NOTICE '🚀 Migration Dynamique RÉUSSIE !';
    RAISE NOTICE '📊 Architecture complète pour app entièrement dynamique';
    RAISE NOTICE '✅ Tables créées: %', array_to_string(required_tables, ', ');
    RAISE NOTICE '🔄 Realtime activé, RLS configuré, indexes optimisés';
    RAISE NOTICE '📈 Dashboard stats automatiques, budget auto-calculé';
    RAISE NOTICE '🎯 Prêt pour étapes 2-7: APIs Redux, dynamisation pages';
END $$; 