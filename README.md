# PlateMate - AI-Powered Calories Tracker PWA

A modern Progressive Web App for tracking calories using AI-powered food recognition via Google Gemini.

## Features

- 📸 **Photo Recognition** - Take a photo of your food and AI identifies it
- ✍️ **Text Input** - Describe your food in natural language
- 📊 **Daily Summary** - Visual progress towards calorie and macro goals
- 📱 **PWA** - Install on your Android phone like a native app
- 🔄 **Offline Support** - Works without internet (except AI features)
- 💾 **Local Storage** - All data stored on your device using IndexedDB

## Quick Start

### 1. Install Dependencies

```bash
cd calories-tracker
npm install
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Add API Key

1. Click the Settings icon (gear) in the app
2. Paste your Gemini API key
3. Click "Save Settings"

## Install on Android

### Method 1: Chrome Browser

1. Open the app URL in Chrome on your Android phone
2. Tap the three-dot menu (⋮)
3. Select "Add to Home screen" or "Install app"
4. Tap "Install"

### Method 2: After Build

```bash
npm run build
npm run preview
```

Then deploy to any static hosting (Vercel, Netlify, GitHub Pages).

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| Zustand | State management |
| Dexie.js | IndexedDB wrapper |
| Google Gemini | AI food recognition |
| Vite PWA Plugin | Service worker & manifest |

## Project Structure

```
src/
├── components/
│   ├── Camera.jsx      # Photo capture
│   ├── FoodInput.jsx   # Text/image input
│   ├── FoodLog.jsx     # Daily entries list
│   ├── Settings.jsx    # API key & goals
│   └── Summary.jsx     # Calorie progress
├── lib/
│   ├── db.js           # IndexedDB operations
│   └── gemini.js       # Gemini API integration
├── stores/
│   └── appStore.js     # Zustand state
├── App.jsx             # Main component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## API Usage Notes

- The app uses `gemini-2.0-flash-exp` model
- Each food analysis costs minimal tokens (~500-1000)
- Free tier: 15 requests/minute, 1500 requests/day
- API key is stored locally in your browser

## Customization

### Change Daily Goals

Open Settings and adjust:
- Calories target
- Protein (grams)
- Carbs (grams)
- Fat (grams)

Or use preset buttons: Weight Loss, Maintenance, Muscle Gain.

### Modify AI Prompt

Edit `src/lib/gemini.js` to customize the food analysis prompt.

## Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Drag 'dist' folder to Netlify dashboard
```

### GitHub Pages

1. Update `vite.config.js`:
   ```js
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   })
   ```
2. Build and deploy:
   ```bash
   npm run build
   git add dist -f
   git commit -m "Deploy"
   git subtree push --prefix dist origin gh-pages
   ```

## License

MIT
