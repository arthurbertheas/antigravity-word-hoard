import { useEffect } from "react";
import { useSelection } from "@/contexts/SelectionContext";

/**
 * Headless component that manages communication with the parent Webflow frame.
 * It does NOT render any UI, relying on the Webflow snippet to display the Floating Bar.
 */
export function SelectionBar() {
    const { selectedWords, clearSelection } = useSelection();

    // 1. Send State to Parent (Webflow)
    useEffect(() => {
        const message = {
            type: 'SELECTION_UPDATE',
            payload: {
                count: selectedWords.length,
                words: selectedWords, // Optional: send data if needed
            }
        };

        // Post to parent window (where the Webflow script lives)
        window.parent.postMessage(message, '*');
    }, [selectedWords]);

    // 2. Listen for Actions from Parent (Webflow)
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Security: In production, check event.origin if possible
            if (!event.data || !event.data.type) return;

            switch (event.data.type) {
                case 'CLEAR_SELECTION':
                    clearSelection();
                    break;
                case 'EXPORT_SELECTION':
                    alert(`Export requested for ${selectedWords.length} items (React logic)`);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [clearSelection, selectedWords]);

    // Render nothing visually in the iframe
    return null;
}
