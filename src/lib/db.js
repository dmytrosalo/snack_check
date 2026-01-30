import { supabase } from './supabase';

// Helper functions

/**
 * Adds a new food entry to Supabase
 */
export async function addFoodEntry(entry) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const timestamp = Date.now();
  const date = entry.date || new Date().toISOString().split('T')[0];

  let publicImageUrl = entry.imageUrl;

  // Upload image if it's a base64 string
  if (entry.imageUrl && entry.imageUrl.startsWith('data:image')) {
    try {
      publicImageUrl = await uploadImage(entry.imageUrl, user.id);
    } catch (err) {
      console.error('Failed to upload image:', err);
      // Fallback: Proceed without image or handle error?
      // Proceeding with original (base64) might fail if DB text limit is tight,
      // but let's assume we want to fail gracefully or just try saving.
      // Ideally we should throw, but let's try to proceed to not lose data.
    }
  }

  const pgEntry = {
    user_id: user.id,
    date,
    timestamp,
    name: entry.name,
    calories: entry.calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fat: entry.fat,
    image_url: publicImageUrl,
    description: entry.description,
    health_tip: entry.healthTip,
    tags: entry.tags,
    portion: entry.portion
  };

  const { data, error } = await supabase
    .from('food_entries')
    .insert([pgEntry])
    .select();

  if (error) throw error;
  return mapToAppEntry(data[0]);
}

async function uploadImage(base64Image, userId) {
  // 1. Convert Base64 to Blob
  const byteString = atob(base64Image.split(',')[1]);
  const mimeString = base64Image.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });

  // 2. Generate path (user_id/timestamp.ext)
  const ext = mimeString.split('/')[1] || 'jpg';
  const filePath = `${userId}/${Date.now()}.${ext}`;

  // 3. Upload
  const { data, error } = await supabase.storage
    .from('food-photos')
    .upload(filePath, blob, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // 4. Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('food-photos')
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Gets entries for "today" (based on local time)
 */
export async function getTodayEntries() {
  const today = new Date().toISOString().split('T')[0];
  return getEntriesByDate(today);
}

/**
 * Gets entries for a specific date string (YYYY-MM-DD)
 */
export async function getEntriesByDate(date) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('food_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data.map(mapToAppEntry);
}

// Helper to map DB snake_case back to App camelCase
function mapToAppEntry(dbEntry) {
  if (!dbEntry) return null;
  return {
    ...dbEntry,
    imageUrl: dbEntry.image_url,
    healthTip: dbEntry.health_tip,
    // description, tags, portion, name, calories, etc. match standard names or are direct assignments
    // but explicit mapping for safety:
    description: dbEntry.description,
    tags: dbEntry.tags,
    portion: dbEntry.portion,
    name: dbEntry.name,
    calories: dbEntry.calories,
    protein: dbEntry.protein,
    carbs: dbEntry.carbs,
    fat: dbEntry.fat,
    id: dbEntry.id,
    date: dbEntry.date,
    timestamp: dbEntry.timestamp
  };
}

/**
 * Deletes an entry by ID
 */
export async function deleteFoodEntry(id) {
  const { error } = await supabase
    .from('food_entries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Updates an entry
 */
export async function updateFoodEntry(id, changes) {
  const { error } = await supabase
    .from('food_entries')
    .update(changes)
    .eq('id', id);

  if (error) throw error;
}

/**
 * Gets stats for the last 7 days
 */
export async function getWeeklyStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayStr = today.toISOString().split('T')[0];
  const weekAgoStr = weekAgo.toISOString().split('T')[0];

  const { data: entries, error } = await supabase
    .from('food_entries')
    .select('date, calories, protein, carbs, fat')
    .eq('user_id', user.id)
    .gte('date', weekAgoStr)
    .lte('date', todayStr);

  if (error) throw error;

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

// Settings helpers (User Settings Table - Optional future implementation)
// For now preserving signature but effectively doing nothing or using LocalStorage fallback if caller expects persistence?
// Since useAppStore handles settings, these might be legacy.
export async function getSetting(key, defaultValue = null) {
  // Placeholder if needed, or remove.
  return defaultValue;
}

export async function setSetting(key, value) {
  // Placeholder
  return;
}
