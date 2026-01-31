# Webflow Integration Guide

This React application is designed to be embedded in an iframe on Webflow. To ensure the best user experience (especially regarding scrolling and resizing), you need to add a small Snippet to your Webflow project.

## 1. Iframe Resizing (Auto-Height)
The application sends its height via `postMessage`.
To remove double scrollbars, ensure your iframe in Webflow has a script that listens to `resize` messages and adjusts the `height` style of the iframe element.

## 2. Smooth Scroll to Top (Navigation)
When a user navigates between pages or opens a word detail, the app sends a `scroll_to_offset` signal.
To make the page scroll back up to the "Tous les outils" or section header specific to your design, add this script:

### 📍 Where to add?
Go to **Page Settings** > **Custom Code** > **Footer Code (Before </body> tag)**.

### 📜 Script "Zen & Robust" (Split View Compatible)
Ce script gère à la fois l'ajustement automatique de la hauteur (pour voir les boutons du bas) et le mode plein écran pour le Diaporama. Il remplace avantageusement ton ancien code.

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
        /* Opacity supprimée pour éviter le bug d'écran blanc */
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
            // 1. On récupère la position ABSOLUE du haut de l'iframe (par rapport au début du document)
            const rect = iframe.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const absoluteTop = rect.top + scrollTop;
            
            // 2. On calcule la hauteur disponible dans le viewport INITIAL (sans compter le scroll actuel)
            // On veut que le bas de l'iframe touche le bas de la fenêtre QUAND on est tout en haut
            const availableHeight = window.innerHeight - absoluteTop;

            console.log("Antigravity Resize:", { absoluteTop, availableHeight });

            // 3. On applique la hauteur
            // On retire 10px de marge de sécurité pour les arrondis de pixels
            const finalHeight = Math.max(availableHeight - 10, 200);
            
            iframe.style.setProperty('height', finalHeight + 'px', 'important');
            
        } catch (e) {
            console.error("Antigravity Erreur:", e);
            iframe.style.height = '500px'; // Sécurité absolue
        }
    }

    // Polling rapide au chargement pour s'adapter aux changements de layout (chargement images, etc.)
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

> [!TIP]
> **Réglages Webflow Designer :**
> - Assure-toi que le composant **Code Embed** a une hauteur réglée sur `Auto` (comme sur ton image).
> - Vérifie que le parent du Code Embed (Section ou Div) n'a pas de `Max Height` ou `Height` fixe qui briderait l'expansion.
> - Le script s'occupe de tout le reste.

