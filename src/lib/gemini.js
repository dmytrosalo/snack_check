import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

export function initGemini(apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export function isGeminiInitialized() {
  return genAI !== null;
}

// Helper to get prompt text based on language
const getSystemPrompt = (language = 'ua') => `
You are an AI nutritionist and fun food tracker.
Analyze the image or text description and provide nutritional information.
Language: The user's language is "${language === 'ua' ? 'Ukrainian' : 'English'}".
Output JSON ONLY. No markdown formatting.

Format:
{
  "name": "Food Name (in ${language})",
  "calories": Number,
  "protein": Number (grams),
  "carbs": Number (grams),
  "fat": Number (grams),
  "portion": "Estimated Portion Size (in ${language})",
  "tags": ["Tag1", "Tag2"],
  "healthTip": "A short, sassy comment (in ${language})"
}

Instructions:
1. Identify the food item(s) clearly.
2. Calculate nutrition for the WHOLE portion/quantity.
3. If multiple items are present, sum up their values.
4. Identify dietary tags (e.g., "High Protein", "Vegan", "Keto Friendly", "Gluten Free", "High Sugar"). Translate tags to ${language}.
5. Provide a short, sassy, and slightly edgy comment in ${language}. If it's healthy, praise them. If it's junk food, be brutally honest (e.g., "Do you want to be fat?"). Max 1 sentence. If Ukrainian, use culturally relevant humor/slang if appropriate.

Return valid JSON only:
{
  "name": "string",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "portion": "string",
  "tags": ["string"],
  "healthTip": "string"
}
`;

// Helper to parse the Gemini response
const parseResponse = (text) => {
  let cleanedText = text.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.slice(7);
  }
  if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.slice(3);
  }
  if (cleanedText.endsWith('```')) {
    cleanedText = cleanedText.slice(0, -3);
  }
  cleanedText = cleanedText.trim();

  const parsed = JSON.parse(cleanedText);

  return {
    name: parsed.name || 'Unknown food',
    calories: Math.round(parsed.calories) || 0,
    protein: Math.round(parsed.protein) || 0,
    carbs: Math.round(parsed.carbs) || 0,
    fat: Math.round(parsed.fat) || 0,
    portion: parsed.portion || 'Unknown portion',
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    healthTip: parsed.healthTip || '',
  };
};

export const analyzeFoodFromImage = async (base64Image, language = 'ua') => {
  if (!genAI) {
    throw new Error('Gemini API not initialized. Please add your API key.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Remove header from base64 string if present
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const result = await model.generateContent([
      getSystemPrompt(language),
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64
        }
      }
    ]);

    const response = await result.response;
    return parseResponse(response.text());
  } catch (error) {
    console.error('Gemini Image Analysis Error:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
};

export const analyzeFoodFromText = async (description, language = 'ua') => {
  if (!genAI) {
    throw new Error('Gemini API not initialized. Please add your API key.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-latest" });

    const result = await model.generateContent([
      getSystemPrompt(language),
      description
    ]);

    const response = await result.response;
    return parseResponse(response.text());
  } catch (error) {
    console.error('Gemini Text Analysis Error:', error);
    throw new Error(`Failed to analyze text: ${error.message}`);
  }
};

// Remove old exports if any remain below

