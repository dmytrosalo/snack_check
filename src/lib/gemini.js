import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

export function initGemini(apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export function isGeminiInitialized() {
  return genAI !== null;
}

const FOOD_ANALYSIS_PROMPT = `Analyze the food image or description.
IMPORTANT:
1. Estimate the TOTAL quantity/portion size visible or described (e.g., "3 apples", "large bowl of pasta").
2. Calculate nutrition for the WHOLE portion/quantity.
3. If multiple items are present, sum up their values.
4. Identify dietary tags (e.g., "High Protein", "Vegan", "Keto Friendly", "Gluten Free", "High Sugar").
5. Provide a short, sassy, funny, or motivational comment. Act like a gym buddy with personality. If it's healthy, cheer them on. If it's junk food, lightly roast them (but be funny). Max 1 sentence.

Return valid JSON only:
{
  "name": "concise food name (e.g. '3 Medium Apples')",
  "calories": number (total kcal),
  "protein": number (total g),
  "carbs": number (total g),
  "fat": number (total g),
  "portion": "estimated quantity",
  "tags": ["tag1", "tag2"],
  "healthTip": "brief health verdict",
  "confidence": "high"|"medium"|"low"
}
If unclear/not food, return: {"error": "reason"}`;

export async function analyzeFood(input, isImage = false) {
  if (!genAI) {
    throw new Error('Gemini API not initialized. Please add your API key.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    let result;

    if (isImage) {
      // Image analysis
      const imagePart = {
        inlineData: {
          data: input.split(',')[1], // Remove data URL prefix
          mimeType: input.split(';')[0].split(':')[1]
        }
      };

      result = await model.generateContent([
        FOOD_ANALYSIS_PROMPT,
        imagePart
      ]);
    } else {
      // Text analysis
      result = await model.generateContent([
        FOOD_ANALYSIS_PROMPT,
        `Food description: ${input}`
      ]);
    }

    const response = await result.response;
    const text = response.text();

    // Clean up response - remove markdown code blocks if present
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

    if (parsed.error) {
      throw new Error(parsed.error);
    }

    return {
      name: parsed.name || 'Unknown food',
      calories: Math.round(parsed.calories) || 0,
      protein: Math.round(parsed.protein) || 0,
      carbs: Math.round(parsed.carbs) || 0,
      fat: Math.round(parsed.fat) || 0,
      portion: parsed.portion || 'Unknown portion',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      healthTip: parsed.healthTip || '',
      confidence: parsed.confidence || 'low'
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to analyze food: ${error.message}`);
  }
}

export async function analyzeFoodFromText(description) {
  return analyzeFood(description, false);
}

export async function analyzeFoodFromImage(imageDataUrl) {
  return analyzeFood(imageDataUrl, true);
}
