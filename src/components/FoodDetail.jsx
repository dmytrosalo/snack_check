import { X, Trash2, Clock, Flame, Info } from 'lucide-react';
import { deleteFoodEntry } from '../lib/db';
import { useAppStore } from '../stores/appStore';
import { useTranslation } from 'react-i18next'; // Import i18n

export default function FoodDetail({ entry, onClose }) {
    const { setError, dailyGoals } = useAppStore();
    const { t } = useTranslation();

    const handleDelete = async () => {
        if (window.confirm(t('detail.confirmDelete'))) {
            try {
                await deleteFoodEntry(entry.id);
                onClose();
            } catch (err) {
                setError(t('errors.failedToDelete'));
            }
        }
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Calculate percentages
    const getPercent = (val, goal) => Math.round((val / goal) * 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Card */}
            <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 relative z-10 animate-slide-up shadow-2xl">

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                            {/* Icon placeholder - could be 'Journable' logo or generic food icon */}
                            <div className="w-6 h-6 flex items-center justify-center font-bold text-lg">🍔</div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{entry.name}</h2>
                        </div>
                    </div>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6 text-center border-b border-slate-100 pb-6">
                    <div>
                        <div className="font-bold text-xl text-slate-900">{entry.calories}</div>
                        <div className="text-xs text-slate-500 font-medium">Calories</div>
                    </div>
                    <div>
                        <div className="font-bold text-xl text-slate-900">{entry.carbs}g</div>
                        <div className="text-xs text-slate-500 font-medium">Carbs</div>
                    </div>
                    <div>
                        <div className="font-bold text-xl text-slate-900">{entry.protein}g</div>
                        <div className="text-xs text-slate-500 font-medium">Protein</div>
                    </div>
                    <div>
                        <div className="font-bold text-xl text-slate-900">{entry.fat}g</div>
                        <div className="text-xs text-slate-500 font-medium">Fat</div>
                    </div>
                </div>

                {/* Percentages */}
                <div className="mb-6 border-b border-slate-100 pb-6">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Percentage of Daily Goals</h3>
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="font-bold text-lg text-slate-900">{getPercent(entry.calories, dailyGoals.calories)}%</div>
                            <div className="text-xs text-slate-500">Calories</div>
                        </div>
                        <div>
                            <div className="font-bold text-lg text-slate-900">{getPercent(entry.carbs, dailyGoals.carbs)}%</div>
                            <div className="text-xs text-slate-500">Carbs</div>
                        </div>
                        <div>
                            <div className="font-bold text-lg text-slate-900">{getPercent(entry.protein, dailyGoals.protein)}%</div>
                            <div className="text-xs text-slate-500">Protein</div>
                        </div>
                        <div>
                            <div className="font-bold text-lg text-slate-900">{getPercent(entry.fat, dailyGoals.fat)}%</div>
                            <div className="text-xs text-slate-500">Fat</div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-6 space-y-4">
                    {/* Joke/Tip - Always Visible */}
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">🤖</span>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{t('detail.insightTitle')}</span>
                        </div>
                        <p className="text-slate-700 text-sm italic leading-relaxed">
                            "{entry.healthTip}"
                        </p>
                    </div>

                    {/* Description - Collapsible */}
                    <details className="group">
                        <summary className="list-none cursor-pointer flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Info size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wider">Product Info</span>
                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 group-open:hidden">Tap to read</span>
                        </summary>
                        <div className="mt-3 text-slate-600 text-sm leading-relaxed animate-slide-up pl-1 border-l-2 border-slate-100">
                            {entry.description || "No detailed description available."}
                        </div>
                    </details>
                </div>

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {entry.tags.map(tag => (
                            <span
                                key={tag}
                                className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Portion Info if available */}
                {entry.portion && (
                    <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase mr-2">Portion:</span>
                        <span className="text-sm text-slate-700">{entry.portion}</span>
                    </div>
                )}

                {/* Footer / Actions */}
                {/* Footer / Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                    >
                        {t('detail.ok')}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 active:scale-[0.98] transition-all"
                        aria-label="Delete Entry"
                    >
                        <Trash2 size={24} />
                    </button>
                </div>

                {/* Timestamp below */}
                <div className="flex items-center justify-center gap-1 text-slate-400 text-sm mt-4">
                    <Clock size={14} />
                    <span>{formatTime(entry.timestamp || entry.date)}</span>
                </div>

                {/* Close Button X absolute */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
