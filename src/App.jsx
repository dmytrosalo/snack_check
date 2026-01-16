import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Settings as SettingsIcon, X, Loader2 } from 'lucide-react';
import { useAppStore } from './stores/appStore';
import { initGemini } from './lib/gemini';
import { getTodayEntries } from './lib/db';
import Summary from './components/Summary';
import FoodInput from './components/FoodInput';
import FoodLog from './components/FoodLog';
import { analyzeFoodFromImage } from './lib/gemini';
import { addFoodEntry } from './lib/db';

const Camera = lazy(() => import('./components/Camera'));
const Settings = lazy(() => import('./components/Settings'));

function App() {
  const [entries, setEntries] = useState([]);
  const {
    apiKey,
    showSettings,
    setShowSettings,
    showCamera,
    setShowCamera,
    error,
    clearError,
    setError
  } = useAppStore();

  // Load entries on mount
  const loadEntries = useCallback(async () => {
    const todayEntries = await getTodayEntries();
    setEntries(todayEntries);
  }, []);

  useEffect(() => {
    loadEntries();

    // Initialize Gemini if API key exists or fallback to env var
    const defaultKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      initGemini(apiKey);
    } else if (defaultKey) {
      initGemini(defaultKey);
    }
  }, [apiKey, loadEntries]);

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
        imageUrl: imageDataUrl
      });
      loadEntries();

      // Increment count only if using default key
      if (!apiKey) {
        useAppStore.getState().incrementRequestCount();
      }
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800/50 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              CalTrack
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

      {/* Main Content */}
      <main className="px-4 py-4 pb-8 space-y-4 max-w-lg mx-auto">
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

        <FoodInput
          onShowCamera={() => setShowCamera(true)}
          onEntryAdded={loadEntries}
        />

        <FoodLog
          entries={entries}
          onEntryDeleted={loadEntries}
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
    </div>
  );
}

export default App;
