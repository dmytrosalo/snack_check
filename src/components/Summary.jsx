import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../stores/appStore';
import { Flame } from 'lucide-react';

function CircularProgress({ value, max, color, size = 80, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-700/50"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold text-sm">
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}

function MacroBar({ label, value, max, color, unit = 'g' }) {
  const progress = Math.min((value / max) * 100, 100);
  const isOver = value > max;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className={isOver ? 'text-red-400' : 'text-white'}>
          {Math.round(value)}/{max}{unit}
        </span>
      </div>
      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: isOver ? '#ef4444' : color
          }}
        />
      </div>
    </div>
  );
}

export default function Summary({ entries }) {
  const { t } = useTranslation();
  const { dailyGoals } = useAppStore();

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, entry) => ({
        calories: acc.calories + (entry.calories || 0),
        protein: acc.protein + (entry.protein || 0),
        carbs: acc.carbs + (entry.carbs || 0),
        fat: acc.fat + (entry.fat || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [entries]);

  const remaining = dailyGoals.calories - totals.calories;

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Calories Card */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-5 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="text-orange-500 fill-orange-500/20" size={20} />
          <h2 className="font-bold text-white text-lg">{t('summary.title')}</h2>
        </div>

        <div className="flex justify-between items-end mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">{Math.round(totals.calories)}</div>
            <div className="text-slate-400 text-xs font-medium">Food</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-500 mb-1">0</div>
            <div className="text-slate-500 text-xs font-medium">Exercise</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold mb-1 ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {Math.round(remaining)}
            </div>
            <div className="text-slate-400 text-xs font-medium">Remaining</div>
          </div>
        </div>
      </div>

      {/* Macros Card */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-5 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-full border-2 border-pink-500 border-t-emerald-400 border-r-blue-400 -rotate-45" />
          <h2 className="font-bold text-white text-lg">Macros</h2>
        </div>

        <div className="space-y-4">
          {/* Carbs */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <div className="font-medium text-slate-300">
                <span className="text-white font-bold">{Math.round(totals.carbs)}</span>
                <span className="text-slate-500">/{dailyGoals.carbs}</span>
              </div>
              <div className="text-slate-400">{t('detail.carbs')} (g)</div>
            </div>
            <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-200 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totals.carbs / dailyGoals.carbs) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <div className="font-medium text-slate-300">
                <span className="text-white font-bold">{Math.round(totals.protein)}</span>
                <span className="text-slate-500">/{dailyGoals.protein}</span>
              </div>
              <div className="text-slate-400">{t('detail.protein')} (g)</div>
            </div>
            <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totals.protein / dailyGoals.protein) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <div className="font-medium text-slate-300">
                <span className="text-white font-bold">{Math.round(totals.fat)}</span>
                <span className="text-slate-500">/{dailyGoals.fat}</span>
              </div>
              <div className="text-slate-400">{t('detail.fat')} (g)</div>
            </div>
            <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totals.fat / dailyGoals.fat) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
