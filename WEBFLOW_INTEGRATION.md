# Webflow Integration Guide

Cette application React est concue pour etre embarquee en iframe dans un site Webflow (MaterielOrthophonie.fr). Ce guide documente l'architecture d'integration.

## Architecture

### Shell parent (`ressources-orthophonie-app`)

Le site parent est un shell SPA avec 3 pages HTML :
- `index.html` — App principale (catalogue d'outils, navigation, iframe pour les outils)
- `login.html` — Page de connexion (Supabase Auth)
- `signup.html` — Page d'inscription (Supabase Auth)

Le shell gere :
- La navigation entre pages (accueil, catalogue, outils)
- Le routing URL (`/accueil`, `/mes-outils`, `/mes-outils/{slug}`)
- L'affichage des outils en iframe
- Toute la gestion `history` (back/forward button)

### Communication postMessage

| Message | Direction | Description |
|---------|-----------|-------------|
| `selection_update` | App -> Parent | Notifie le parent du nombre de mots selectionnes |
| `focus_mode_change` | App -> Parent | Un overlay (diaporama, imagier) est ouvert/ferme |
| `close_overlay` | Parent -> App | Demande a l'app de fermer l'overlay courant |
| `close_tool` | App -> Parent | L'app demande a revenir au catalogue (legacy) |
| `launch_diaporama` | Parent -> App | Commande pour lancer le diaporama |
| `clear_selection_command` | Parent -> App | Vider la selection |
| `export_selection_command` | Parent -> App | Exporter la selection |
| `supabase_session` | Parent -> App | Relay de session auth cross-origin |
| `resize` | App -> Parent | Signal de recalcul de la hauteur iframe |
| `scroll_to_offset` | App -> Parent | Demande de scroll vers le haut de la page |

### Navigation back button

**Principe** : Toute la gestion `history` est centralisee dans le shell parent. L'iframe ne fait **aucun** appel a `pushState`, `replaceState`, ou `popstate`.

**Flux** :
1. Quand un overlay s'ouvre (diaporama, imagier) : l'app envoie `focus_mode_change { isOpen: true }`
2. Le parent fait `history.pushState({ tool, overlay: true })` pour creer une entree "overlay"
3. Si l'utilisateur appuie sur Back : le parent intercepte `popstate`, detecte l'etat overlay, envoie `close_overlay` a l'iframe
4. L'app ferme l'overlay et envoie `focus_mode_change { isOpen: false }`
5. Si l'overlay est ferme par X ou Escape (pas par Back) : le parent fait `history.back()` pour retirer l'entree overlay

**Variables de state du parent** :
- `currentToolId` — ID de l'outil actuellement affiche
- `toolOverlayOpen` — Un overlay est-il ouvert dans l'iframe ?
- `closingOverlayViaBack` — Flag pour distinguer fermeture par Back vs fermeture par X/Escape

## 1. Iframe Resizing (Auto-Height)

L'application envoie sa hauteur via `postMessage` (type `resize`). Le script parent recalcule la hauteur de l'iframe pour remplir le viewport disponible.

## 2. Mode plein ecran (Diaporama)

Quand l'app envoie `focus_mode_change { isOpen: true }`, le parent :
- Ajoute la classe `focused-iframe` a l'iframe (position fixed, z-index 10M, plein ecran)
- Ajoute `body-lock` au body (overflow hidden)

Quand l'overlay se ferme, ces classes sont retirees.

## 3. Script d'integration Webflow

### Ou ajouter ?
**Page Settings** > **Custom Code** > **Footer Code (Before </body> tag)**.

### Script "Zen & Robust"

```html
<style>
    /* 1. Fullscreen Promotion (Mode Diaporama) */
    .focused-iframe {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 10000000 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        background: #fafafa !important;
    }
    .body-lock {
        overflow: hidden !important;
    }
    /* 2. Style de base pour l'iframe dans Webflow */
    iframe {
        width: 100% !important;
        display: block !important;
        border: none !important;
    }

    /* 3. VERROUILLAGE ULTIME DU SCROLL DE PAGE */
    html, body {
        overflow: hidden !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
    }
</style>

<script>
/**
 * SCRIPT D'INTEGRATION "ROBUSTE"
 * Objectif : Calcule la place restante et s'assure que l'iframe est TOUJOURS visible.
 */
(function () {
    const iframe = document.querySelector('iframe');
    if (!iframe) {
        console.error("Antigravity: Iframe introuvable !");
        return;
    }

    // Fonction de calcul PRECIS
    function fitIframeToViewport() {
        if (iframe.classList.contains('focused-iframe')) return;

        try {
            const rect = iframe.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const absoluteTop = rect.top + scrollTop;
            const availableHeight = window.innerHeight - absoluteTop;
            const finalHeight = Math.max(availableHeight - 10, 200);

            iframe.style.setProperty('height', finalHeight + 'px', 'important');

        } catch (e) {
            console.error("Antigravity Erreur:", e);
            iframe.style.height = '500px';
        }
    }

    // Polling rapide au chargement
    const checkTimes = [50, 200, 500, 1000, 2000, 5000];
    checkTimes.forEach(t => setTimeout(fitIframeToViewport, t));

    window.addEventListener('message', function(event) {
        if (!event.data) return;

        if (event.data.type === 'resize') {
            fitIframeToViewport();
        }

        if (event.data.type === 'scroll_to_offset') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (event.data.type === 'focus_mode_change') {
            if (event.data.isOpen) {
                iframe.classList.add('focused-iframe');
                document.body.classList.add('body-lock');
            } else {
                iframe.classList.remove('focused-iframe');
                document.body.classList.remove('body-lock');
                setTimeout(fitIframeToViewport, 50);
            }
        }
    });

    window.addEventListener('resize', fitIframeToViewport);

    // Premier appel
    fitIframeToViewport();
})();
</script>
```

> **Reglages Webflow Designer :**
> - Le composant **Code Embed** doit avoir une hauteur reglee sur `Auto`.
> - Le parent du Code Embed (Section ou Div) ne doit pas avoir de `Max Height` ou `Height` fixe.
> - Le script s'occupe de tout le reste.

## 4. Authentification

### Flux auth cross-origin

Le shell parent (sur le meme domaine que Supabase) gere l'auth :
1. L'utilisateur se connecte sur `login.html` (Supabase Auth)
2. Le shell envoie la session via `postMessage` type `supabase_session` a l'iframe
3. L'iframe utilise cette session pour les appels Supabase (listes, settings)

### Auth gate

Le fichier `index.html` du shell contient un auth gate qui redirige vers `login.html` si aucune session n'est active.
