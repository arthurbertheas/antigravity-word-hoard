# Ticket : Correction de l'affichage "Double Divider" sur le panneau Mes Listes

## 🐛 Description du problème
Actuellement, lorsque le panneau "Mes listes" est ouvert, on observe un **double filet de séparation** (double divider) et un espacement non désiré entre l'en-tête principal ("Ma Liste") et l'en-tête du panneau ("Mes listes").

La `div` contenant "Mes listes" n'est pas correctement "collée" au divider du dessus, créant un effet visuel désagréable.

## 🎯 Objectif
Avoir une séparation **unique et propre** (clean) entre la partie supérieure fixe et le panneau déroulant des listes.

## 🛠 Solution Technique PROPOSÉE

1.  **Supprimer le divider du composant `PanelHeader`** à l'intérieur de `SavedListsPanel`.
    *   Utiliser la prop `hideBorder={true}` sur le `PanelHeader` de `SavedListsPanel`.
2.  **Ajuster le positionnement** de la `div` conteneur (`SavedListsPanel`).
    *   Vérifier les classes CSS de positionnement (`top-[80px]`) dans `SelectionTray.tsx`.
    *   S'assurer qu'il n'y a pas de `margin-top` ou `padding-top` parasite qui crée un espace blanc entre le header principal et le panneau.
    *   Si le header principal a déjà une bordure `border-b`, celle du panneau doit être supprimée pour éviter le doublon.
3.  **Vérifier lier l'espacement** (padding) interne pour que le contenu remonte proprement contre le filet de séparation unique.

## ✅ Critères d'acceptation
- [ ] Plus de double ligne visible.
- [ ] Le panneau "Mes listes" est visuellement "collé" à la barre du haut.
- [ ] L'espace est uniforme et conforme au design "clean".
