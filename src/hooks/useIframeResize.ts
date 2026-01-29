import { useEffect } from 'react';

export function useIframeResize() {
    useEffect(() => {
        const sendHeight = () => {
            const height = document.body.scrollHeight;
            window.parent.postMessage({ type: 'resize', height }, '*');
        };

        const observer = new ResizeObserver(sendHeight);
        observer.observe(document.body);

        // Initial send
        sendHeight();

        // Also send on window resize
        window.addEventListener('resize', sendHeight);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', sendHeight);
        };
    }, []);
}
