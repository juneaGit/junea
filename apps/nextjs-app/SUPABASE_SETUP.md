# Configuration Supabase pour l'Application de Mariage

## 1. Création du Projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **Project URL** et **anon public key**

## 2. Configuration de la Base de Données

### Étape 1 : Exécuter le Schéma SQL

1. Dans votre dashboard Supabase, allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Copiez et collez le contenu du fichier `supabase-schema.sql`
4. Exécutez la requête

**Important :** Le schéma ne modifie PAS la table système `auth.users`. Il crée une table `profiles` qui référence `auth.users` pour les données supplémentaires.

### Étape 2 : Vérifier les Tables Créées

Après l'exécution, vous devriez voir ces tables dans **Table Editor** :
- `profiles` - Profils utilisateurs (complète auth.users)
- `wedding_profiles` - Profils de mariage
- `tasks` - Tâches du rétro-planning
- `budget_items` - Articles du budget
- `guests` - Liste des invités
- `ai_recommendations` - Recommandations IA

### Étape 3 : Vérifier les Politiques RLS

Dans **Authentication** > **Policies**, vous devriez voir toutes les politiques RLS activées pour chaque table.

## 3. Configuration de l'Authentification

### Étape 1 : Activer les Providers

1. Allez dans **Authentication** > **Providers**
2. Activez **Email** (déjà activé par défaut)
3. Optionnel : Activez **Google OAuth** si souhaité

### Étape 2 : Configurer les URL de Redirection

1. Dans **Authentication** > **URL Configuration**
2. Ajoutez vos URL de redirection :
   - `http://localhost:3001/auth/callback` (développement)
   - `https://votre-domaine.com/auth/callback` (production)

## 4. Configuration des Variables d'Environnement

Créez un fichier `.env.local` dans le répertoire `apps/nextjs-app/` :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon

# OpenAI Configuration (optionnel)
OPENAI_API_KEY=votre-clé-openai

# Mock API (pour développement)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENABLE_API_MOCKING=false
```

## 5. Test de la Configuration

### Étape 1 : Tester l'Inscription

1. Lancez votre application : `npm run dev`
2. Allez sur `/auth/register`
3. Créez un compte avec email/mot de passe
4. Vérifiez que :
   - L'utilisateur est créé dans **Authentication** > **Users**
   - Un profil est automatiquement créé dans la table `profiles`

### Étape 2 : Tester la Connexion

1. Allez sur `/auth/login`
2. Connectez-vous avec vos identifiants
3. Vérifiez que vous êtes redirigé vers le dashboard

### Étape 3 : Tester les Données

1. Dans le dashboard, créez quelques données de test
2. Vérifiez dans **Table Editor** que les données sont bien sauvegardées
3. Testez que les politiques RLS fonctionnent (vous ne voyez que vos propres données)

## 6. Dépannage

### Erreur "must be owner of table users"

Cette erreur apparaît si vous essayez de modifier la table système `auth.users`. Solution :
- Utilisez uniquement le schéma fourni qui ne modifie PAS `auth.users`
- La table `profiles` référence `auth.users` sans la modifier

### Erreur "relation does not exist"

Si vous obtenez cette erreur :
1. Vérifiez que toutes les requêtes SQL ont été exécutées
2. Vérifiez l'ordre d'exécution (les tables doivent être créées avant les politiques RLS)
3. Réexécutez le schéma complet

### Problèmes d'Authentification

Si l'authentification ne fonctionne pas :
1. Vérifiez les variables d'environnement
2. Vérifiez que les URL de redirection sont correctes
3. Vérifiez que les politiques RLS sont bien activées

### Problèmes de Permissions

Si vous ne pouvez pas accéder à vos données :
1. Vérifiez que vous êtes bien connecté
2. Vérifiez que les politiques RLS utilisent `auth.uid()`
3. Vérifiez que les foreign keys sont correctes

## 7. Fonctionnalités Avancées

### Trigger de Création Automatique de Profil

Le schéma inclut un trigger qui crée automatiquement un profil dans la table `profiles` quand un utilisateur s'inscrit via `auth.users`.

### Vues Utiles

Une vue `wedding_overview` est créée pour obtenir un aperçu complet des données de mariage avec des statistiques.

### Indexes de Performance

Des indexes sont créés sur les colonnes fréquemment utilisées pour optimiser les performances.

## 8. Sécurité

- **Row Level Security (RLS)** : Activé sur toutes les tables
- **Politiques strictes** : Chaque utilisateur ne peut accéder qu'à ses propres données
- **Validation des données** : Contraintes CHECK sur les énumérations
- **Références d'intégrité** : Foreign keys pour maintenir la cohérence

## 9. Maintenance

### Sauvegarde

Supabase sauvegarde automatiquement votre base de données. Vous pouvez aussi exporter vos données via **Database** > **Backups**.

### Monitoring

Surveillez l'utilisation dans **Settings** > **Usage** pour rester dans les limites du plan gratuit.

### Mises à jour

Pour ajouter de nouvelles fonctionnalités, créez des migrations SQL plutôt que de recréer toute la base. 