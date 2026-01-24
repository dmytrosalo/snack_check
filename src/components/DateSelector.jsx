import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function DateSelector({ selectedDate, onSelectDate }) {
    const { i18n } = useTranslation();
    const scrollRef = useRef(null);

    // Generate 14 days centered on today/selected
    // But usually users want to see "Today" and past days easily, maybe future too.
    // Let's generate a sliding window around the selected date, or just a fixed range.
    // Better: Fixed range of [-7, +7] days from *now*, or infinite scroll?
    // Simplest for now: 7 days before and 7 days after selected date.

    const dates = [];
    const baseDate = new Date(); // Anchor around today so "today" is always findable?
    // If we anchor around selectedDate, then as you click, the list shifts, which is annoying.
    // Let's anchor around TODAY, but ensure selectedDate is included.

    // Actually, if I select a date far in the past, I want to see context around IT.
    // Let's generate dates around the `selectedDate`.
    // Wait, if I click one, it re-renders with new selectedDate, shifting the list? That's bad UX.
    // The list should be stable.
    // Let's generate [-30, +7] days from TODAY.

    // Implementation:
    // Show 14 days centered on selectedDate? No, jumpy.
    // Show large range [-14, +14] from TODAY?
    // Let's go with [-14, +7] from today.

    // Refined approach:
    // If selectedDate is far from today, we might need to shift the window.
    // But for this MVP, let's just show a good range around Today.

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOffset = -14;
    const endOffset = 7;

    for (let i = startOffset; i <= endOffset; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d);
    }

    // Scroll to selected date on mount
    useEffect(() => {
        if (scrollRef.current) {
            // Find the selected element?
            // Simple manual scroll to center "today" or selected
            // For now, let's just not overengineer the scrolling.
        }
    }, []);

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const isSelected = (date) => formatDate(date) === selectedDate;
    const isToday = (date) => formatDate(date) === formatDate(today);

    return (
        <div className="w-full overflow-x-auto no-scrollbar py-2 px-4" ref={scrollRef}>
            <div className="flex gap-3 min-w-max">
                {dates.map(date => {
                    const dateStr = formatDate(date);
                    const selected = isSelected(date);
                    const dayName = date.toLocaleDateString(i18n.language, { weekday: 'short' });
                    const dayNum = date.getDate();

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onSelectDate(dateStr)}
                            className={`
                  flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all duration-300
                  ${selected
                                    ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/10'
                                    : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 shadow-sm'}
                `}
                        >
                            <div className="text-xs font-medium uppercase tracking-wider mb-1 opacity-80">
                                {dayName}
                            </div>
                            <div className={`text-xl font-bold ${selected ? 'text-emerald-600' : 'text-slate-800'}`}>
                                {dayNum}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
