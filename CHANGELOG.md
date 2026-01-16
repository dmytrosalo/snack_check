# Changelog

## [0.0.12] - 2026-01-17
### Testing & Stability 🧪
- **Avatar System Tests**: Added comprehensive unit tests for `Avatar`, `AvatarScreen`, and `PainterlyFilter` components.
- **Visual Regression Checks**: Added checks for Disco Elysium style elements (textures, lighting overlays, and SVG filters).

## [0.0.11] - 2026-01-16
### Disco Elysium Redesign 🎨
- **Painterly Avatar**: Implemented a procedural "oil-paint" filter for the avatar using SVG `feTurbulence` and `feDisplacementMap`.
- **Atmosphere**: Added "Thought Cabinet" style abstract background textures.
- **UI Overhaul**: Redesigned `AvatarScreen` with serif fonts, "Pigment" color selectors, and high-contrast visuals to match the game's aesthetic.

### Avatar Gamification 👕
- **Wardrobe System**: Unlocked items (Shirt, Jeans, Sneakers) can now be equipped/unequipped.
- **Color Customization**: Added ability to dye individual clothing items with a 19-color palette.
- **Dynamic Icons**: Wardrobe grid icons now reflect the currently selected color of the item.
- **Mini Avatar**: Added a live-updating mini avatar button in the header.

### Core Features 🔥
- **Calorie Goals**: Added a setting to customize the daily calorie limit.
- **Summary Update**: Added a pulsing "Flame" icon to the dashboard summary card for better visual feedback.

## [0.0.10] - 2026-01-16
### Localization 🇺🇦 / 🇺🇸
- **Multi-Language Support**: Added full support for **Ukrainian (UA)** and **English (EN)**.
- **Default Language**: Set Ukrainian as the default language for new users.
- **Language Toggle**: Added a language switcher in the `Settings` menu.
- **Localized AI**: Updates the AI prompt to respond in the selected language, maintaining its personality (including culturally relevant sass in Ukrainian).
- **UI Translation**: Translated all application text, including buttons, placeholders, and error messages.
- **Image Validation**: Restored checks for file type and size (limit 10MB) to ensure platform stability.

## [0.0.9] - 2026-01-16
### User Interface Fixes
- **Detail View**: Fixed "Invalid Date" display bug by handling legacy and new timestamp formats correctly.
- **Button Redesign**: Replaced single delete button with a large "OK" button (to close) and a smaller, discreet "Delete" icon button to improve UX safety and clarity.
### Gamification & Personality
- **Logic Update**: Meme rewards now appear only on every **5th** logged meal to make them feel special.
- **AI Tone**: Updated personality to be "edgier" and brutally honest about junk food (e.g., "Do you want to be fat?") for stronger motivation.
- **Accessibility**: Added `aria-labels` to all input buttons.
- **Testing**: Added `FoodInput` integration tests covering the new gamification callbacks.

## [0.0.7] - 2026-01-16
### Testing & Quality Assurance
- Added unit tests for utility functions (`dateUtils`, `imageUtils`).
- Added component tests for `FoodLog`, `FoodDetail`, and `MemeReward`.
- Set up Vitest and React Testing Library infrastructure.

## [0.0.6] - 2026-01-16
### Fun & Personality
- **Sassy AI**: Updated AI persona to be "sassy and funny" instead of just factual.
- **UI Update**: Renamed insight box to "PlateMate Says 🤖".

## [0.0.5] - 2026-01-16
### Gamification
- **Meme Rewards**: Added a feature to show a random meme (from `meme-api.com`) after successfully logging a meal to keep motivation high.

## [0.0.4] - 2026-01-16
### Health Intelligence
- **Dietary Tags**: AI now identifies and displays tags like "High Protein", "Vegan", "Keto".
- **Health Verdict**: Added short AI-generated health tips/insights for each meal.

## [0.0.3] - 2026-01-16
### UX Enhancements
- **Swipe Navigation**: Added ability to swipe left/right to switch between days on mobile.
- **Food Detail View**: Created a popup modal for food entries showing larger images and macro details.

## [0.0.2] - 2026-01-16
### Rebranding
- **Name Change**: Renamed application from "SnackTrack" to **PlateMate**.
- Updated all assets, manifest, and textual references.

## [0.0.1] - 2026-01-16
### Core Optimizations & Fixes
- **Database**: Switched to `dexie-react-hooks` (`useLiveQuery`) for reactive, real-time updates.
- **History**: Implemented date navigation (Previous/Next day logic).
- **Performance**: Added client-side image resizing to save tokens and bandwidth.
- **Bug Fixes**: Fixed camera crashing issues and Tailwind configuration.
- **Mobile**: Fixed sticky scrolling and layout issues on mobile devices.
