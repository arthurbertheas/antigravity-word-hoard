# 🎫 Ticket : Réinitialiser la sélection au changement de filtre

## Contexte

Quand l'utilisateur a une sélection active (via "Tout sélectionner" ou "Aléatoire") et qu'il modifie les filtres, le comportement actuel n'est pas défini.

## Comportement attendu

**Tout changement de filtre réinitialise la sélection :**

1. La sélection de mots est vidée
2. Le bouton "Tout sélectionner" repasse en état inactif `[ ○ Tout sélectionner ]`
3. Le bouton "Aléatoire" repasse en état inactif `[ ○ Aléatoire ▼ ]`
4. Le panneau "Ma Liste" affiche 0 mots

## Filtres concernés

Tout changement sur :
- Syllabes
- Code Appui Lexical
- Phonèmes / Graphèmes
- Positions
- Catégories
- Structures
- Complexité
- Recherche texte
- Tout autre filtre

## Critères d'acceptance

- [ ] Modifier un filtre vide la sélection de mots
- [ ] Le bouton "Tout sélectionner" repasse en état inactif
- [ ] Le bouton "Aléatoire" repasse en état inactif (plus de nombre affiché)
- [ ] Pas de modale de confirmation (réinitialisation silencieuse)

---

## Priorité

🟠 Medium

## Estimation

~1h
