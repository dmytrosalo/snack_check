import Dexie from 'dexie';

export const db = new Dexie('CaloriesTrackerDB');

db.version(1).stores({
  foodEntries: '++id, date, timestamp, name, calories, protein, carbs, fat, imageUrl',
  dailyGoals: 'date, calories, protein, carbs, fat',
  settings: 'key, value'
});

// Helper functions
export async function addFoodEntry(entry) {
  const timestamp = Date.now();
  const date = new Date().toISOString().split('T')[0];
  
  return await db.foodEntries.add({
    ...entry,
    date,
    timestamp
  });
}

export async function getTodayEntries() {
  const today = new Date().toISOString().split('T')[0];
  return await db.foodEntries
    .where('date')
    .equals(today)
    .sortBy('timestamp');
}

export async function getEntriesByDate(date) {
  return await db.foodEntries
    .where('date')
    .equals(date)
    .sortBy('timestamp');
}

export async function deleteFoodEntry(id) {
  return await db.foodEntries.delete(id);
}

export async function updateFoodEntry(id, changes) {
  return await db.foodEntries.update(id, changes);
}

export async function getWeeklyStats() {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const entries = await db.foodEntries
    .where('date')
    .between(weekAgo.toISOString().split('T')[0], today.toISOString().split('T')[0], true, true)
    .toArray();
  
  // Group by date
  const grouped = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    acc[entry.date].calories += entry.calories || 0;
    acc[entry.date].protein += entry.protein || 0;
    acc[entry.date].carbs += entry.carbs || 0;
    acc[entry.date].fat += entry.fat || 0;
    return acc;
  }, {});
  
  return grouped;
}

// Settings helpers
export async function getSetting(key, defaultValue = null) {
  const setting = await db.settings.get(key);
  return setting?.value ?? defaultValue;
}

export async function setSetting(key, value) {
  return await db.settings.put({ key, value });
}
