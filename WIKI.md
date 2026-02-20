# 📚 Wiki — Antigravity Word Hoard (La Boîte à mots)

Bienvenue dans le guide simplifié de fonctionnement de votre application. Ce wiki explique comment l'outil réagit à vos actions et comment il traite les mots.

---

## 1. Sélection et Ma Liste
*Comment l'application gère vos choix de mots.*

- **Unicité des mots** : L'application reconnaît chaque mot selon son écriture, mais aussi sa classe (nom, verbe, etc.) et son nombre de syllabes. Vous pouvez donc avoir plusieurs fois le même mot s'il a des propriétés différentes.
- **Ajout rapide** : Cliquez sur un mot dans la banque de mots pour l'ajouter à "Ma sélection". Un compteur en bas de l'écran vous indique le nombre de mots sélectionnés.
- **Persistance** : Votre sélection est automatiquement sauvegardée dans le navigateur (localStorage). Elle est restaurée à la prochaine visite.
- **Lancement** : Pour démarrer le diaporama, il vous faut au moins un mot dans votre sélection.

---

## 2. Listes sauvegardées
*Comment enregistrer et retrouver vos listes.*

- **Sauvegarde dans le cloud** : Vos listes sont stockées dans Supabase, liées à votre compte utilisateur. Vous les retrouvez sur n'importe quel appareil.
- **Noms uniques** : L'application empêche la création de deux listes portant le même nom.
- **Tags et description** : Chaque liste peut avoir des tags et une description pour faciliter l'organisation.
- **Charger une liste** : Cliquez sur une liste sauvegardée pour remplacer votre sélection actuelle par son contenu.
- **Exporter** : Le menu "..." de chaque liste propose un bouton "Exporter" qui ouvre le panneau d'export complet (choix de layout, format PDF/Word, personnalisation du titre, aperçu A4).

---

## 3. Filtres et Recherche
*Comment trouver les mots qui vous intéressent.*

### Filtres progressifs
- **Structure syllabique** : 7 niveaux (a → g) de complexité croissante, des syllabes simples (CV) aux clusters consonantiques complexes.
- **Progression graphèmes** : 13 niveaux de difficulté croissante des graphèmes.
- **Appui lexical** : 4 niveaux de familiarité (I = Très familier, II = Familier, III = Peu familier, IV = Non familier). Chips indigo avec badges romains.

### Filtres complémentaires
- **Catégorie syntaxique** : NC, ADJ, VER, ADV, PRE, NP
- **Nombre de syllabes** : filtrage par nombre exact
- **Longueur du mot** : filtrage par nombre de lettres
- **Avec image** : ne montrer que les mots ayant une image associée

### Recherche ciblée (Include / Exclude)
Les 3 filtres de recherche ciblée supportent deux modes via un toggle **Contient / Sans** :
- **Séquence de lettres** : recherche par début, milieu, fin ou partout dans le mot
- **Graphème** : recherche dans la segmentation graphémique
- **Phonème** : recherche dans la transcription phonétique, avec grille IPA interactive

Le mode **Sans** (exclude) inverse le filtre : seuls les mots ne contenant PAS le critère sont affichés. Les tags exclude s'affichent en rouge.

### Sélection aléatoire
- Tirage au sort respectant les filtres actifs
- Distribution équilibrée selon les critères include
- Les critères exclude sont ignorés dans la distribution (mais respectés dans le filtrage)

---

## 4. Affichage et Couleurs (Linguistique)
*Comment les mots sont colorés à l'écran.*

- **Syllabes et Graphèmes** : Les mots ne sont pas affichés lettre par lettre, mais découpés selon les sons (graphèmes).
- **Voyelles en rouge** : Si l'option est activée, les voyelles (a, e, i, o, u, y et leurs variantes accentuées) s'affichent en rouge.
- **Lettres muettes en gris** : Les lettres qui ne se prononcent pas (comme le 'h' ou les lettres finales silencieuses) s'affichent en gris clair.
- **Le cas du "e"** : Dans certains mots, si l'option est cochée, le "e" entraîne avec lui au maximum **deux** consonnes qui suivent (ex : dans "mer", le 'e' est rouge et le 'r' est marron ; dans "extraterrestre", le 'e' est rouge et 'xt' sont marron).
- **Combinaisons spéciales** : Pour les lettres comme `qu`, `ge` ou `gu`, l'application est intelligente : elle ne grise que la lettre silencieuse (le 'u' ou le 'e').
- **Mots protégés** : Les messages "Prêt ?" et "Bravo !" restent toujours en noir pour ne pas perturber l'enfant.

---

## 5. Le Diaporama (Tachistoscope)
*Comment se déroule l'exercice.*

- **Rythme** : Le diaporama alterne entre l'affichage du mot et une pause.
- **Modes d'affichage** : 3 modes (Mot / Image / Mot + Image) avec option "Double face" (l'image ou le mot se dévoile au toucher).
- **Polices** : Arial, Verdana, MDI École, OpenDyslexic, Sans, Serif, Mono.
- **Espacements** : 3 modes d'espacement visuel (Lettres, Graphèmes, Syllabes) avec aperçu inline.
- **Mise en surbrillance** : voyelles en rouge, lettres muettes en gris.
- **Croix de fixation** : Pendant la pause, une petite croix peut s'afficher au centre pour aider l'enfant à savoir où regarder.
- **Le Bip sonore** :
    - Si vous passez les mots **manuellement** (flèches) : Le bip retentit pile quand le mot apparaît.
    - Si le diaporama est en **automatique** (Play) : Le bip retentit un court instant (**0,5 seconde**) *avant* que le mot n'apparaisse pour préparer l'attention.
- **Mélange** : Vous pouvez mélanger la liste. Le message "Bravo !" restera toujours à la toute fin, quoi qu'il arrive.
- **Panneau de configuration** : s'ouvre par défaut sur l'onglet Affichage, se replie automatiquement après 30 secondes.
- **Détection d'images** : Les modes Image et Mot+Image sont automatiquement grisés si aucun mot de la liste n'a d'image. Un avertissement ambre s'affiche pour les listes mixtes.

---

## 6. Résultats et Progrès
*Comment suivre les performances.*

- **Validation** : Après chaque mot, vous (ou l'enfant) pouvez indiquer si la lecture était réussie (Vert) ou non (Rouge).
- **Calcul du score** : Le pourcentage de réussite ne prend en compte que les mots qui ont été évalués. Si vous sautez un mot, il ne fait pas varier le score.
- **Rapport PDF** : À la fin, vous pouvez télécharger un bilan complet. Il contient la date, la durée de l'exercice, le score global et le détail de chaque mot pour votre dossier patient.

---

## 7. Export
*Comment exporter vos listes de mots.*

### Accès
- **Depuis "Ma sélection"** : Bouton "Exporter la liste" dans le panneau de sélection
- **Depuis les listes sauvegardées** : Menu "..." > "Exporter" sur chaque liste

### Panneau d'export
Un modal s'ouvre avec :
- **Onglet Document** : choix du layout parmi 5 options visuelles (Liste, 2 colonnes, 3 colonnes, Cartes, Tableau)
- **Onglet Contenu** : options d'affichage (mot seul, image seule, mot + image), inclusion de phonèmes, catégorie, nb syllabes, segmentation syllabique, numérotation, date
- **Aperçu A4** : rendu en temps réel de l'export
- **Titre/sous-titre** : personnalisables (pré-rempli avec le nom de la liste si export depuis une liste sauvegardée)

### Formats
- **PDF** : généré via `@react-pdf/renderer` (texte vectoriel net, pas de pixelisation)
- **Word (.docx)** : généré via la librairie `docx`, avec images intégrées, couleurs de statut, bordures de tableau

### Raccourcis
- `Échap` : fermer le panneau
- `Ctrl/Cmd + Entrée` : lancer l'export

---

## 8. Imagier phonétique
*Comment créer des livrets d'images pour vos patients.*

- **Grilles** : 4 formats (2×3, 3×3, 3×4, 4×4) en portrait ou paysage
- **Contenu par carte** : image du mot, mot écrit, déterminant, segmentation syllabique, phonèmes, catégorie syntaxique, nombre de syllabes
- **Casse** : minuscule, MAJUSCULE, Capitalisé
- **Taille de police** : petit, moyen, grand
- **Guides de découpe** : bordures en pointillés pour faciliter le découpage
- **En-tête / pied de page** : titre et sous-titre personnalisables
- **Multi-page** : pagination automatique si le nombre de mots dépasse la grille
- **Export PDF** : rendu vectoriel via `@react-pdf/renderer`, images converties de SVG en PNG

---

## 9. Intégration Webflow
*Comment l'application s'intègre dans le site principal.*

L'application est embarquée en iframe dans le site MaterielOrthophonie.fr (Webflow). La communication se fait via `postMessage` :
- Le compteur de mots sélectionnés est synchronisé avec le site parent
- Le mode diaporama (plein écran) est géré par le parent
- La navigation "retour" est centralisée dans le shell parent pour éviter les doubles appuis
