import { X, Trash2, Clock, Flame, Info } from 'lucide-react';
import { deleteFoodEntry } from '../lib/db';
import { useAppStore } from '../stores/appStore';
import { useTranslation } from 'react-i18next'; // Import i18n

export default function FoodDetail({ entry, onClose }) {
    const { setError } = useAppStore();
    const { t } = useTranslation(); // Init hook

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
        // Check if date is valid
        if (isNaN(d.getTime())) return '';

        return d.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={onClose}
            />

            {/* Modal/Sheet */}
            <div className="w-full sm:w-[400px] bg-slate-900 border-t sm:border border-slate-700/50 rounded-t-3xl sm:rounded-3xl p-6 pointer-events-auto animate-slide-up shadow-2xl relative max-h-[90vh] overflow-y-auto">

                {/* Drag handle for mobile feel */}
                <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6" />

                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 mr-4">
                        <h2 className="text-2xl font-bold text-white leading-tight">{entry.name}</h2>
                        <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                            <Clock size={14} />
                            <span>{formatTime(entry.timestamp || entry.date) || 'Recent'}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Large Image */}
                {entry.imageUrl && (
                    <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-slate-700/50">
                        <img
                            src={entry.imageUrl}
                            alt={entry.name}
                            className="w-full h-64 object-cover"
                        />
                    </div>
                )}

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {entry.tags.map(tag => (
                            <span
                                key={tag}
                                className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/20"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Macros Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <Flame size={16} className="text-orange-500" />
                            <span>{t('detail.calories')}</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {entry.calories} <span className="text-sm font-normal text-slate-500">kcal</span>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-blue-400 font-medium">{t('detail.protein')}</span>
                            <span className="text-white font-bold">{entry.protein}g</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-amber-400 font-medium">{t('detail.carbs')}</span>
                            <span className="text-white font-bold">{entry.carbs}g</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-pink-400 font-medium">{t('detail.fat')}</span>
                            <span className="text-white font-bold">{entry.fat}g</span>
                        </div>
                    </div>
                </div>

                {/* Health Tip / Info */}
                <div className="space-y-4 mb-8">
                    {entry.healthTip && (
                        <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                            <h4 className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">{t('detail.insightTitle')}</h4>
                            <p className="text-slate-200 text-sm">{entry.healthTip}</p>
                        </div>
                    )}

                    <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/30">
                        <div className="flex items-start gap-3">
                            <Info size={18} className="text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">{t('detail.portion')}</span>
                                    {entry.portion || 'No portion information available.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                    >
                        {t('detail.ok')}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-4 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 active:scale-[0.98] transition-all"
                        aria-label="Delete Entry"
                    >
                        <Trash2 size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
