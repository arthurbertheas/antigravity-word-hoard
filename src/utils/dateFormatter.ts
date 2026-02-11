/**
 * Formats an ISO date string into a human-readable "smart" format:
 * - Today: "Aujourd'hui à 14h35"
 * - Yesterday: "Hier à 10h12"
 * - Older: "DD/MM/YYYY à HHhMM"
 */
export function formatDateTimeSmart(isoString: string | null | undefined): string {
    if (!isoString) return '';

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString; // Return original if invalid

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const time = `${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}`;

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
        return `Aujourd'hui à ${time}`;
    }
    if (isYesterday) {
        return `Hier à ${time}`;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year} à ${time}`;
}
// ... existing code ...
export function formatDateCompact(isoString: string | null | undefined): string {
    if (!isoString) return '';

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const time = `${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}`;

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return `Auj. ${time}`;
    if (isYesterday) return `Hier ${time}`;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${day}/${month}`;
}
