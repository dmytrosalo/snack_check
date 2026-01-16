import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Localization
      language: 'ua',
      setLanguage: (lang) => set({ language: lang }),

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

      // Request counting for default API key
      requestCount: 0,
      incrementRequestCount: () => set((state) => ({ requestCount: state.requestCount + 1 })),

      // Lifetime logs count
      lifetimeLogs: 0,
      incrementLifetimeLogs: () => set((state) => ({ lifetimeLogs: state.lifetimeLogs + 1 })),

      // Selected date for history view
      selectedDate: new Date().toISOString().split('T')[0],
      setSelectedDate: (date) => set({ selectedDate: date }),

      // Avatar System
      unlockedItems: [1], // Level 1 item unlocked by default
      unlockItem: (id) => set((state) => ({
        unlockedItems: state.unlockedItems.includes(id) ? state.unlockedItems : [...state.unlockedItems, id]
      })),

      equippedItems: {
        head: null,
        face: null,
        body: 1, // Default T-Shirt
        bottom: 2, // Default Jeans
        feet: 3, // Default Sneakers
        accessory: null
      },
      equipItem: (slot, id) => set((state) => ({
        equippedItems: { ...state.equippedItems, [slot]: id }
      })),

      itemColors: {}, // { itemId: '#colorHex' }
      setItemColor: (itemId, color) => set((state) => ({
        itemColors: { ...state.itemColors, [itemId]: color }
      })),
    }),
    {
      name: 'calories-tracker-storage-v1',
      partialize: (state) => ({
        language: state.language,
        apiKey: state.apiKey,
        dailyGoals: state.dailyGoals,
        requestCount: state.requestCount,
        lifetimeLogs: state.lifetimeLogs,
        unlockedItems: state.unlockedItems,
        equippedItems: state.equippedItems,
        itemColors: state.itemColors
      })
    }
  )
);
