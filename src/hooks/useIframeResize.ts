import { useEffect } from 'react';

export function useIframeResize() {
    useEffect(() => {
        let timeoutId: any;

        const sendHeight = () => {
            // Debounce to prevent message flooding during animations
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const height = document.body.scrollHeight;
                window.parent.postMessage({ type: 'resize', height }, '*');
            }, 50); // 50ms delay
        };

        const observer = new ResizeObserver(sendHeight);
        observer.observe(document.body);

        // Initial send (immediate)
        const initialHeight = document.body.scrollHeight;
        window.parent.postMessage({ type: 'resize', height: initialHeight }, '*');

        // Also send on window resize
        window.addEventListener('resize', sendHeight);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', sendHeight);
            clearTimeout(timeoutId);
        };
    }, []);
}
