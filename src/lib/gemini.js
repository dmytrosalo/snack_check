import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

export function initGemini(apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export function isGeminiInitialized() {
  return genAI !== null;
}

const FOOD_ANALYSIS_PROMPT = `Analyze this food and provide nutritional information.
Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "name": "food name",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams),
  "portion": "estimated portion size",
  "confidence": "high" | "medium" | "low"
}

If you cannot identify the food or estimate nutrition, return:
{
  "error": "reason why"
}`;

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
