import { X, Sparkles, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MemeReward({ meme, onClose }) {
    const { t } = useTranslation();

    if (!meme) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl animate-scale-up overflow-hidden">
                {/* Confetti-like decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-x" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full mb-3 animate-bounce-slow">
                        <span className="text-3xl">🎉</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{t('meme.title')}</h2>
                    <p className="text-slate-400 text-sm">{t('meme.subtitle')}</p>
                </div>

                {/* Meme Image */}
                <div className="relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 mb-6 group">
                    <img
                        src={meme.url}
                        alt={meme.title}
                        className="w-full h-auto max-h-[60vh] object-contain mx-auto"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-white text-sm font-medium line-clamp-2">{meme.title}</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                >
                    {t('meme.awesome')}
                </button>
            </div>
        </div>
    );
}
