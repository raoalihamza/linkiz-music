# Guide du Convertisseur Linkiz

## Vue d'ensemble

Le convertisseur Linkiz permet à tous les utilisateurs (connectés ou visiteurs) de télécharger des vidéos et audios depuis les plateformes les plus populaires en haute qualité.

## Accès

### Pour tous les utilisateurs
- Accessible depuis le menu principal via le bouton **"Convertisseur"**
- URL directe: `/converter`
- Aucune connexion requise pour l'utilisation de base

### Avantages pour les utilisateurs connectés
- Conversions illimitées
- Vitesse de conversion prioritaire
- Historique des téléchargements
- Pas de limite de taille de fichier

## Plateformes supportées

Le convertisseur supporte les plateformes suivantes:

- **YouTube** (youtube.com, youtu.be, m.youtube.com)
- **Instagram** (instagram.com)
- **Facebook** (facebook.com, fb.watch)
- **TikTok** (tiktok.com, vm.tiktok.com)
- **Vimeo** (vimeo.com)
- **Dailymotion** (dailymotion.com)
- **SoundCloud** (soundcloud.com)

## Formats disponibles

### Audio
- **MP3 320 kbps** - Haute qualité audio parfaite pour la musique

### Vidéo
- **MP4 HD 1080p** - Vidéo haute définition
- **MP4 SD 720p** - Vidéo qualité standard (fichiers plus légers)

## Comment utiliser le convertisseur

### Étape 1: Accéder au convertisseur
1. Cliquez sur **"Convertisseur"** dans le menu principal
2. Ou allez directement sur `/converter`

### Étape 2: Entrer l'URL
1. Copiez l'URL de la vidéo/audio que vous souhaitez télécharger
   - Exemple YouTube: `https://youtube.com/watch?v=dQw4w9WgXcQ`
   - Exemple Instagram: `https://instagram.com/p/ABC123/`
2. Collez l'URL dans le champ prévu

### Étape 3: Choisir le format
1. Sélectionnez le format souhaité:
   - **MP3 320 kbps** pour l'audio uniquement
   - **MP4 HD 1080p** pour une vidéo haute qualité
   - **MP4 SD 720p** pour un fichier plus léger

### Étape 4: Convertir
1. Cliquez sur **"Convertir et télécharger"**
2. Attendez que la conversion se termine (quelques secondes)
3. Cliquez sur **"Télécharger maintenant"** une fois prêt

## Exemples d'utilisation

### Télécharger une chanson YouTube en MP3
```
URL: https://youtube.com/watch?v=dQw4w9WgXcQ
Format: MP3 320 kbps
Résultat: Never_Gonna_Give_You_Up_320kbps.mp3
```

### Télécharger une vidéo Instagram
```
URL: https://instagram.com/p/ABC123/
Format: MP4 HD 1080p
Résultat: Instagram_Video_1080p.mp4
```

### Télécharger une vidéo TikTok
```
URL: https://tiktok.com/@user/video/123456789
Format: MP4 SD 720p
Résultat: TikTok_Video_720p.mp4
```

## Messages d'erreur courants

### "URL non supportée"
**Cause:** L'URL ne provient pas d'une plateforme supportée.
**Solution:** Vérifiez que l'URL provient de YouTube, Instagram, Facebook, TikTok, Vimeo, Dailymotion ou SoundCloud.

### "Veuillez entrer une URL valide"
**Cause:** Le champ URL est vide ou le format n'est pas valide.
**Solution:** Collez une URL complète commençant par `http://` ou `https://`.

### "Erreur lors de la conversion"
**Cause:** Problème temporaire avec le service ou la vidéo est privée/supprimée.
**Solution:**
- Vérifiez que la vidéo est toujours disponible
- Réessayez dans quelques instants
- Vérifiez que la vidéo n'est pas privée

## Limites et restrictions

### Utilisateurs non connectés
- Limite de conversions quotidiennes
- Taille maximale de fichier limitée
- Vitesse de conversion standard

### Utilisateurs connectés (Free)
- Conversions illimitées
- Pas de limite de taille
- Vitesse de conversion rapide

### Utilisateurs Premium
- Conversions ultra-rapides
- Téléchargements par lots
- Formats supplémentaires (WAV, FLAC, 4K)
- Support prioritaire

## Utilisation responsable

### Droits d'auteur
- Respectez toujours les droits d'auteur
- Ne téléchargez que du contenu dont vous avez les droits
- L'utilisation doit être à des fins personnelles

### Conditions d'utilisation
- Ne pas utiliser pour de la distribution commerciale
- Ne pas télécharger de contenu protégé pour le revendre
- Respecter les conditions d'utilisation des plateformes sources

### Limites légales
- Le service ne doit pas être utilisé pour contourner les DRM
- Le contenu téléchargé est sous votre responsabilité
- Linkiz n'héberge aucun contenu, nous facilitons uniquement l'accès

## Architecture technique

### Frontend
- Composant React avec validation d'URL côté client
- Interface utilisateur moderne avec feedback en temps réel
- Support pour tous les navigateurs modernes

### Backend (Edge Function)
- Edge function Supabase déployée sur `converter`
- Validation des URL et des formats
- Conversion et génération des liens de téléchargement
- Support CORS pour accès public

### API Endpoint
```
POST /functions/v1/converter
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=...",
  "format": "mp3-320" | "mp4-hd" | "mp4-sd",
  "userId": "anonymous" | "<user-id>"
}
```

### Réponse
```json
{
  "success": true,
  "downloadUrl": "https://...",
  "filename": "Video_Title_320kbps.mp3",
  "fileSize": "5.24 MB",
  "duration": "3:24",
  "message": "Conversion initiated successfully"
}
```

## FAQ

### Le convertisseur est-il gratuit?
Oui, l'accès de base est gratuit pour tous. Les utilisateurs connectés bénéficient de conversions illimitées.

### Dois-je créer un compte?
Non, le convertisseur fonctionne sans compte. Mais un compte offre des avantages (conversions illimitées, historique, etc.).

### Quelle est la qualité audio du MP3?
Nous utilisons 320 kbps, la meilleure qualité pour le format MP3.

### Puis-je télécharger des playlists?
Actuellement, une URL à la fois. Les comptes Premium auront accès aux téléchargements de playlists.

### Les vidéos privées sont-elles supportées?
Non, seules les vidéos publiques peuvent être converties.

### Combien de temps la conversion prend-elle?
En général, 5-30 secondes selon la longueur de la vidéo et le format choisi.

### Où sont stockés mes fichiers?
Les fichiers ne sont pas stockés. Nous générons un lien de téléchargement temporaire valide 24h.

### Le service fonctionne-t-il sur mobile?
Oui, le convertisseur est entièrement responsive et fonctionne sur tous les appareils.

## Support

Pour toute question ou problème:
1. Vérifiez ce guide d'abord
2. Consultez `TROUBLESHOOTING.md` pour les problèmes courants
3. Contactez le support via le dashboard si vous êtes connecté

## Évolutions futures

### Prochaines fonctionnalités
- Support de plus de plateformes (Twitter, Reddit, etc.)
- Formats audio supplémentaires (WAV, FLAC, OGG)
- Formats vidéo 4K
- Téléchargement de playlists
- Sous-titres automatiques
- Découpage de vidéo
- Fusion de fichiers

### Améliorations planifiées
- Aperçu de la vidéo avant téléchargement
- Choix de la qualité personnalisée
- Téléchargement par lot
- Historique des conversions
- Favoris et collections
