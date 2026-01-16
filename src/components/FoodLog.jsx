import { Trash2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { deleteFoodEntry } from '../lib/db';
import { useAppStore } from '../stores/appStore';

export default function FoodLog({ entries, onItemClick }) {
  const { t } = useTranslation();
  const { setError } = useAppStore();

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm(t('detail.confirmDelete'))) {
      try {
        await deleteFoodEntry(id);
      } catch (err) {
        setError(t('errors.failedToDelete'));
      }
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-slate-300 font-medium mb-2">{t('log.emptyTitle')}</h3>
        <p className="text-slate-500 text-sm">
          {t('log.emptySubtitle')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-slate-400 text-sm font-medium mb-3">
        {t('log.todayTitle')} ({entries.length})
      </h3>

      {entries.map((entry, index) => (
        <div
          key={entry.id}
          onClick={() => onItemClick && onItemClick(entry)}
          className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50 animate-slide-up cursor-pointer active:scale-[0.98] transition-all hover:bg-slate-800/70"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex gap-3">
            {/* Image thumbnail */}
            {entry.imageUrl && (
              <img
                src={entry.imageUrl}
                alt={entry.name}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-white font-medium truncate">{entry.name}</h4>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                    <Clock size={12} />
                    <span>{formatTime(entry.timestamp)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(entry.id, e)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Macros */}
              <div className="flex gap-4 mt-2 text-sm">
                <div>
                  <span className="text-white font-semibold">{entry.calories}</span>
                  <span className="text-slate-500 ml-1">kcal</span>
                </div>
                <div>
                  <span className="text-blue-400">{entry.protein}g</span>
                  <span className="text-slate-500 ml-1">P</span>
                </div>
                <div>
                  <span className="text-amber-400">{entry.carbs}g</span>
                  <span className="text-slate-500 ml-1">C</span>
                </div>
                <div>
                  <span className="text-pink-400">{entry.fat}g</span>
                  <span className="text-slate-500 ml-1">F</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
