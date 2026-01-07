# Guide de Changement de Plan

## Vue d'Ensemble

Le système de gestion des plans permet de **tester instantanément tous les plans sans paiement**. C'est idéal pour le développement et les démonstrations.

## Comment Changer de Plan

### 1. Accéder au Gestionnaire d'Abonnement

Depuis le Dashboard, cliquez sur le bouton **"Upgrade Plan"** ou **"Manage Subscription"**.

### 2. Choisir Votre Plan

Vous verrez trois plans disponibles:

#### **Free** (Gratuit)
- Pages publiques illimitées
- Liens illimités
- ❌ Téléchargements bloqués
- ❌ Fichiers avec watermark
- ❌ Publicités activées

#### **Starter** (4€/mois)
- Tout ce qui est dans Free
- ✅ 3 téléchargements par mois
- ✅ Pas de publicités
- ✅ Watermark métadonnées uniquement
- ✅ Réinitialisation mensuelle

#### **Creator** (7€/mois)
- Tout ce qui est dans Starter
- ✅ 20 téléchargements par mois
- ✅ Pas de publicités
- ✅ Fichiers sans watermark
- ✅ Support prioritaire

### 3. Changer Instantanément

- Cliquez sur le bouton du plan souhaité
- Le changement est **immédiat** et **gratuit** (mode test)
- Les quotas sont réinitialisés automatiquement
- La page se recharge pour appliquer les changements

## Fonctionnalités du Mode Test

### ✅ Avantages

1. **Changement Instantané**
   - Aucun paiement requis
   - Aucune vérification de carte
   - Changement en un clic

2. **Test Complet**
   - Testez toutes les fonctionnalités
   - Voyez les différences entre les plans
   - Comparez les quotas de téléchargement

3. **Quotas Réinitialisés**
   - À chaque changement de plan, vos quotas sont réinitialisés
   - `downloads_used` est remis à 0
   - Les limites sont mises à jour selon le plan

4. **Montée et Descente**
   - Passez de Free à Creator
   - Revenez à Free depuis Creator
   - Testez Starter entre les deux

### 🔄 Changements Appliqués

Lors d'un changement de plan, le système met à jour:

```typescript
{
  plan_type: 'free' | 'starter' | 'creator',
  download_limit: 0 | 3 | 20,
  downloads_used: 0  // Toujours réinitialisé
}
```

### 📊 Limites par Plan

| Plan | Téléchargements | Watermark | Publicités |
|------|----------------|-----------|------------|
| Free | 0 | Oui (audio) | Oui |
| Starter | 3/mois | Métadonnées | Non |
| Creator | 20/mois | Non | Non |

## Implications Techniques

### Base de Données

La table `user_profiles` est mise à jour:

```sql
UPDATE user_profiles
SET
  plan_type = 'starter',
  download_limit = 3,
  downloads_used = 0
WHERE id = user_id;
```

### Row Level Security (RLS)

Les politiques RLS permettent aux utilisateurs de modifier leur propre profil:

```sql
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Interface Utilisateur

Le composant `SubscriptionManager.tsx` gère:

1. **État de Chargement**
   ```typescript
   const [loading, setLoading] = useState(false);
   ```

2. **Messages de Feedback**
   ```typescript
   const [message, setMessage] = useState<{
     type: 'success' | 'error',
     text: string
   } | null>(null);
   ```

3. **Mise à Jour en Base**
   ```typescript
   const { error } = await supabase
     .from('user_profiles')
     .update({ plan_type, download_limit, downloads_used: 0 })
     .eq('id', user.id);
   ```

## Passer en Production

### 🚀 Intégration Stripe

Pour activer les paiements réels, suivez ces étapes:

#### 1. Configuration Stripe

```bash
# Installer Stripe
npm install @stripe/stripe-js stripe
```

#### 2. Variables d'Environnement

Ajoutez à `.env`:

```env
VITE_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 3. Créer les Prix dans Stripe

```bash
# Dashboard Stripe > Products
# Créer 2 produits:
# - Starter: 4€/mois
# - Creator: 7€/mois
```

#### 4. Edge Function pour Checkout

Créer `supabase/functions/create-checkout/index.ts`:

```typescript
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

Deno.serve(async (req) => {
  const { priceId, userId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${req.headers.get('origin')}/dashboard?success=true`,
    cancel_url: `${req.headers.get('origin')}/dashboard?canceled=true`,
    client_reference_id: userId,
  });

  return new Response(JSON.stringify({ url: session.url }));
});
```

#### 5. Webhook pour Paiements

Créer `supabase/functions/stripe-webhook/index.ts`:

```typescript
import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Déterminer le plan selon le prix
    const planMap = {
      'price_starter_id': { type: 'starter', limit: 3 },
      'price_creator_id': { type: 'creator', limit: 20 }
    };

    const plan = planMap[session.line_items.data[0].price.id];

    await supabase
      .from('user_profiles')
      .update({
        plan_type: plan.type,
        download_limit: plan.limit,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription
      })
      .eq('id', session.client_reference_id);
  }

  return new Response(JSON.stringify({ received: true }));
});
```

#### 6. Modifier le Frontend

Remplacer `handleChangePlan` dans `SubscriptionManager.tsx`:

```typescript
const handleUpgrade = async (priceId: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, userId: user.id })
      }
    );

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Tester le Système

### Scénarios de Test

#### Test 1: Upgrade Free → Starter
1. Connectez-vous avec un compte Free
2. Ouvrez le gestionnaire d'abonnement
3. Cliquez sur "Passer à Starter"
4. Vérifiez que `download_limit = 3`
5. Vérifiez que `downloads_used = 0`

#### Test 2: Upgrade Starter → Creator
1. Depuis un compte Starter
2. Cliquez sur "Passer à Creator"
3. Vérifiez que `download_limit = 20`
4. Vérifiez que les quotas sont réinitialisés

#### Test 3: Downgrade Creator → Free
1. Depuis un compte Creator
2. Cliquez sur "Passer à Free"
3. Vérifiez que `download_limit = 0`
4. Testez que les téléchargements sont bloqués

#### Test 4: Changements Multiples
1. Free → Starter → Creator → Free
2. Vérifiez à chaque étape:
   - Les limites sont correctes
   - Les quotas sont réinitialisés
   - L'interface reflète le changement

### Vérifier en Base de Données

```sql
-- Voir le profil d'un utilisateur
SELECT
  id,
  email,
  plan_type,
  download_limit,
  downloads_used
FROM user_profiles
WHERE email = 'test@example.com';

-- Historique des changements (si vous ajoutez une table d'audit)
SELECT * FROM plan_changes
WHERE user_id = 'user-uuid'
ORDER BY changed_at DESC;
```

## Limitations du Mode Test

### ⚠️ Important

1. **Pas de Vérification de Paiement**
   - N'importe qui peut passer à Creator gratuitement
   - Pas de validation de carte de crédit

2. **Quotas Réinitialisés**
   - À chaque changement, les téléchargements utilisés sont remis à 0
   - En production, préserver les quotas jusqu'à la fin du cycle

3. **Pas d'Historique**
   - Aucun enregistrement des changements
   - En production, créer une table `subscription_history`

4. **Pas de Facturation**
   - Aucune facture générée
   - Aucun reçu envoyé

## Recommandations

### Pour le Développement

✅ **Gardez ce système** pour:
- Tests locaux
- Démonstrations
- Développement de fonctionnalités

### Pour la Production

🔒 **Implémentez**:
1. Stripe pour les paiements
2. Webhooks pour la synchronisation
3. Gestion des cycles de facturation
4. Historique des abonnements
5. Emails de confirmation
6. Portail client Stripe

## Support

Pour toute question sur le système de plans:
- Consultez `src/components/SubscriptionManager.tsx`
- Vérifiez les politiques RLS dans `supabase/migrations/`
- Voir le guide Stripe: https://bolt.new/setup/stripe

---

**Note**: Ce système est parfait pour le développement. Pour la production, intégrez Stripe pour des paiements sécurisés et conformes.
