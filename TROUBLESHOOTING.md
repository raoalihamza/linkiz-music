# Dépannage Linkiz - Problèmes d'authentification

## ❌ Problème: "Mot de passe ne fonctionne pas"

### Symptômes
- Vous créez un compte mais ne pouvez pas vous connecter
- Message d'erreur après l'inscription
- La page ne se connecte pas automatiquement

### ✅ Solution rapide (99% des cas)

**Le problème:** La confirmation d'email est activée dans Supabase.

**La solution (2 minutes):**

1. **Ouvrez votre dashboard Supabase**
   ```
   https://supabase.com/dashboard
   ```

2. **Sélectionnez votre projet**
   - Cliquez sur votre projet: `nzdcqxazpwnagkfkpunx`

3. **Allez dans Authentication**
   - Menu de gauche → `Authentication`
   - Cliquez sur `Providers`

4. **Configurez le provider Email**
   - Trouvez "Email" dans la liste
   - Cliquez pour éditer
   - **IMPORTANT:** Décochez "Confirm email"
   - Cliquez sur "Save"

5. **Testez à nouveau**
   - Rechargez votre application
   - Créez un nouveau compte
   - ✅ Connexion instantanée!

## Autres problèmes possibles

### Problème: "Email already registered"

**Cause:** Vous avez déjà créé un compte avec cet email.

**Solution:**
1. Utilisez l'onglet "Se connecter" au lieu de "Créer un compte"
2. Entrez votre email et mot de passe
3. Cliquez sur "Se connecter"

### Problème: "Invalid email or password"

**Cause:** Email ou mot de passe incorrect.

**Solutions:**
1. Vérifiez que votre email est correct
2. Vérifiez votre mot de passe (sensible à la casse)
3. Le mot de passe doit faire minimum 6 caractères
4. Si vous avez oublié, créez un nouveau compte avec un autre email

### Problème: "Veuillez confirmer votre email"

**Cause:** La confirmation d'email est activée dans Supabase.

**Solution:** Suivez les étapes de la "Solution rapide" ci-dessus.

## Vérifier que tout fonctionne

### Test complet

1. **Ouvrez votre application**
   ```bash
   npm run dev
   ```

2. **Créez un compte test**
   - Cliquez sur "Get Started"
   - Onglet "Créer un compte"
   - Email: `test123@example.com`
   - Mot de passe: `password123`
   - Cliquez sur "Créer mon compte"

3. **Vérifications**
   - ✅ Message "Compte créé avec succès!"
   - ✅ Redirection automatique vers le dashboard
   - ✅ Affichage de votre nom en haut à droite
   - ✅ Plan "Free" visible

4. **Test de déconnexion**
   - Cliquez sur "Sign Out"
   - Vous êtes redirigé vers la page d'accueil

5. **Test de reconnexion**
   - Cliquez sur "Get Started"
   - Onglet "Se connecter"
   - Même email et mot de passe
   - ✅ Connexion réussie!

## Vérifier les logs Supabase

Si le problème persiste:

1. **Ouvrez le dashboard Supabase**
   - https://supabase.com/dashboard

2. **Allez dans les logs**
   - Menu de gauche → `Logs`
   - Sélectionnez `Auth`

3. **Regardez les erreurs**
   - Les erreurs récentes apparaissent en rouge
   - Cherchez des messages comme:
     - "Email not confirmed"
     - "Invalid credentials"
     - "User already registered"

## Configuration recommandée pour développement

Dans votre dashboard Supabase → Authentication → Providers → Email:

- ✅ Enable Email provider: **ON**
- ❌ Confirm email: **OFF** (important!)
- ✅ Enable email OTP: ON (optionnel)
- ✅ Secure email change: ON

## Réinitialiser complètement l'authentification

Si rien ne fonctionne, réinitialisez:

1. **Supprimez tous les utilisateurs test**
   - Dashboard Supabase → Authentication → Users
   - Sélectionnez les utilisateurs test
   - Cliquez sur "Delete"

2. **Vérifiez la configuration Email**
   - Authentication → Providers → Email
   - Confirm email: **OFF**
   - Save

3. **Videz le cache du navigateur**
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Cmd+Option+E

4. **Rechargez l'application**
   ```bash
   npm run dev
   ```

5. **Créez un nouveau compte**

## Besoin d'aide?

Si le problème persiste après toutes ces étapes:

1. Vérifiez les logs Supabase (Auth)
2. Vérifiez la console du navigateur (F12)
3. Copiez les messages d'erreur exacts
4. Vérifiez que votre projet Supabase est bien actif

## Configuration de production

Pour la production, vous pouvez réactiver la confirmation d'email:

1. Configurez un service SMTP (SendGrid, Mailgun, AWS SES)
2. Supabase → Project Settings → Authentication → SMTP Settings
3. Activez "Confirm email"
4. Personnalisez les templates d'email

Mais pour le développement, laissez la confirmation d'email **désactivée**.
