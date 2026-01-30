import { useEffect } from 'react';

// Enhanced V8/V9 Adaptive Resize Logic
export function useIframeResize(isFocusMode: boolean = false) {
    useEffect(() => {
        let timeoutId: any;

        const sendHeight = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                let height;

                if (isFocusMode) {
                    // IF FOCUS MODE: Match viewport height exactly (100vh)
                    // This prevents the iframe from being taller than the screen, ensuring the slideshow fits perfectly.
                    // We use innerHeight because '100dvh' inside iframe = innerHeight.
                    height = window.innerHeight;
                } else {
                    // NORMAL MODE: Match content height
                    height = document.body.scrollHeight;
                }

                // Send to parent
                window.parent.postMessage({ type: 'resize', height }, '*');
            }, 50);
        };

        const observer = new ResizeObserver(sendHeight);
        observer.observe(document.body);

        // Send initially
        sendHeight();

        // Also listen to window resize (crucial for Focus Mode dynamic height)
        window.addEventListener('resize', sendHeight);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', sendHeight);
            clearTimeout(timeoutId);
        };
    }, [isFocusMode]); // Re-run when mode changes
}
