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
</style>

<script>
(function () {
    const iframe = document.querySelector('iframe'); // Vérifie que c'est bien TON iframe
    if (!iframe) return;

    // Fonction pour ajuster la hauteur de l'iframe à la fenêtre restante
    function fitIframeToViewport() {
        if (iframe.classList.contains('focused-iframe')) return;
        
    // Fonction pour ajuster la hauteur de l'iframe à la fenêtre restante
    function fitIframeToViewport() {
        if (iframe.classList.contains('focused-iframe')) return;
        
        // METHODE 1 : Calcul précis JS
        try {
            const topOffset = iframe.getBoundingClientRect().top;
            const availableHeight = window.innerHeight - topOffset;
            // On enlève 20px de marge de sécurité
            iframe.style.height = Math.max(availableHeight - 20, 500) + 'px';
        } catch (e) {
            // METHODE 2 : Fallback CSS AGRESSIF (On déduit ~300px pour les 2 headers)
            iframe.style.height = 'calc(100vh - 300px)';
        }
    }

    const interval = setInterval(fitIframeToViewport, 1000); // Check régulier au cas où le layout bouge
    setTimeout(() => clearInterval(interval), 10000); // Stop après 10s

    window.addEventListener('message', function(event) {
        if (!event.data) return;

        // 1. Resize Dynamique
        if (event.data.type === 'resize') {
            fitIframeToViewport();
        }

        // 2. Navigation / Scroll
        if (event.data.type === 'scroll_to_offset') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // 3. Mode Diaporama (Fullscreen)
        if (event.data.type === 'focus_mode_change') {
            if (event.data.isOpen) {
                iframe.classList.add('focused-iframe');
                document.body.classList.add('body-lock');
            } else {
                iframe.classList.remove('focused-iframe');
                document.body.classList.remove('body-lock');
                setTimeout(fitIframeToViewport, 10);
            }
        }
    });

    // Ajustement initial et lors du redimensionnement de la fenêtre
    fitIframeToViewport();
    window.addEventListener('resize', fitIframeToViewport);
})();
</script>
```
