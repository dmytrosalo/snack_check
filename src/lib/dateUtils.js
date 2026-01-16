/**
 * Format a date string (YYYY-MM-DD) to a human readable format
 * e.g. "Today", "Yesterday", "Mon, Jan 01"
 */
export const formatDate = (dateString, locale = 'uk-UA') => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset times for accurate comparison
    const d = new Date(dateString).setHours(0, 0, 0, 0);
    const t = new Date().setHours(0, 0, 0, 0);
    const y = new Date(yesterday).setHours(0, 0, 0, 0);

    // TODO: Ideally translate "Today"/"Yesterday" too, checking if locale is uk
    const isUa = locale.startsWith('uk') || locale === 'ua';

    if (d === t) return isUa ? 'Сьогодні' : 'Today';
    if (d === y) return isUa ? 'Вчора' : 'Yesterday';

    return date.toLocaleDateString(isUa ? 'uk-UA' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Get date string (YYYY-MM-DD) for next/prev day
 */
export const getRelativeDate = (dateString, days) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};
