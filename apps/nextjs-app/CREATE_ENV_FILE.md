# 🔑 Configuration des Variables d'Environnement

## ⚠️ **ÉTAPE CRITIQUE** - Créer le fichier `.env.local`

### **1. Créer le fichier**
Dans le dossier `apps/nextjs-app`, créez un fichier nommé exactement `.env.local`

### **2. Ajouter le contenu**
Copiez-collez exactement ce contenu dans le fichier :

```env
# OpenAI Configuration
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Next.js Configuration  
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration (optionnel pour l'instant)
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **3. Vérifications importantes**
✅ Le fichier s'appelle exactement `.env.local` (avec le point au début)
✅ Il se trouve dans `apps/nextjs-app/.env.local`
✅ La clé OpenAI commence par `sk-proj-`
✅ Pas d'espaces autour du `=`

---

## 🔒 **SÉCURITÉ**

### **Fichier .gitignore**
Vérifiez que `.env.local` est dans `.gitignore` pour ne pas l'uploader sur Git :

```gitignore
# Local env files
.env.local
.env.*.local
```

### **⚠️ Note importante**
- Cette clé est maintenant **EXPOSÉE** dans ce chat
- Après les tests, **RÉVOQUEZ** cette clé dans votre dashboard OpenAI
- Générez une **nouvelle clé** pour la production

---

## 🧪 **Test de la Configuration**

Après avoir créé le fichier :

1. **Redémarrer le serveur** :
```bash
# Arrêter avec Ctrl+C puis relancer
cd apps/nextjs-app
npm run dev
```

2. **Tester** :
- Aller sur http://localhost:3002/app/catering
- Ouvrir la Console (F12)
- Chercher ces logs :
```
🤖 IA disponible et prête
🤖 OpenAI initialisé avec succès
```

3. **Cliquer sur "Suggestions IA"** et vérifier les logs :
```
🤖 Génération recommandations IA type: catering
✅ Recommandations générées: 3
```

---

## 🚀 **Pour Vercel (Production)**

Quand vous déployez sur Vercel :

1. Dashboard Vercel → Project Settings → Environment Variables
2. Ajouter : 
   - **Key** : `NEXT_PUBLIC_OPENAI_API_KEY`
   - **Value** : `sk-proj-...` (nouvelle clé sécurisée)
   - **Environment** : Production, Preview, Development

**JAMAIS** la clé dans le code Git !

---

## ✅ **Résultat Attendu**

Avec la configuration correcte :
- ❌ **AVANT** : "OpenAI API key is missing" → Pages blanches
- ✅ **APRÈS** : AI fonctionne, suggestions personnalisées, pas d'erreurs console

**Si ça marche, les erreurs d'hydratation disparaissent ! 🎉** 