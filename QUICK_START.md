# Configuration Rapide Linkiz

## Authentification simplifiée - Email + Mot de passe

L'application utilise maintenant une authentification simple par email et mot de passe. **Aucune configuration email n'est requise.**

## Configuration Supabase (1 minute)

Pour que l'authentification fonctionne immédiatement **sans email de confirmation** :

1. **Accédez à votre dashboard Supabase**
   - URL: https://supabase.com/dashboard
   - Projet: https://nzdcqxazpwnagkfkpunx.supabase.co

2. **Désactivez la confirmation d'email**
   - Allez dans `Authentication` → `Providers` → `Email`
   - **Désactivez** "Confirm email"
   - Cliquez sur "Save"

3. **C'est tout!**

Les utilisateurs peuvent maintenant:
- Créer un compte instantanément
- Se connecter immédiatement
- Pas besoin d'attendre un email
- Pas de configuration SMTP nécessaire

## Test de l'authentification

1. Démarrez l'application
2. Cliquez sur "Get Started"
3. Choisissez "Créer un compte"
4. Entrez email + mot de passe (min. 6 caractères)
5. Cliquez sur "Créer mon compte"
6. ✅ Connexion immédiate!

## Interface simplifiée

L'interface d'authentification a été simplifiée:
- ✅ Formulaire simple email + mot de passe
- ✅ Onglets "Créer un compte" / "Se connecter"
- ✅ Messages d'erreur en français
- ✅ Confirmation visuelle lors de la création
- ❌ Plus de Google Sign-In (optionnel)
- ❌ Plus de Magic Link (optionnel)

## Pour production (optionnel)

Si vous voulez activer la confirmation d'email en production:

1. Configurez un service SMTP (SendGrid, Mailgun, etc.)
2. Dans Supabase: `Authentication` → `Email Templates`
3. Personnalisez les templates d'email
4. Activez "Confirm email"

## Support

- Dashboard Supabase: https://supabase.com/dashboard
- Documentation: https://supabase.com/docs/guides/auth
- Votre projet: https://nzdcqxazpwnagkfkpunx.supabase.co

---

**Note**: Pour tester rapidement, vous pouvez utiliser n'importe quel email (même fictif) tant que la confirmation d'email est désactivée.
