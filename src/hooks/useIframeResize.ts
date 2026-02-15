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
                    // V20: Don't send height in focus mode.
                    // Webflow promotes the iframe to fixed fullscreen (100vw/100vh).
                    return;
                } else {
                    // NORMAL MODE: Use window height to prevent scroll
                    // Using scrollHeight can cause overflow - use innerHeight instead
                    height = window.innerHeight;
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
