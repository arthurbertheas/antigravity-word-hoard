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

### 📜 Script to Copy:
```html
<script>
window.addEventListener('message', function(event) {
    // 1. Handle Scroll to Top
    if (event.data.type === 'scroll_to_offset') {
        // Defines where to scroll to. 
        // Priority: 
        // 1. Element with class .section-header (Your "Banque de mots" title section)
        // 2. Element with class .w-layout-grid (Common Webflow layout)
        // 3. <h1> tag
        // 4. Top of body
        const target = document.querySelector('.section-header') || 
                       document.querySelector('.w-layout-grid') || 
                       document.querySelector('h1') || 
                       document.body;
        
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // 2. Handle Auto-Resize (Optional, for better seamless fit)
    if (event.data.type === 'resize' && event.data.height) {
        const iframe = document.querySelector('iframe'); // Ensure this selects YOUR iframe
        if (iframe) {
            iframe.style.height = event.data.height + 'px';
        }
    }
});
</script>
```
