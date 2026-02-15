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
                    // NORMAL MODE: Match content height
                    height = document.body.scrollHeight;

                    // DIAGNOSTIC: Log height information
                    console.group('[SCROLL DEBUG] Height Calculation');
                    console.log('body.scrollHeight:', document.body.scrollHeight);
                    console.log('body.offsetHeight:', document.body.offsetHeight);
                    console.log('body.clientHeight:', document.body.clientHeight);
                    console.log('documentElement.scrollHeight:', document.documentElement.scrollHeight);
                    console.log('documentElement.offsetHeight:', document.documentElement.offsetHeight);
                    console.log('window.innerHeight:', window.innerHeight);
                    console.log('Height sent to parent:', height);

                    // Check for overflow elements
                    const overflowElements = Array.from(document.querySelectorAll('*')).filter(el => {
                        const rect = el.getBoundingClientRect();
                        return rect.bottom > window.innerHeight || rect.right > window.innerWidth;
                    });
                    if (overflowElements.length > 0) {
                        console.log('Elements causing overflow:', overflowElements.map(el => ({
                            tag: el.tagName,
                            class: el.className,
                            bottom: el.getBoundingClientRect().bottom,
                            windowHeight: window.innerHeight
                        })));
                    }
                    console.groupEnd();
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
