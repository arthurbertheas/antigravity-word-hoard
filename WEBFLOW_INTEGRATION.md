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

### 📜 Script to Copy (Dashboard Mode):
```html
<script>
window.addEventListener('message', function(event) {
    const iframe = document.querySelector('iframe'); // Ensure this selects YOUR iframe
    if (!iframe) return;

    // 1. Handle Scroll to Top
    if (event.data.type === 'scroll_to_offset') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 2. Dashboard Mode Resize (Fills the available viewport)
    // We calculate the remaining height from the top of the iframe to the bottom of the screen.
    function fitIframeToViewport() {
        const topOffset = iframe.getBoundingClientRect().top;
        const availableHeight = window.innerHeight - topOffset;
        // Limit to a reasonable minimum height
        iframe.style.height = Math.max(availableHeight, 600) + 'px';
    }

    if (event.data.type === 'resize') {
        fitIframeToViewport();
    }
    
    // Also fit initially and on window resize
    fitIframeToViewport();
    window.addEventListener('resize', fitIframeToViewport);
});
</script>
```
