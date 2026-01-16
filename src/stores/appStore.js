import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // API Key
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),
      
      // Daily goals
      dailyGoals: {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65
      },
      setDailyGoals: (goals) => set({ dailyGoals: { ...get().dailyGoals, ...goals } }),
      
      // UI State
      activeTab: 'today',
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Settings modal
      showSettings: false,
      setShowSettings: (show) => set({ showSettings: show }),
      
      // Camera state
      showCamera: false,
      setShowCamera: (show) => set({ showCamera: show }),
      
      // Selected date for history view
      selectedDate: new Date().toISOString().split('T')[0],
      setSelectedDate: (date) => set({ selectedDate: date }),
    }),
    {
      name: 'calories-tracker-storage',
      partialize: (state) => ({
        apiKey: state.apiKey,
        dailyGoals: state.dailyGoals
      })
    }
  )
);
