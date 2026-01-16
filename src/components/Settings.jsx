import { useState, useEffect } from 'react';
import { X, Key, Target, ExternalLink } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { initGemini } from '../lib/gemini';

export default function Settings({ onClose }) {
  const { apiKey, setApiKey, dailyGoals, setDailyGoals } = useAppStore();
  
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localGoals, setLocalGoals] = useState(dailyGoals);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    setApiKey(localApiKey);
    setDailyGoals(localGoals);
    
    if (localApiKey) {
      initGemini(localApiKey);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="bg-slate-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 sticky top-0 bg-slate-800">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* API Key Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Key size={18} className="text-emerald-400" />
              <h3 className="font-medium text-white">Gemini API Key</h3>
            </div>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 pr-20"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 text-sm mt-2 hover:underline"
            >
              Get your free API key
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Daily Goals Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-emerald-400" />
              <h3 className="font-medium text-white">Daily Goals</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  value={localGoals.calories}
                  onChange={(e) => setLocalGoals({ ...localGoals, calories: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={localGoals.protein}
                  onChange={(e) => setLocalGoals({ ...localGoals, protein: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={localGoals.carbs}
                  onChange={(e) => setLocalGoals({ ...localGoals, carbs: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">
                  Fat (g)
                </label>
                <input
                  type="number"
                  value={localGoals.fat}
                  onChange={(e) => setLocalGoals({ ...localGoals, fat: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>

          {/* Preset Goals */}
          <div>
            <h4 className="text-slate-400 text-sm mb-2">Quick Presets</h4>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setLocalGoals({ calories: 1500, protein: 120, carbs: 150, fat: 50 })}
                className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-sm rounded-lg transition-colors"
              >
                Weight Loss
              </button>
              <button
                onClick={() => setLocalGoals({ calories: 2000, protein: 150, carbs: 200, fat: 65 })}
                className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-sm rounded-lg transition-colors"
              >
                Maintenance
              </button>
              <button
                onClick={() => setLocalGoals({ calories: 2500, protein: 180, carbs: 280, fat: 80 })}
                className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-sm rounded-lg transition-colors"
              >
                Muscle Gain
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 sticky bottom-0 bg-slate-800 safe-bottom">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
