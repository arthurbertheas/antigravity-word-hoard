# Interface Design - Guide d'Installation et d'Utilisation

## À propos

**Interface Design** est un skill pour Claude qui vous aide à créer des interfaces avec cohérence, mémoire et qualité de design.

Ce skill est conçu pour :
- **Dashboards**, panneaux d'administration, applications SaaS, outils, pages de paramètres
- **PAS pour** les sites marketing, landing pages, ou campagnes

---

## Structure du Skill

```
interface-design-skill/
├── .claude/
│   ├── skills/
│   │   └── interface-design/
│   │       ├── SKILL.md              # Skill principal
│   │       └── references/
│   │           ├── principles.md     # Principes de design détaillés
│   │           ├── validation.md     # Gestion de la mémoire
│   │           ├── critique.md       # Protocole de critique
│   │           └── example.md        # Exemples
│   └── commands/
│       ├── init.md                   # Initialiser un design system
│       ├── status.md                 # Voir l'état actuel
│       ├── audit.md                  # Auditer le code
│       ├── extract.md                # Extraire les patterns
│       └── critique.md               # Critiquer et améliorer
├── .claude-plugin/                   # Configuration du plugin
├── reference/                        # Exemples de systèmes
└── README.md                         # Documentation
```

---

## Installation

### Option 1 : Utilisation Directe dans Claude.ai

Les fichiers sont prêts à être utilisés directement avec Claude. Vous pouvez :

1. **Partager le contenu du SKILL.md** dans vos conversations avec Claude
2. **Référencer les principes** quand vous travaillez sur des interfaces
3. **Créer votre propre `.interface-design/system.md`** pour mémoriser vos décisions

### Option 2 : Installation comme Skill Local

Si vous utilisez Claude Code ou un environnement local :

```bash
# Copier les skills
cp -r .claude/skills/* ~/.claude/skills/

# Copier les commandes
cp -r .claude/commands/* ~/.claude/commands/

# (Optionnel) Copier la configuration du plugin
cp -r .claude-plugin/* ~/.claude-plugin/
```

---

## Comment ça Fonctionne

### Premier Projet (Sans system.md)

1. **Exploration du domaine** - Claude analyse le contexte de votre produit
2. **Proposition de direction** - Suggestion basée sur l'exploration
3. **Confirmation** - Vous validez la direction
4. **Construction** - Application des principes
5. **Sauvegarde** - Option de sauvegarder dans `.interface-design/system.md`

### Projets Suivants (Avec system.md)

1. **Chargement automatique** - Claude lit `.interface-design/system.md`
2. **Application des patterns** - Utilisation des décisions existantes
3. **Cohérence** - Tous les composants suivent le même système
4. **Évolution** - Option d'ajouter de nouveaux patterns

---

## Le Fichier system.md

Après avoir établi votre direction, vos décisions sont sauvegardées dans `.interface-design/system.md` :

```markdown
# Design System

## Direction
Personnalité: Précision & Densité
Fondation: Cool (slate)
Profondeur: Borders-only

## Tokens
### Espacement
Base: 4px
Échelle: 4, 8, 12, 16, 24, 32

### Couleurs
--foreground: slate-900
--secondary: slate-600
--accent: blue-600

## Patterns
### Bouton Principal
- Hauteur: 36px
- Padding: 12px 16px
- Radius: 6px
- Usage: Actions principales

### Carte Par Défaut
- Border: 0.5px solid
- Padding: 16px
- Radius: 8px
```

Ce fichier se charge automatiquement au début de chaque session.

---

## Commandes Disponibles

```
/interface-design:init           # Démarrer avec les principes de design
/interface-design:status         # Afficher le système actuel
/interface-design:audit <path>   # Vérifier le code contre le système
/interface-design:extract        # Extraire les patterns du code existant
/interface-design:critique       # Critiquer et améliorer votre build
```

---

## Directions de Design

Le skill infère la direction depuis le contexte du projet, mais vous pouvez personnaliser :

| Direction | Sensation | Meilleur Pour |
|-----------|-----------|---------------|
| **Precision & Density** | Serré, technique, monochrome | Outils dev, dashboards admin |
| **Warmth & Approachability** | Espacement généreux, ombres douces | Outils collaboratifs, apps grand public |
| **Sophistication & Trust** | Tons froids, profondeur en couches | Finance, B2B entreprise |
| **Boldness & Clarity** | Contraste élevé, espace dramatique | Dashboards modernes, apps data-heavy |
| **Utility & Function** | Fonctionnel, densité muette | Outils style GitHub |
| **Data & Analysis** | Optimisé graphiques, nombres d'abord | Analytics, outils BI |

---

## Principes Clés

### 1. L'Intent d'Abord

Avant de toucher au code, répondez :
- **Qui est cet humain ?** Le contexte réel de l'utilisateur
- **Que doit-il accomplir ?** L'action spécifique
- **Quelle sensation doit-il ressentir ?** Pas "propre et moderne" mais spécifique

### 2. Layering Subtil

Le backbone du craft :
- **Élévation des surfaces** - Systèmes numérotés, sauts de quelques %
- **Hiérarchie des bordures** - Progression de l'intensité
- **Espacement cohérent** - Unité de base et multiples
- **Profondeur consistante** - Une approche, pas de mélange

### 3. Éviter les Défauts Génériques

- ❌ Bordures trop fortes
- ❌ Sauts de surface dramatiques
- ❌ Espacement incohérent
- ❌ Stratégies de profondeur mixtes
- ❌ États d'interaction manquants
- ❌ Ombres portées dramatiques

---

## Exemples

Voir `reference/examples/` pour des templates de system.md :

- **system-precision.md** - Interfaces dashboard/admin
- **system-warmth.md** - Apps collaboratives/grand public

---

## Utilisation pour Antigravity Word Hoard

Pour votre projet **Antigravity Word Hoard**, voici comment utiliser ce skill :

### 1. Créer votre system.md

Basé sur vos tokens existants (primary #4f46e5, Sora/DM Sans/IBM Plex Mono) :

```bash
# Dans votre projet
mkdir -p .interface-design
```

Créez `.interface-design/system.md` avec vos décisions actuelles.

### 2. Utiliser avec Claude

Quand vous demandez des modifications d'interface :

```
"Je veux améliorer le panneau Mes listes avec une meilleure hiérarchie visuelle"
```

Claude va :
1. Charger votre system.md
2. Appliquer vos tokens (violet #4f46e5, Sora, etc.)
3. Respecter votre design system existant
4. Proposer des améliorations cohérentes

### 3. Évolution Progressive

Au fur et à mesure :
- Ajoutez des patterns réutilisables
- Documentez les variations de composants
- Maintenez la cohérence sur tout le projet

---

## Ressources

- **Documentation complète** : README.md
- **Exemples de référence** : reference/examples/
- **Site web** : https://interface-design.dev

---

## Licence

MIT - Voir LICENSE

---

## Crédits

Skill créé par Dammyjay93 (Oyindamola Akinleye)
Repository original : https://github.com/Dammyjay93/interface-design
