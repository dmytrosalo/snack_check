import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Settings as SettingsIcon, X, Loader2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAppStore } from './stores/appStore';
import { initGemini } from './lib/gemini';
import { db } from './lib/db';
import { formatDate, getRelativeDate } from './lib/dateUtils';
import Summary from './components/Summary';
import FoodInput from './components/FoodInput';
import FoodLog from './components/FoodLog';
import { analyzeFoodFromImage } from './lib/gemini';
import { addFoodEntry } from './lib/db';

const Camera = lazy(() => import('./components/Camera'));
const Settings = lazy(() => import('./components/Settings'));
const FoodDetail = lazy(() => import('./components/FoodDetail'));
const MemeReward = lazy(() => import('./components/MemeReward'));

function App() {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [currentMeme, setCurrentMeme] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const {
    apiKey,
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

  useEffect(() => {
    // Initialize Gemini if API key exists or fallback to env var
    const defaultKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      initGemini(apiKey);
    } else if (defaultKey) {
      initGemini(defaultKey);
    }
  }, [apiKey]);

  const changeDate = (days) => {
    const newDate = getRelativeDate(selectedDate, days);

    // Prevent going to future
    if (days > 0 && selectedDate === new Date().toISOString().split('T')[0]) {
      return;
    }

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
      // Swiping Left -> Next Day (like pages of a book, next page is on right, so you swipe left to bring it in? Or timeline?)
      // Timeline convention: Past is Left, Future is Right.
      // Swipe Left (finger moves Left) -> Moves content Left -> Reveals content on Right (Future)
      changeDate(1);
    }

    if (isRightSwipe) {
      // Swipe Right (finger moves Right) -> Moves content Right -> Reveals content on Left (Past)
      changeDate(-1);
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
    if (!apiKey) {
      const { requestCount, incrementRequestCount } = useAppStore.getState();
      if (requestCount >= 30) {
        setShowCamera(false);
        setError('Free limit reached (30 requests). Please add your own API key in settings.');
        setShowSettings(true);
        return;
      }
    }

    setShowCamera(false);

    try {
      const result = await analyzeFoodFromImage(imageDataUrl);
      await addFoodEntry({
        ...result,
        imageUrl: imageDataUrl,
        date: selectedDate // Ensure we add to currently selected date (or default logic handles today)
        // Note: db.addFoodEntry uses 'date' from arguments if provided,
        // but currently our addFoodEntry helper overwrites it with Today.
        // We should fix the helper or pass timestamp manually?
        // Actually, let's keep it adding to TODAY for now, or respect selectedDate?
        // User request "track food by day" implies seeing history.
        // Logic "add food" usually means "I ate this JUST NOW".
        // If I am browsing yesterday and click add, should it add to yesterday?
        // Usually YES in tracking apps.
        // Let's modify addFoodEntry call to include date: selectedDate
      });

      // Increment count only if using default key
      if (!apiKey) {
        useAppStore.getState().incrementRequestCount();
      }

      // Show reward
      fetchMeme();
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
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              PlateMate
            </h1>
            <p className="text-slate-500 text-xs">AI-Powered Nutrition</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-slate-800/50 rounded-full text-slate-400 transition-colors"
          >
            <SettingsIcon size={22} />
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
      <div className="flex items-center justify-between px-6 py-2 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <button
          onClick={() => changeDate(-1)}
          className="p-1 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2 font-medium">
          <Calendar size={16} className="text-emerald-400" />
          <span>{formatDate(selectedDate)}</span>
        </div>
        <button
          onClick={() => changeDate(1)}
          className="p-1 text-slate-400 hover:text-white transition-colors"
          disabled={selectedDate === new Date().toISOString().split('T')[0]}
        >
          <ChevronRight size={24} className={selectedDate === new Date().toISOString().split('T')[0] ? 'opacity-30' : ''} />
        </button>
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
              👋 Welcome! Tap here to add your Gemini API key and start tracking.
            </p>
          </div>
        )}

        <Summary entries={entries} />

        {/* Only allow adding food if selected date is today (optional choice, but let's allow all days for flexibility) */}
        <FoodInput
          onShowCamera={() => setShowCamera(true)}
          selectedDate={selectedDate}
          onSuccess={fetchMeme}
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
