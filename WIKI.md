# 📚 Wiki des Règles - Antigravity Word Hoard

Bienvenue dans le guide simplifié de fonctionnement de votre application. Ce wiki explique comment l'outil réagit à vos actions et comment il traite les mots.

---

## 🧭 1. Sélection et Ma Liste
*Comment l'application gère vos choix de mots.*

- **Unicité des mots** : L'application reconnaît chaque mot selon son écriture, mais aussi sa classe (nom, verbe, etc.) et son nombre de syllabes. Vous pouvez donc avoir plusieurs fois le même mot s'il a des propriétés différentes.
- **Ajout rapide** : Cliquez sur un mot dans la banque de mots pour l'ajouter à "Ma liste". Un compteur en bas de l'écran vous indique le nombre de mots sélectionnés.
- **Sauvegarde** : Vous pouvez enregistrer vos sélections pour les retrouver plus tard. L'application vous préviendra si vous essayez de donner le même nom à deux listes différentes.
- **Lancement** : Pour démarrer le diaporama, il vous faut au moins un mot dans votre liste.

---

## 🎨 2. Affichage et Couleurs (Linguistique)
*Comment les mots sont colorés à l'écran.*

- **Syllabes et Graphemes** : Les mots ne sont pas affichés lettre par lettre, mais découpés selon les sons (graphemes).
- **Voyelles en rouge** : Si l'option est activée, les voyelles (a, e, i, o, u, y et leurs variantes accentuées) s'affichent en rouge.
- **Lettres muettes en gris** : Les lettres qui ne se prononcent pas (comme le 'h' ou les lettres finales silencieuses) s'affichent en gris clair.
- **Le cas du "e"** : Dans certains mots, si l'option est cochée, le "e" entraîne avec lui les consonnes qui suivent (ex: dans "mer", le 'e' et le 'r' seront rouges).
- **Règle spéciale "ex"** : Pour les mots commençant par "ex" (comme *expert* ou *explosion*), nous colorions le "e", le "x" et, au maximum, la consonne qui suit.
- **Combinaisons spéciales** : Pour les lettres comme `qu`, `ge` ou `gu`, l'application est intelligente : elle ne grise que la lettre silencieuse (le 'u' ou le 'e').
- **Mots protégés** : Les messages "Prêt ?" et "Bravo !" restent toujours en noir pour ne pas perturber l'enfant.

---

## ⏱️ 3. Le Diaporama (Tachistoscope)
*Comment se déroule l'exercice.*

- **Rythme** : Le diaporama alterne entre l'affichage du mot et une pause.
- **Croix de fixation** : Pendant la pause, une petite croix peut s'afficher au centre pour aider l'enfant à savoir où regarder.
- **Le Bip sonore** :
    - Si vous passez les mots **manuellement** (flèches) : Le bip retentit pile quand le mot apparaît.
    - Si le diaporama est en **automatique** (Play) : Le bip retentit un court instant (**0,5 seconde**) *avant* que le mot n'apparaisse pour préparer l'attention.
- **Mélange** : Vous pouvez mélanger la liste. Le message "Bravo !" restera toujours à la toute fin, quoi qu'il arrive.

---

## 📊 4. Résultats et Progrès
*Comment suivre les performances.*

- **Validation** : Après chaque mot, vous (ou l'enfant) pouvez indiquer si la lecture était réussie (Vert/✓) ou non (Rouge/✗).
- **Calcul du score** : Le pourcentage de réussite ne prend en compte que les mots qui ont été évalués. Si vous sautez un mot, il ne fait pas varier le score.
- **Rapport PDF** : À la fin, vous pouvez télécharger un bilan complet. Il contient la date, la durée de l'exercice, le score global et le détail de chaque mot pour votre dossier patient.
