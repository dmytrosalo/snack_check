import { useState, useRef } from 'react';
import { Camera, Send, Image, Loader2, X } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { analyzeFoodFromText, analyzeFoodFromImage, isGeminiInitialized } from '../lib/gemini';
import { addFoodEntry } from '../lib/db';
import { resizeImage } from '../lib/imageUtils';

export default function FoodInput({ onShowCamera, selectedDate, onSuccess }) {
  const [input, setInput] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  const { setError, setShowSettings, apiKey } = useAppStore();

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const originalUrl = event.target.result;
        const resizedUrl = await resizeImage(originalUrl);
        setPreviewImage(resizedUrl);
      } catch (err) {
        console.error('Failed to resize image:', err);
        setPreviewImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearPreview = () => {
    setPreviewImage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearInput = () => {
    setInput('');
    setPreviewImage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    // Check limit if using default key
    if (!apiKey) {
      if (!isGeminiInitialized()) {
        setError('Please add your Gemini API key in settings');
        setShowSettings(true);
        return;
      }

      const { requestCount } = useAppStore.getState();
      if (requestCount >= 30) {
        setError('Free limit reached (30 requests). Please add your own API key in settings.');
        setShowSettings(true);
        return;
      }
    }

    if (!input.trim() && !previewImage) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let result;
      if (previewImage) {
        result = await analyzeFoodFromImage(previewImage);
      } else {
        result = await analyzeFoodFromText(input);
      }
      setAnalysisResult(result);

      // Increment count only if using default key
      if (!apiKey) {
        useAppStore.getState().incrementRequestCount();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddEntry = async () => {
    if (!analysisResult) return;

    try {
      await addFoodEntry({
        ...analysisResult,
        imageUrl: previewImage || null,
        date: selectedDate || new Date().toISOString().split('T')[0]
      });

      clearInput();
      // No need to call onEntryAdded, useLiveQuery handles updates
      // Trigger meme reward
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to save entry');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (analysisResult) {
        handleAddEntry();
      } else {
        handleAnalyze();
      }
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 border border-slate-700/50">
      {/* Image Preview */}
      {previewImage && (
        <div className="relative mb-3">
          <img
            src={previewImage}
            alt="Food preview"
            className="w-full h-40 object-cover rounded-xl"
          />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Analysis Result */}
      {analysisResult && (
        <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-emerald-400">{analysisResult.name}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${analysisResult.confidence === 'high'
              ? 'bg-emerald-500/20 text-emerald-400'
              : analysisResult.confidence === 'medium'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
              }`}>
              {analysisResult.confidence} confidence
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <div>
              <div className="text-white font-bold">{analysisResult.calories}</div>
              <div className="text-slate-400 text-xs">kcal</div>
            </div>
            <div>
              <div className="text-blue-400 font-bold">{analysisResult.protein}g</div>
              <div className="text-slate-400 text-xs">protein</div>
            </div>
            <div>
              <div className="text-amber-400 font-bold">{analysisResult.carbs}g</div>
              <div className="text-slate-400 text-xs">carbs</div>
            </div>
            <div>
              <div className="text-pink-400 font-bold">{analysisResult.fat}g</div>
              <div className="text-slate-400 text-xs">fat</div>
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-2">Portion: {analysisResult.portion}</p>

          <button
            onClick={handleAddEntry}
            className="w-full mt-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
          >
            Add to Log
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={previewImage ? "Add description (optional)..." : "Describe your food..."}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors"
            disabled={isAnalyzing}
          />
        </div>

        {/* Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="p-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
        >
          <Image size={22} />
        </button>

        {/* Camera */}
        <button
          onClick={onShowCamera}
          disabled={isAnalyzing}
          className="p-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
        >
          <Camera size={22} />
        </button>

        {/* Analyze/Send */}
        <button
          onClick={analysisResult ? handleAddEntry : handleAnalyze}
          disabled={isAnalyzing || (!input.trim() && !previewImage && !analysisResult)}
          className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <Send size={22} />
          )}
        </button>
      </div>
    </div>
  );
}
