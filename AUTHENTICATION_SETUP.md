# Configuration de l'authentification Linkiz

## ✅ Solution Recommandée: Authentification par mot de passe

L'application utilise maintenant l'authentification simple par **email + mot de passe**.

**Cette méthode fonctionne immédiatement sans configuration!**

Voir le fichier `QUICK_START.md` pour la configuration rapide en 1 minute.

---

## Solutions Alternatives (Optionnelles)

### Option 1: Configurer l'authentification par Email (Magic Link)

### Étapes:

1. **Accédez à votre dashboard Supabase**
   - URL: https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Configurez l'email provider**
   - Allez dans `Authentication` → `Providers` → `Email`
   - Activez "Enable Email provider"
   - Activez "Confirm email" (si vous voulez que les utilisateurs confirment leur email)

3. **Configurez SMTP (pour l'envoi d'emails)**
   - Allez dans `Project Settings` → `Authentication` → `SMTP Settings`
   - Option A - Utiliser le SMTP de Supabase (limité en développement):
     - Laissez la configuration par défaut
     - Note: En développement, Supabase limite l'envoi à 3-4 emails par heure

   - Option B - Utiliser votre propre SMTP (recommandé pour production):
     - Activez "Enable Custom SMTP"
     - Configurez avec votre service email (Gmail, SendGrid, Mailgun, etc.)
     - Exemple avec Gmail:
       - Host: smtp.gmail.com
       - Port: 587
       - Username: votre-email@gmail.com
       - Password: votre-app-password (pas votre mot de passe Gmail normal)

4. **Configurez les URLs de redirection**
   - Allez dans `Authentication` → `URL Configuration`
   - Ajoutez votre URL locale: `http://localhost:5173`
   - Ajoutez votre URL de production si déployée

5. **Testez l'authentification**
   - Entrez votre email dans le formulaire
   - Vérifiez votre boîte mail (et spam)
   - Cliquez sur le lien magic link

### Option 2: Configurer Google OAuth

### Étapes:

1. **Créez un projet Google Cloud**
   - Allez sur https://console.cloud.google.com
   - Créez un nouveau projet ou utilisez un existant

2. **Configurez l'écran de consentement OAuth**
   - Dans Google Cloud Console: `APIs & Services` → `OAuth consent screen`
   - Type d'utilisateur: External
   - Remplissez les informations requises

3. **Créez les identifiants OAuth 2.0**
   - `APIs & Services` → `Credentials` → `Create Credentials` → `OAuth 2.0 Client ID`
   - Type d'application: Application Web
   - Authorized redirect URIs:
     - `https://nzdcqxazpwnagkfkpunx.supabase.co/auth/v1/callback`
   - Copiez le Client ID et Client Secret

4. **Configurez Google dans Supabase**
   - Dashboard Supabase: `Authentication` → `Providers` → `Google`
   - Activez "Google enabled"
   - Collez votre Client ID
   - Collez votre Client Secret
   - Sauvegardez

5. **Testez Google Sign-In**
   - Cliquez sur "Continue with Google" dans l'application
   - Sélectionnez votre compte Google
   - Autorisez l'application

### Configuration actuelle (déjà implémentée)

L'application utilise l'authentification par mot de passe qui fonctionne immédiatement:

1. **L'authentification par mot de passe est active**
   - Les utilisateurs peuvent créer un compte avec email + mot de passe
   - Connexion immédiate sans email de confirmation
   - Aucune configuration SMTP nécessaire

2. **Pour désactiver la confirmation d'email** (recommandé pour le développement):
   - Dashboard Supabase: `Authentication` → `Providers` → `Email`
   - Désactivez "Confirm email"
   - Cliquez sur "Save"

## Vérification de la configuration

### Test Email:
```bash
# Vérifiez les logs Supabase
Dashboard → Logs → Auth
```

### Test Google OAuth:
```bash
# Vérifiez que la redirection fonctionne
# L'URL doit contenir: /auth/v1/callback
```

## Dépannage

### Problème: "Email not sent"
- Vérifiez la configuration SMTP
- Vérifiez les limites d'envoi (3-4 emails/heure en dev)
- Consultez les logs: Dashboard → Logs

### Problème: "Provider not enabled"
- Vérifiez que Google OAuth est activé dans Supabase
- Vérifiez que les credentials sont corrects
- Vérifiez les URLs de redirection

### Problème: "Invalid redirect URL"
- Ajoutez votre URL dans Authentication → URL Configuration
- Format: `http://localhost:5173` (sans slash à la fin)

## Configuration recommandée pour production

1. Utilisez un service SMTP dédié (SendGrid, Mailgun, AWS SES)
2. Configurez un domaine personnalisé pour les emails
3. Activez la confirmation d'email
4. Ajoutez toutes les URLs de production dans les redirections autorisées
5. Configurez les templates d'email personnalisés

## Support

- Documentation Supabase: https://supabase.com/docs/guides/auth
- Dashboard Supabase: https://supabase.com/dashboard
- Votre projet: https://nzdcqxazpwnagkfkpunx.supabase.co
