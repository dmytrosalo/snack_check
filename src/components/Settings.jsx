import { useState } from 'react';
import { X, Save, Key, Globe, Target } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { useTranslation } from 'react-i18next';
import { initGemini } from '../lib/gemini';

export default function Settings({ onClose }) {
  const { apiKey, setApiKey, language, setLanguage, dailyGoals, setDailyGoals } = useAppStore();
  const [keyInput, setKeyInput] = useState(apiKey);
  const [caloriesInput, setCaloriesInput] = useState(dailyGoals.calories);
  const { t, i18n } = useTranslation();

  const handleSave = () => {
    setApiKey(keyInput);
    if (caloriesInput && !isNaN(caloriesInput)) {
      setDailyGoals({ calories: parseInt(caloriesInput) });
    }
    if (keyInput) {
      initGemini(keyInput);
    }
    onClose();
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{t('settings.title')}</h2>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
            <Globe size={16} />
            {t('settings.language')}
          </label>
          <div className="flex gap-2 bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => handleLanguageChange('ua')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${language === 'ua'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              🇺🇦 Українська
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${language === 'en'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Daily Goal Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-emerald-400" />
              <label className="text-sm font-medium text-slate-400">{t('settings.dailyGoal')}</label>
            </div>
            <input
              type="number"
              value={caloriesInput}
              onChange={(e) => setCaloriesInput(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* API Key Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key size={16} className="text-emerald-400" />
              <label className="text-sm font-medium text-slate-400">{t('settings.apiKey')}</label>
            </div>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste your Gemini API key"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-2">
              Your key is stored locally on your device.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
          >
            <Save size={18} />
            {t('settings.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
