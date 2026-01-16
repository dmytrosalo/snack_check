import { useMemo } from 'react';
import { useAppStore } from '../stores/appStore';

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
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-5 border border-slate-700/50">
      {/* Main Calories Display */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-slate-400 text-sm mb-1">Today's Calories</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">
              {Math.round(totals.calories)}
            </span>
            <span className="text-slate-500">/ {dailyGoals.calories}</span>
          </div>
          <p className={`text-sm mt-1 ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {remaining >= 0 
              ? `${Math.round(remaining)} remaining`
              : `${Math.abs(Math.round(remaining))} over`
            }
          </p>
        </div>
        <CircularProgress
          value={totals.calories}
          max={dailyGoals.calories}
          color={totals.calories > dailyGoals.calories ? '#ef4444' : '#10b981'}
          size={90}
          strokeWidth={10}
        />
      </div>

      {/* Macros */}
      <div className="space-y-3">
        <MacroBar
          label="Protein"
          value={totals.protein}
          max={dailyGoals.protein}
          color="#3b82f6"
        />
        <MacroBar
          label="Carbs"
          value={totals.carbs}
          max={dailyGoals.carbs}
          color="#f59e0b"
        />
        <MacroBar
          label="Fat"
          value={totals.fat}
          max={dailyGoals.fat}
          color="#ec4899"
        />
      </div>
    </div>
  );
}
