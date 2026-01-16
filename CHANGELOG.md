# Changelog

## [0.0.8] - 2026-01-16
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
