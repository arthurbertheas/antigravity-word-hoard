# Paramètres Utilisateur du Tachistoscope

## Vue d'ensemble

Cette fonctionnalité permet à chaque utilisateur de sauvegarder et de charger automatiquement ses préférences de configuration du tachistoscope (diaporama).

## Installation

### 1. Exécuter la migration SQL

Connectez-vous à votre console Supabase et exécutez le script SQL suivant :

```bash
# Le fichier se trouve à la racine du projet
supabase-migration-user-settings.sql
```

Ou copiez-collez le contenu dans l'éditeur SQL de Supabase.

Cette migration va créer :
- Une table `user_tachistoscope_settings` pour stocker les préférences
- Des politiques RLS (Row Level Security) pour protéger les données
- Des index pour optimiser les performances

### 2. Vérifier la migration

Vérifiez que la table a bien été créée :

```sql
SELECT * FROM user_tachistoscope_settings LIMIT 5;
```

## Fonctionnement

### Chargement des paramètres

1. **Au montage du composant** : Lorsqu'un utilisateur ouvre le tachistoscope, le système :
   - Charge d'abord les paramètres depuis `localStorage` (pour un affichage rapide)
   - Puis charge les paramètres depuis Supabase (si l'utilisateur est connecté)
   - Si des paramètres existent dans Supabase, ils écrasent ceux du localStorage

2. **Fallback** : Si l'utilisateur n'est pas connecté ou si aucun paramètre n'existe :
   - Les paramètres par défaut sont utilisés
   - Seul le localStorage est utilisé

### Sauvegarde des paramètres

Lorsqu'un utilisateur modifie un paramètre (police, taille, espacement, timing, etc.) :
- Le paramètre est **immédiatement sauvegardé** dans localStorage
- Le paramètre est **aussi sauvegardé dans Supabase** (si l'utilisateur est connecté)
- L'opération Supabase est asynchrone (fire-and-forget) pour ne pas bloquer l'interface

### Paramètres sauvegardés

Les paramètres suivants sont sauvegardés pour chaque utilisateur :

| Paramètre | Description | Valeur par défaut |
|-----------|-------------|-------------------|
| `speed_ms` | Durée d'affichage du mot (en ms) | 1000 |
| `gap_ms` | Durée de la pause entre les mots (en ms) | 500 |
| `font_size` | Taille de la police (multiplicateur) | 15 |
| `font_family` | Police de caractères | 'arial' |
| `highlight_vowels` | Coloration des voyelles en rouge | false |
| `highlight_silent` | Coloration des lettres muettes en gris | false |
| `spacing_value` | Valeur de l'espacement | 0 |
| `spacing_mode` | Mode d'espacement (letters/graphemes/syllables) | 'letters' |
| `show_focus_point` | Afficher le point de fixation pendant la pause | true |
| `enable_sound` | Activer le bip sonore à chaque mot | false |

## Sécurité

- **Row Level Security (RLS)** : Activé sur la table
- Chaque utilisateur ne peut accéder qu'à ses propres paramètres
- Les politiques empêchent la lecture/modification des paramètres d'autres utilisateurs

## Architecture technique

### Fichiers modifiés

1. **`src/lib/supabase.ts`**
   - Ajout du type `TachistoscopeSettings`
   - Fonction `loadUserTachistoscopeSettings()` : Charge les paramètres depuis Supabase
   - Fonction `saveUserTachistoscopeSettings()` : Sauvegarde les paramètres dans Supabase

2. **`src/contexts/PlayerContext.tsx`**
   - Ajout d'un `useEffect` pour charger les paramètres au montage
   - Modification du `useEffect` de sauvegarde pour aussi sauvegarder dans Supabase
   - Gestion de l'état `settingsLoaded` pour éviter les sauvegardes pendant le chargement initial

3. **`supabase-migration-user-settings.sql`**
   - Script de création de la table et des politiques RLS

### Flux de données

```
Utilisateur modifie un paramètre
    ↓
updateSettings() appelé
    ↓
settings state mis à jour
    ↓
useEffect déclenché
    ↓
┌─────────────────────┬─────────────────────┐
│  localStorage       │    Supabase         │
│  (synchrone)        │    (asynchrone)     │
└─────────────────────┴─────────────────────┘
```

## Tests

### Tester le chargement

1. Connectez-vous avec un compte utilisateur
2. Modifiez plusieurs paramètres du tachistoscope
3. Rafraîchissez la page
4. Vérifiez que les paramètres sont bien restaurés

### Tester avec plusieurs utilisateurs

1. Connectez-vous avec l'utilisateur A
2. Configurez les paramètres (ex: police Verdana, taille 20)
3. Déconnectez-vous
4. Connectez-vous avec l'utilisateur B
5. Vérifiez que les paramètres par défaut s'affichent
6. Configurez d'autres paramètres (ex: police Arial, taille 10)
7. Reconnectez-vous avec l'utilisateur A
8. Vérifiez que ses paramètres (Verdana, taille 20) sont bien restaurés

### Vérifier dans la base de données

```sql
-- Voir tous les paramètres utilisateur
SELECT
    user_id,
    font_family,
    font_size,
    speed_ms,
    gap_ms,
    updated_at
FROM user_tachistoscope_settings
ORDER BY updated_at DESC;
```

## Maintenance

### Réinitialiser les paramètres d'un utilisateur

```sql
DELETE FROM user_tachistoscope_settings
WHERE user_id = 'USER_UUID_HERE';
```

### Voir les paramètres d'un utilisateur spécifique

```sql
SELECT * FROM user_tachistoscope_settings
WHERE user_id = 'USER_UUID_HERE';
```

## Notes importantes

- Les paramètres sont sauvegardés **automatiquement** à chaque modification
- Il n'y a **pas de bouton "Sauvegarder"** - tout est transparent pour l'utilisateur
- Le localStorage est conservé comme fallback en cas de problème réseau
- Les erreurs Supabase sont loguées dans la console mais ne bloquent pas l'utilisateur
