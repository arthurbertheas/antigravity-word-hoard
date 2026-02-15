import { useEffect } from 'react';

// Enhanced V8/V9 Adaptive Resize Logic
export function useIframeResize(isFocusMode: boolean = false) {
    // Prevent scroll chaining: when the iframe has overflow:hidden,
    // wheel events "leak" to the parent Webflow page causing it to scroll.
    // We capture wheel events and only allow them inside scrollable containers.
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            let el = e.target as HTMLElement | null;
            while (el && el !== document.body) {
                const style = getComputedStyle(el);
                const isScrollable = style.overflowY === 'auto' || style.overflowY === 'scroll';
                const hasScroll = el.scrollHeight > el.clientHeight;
                if (isScrollable && hasScroll) {
                    const atTop = el.scrollTop <= 0;
                    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
                    if (e.deltaY < 0 && !atTop) return;
                    if (e.deltaY > 0 && !atBottom) return;
                }
                el = el.parentElement;
            }
            e.preventDefault();
        };

        document.addEventListener('wheel', handleWheel, { passive: false });
        return () => document.removeEventListener('wheel', handleWheel);
    }, []);

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
