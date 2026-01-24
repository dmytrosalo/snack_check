import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Settings as SettingsIcon, X, Loader2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Trash2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAppStore } from './stores/appStore';
import { initGemini } from './lib/gemini';
import { db, addFoodEntry } from './lib/db';
import { formatDate } from './lib/dateUtils';
import Summary from './components/Summary';
import FoodInput from './components/FoodInput';
import FoodLog from './components/FoodLog';
import { analyzeFoodFromImage } from './lib/gemini';
import DateSelector from './components/DateSelector';

const Camera = lazy(() => import('./components/Camera'));
const Settings = lazy(() => import('./components/Settings'));
const FoodDetail = lazy(() => import('./components/FoodDetail'));
const MemeReward = lazy(() => import('./components/MemeReward'));

function App() {
  const { t, i18n } = useTranslation();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [currentMeme, setCurrentMeme] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const {
    apiKey,
    language,
    showSettings,
    setShowSettings,
    showCamera,
    setShowCamera,
    error,
    clearError,
    setError,
    selectedDate,
    setSelectedDate
  } = useAppStore();

  // Reactive DB query
  const entries = useLiveQuery(
    () => db.foodEntries
      .where('date')
      .equals(selectedDate)
      .sortBy('timestamp'),
    [selectedDate]
  ) || [];

  // Sync language from store to i18n
  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  useEffect(() => {
    // Initialize Gemini if API key exists or fallback to env var
    const defaultKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey || defaultKey) {
      initGemini(apiKey || defaultKey);
    }
  }, [apiKey]);

  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    const newDate = date.toISOString().split('T')[0];
    setSelectedDate(newDate);
  };

  // Swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Future (Right)
      const today = new Date().toISOString().split('T')[0];
      if (selectedDate !== today) {
        changeDate(1);
      }
    }

    if (isRightSwipe) {
      // Past (Left)
      changeDate(-1);
    }
  };

  const handlePostTracking = (entry) => {
    const { lifetimeLogs, incrementLifetimeLogs } = useAppStore.getState();
    const count = lifetimeLogs + 1;
    incrementLifetimeLogs();

    // Reward Logic: Only Memes now
    if (count % 5 === 0) {
      fetchMeme();
    } else {
      // Otherwise -> Show Food Detail
      setSelectedEntry(entry);
    }
  };

  const fetchMeme = async () => {
    try {
      const res = await fetch('https://meme-api.com/gimme/wholesomememes');
      const data = await res.json();
      if (data && data.url) {
        setCurrentMeme(data);
      }
    } catch (e) {
      console.error('Failed to fetch meme:', e);
      // Fallback or just silent fail
    }
  };

  // Handle camera capture
  const handleCameraCapture = async (imageDataUrl) => {
    // Check limit if using default key
    const defaultKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey && !defaultKey) {
      const { requestCount } = useAppStore.getState();
      if (requestCount >= 30) {
        setShowCamera(false);
        setError(t('errors.limitReached'));
        setShowSettings(true);
        return;
      }
    }

    setShowCamera(false);

    try {
      // Pass language to analysis
      const result = await analyzeFoodFromImage(imageDataUrl, language);
      const entry = {
        ...result,
        imageUrl: imageDataUrl,
        date: selectedDate
      };

      // Save directly from here (since Camera doesn't use FoodInput directly for add)
      await addFoodEntry(entry);

      // Increment count only if using default key
      if (!apiKey && !defaultKey) {
        useAppStore.getState().incrementRequestCount();
      }

      handlePostTracking(entry);
    } catch (err) {
      setError(err.message);
    }
  };

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <div
      className="min-h-[100dvh] bg-gradient-to-b from-slate-900 to-slate-800 text-white"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800/50 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-sm">
            {t('app.title')}
          </h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 bg-slate-800/50 rounded-full hover:bg-slate-700/50 transition-colors"
          >
            <SettingsIcon size={22} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* Error Toast */}
      {error && (
        <div className="fixed top-16 left-4 right-4 z-50 animate-slide-up">
          <div className="bg-red-500/90 backdrop-blur-lg text-white px-4 py-3 rounded-xl flex items-center justify-between">
            <p className="text-sm">{error}</p>
            <button onClick={clearError} className="ml-2">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Date Navigation */}
      <div className="py-2 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <DateSelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

      {/* Main Content */}
      <main className="px-4 py-4 pb-24 space-y-4 max-w-lg mx-auto">
        {/* API Key Prompt */}
        {!apiKey && !import.meta.env.VITE_GEMINI_API_KEY && (
          <div
            onClick={() => setShowSettings(true)}
            className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 cursor-pointer hover:bg-amber-500/20 transition-colors"
          >
            <p className="text-amber-400 text-sm">
              {t('app.welcome')}
            </p>
          </div>
        )}

        <Summary entries={entries} />

        {/* Only allow adding food if selected date is today (optional choice, but let's allow all days for flexibility) */}
        <FoodInput
          onShowCamera={() => setShowCamera(true)}
          selectedDate={selectedDate}
          onSuccess={handlePostTracking}
        />

        <FoodLog
          entries={entries}
          onItemClick={setSelectedEntry}
        />
      </main>

      {/* Camera Modal */}
      {showCamera && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" size={32} /></div>}>
          <Camera
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        </Suspense>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-white" size={32} /></div>}>
          <Settings onClose={() => setShowSettings(false)} />
        </Suspense>
      )}

      {/* Food Detail Modal */}
      {selectedEntry && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-white" size={32} /></div>}>
          <FoodDetail
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
          />
        </Suspense>
      )}

      {/* Meme Reward Modal */}
      {currentMeme && (
        <Suspense fallback={null}>
          <MemeReward
            meme={currentMeme}
            onClose={() => setCurrentMeme(null)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
