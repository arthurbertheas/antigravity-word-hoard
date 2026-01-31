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
    /* 2. Invisible au chargement pour éviter le saut */
    iframe {
        transition: opacity 0.5s ease-in-out;
    }
</style>

<script>
(function () {
    const iframe = document.querySelector('iframe');
    if (!iframe) return;

    // A. On cache l'iframe le temps du calcul
    iframe.style.opacity = '0';

    // B. Fonction de calcul PRECIS (Pixel Perfect)
    function fitIframeToViewport() {
        if (iframe.classList.contains('focused-iframe')) return;

        try {
            // 1. On récupère la position du haut de l'iframe par rapport au viewport
            const rect = iframe.getBoundingClientRect();
            const topOffset = rect.top;
            
            // 2. On calcule la place restante exacte
            // window.innerHeight = La hauteur visible du navigateur
            const availableHeight = window.innerHeight - topOffset;

            // 3. On applique la hauteur (min 500px pour sécurité)
            // On retire 5px de buffer pour éviter tout scroll externe accidentel
            const finalHeight = Math.max(availableHeight - 5, 500);
            
            iframe.style.height = finalHeight + 'px';
            
            // C. On affiche l'iframe une fois la taille calée
            if (iframe.style.opacity === '0') {
               requestAnimationFrame(() => {
                   iframe.style.opacity = '1';
               });
            }

        } catch (e) {
            console.error("Erreur calcul hauteur", e);
            iframe.style.height = 'calc(100vh - 300px)'; // Fallback
            iframe.style.opacity = '1';
        }
    }

    // D. Auto-Correction (Polling rapide au chargement pour gérer les images Webflow)
    const checkTimes = [50, 100, 300, 500, 1000, 2000];
    checkTimes.forEach(t => setTimeout(fitIframeToViewport, t));

    // E. Gestion des Messages
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
                // Petit délai pour recalculer après fermeture
                setTimeout(fitIframeToViewport, 50);
            }
        }
    });

    // F. Resize Standard
    window.addEventListener('resize', fitIframeToViewport);
    
    // Premier appel
    fitIframeToViewport();
})();
</script>
```
