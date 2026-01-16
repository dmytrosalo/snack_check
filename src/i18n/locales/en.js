export default {
    translation: {
        app: {
            title: 'PlateMate',
            welcome: '👋 Welcome! Tap here to add your Gemini API key and start tracking.'
        },
        input: {
            placeholder: 'Describe your food...',
            descriptionOptional: 'Description (optional)...',
            camera: 'Camera',
            uploadImage: 'Upload Image',
            send: 'Send',
            add: 'Add Entry',
            analyzing: 'Analyzing...',
            confidence: 'Confidence'
        },
        detail: {
            calories: 'Calories',
            protein: 'Protein',
            carbs: 'Carbs',
            fat: 'Fat',
            portion: 'Portion Estimate',
            insightTitle: 'PlateMate Says 🤖',
            ok: 'OK',
            delete: 'Delete Entry',
            confirmDelete: 'Are you sure you want to delete this entry?'
        },
        summary: {
            title: "Today's Calories",
            remaining: 'remaining',
            over: 'over'
        },
        camera: {
            title: 'Take Photo',
            error: 'Could not access camera. Please grant permission.',
            tryAgain: 'Try Again'
        },
        avatar: {
            title: 'Your Style',
            wardrobe: 'Wardrobe',
            lvl: 'LVL'
        },
        meme: {
            title: 'Meal Logged!',
            subtitle: "Here's a meme for keeping it real.",
            awesome: 'Awesome!'
        },
        settings: {
            title: 'Settings',
            language: 'Language',
            apiKey: 'Gemini API Key',
            dailyGoal: 'Daily Goal (kcal)',
            noApiKey: 'Please add your Gemini API Key in settings.',
            save: 'Save'
        },
        log: {
            emptyTitle: 'No food logged yet',
            emptySubtitle: 'Add your first meal using text or photo',
            todayTitle: "Today's Log"
        },
        errors: {
            limitReached: 'Daily request limit reached (30). Add your own API Key to continue.',
            failedToSave: 'Failed to save entry. Please try again.',
            failedToDelete: 'Failed to delete entry.',
            invalidFileType: 'Please select a valid image file (JPEG, PNG).',
            fileTooLarge: 'Image is too large. Please choose a file under 10MB.'
        }
    }
};
