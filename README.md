# Linkiz - Plateforme Multi-Link Freemium pour Musiciens

Linkiz est une plateforme freemium qui permet aux artistes et créateurs musicaux de centraliser leurs liens et partager des fichiers audio via un système d'abonnement.

## 🚀 Démarrage Rapide

### 1. Installation
```bash
npm install
```

### 2. Configuration Supabase (1 minute)
Allez dans votre dashboard Supabase:
- `Authentication` → `Providers` → `Email`
- **Désactivez** "Confirm email"
- Cliquez sur "Save"

✅ C'est tout! L'authentification fonctionne maintenant.

Voir `QUICK_START.md` pour plus de détails.

### 3. Lancement
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 📋 Fonctionnalités

### Convertisseur Média (Nouveau!)
- ✅ Accessible à tous (connectés ou visiteurs)
- ✅ Téléchargement YouTube, Instagram, Facebook, TikTok, Vimeo
- ✅ Formats: MP3 320kbps, MP4 HD 1080p, MP4 SD 720p
- ✅ Interface intuitive et moderne
- ✅ Conversions illimitées pour utilisateurs connectés

### Accès Public
- ✅ Pages Linkiz accessibles sans compte
- ✅ Visualisation des liens et contenu
- ✅ Téléchargements nécessitent un compte

### Authentification
- ✅ Inscription/connexion simple avec email + mot de passe
- ✅ Connexion instantanée (pas d'email de confirmation requis)
- ✅ Gestion de profil automatique

### Système d'Abonnement

**Plan Gratuit (0€)**
- Pages publiques illimitées
- Liens illimités
- Téléchargements bloqués
- Fichiers watermarkés
- Publicités activées

**Plan Starter (4€/mois)**
- 3 téléchargements par mois
- Pas de publicités
- Watermark metadata uniquement
- Réinitialisation mensuelle

**Plan Creator (7€/mois)**
- 20 téléchargements par mois
- Pas de publicités
- Fichiers propres sans watermark
- Support prioritaire

### Système de Téléchargement
- ✅ Liens de téléchargement sécurisés
- ✅ Vérification du quota avant téléchargement
- ✅ Tracking des téléchargements
- ✅ Watermarking selon le plan
- ✅ Modal d'upgrade si quota dépassé

### Gestion de Pages
- ✅ Créateur de pages multi-liens intuitif
- ✅ Personnalisation des couleurs
- ✅ Icônes pour chaque lien (Music, YouTube, Instagram, etc.)
- ✅ Gestion de l'ordre des liens
- ✅ Preview en temps réel
- ✅ Compteur de vues

### Dashboard
- ✅ Statistiques en temps réel
- ✅ Pages actives
- ✅ Total de liens
- ✅ Vues de pages
- ✅ Téléchargements totaux
- ✅ Indicateur de quota

## 🗄️ Architecture

### Base de Données (Supabase)
- `user_profiles` - Profils utilisateurs avec abonnements
- `linkiz_pages` - Pages multi-liens personnalisées
- `links` - Liens individuels avec fichiers téléchargeables
- `downloads` - Historique des téléchargements
- `subscriptions` - Gestion des abonnements Stripe

### Sécurité
- ✅ Row Level Security (RLS) sur toutes les tables
- ✅ Authentification sécurisée via Supabase Auth
- ✅ Politiques restrictives par défaut
- ✅ Vérification des quotas côté serveur

## 💳 Paiements (À configurer)

Pour activer Stripe:
1. Créez un compte Stripe
2. Obtenez vos clés API
3. Suivez le guide: https://bolt.new/setup/stripe

## 📁 Structure du Projet

```
src/
├── components/          # Composants React
│   ├── AuthModal.tsx           # Modal d'authentification
│   ├── Dashboard.tsx           # Dashboard utilisateur
│   ├── PageEditor.tsx          # Éditeur de pages
│   ├── PublicPage.tsx          # Vue publique des pages
│   ├── DownloadModal.tsx       # Modal de téléchargement
│   ├── SubscriptionManager.tsx # Gestion des abonnements
│   ├── Converter.tsx           # Convertisseur YouTube/médias
│   ├── Header.tsx              # En-tête navigation
│   ├── Footer.tsx              # Pied de page
│   └── LandingPage.tsx         # Page d'accueil
├── contexts/
│   └── AuthContext.tsx  # Context d'authentification
├── lib/
│   ├── supabase.ts      # Client Supabase
│   ├── database.types.ts # Types TypeScript générés
│   └── downloadService.ts # Service de téléchargement
└── App.tsx              # Application principale

supabase/
├── migrations/          # Migrations SQL
└── functions/           # Edge Functions
    └── converter/       # Service de conversion média
```

## 🛠️ Technologies

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Paiements**: Stripe (à configurer)
- **Icons**: Lucide React
- **Build**: Vite

## 📝 Commandes

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Lint
npm run lint

# Type check
npm run typecheck
```

## 🔒 Légal & Sécurité

- ✅ Acceptation des CGU lors de l'inscription
- ✅ Utilisateurs responsables du contenu uploadé/téléchargé
- ✅ Linkiz ne vend pas de droits musicaux
- ✅ Redistribution/revente interdite
- ✅ Suspension/résiliation en cas d'abus
- ✅ Conforme GDPR

## 📚 Documentation

- `QUICK_START.md` - Configuration rapide (1 minute)
- `AUTHENTICATION_SETUP.md` - Guide complet d'authentification
- `CONVERTER_GUIDE.md` - Guide d'utilisation du convertisseur
- `TROUBLESHOOTING.md` - Résolution des problèmes courants
- `supabase/migrations/` - Documentation SQL des tables

## 🎯 Objectif

Construire un MVP simple, rapide et scalable axé sur:
- ✅ Monétisation via abonnements
- ✅ Contrôle des téléchargements
- ✅ Conversion des utilisateurs gratuits

## 🆘 Support

Pour toute question:
1. Consultez `QUICK_START.md` pour la configuration
2. Vérifiez `AUTHENTICATION_SETUP.md` pour l'auth
3. Consultez `CONVERTER_GUIDE.md` pour le convertisseur
4. Voir `TROUBLESHOOTING.md` pour les problèmes courants
5. Consultez les logs Supabase: Dashboard → Logs

## 📄 Licence

Tous droits réservés. Les utilisateurs sont responsables de tout contenu uploadé ou téléchargé.
