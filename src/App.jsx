import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Settings as SettingsIcon, X, Loader2, ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
import { Trash2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import Avatar from './components/Avatar';

const Camera = lazy(() => import('./components/Camera'));
const Settings = lazy(() => import('./components/Settings'));
const AvatarScreen = lazy(() => import('./components/AvatarScreen'));
const FoodDetail = lazy(() => import('./components/FoodDetail'));
const MemeReward = lazy(() => import('./components/MemeReward'));

function App() {
  const { t, i18n } = useTranslation();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showAvatar, setShowAvatar] = useState(false);
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
    setSelectedDate,
    equippedItems
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
    // if (!touchStart || !touchEnd) return; // Removed as per new state

    // const distance = touchStart - touchEnd; // Removed as per new state
    // const isLeftSwipe = distance > minSwipeDistance; // Removed as per new state
    // const isRightSwipe = distance < -minSwipeDistance; // Removed as per new state

    // if (isLeftSwipe) {
    //   // Swiping Left -> Next Day (like pages of a book, next page is on right, so you swipe left to bring it in? Or timeline?)
    //   // Timeline convention: Past is Left, Future is Right.
    //   // Swipe Left (finger moves Left) -> Moves content Left -> Reveals content on Right (Future)
    //   changeDate(1);
    // }

    // if (isRightSwipe) {
    //   // Swipe Right (finger moves Right) -> Moves content Right -> Reveals content on Left (Past)
    //   changeDate(-1);
    // }
  };

  const handlePostTracking = (entry) => {
    const { lifetimeLogs, incrementLifetimeLogs, unlockItem, unlockedItems } = useAppStore.getState();
    const count = lifetimeLogs + 1;
    incrementLifetimeLogs();

    // Reward Logic: Unlock new item every 10 logs
    if (count % 10 === 0) {
      // Calculate which item ID to unlock based on the count (e.g. 10 -> ID 2, 20 -> ID 3)
      // Assuming ID 1 is default.
      const level = Math.floor(count / 10) + 1;

      // Find if this item ID exists in our items list (we need to import ITEMS or just try to unlock)
      // Since we don't have ITEMS imported here, we'll blindly try to unlock 'level'.
      // Better yet, let's just use the level as the ID.
      if (!unlockedItems.includes(level)) {
        unlockItem(level);
        // Show toast instead of redirecting
        setError(`🎉 New Style Unlocked! (Level ${level})`);
        // setShowAvatar(true); // User requested NO redirect
        return;
      }
    }

    if (count % 5 === 0) {
      // Every 5th log -> Show Meme (unless it was a 10th log which also triggers unlock?
      // 10 is divisible by 5. So at 10 we get Unlock AND Meme?
      // Let's allow Meme as well, or prioritize unlock?
      // User didn't specify, but "reward" usually implies one special thing.
      // If we return above, meme won't show. That's probably fine. Be simpler.
      fetchMeme();
    } else {
      // Otherwise -> Show Food Detail (Sassy AI)
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
    if (!apiKey) {
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

      await addFoodEntry(entry);

      // Increment count only if using default key
      if (!apiKey) {
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
          <div className="flex gap-2">
            <button
              onClick={() => setShowAvatar(true)}
              className="relative p-0.5 bg-emerald-500/10 rounded-full hover:bg-emerald-500/20 transition-colors border border-emerald-500/20 w-10 h-10 overflow-hidden"
              aria-label={t('avatar.title')}
            >
              <div className="absolute top-1 left-1/2 -translate-x-1/2 transform scale-[0.18] origin-top">
                <Avatar equipped={equippedItems} />
              </div>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 bg-slate-800/50 rounded-full hover:bg-slate-700/50 transition-colors"
            >
              <SettingsIcon size={22} className="text-slate-400" />
            </button>
          </div>
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
          <span>{formatDate(selectedDate, language)}</span>
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

      {/* Avatar Modal */}
      {showAvatar && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-white" size={32} /></div>}>
          <AvatarScreen onClose={() => setShowAvatar(false)} />
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
