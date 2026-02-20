# Wiki des Regles - Antigravity Word Hoard (La Boite a mots)

Bienvenue dans le guide simplifie de fonctionnement de votre application. Ce wiki explique comment l'outil reagit a vos actions et comment il traite les mots.

---

## 1. Selection et Ma Liste
*Comment l'application gere vos choix de mots.*

- **Unicite des mots** : L'application reconnait chaque mot selon son ecriture, mais aussi sa classe (nom, verbe, etc.) et son nombre de syllabes. Vous pouvez donc avoir plusieurs fois le meme mot s'il a des proprietes differentes.
- **Ajout rapide** : Cliquez sur un mot dans la banque de mots pour l'ajouter a "Ma selection". Un compteur en bas de l'ecran vous indique le nombre de mots selectionnes.
- **Persistance** : Votre selection est automatiquement sauvegardee dans le navigateur (localStorage). Elle est restauree a la prochaine visite.
- **Lancement** : Pour demarrer le diaporama, il vous faut au moins un mot dans votre selection.

---

## 2. Listes sauvegardees
*Comment enregistrer et retrouver vos listes.*

- **Sauvegarde dans le cloud** : Vos listes sont stockees dans Supabase, liees a votre compte utilisateur. Vous les retrouvez sur n'importe quel appareil.
- **Noms uniques** : L'application empeche la creation de deux listes portant le meme nom.
- **Tags et description** : Chaque liste peut avoir des tags et une description pour faciliter l'organisation.
- **Charger une liste** : Cliquez sur une liste sauvegardee pour remplacer votre selection actuelle par son contenu.
- **Exporter** : Le menu "..." de chaque liste propose un bouton "Exporter" qui ouvre le panneau d'export complet (choix de layout, format PDF/Word, personnalisation du titre, apercu A4).

---

## 3. Filtres et Recherche
*Comment trouver les mots qui vous interessent.*

### Filtres progressifs
- **Structure syllabique** : 7 niveaux (a a g) de complexite croissante, des syllabes simples (CV) aux clusters consonantiques complexes.
- **Progression graphemes** : 13 niveaux de difficulte croissante des graphemes.
- **Appui lexical** : 4 niveaux de familiarite (I = Tres familier, II = Familier, III = Peu familier, IV = Non familier). Chips indigo avec badges romains.

### Filtres complementaires
- **Categorie syntaxique** : NC, ADJ, VER, ADV, PRE, NP
- **Nombre de syllabes** : filtrage par nombre exact
- **Longueur du mot** : filtrage par nombre de lettres
- **Avec image** : ne montrer que les mots ayant une image associee

### Recherche ciblee (Include / Exclude)
Les 3 filtres de recherche ciblee supportent deux modes via un toggle **Contient / Sans** :
- **Sequence de lettres** : recherche par debut, milieu, fin ou partout dans le mot
- **Grapheme** : recherche dans la segmentation graphemique
- **Phoneme** : recherche dans la transcription phonetique, avec grille IPA interactive

Le mode **Sans** (exclude) inverse le filtre : seuls les mots ne contenant PAS le critere sont affiches. Les tags exclude s'affichent en rouge.

### Selection aleatoire
- Tirage au sort respectant les filtres actifs
- Distribution equilibree selon les criteres include
- Les criteres exclude sont ignores dans la distribution (mais respectes dans le filtrage)

---

## 4. Affichage et Couleurs (Linguistique)
*Comment les mots sont colores a l'ecran.*

- **Syllabes et Graphemes** : Les mots ne sont pas affiches lettre par lettre, mais decoupes selon les sons (graphemes).
- **Voyelles en rouge** : Si l'option est activee, les voyelles (a, e, i, o, u, y et leurs variantes accentuees) s'affichent en rouge.
- **Lettres muettes en gris** : Les lettres qui ne se prononcent pas (comme le 'h' ou les lettres finales silencieuses) s'affichent en gris clair.
- **Le cas du "e"** : Dans certains mots, si l'option est cochee, le "e" entraine avec lui au maximum **deux** consonnes qui suivent (ex: dans "mer", le 'e' est rouge et le 'r' est marron ; dans "extraterrestre", le 'e' est rouge et 'xt' sont marron).
- **Combinaisons speciales** : Pour les lettres comme `qu`, `ge` ou `gu`, l'application est intelligente : elle ne grise que la lettre silencieuse (le 'u' ou le 'e').
- **Mots proteges** : Les messages "Pret ?" et "Bravo !" restent toujours en noir pour ne pas perturber l'enfant.

---

## 5. Le Diaporama (Tachistoscope)
*Comment se deroule l'exercice.*

- **Rythme** : Le diaporama alterne entre l'affichage du mot et une pause.
- **Modes d'affichage** : 3 modes (Mot / Image / Mot + Image) avec option "Double face" (l'image ou le mot se devoile au toucher).
- **Polices** : Arial, Verdana, MDI Ecole, OpenDyslexic, Sans, Serif, Mono.
- **Espacements** : 3 modes d'espacement visuel (Lettres, Graphemes, Syllabes) avec apercu inline.
- **Mise en surbrillance** : voyelles en rouge, lettres muettes en gris.
- **Croix de fixation** : Pendant la pause, une petite croix peut s'afficher au centre pour aider l'enfant a savoir ou regarder.
- **Le Bip sonore** :
    - Si vous passez les mots **manuellement** (fleches) : Le bip retentit pile quand le mot apparait.
    - Si le diaporama est en **automatique** (Play) : Le bip retentit un court instant (**0,5 seconde**) *avant* que le mot n'apparaisse pour preparer l'attention.
- **Melange** : Vous pouvez melanger la liste. Le message "Bravo !" restera toujours a la toute fin, quoi qu'il arrive.
- **Panneau de configuration** : s'ouvre par defaut sur l'onglet Affichage, se replie automatiquement apres 30 secondes.
- **Detection d'images** : Les modes Image et Mot+Image sont automatiquement grises si aucun mot de la liste n'a d'image. Un avertissement ambre s'affiche pour les listes mixtes.

---

## 6. Resultats et Progres
*Comment suivre les performances.*

- **Validation** : Apres chaque mot, vous (ou l'enfant) pouvez indiquer si la lecture etait reussie (Vert) ou non (Rouge).
- **Calcul du score** : Le pourcentage de reussite ne prend en compte que les mots qui ont ete evalues. Si vous sautez un mot, il ne fait pas varier le score.
- **Rapport PDF** : A la fin, vous pouvez telecharger un bilan complet. Il contient la date, la duree de l'exercice, le score global et le detail de chaque mot pour votre dossier patient.

---

## 7. Export
*Comment exporter vos listes de mots.*

### Acces
- **Depuis "Ma selection"** : Bouton "Exporter la liste" dans le panneau de selection
- **Depuis les listes sauvegardees** : Menu "..." > "Exporter" sur chaque liste

### Panneau d'export
Un modal s'ouvre avec :
- **Onglet Document** : choix du layout parmi 5 options visuelles (Liste, 2 colonnes, 3 colonnes, Cartes, Tableau)
- **Onglet Contenu** : options d'affichage (mot seul, image seule, mot + image), inclusion de phonemes, categorie, nb syllabes, segmentation syllabique, numerotation, date
- **Apercu A4** : rendu en temps reel de l'export
- **Titre/sous-titre** : personnalisables (pre-rempli avec le nom de la liste si export depuis une liste sauvegardee)

### Formats
- **PDF** : genere via `@react-pdf/renderer` (texte vectoriel net, pas de pixelisation)
- **Word (.docx)** : genere via la librairie `docx`, avec images integrees, couleurs de statut, bordures de tableau

### Raccourcis
- `Echap` : fermer le panneau
- `Ctrl/Cmd + Entree` : lancer l'export

---

## 8. Imagier phonetique
*Comment creer des livrets d'images pour vos patients.*

- **Grilles** : 4 formats (2x3, 3x3, 3x4, 4x4) en portrait ou paysage
- **Contenu par carte** : image du mot, mot ecrit, determinant, segmentation syllabique, phonemes, categorie syntaxique, nombre de syllabes
- **Casse** : minuscule, MAJUSCULE, Capitalise
- **Taille de police** : petit, moyen, grand
- **Guides de decoupe** : bordures en pointilles pour faciliter le decoupage
- **En-tete / pied de page** : titre et sous-titre personnalisables
- **Multi-page** : pagination automatique si le nombre de mots depasse la grille
- **Export PDF** : rendu vectoriel via `@react-pdf/renderer`, images converties de SVG en PNG

---

## 9. Integration Webflow
*Comment l'application s'integre dans le site principal.*

L'application est embarquee en iframe dans le site MaterielOrthophonie.fr (Webflow). La communication se fait via `postMessage` :
- Le compteur de mots selectionnes est synchronise avec le site parent
- Le mode diaporama (plein ecran) est gere par le parent
- La navigation "retour" est centralisee dans le shell parent pour eviter les doubles appuis
