import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Generous limit for high-resolution food and fridge photo uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Helper to initialize GoogleGenAI safely with required User-Agent
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Convert data URL or base64 to parts for Gemini
function parseImageData(dataUrlOrBase64: string): { mimeType: string; data: string } {
  if (dataUrlOrBase64.startsWith('data:')) {
    const match = dataUrlOrBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return { mimeType: match[1], data: match[2] };
    }
  }
  // Default fallback assuming standard JPEG/PNG
  return { mimeType: 'image/jpeg', data: dataUrlOrBase64 };
}

// -------------------------------------------------------------
// 1. Health and Status Endpoint
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'online',
    appName: 'Food Verse AI',
    hasGeminiKey: hasKey,
    model: 'gemini-3.8-flash',
    ttsModel: 'gemini-3.8-flash-lite-tts',
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// 2. Multimodal Meal Vision & Calorie/Macro Scanner
// -------------------------------------------------------------
app.post('/api/analyze-meal', async (req, res) => {
  try {
    const { image, textDescription, dietaryGoal, userAllergies } = req.body;
    if (!image && !textDescription) {
      return res.status(400).json({ error: 'Please provide either a food image or dish description.' });
    }

    const ai = getGeminiClient();

    // Fallback if no API key is provided
    if (!ai) {
      return res.json({
        mock: true,
        dishName: textDescription || 'Artisan Avocado & Poached Egg Toast',
        cuisine: 'Modern California Breakfast / Brunch',
        description: 'Thick sourdough toast topped with smashed avocado, soft poached egg, heirloom microgreens, chia seeds, and smoked chili flakes.',
        servingSizeEstimate: '1 plate (approx. 240g)',
        confidenceScore: 0.96,
        nutrition: {
          calories: 385,
          protein: 16,
          carbs: 28,
          fat: 24,
          fiber: 9,
          sugar: 3,
          sodium: 460,
          saturatedFat: 4.5,
          cholesterol: 185,
          micronutrients: [
            { name: 'Potassium', amount: '680mg', dailyValuePercentage: 15 },
            { name: 'Folate (B9)', amount: '120mcg', dailyValuePercentage: 30 },
            { name: 'Vitamin E', amount: '3.1mg', dailyValuePercentage: 21 },
            { name: 'Lutein & Zeaxanthin', amount: '320mcg', dailyValuePercentage: 25 },
          ],
        },
        healthScore: 88,
        glycemicIndex: 'Low',
        ingredients: [
          { name: 'Sourdough Bread', estimatedWeightGrams: 75, calories: 185 },
          { name: 'Haas Avocado', estimatedWeightGrams: 80, calories: 130 },
          { name: 'Poached Egg', estimatedWeightGrams: 55, calories: 72 },
          { name: 'Olive Oil Drizzle & Seeds', estimatedWeightGrams: 10, calories: 45 },
        ],
        allergens: ['Gluten (Wheat)', 'Egg'],
        dietaryBadges: ['Vegetarian', 'High Fiber', 'Heart-Healthy Fats', 'Low Sugar'],
        dietitianVerdict: 'Superb nutrient density! The combination of dietary fiber from avocado and slow-digesting carbs from sourdough cushions the glycemic response. High lutein from the egg yolk supports ocular and neurological health.',
        smartTweaks: [
          'Add a squeeze of fresh lemon to boost non-heme iron absorption.',
          'Swap standard sourdough for sprouted gluten-free bread if celiac.',
          'Add smoked salmon or tempeh to boost protein over 25g.',
        ],
      });
    }

    const parts: any[] = [];
    if (image) {
      const parsed = parseImageData(image);
      parts.push({
        inlineData: {
          mimeType: parsed.mimeType,
          data: parsed.data,
        },
      });
    }

    const promptText = `
You are the world's most sophisticated Multimodal Food Intelligence Agent & Clinical Dietitian in Food Verse AI.
Analyze this food meal thoroughly.

User context:
- Text details / context: ${textDescription || 'None provided'}
- User Dietary Goal: ${dietaryGoal || 'General Wellness & Balanced Macros'}
- User Allergies / Intolerances: ${userAllergies && userAllergies.length > 0 ? userAllergies.join(', ') : 'None specified'}

Provide a rigorous, accurate culinary and nutritional assessment. Return pure valid JSON conforming strictly to this format:
{
  "dishName": "Name of the dish or meal",
  "cuisine": "Cuisine style (e.g. Mediterranean, Japanese, Modern American)",
  "description": "Appetizing yet objective culinary description of the plate",
  "servingSizeEstimate": "Estimated portion e.g. 1 bowl (~320g)",
  "confidenceScore": 0.95,
  "nutrition": {
    "calories": 450,
    "protein": 28,
    "carbs": 35,
    "fat": 18,
    "fiber": 6,
    "sugar": 4,
    "sodium": 520,
    "saturatedFat": 3.5,
    "cholesterol": 65,
    "micronutrients": [
      { "name": "Iron", "amount": "3.5mg", "dailyValuePercentage": 20 },
      { "name": "Vitamin C", "amount": "45mg", "dailyValuePercentage": 50 }
    ]
  },
  "healthScore": 85,
  "glycemicIndex": "Low",
  "ingredients": [
    { "name": "Ingredient name", "estimatedWeightGrams": 120, "calories": 160 }
  ],
  "allergens": ["Gluten", "Dairy", "Soy"],
  "dietaryBadges": ["High-Protein", "Dairy-Free", "Keto-Friendly"],
  "dietitianVerdict": "Concise 2-3 sentence clinical dietary appraisal analyzing macronutrient distribution, satiety index, and nutritional value.",
  "smartTweaks": [
    "Practical healthy adjustment 1",
    "Practical healthy adjustment 2"
  ]
}
Respond with only valid JSON.
`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawText);
    res.json(parsedData);
  } catch (error: any) {
    console.error('Error analyzing meal:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze meal with Gemini multimodal vision.',
    });
  }
});

// -------------------------------------------------------------
// 3. Smart Fridge & Pantry Vision / Zero-Waste Recipe Generator
// -------------------------------------------------------------
app.post('/api/scan-fridge', async (req, res) => {
  try {
    const { image, ingredientTextList, dietaryPreferences, maxCookingTimeMinutes } = req.body;
    if (!image && (!ingredientTextList || ingredientTextList.length === 0)) {
      return res.status(400).json({ error: 'Please provide a fridge photo or list of ingredients.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        mock: true,
        detectedItems: [
          { name: 'Eggs', freshness: 'Fresh (Good for 2 weeks)', category: 'Dairy & Eggs', shelfLifeDays: 14 },
          { name: 'Baby Spinach', freshness: 'Crisp - use within 3 days', category: 'Produce', shelfLifeDays: 3 },
          { name: 'Parmesan Cheese', freshness: 'Good condition', category: 'Dairy & Eggs', shelfLifeDays: 30 },
          { name: 'Cooked Jasmine Rice', freshness: 'Cooked leftover - consume in 24h', category: 'Grains', shelfLifeDays: 1 },
          { name: 'Garlic & Scallions', freshness: 'Fresh', category: 'Produce', shelfLifeDays: 7 },
        ],
        recipes: [
          {
            id: 'fr-1',
            title: 'Golden Garlic Scallion Fried Rice with Crispy Fried Egg',
            description: 'A comforting, savory high-protein wok dish that revitalizes leftover cold rice into fragrant perfection.',
            prepTime: '5 mins',
            cookTime: '10 mins',
            difficulty: 'Easy',
            servings: 2,
            caloriesPerServing: 340,
            macros: { protein: 14, carbs: 42, fat: 12 },
            matchedIngredients: ['Cooked Jasmine Rice', 'Eggs', 'Garlic & Scallions'],
            pantryStaplesNeeded: ['Soy sauce', 'Cooking oil', 'Black pepper'],
            optionalUpgrades: ['Sesame oil drizzle', 'Chili crisp', 'Toasted sesame seeds'],
            instructions: [
              'Separate the cold rice grains gently with wet fingers.',
              'Finely slice scallions separating the white bases from green tops. Mince the garlic.',
              'Heat 1 tbsp oil in a hot skillet over medium-high heat. Sauté scallion whites and garlic until fragrant (30 seconds).',
              'Toss in cold rice and stir-fry vigorously, seasoning with 1 tbsp soy sauce and freshly cracked black pepper.',
              'Push rice to the side, crack an egg into the pan and fry until edges are golden and crispy.',
              'Garnish with fresh green scallion tops and serve sizzling hot.',
            ],
          },
          {
            id: 'fr-2',
            title: 'Fluffy Spinach & Parmesan Herb Omelette',
            description: 'French-style tender rolled omelette loaded with wilted greens and nutty melted parmesan.',
            prepTime: '4 mins',
            cookTime: '6 mins',
            difficulty: 'Easy',
            servings: 1,
            caloriesPerServing: 260,
            macros: { protein: 20, carbs: 3, fat: 19 },
            matchedIngredients: ['Eggs', 'Baby Spinach', 'Parmesan Cheese'],
            pantryStaplesNeeded: ['Butter or olive oil', 'Salt', 'Cracked pepper'],
            optionalUpgrades: ['Pinch of nutmeg', 'Side salad'],
            instructions: [
              'Whisk 3 eggs with a pinch of salt until smooth and aerated.',
              'In a non-stick pan, wilt spinach in a dot of butter for 60 seconds, then set aside.',
              'Pour whisked eggs into low-medium pan, drawing curds inward with a silicone spatula.',
              'When bottom is set but surface is creamy, spoon in wilted spinach and freshly grated parmesan.',
              'Gently fold the omelette and slide onto a warm plate.',
            ],
          },
          {
            id: 'fr-3',
            title: 'Savory Spinach & Rice Porridge (Congee Bowl)',
            description: 'Ultra-digestible soothing Asian rice porridge simmered with wilted spinach and soft-poached egg.',
            prepTime: '5 mins',
            cookTime: '15 mins',
            difficulty: 'Medium',
            servings: 2,
            caloriesPerServing: 280,
            macros: { protein: 12, carbs: 45, fat: 6 },
            matchedIngredients: ['Cooked Jasmine Rice', 'Baby Spinach', 'Eggs', 'Garlic'],
            pantryStaplesNeeded: ['Water or stock', 'Salt', 'Ginger or pepper'],
            optionalUpgrades: ['Crispy garlic chips', 'Drizzle of tamari'],
            instructions: [
              'Simmer 1 cup cooked rice with 2.5 cups water or broth, stirring to break down starch.',
              'Add minced garlic and simmer until silky and velvety.',
              'Fold in tender baby spinach during the final 2 minutes until bright emerald.',
              'Top each steaming bowl with a soft poached egg and a sprinkle of parmesan or scallions.',
            ],
          },
        ],
      });
    }

    const parts: any[] = [];
    if (image) {
      const parsed = parseImageData(image);
      parts.push({
        inlineData: {
          mimeType: parsed.mimeType,
          data: parsed.data,
        },
      });
    }

    const promptText = `
You are the Zero-Waste Chef & Fridge Vision AI in Food Verse AI.
Inspect this fridge/pantry image or list of available ingredients:
- Ingredients list: ${ingredientTextList ? ingredientTextList.join(', ') : 'Extract from image'}
- Dietary Preferences: ${dietaryPreferences || 'None (Standard)'}
- Max Cooking Time: ${maxCookingTimeMinutes ? maxCookingTimeMinutes + ' minutes' : 'Flexible'}

1. Identify every visible edible ingredient, estimating its category, freshness condition, and shelf-life urgency.
2. Generate 3 distinct, creative, delicious recipes utilizing primarily these detected ingredients, minimizing food waste.
3. Return pure valid JSON conforming strictly to this structure:
{
  "detectedItems": [
    { "name": "Item name", "freshness": "Description e.g. Fresh / Consume Soon", "category": "Produce | Dairy & Eggs | Meat & Seafood | Bakery | Pantry", "shelfLifeDays": 4 }
  ],
  "recipes": [
    {
      "id": "recipe-1",
      "title": "Dish Title",
      "description": "Appetizing description highlighting zero-waste utility",
      "prepTime": "10 mins",
      "cookTime": "15 mins",
      "difficulty": "Easy | Medium | Advanced",
      "servings": 2,
      "caloriesPerServing": 380,
      "macros": { "protein": 22, "carbs": 35, "fat": 14 },
      "matchedIngredients": ["Ingredient A", "Ingredient B"],
      "pantryStaplesNeeded": ["Olive oil", "Salt", "Black pepper"],
      "optionalUpgrades": ["Parmesan", "Chili flakes"],
      "instructions": [
        "Step 1 instruction",
        "Step 2 instruction",
        "Step 3 instruction"
      ]
    }
  ]
}
Respond with only valid JSON.
`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawText);
    res.json(parsedData);
  } catch (error: any) {
    console.error('Error scanning fridge:', error);
    res.status(500).json({
      error: error.message || 'Failed to scan fridge and generate recipes.',
    });
  }
});

// -------------------------------------------------------------
// 4. Food Safety, Spoilage & Shelf-Life Auditor
// -------------------------------------------------------------
app.post('/api/safety-audit', async (req, res) => {
  try {
    const { image, foodName, storageType, daysStored, userObservations } = req.body;
    if (!image && !foodName && !userObservations) {
      return res.status(400).json({ error: 'Please provide food photo or food details to audit.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        mock: true,
        foodIdentified: foodName || 'Organic Hass Avocado & Salad Greens',
        verdict: 'SAFE',
        riskLevel: 'LOW',
        freshnessScore: 8,
        visualFindings: [
          'Natural enzymatic browning on outer skin, inside flesh remains vibrant chartreuse.',
          'No visible mycelium or fungal colonies detected.',
          'Cellular turgidity intact with no slimy bacterial exopolysaccharide layer.',
        ],
        shelfLifeRemaining: 'Consume within 2-3 days for peak flavor and antioxidant retention.',
        sensoryChecklist: [
          'Smell: Should have a mild buttery, slightly nutty aroma. Discard if sharp, rancid, or sour.',
          'Texture: Yields gently to light pressure on the palm without deep mushy indentations.',
          'Color: Golden-green inside; slight oxidation surface can be gently scraped off.',
        ],
        preservationAction: 'Store in airtight crisper drawer. If cut in half, keep pit in and brush with lemon juice or olive oil.',
        storageRecommendation: 'Keep at 38°F (3.3°C) in the vegetable crisper away from ethylene-emitting apples.',
      });
    }

    const parts: any[] = [];
    if (image) {
      const parsed = parseImageData(image);
      parts.push({
        inlineData: {
          mimeType: parsed.mimeType,
          data: parsed.data,
        },
      });
    }

    const promptText = `
You are the Food Safety & Microbiology Quality Auditor in Food Verse AI.
Audit this food sample for spoilage, foodborne pathogen risks, and shelf life:
- Food Name: ${foodName || 'Inspect from photo'}
- Storage Location: ${storageType || 'Fridge'}
- Days in Storage: ${daysStored ? daysStored + ' days' : 'Unknown'}
- User observations: ${userObservations || 'None'}

Provide a rigorous USDA / FDA-aligned food safety evaluation. Return pure valid JSON in this exact structure:
{
  "foodIdentified": "Identified item",
  "verdict": "SAFE | CONSUME_SOON | CAUTION | DISCARD",
  "riskLevel": "LOW | MODERATE | HIGH | CRITICAL",
  "freshnessScore": 8,
  "visualFindings": [
    "Observation 1 (e.g. slight enzymatic oxidation vs pathogenic mold)",
    "Observation 2"
  ],
  "shelfLifeRemaining": "Estimated safe consumption window",
  "sensoryChecklist": [
    "Smell test guidelines",
    "Texture & tactile check guidelines",
    "Color check"
  ],
  "preservationAction": "How to prolong shelf life safely right now",
  "storageRecommendation": "Ideal storage temperature and container guidelines"
}
Respond with only valid JSON.
`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawText);
    res.json(parsedData);
  } catch (error: any) {
    console.error('Error auditing food safety:', error);
    res.status(500).json({
      error: error.message || 'Failed to complete food safety audit.',
    });
  }
});

// -------------------------------------------------------------
// 5. Chef Verse Multimodal Culinary Assistant Chat
// -------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, image } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: "Greetings from Chef Verse! I'm here to assist with food science, culinary techniques, flavor balancing, ingredient swaps, and nutritional optimization. What are you cooking or curious about today?",
        suggestedPrompts: [
          'How do I fix an oversalted soup?',
          'What can I substitute for buttermilk?',
          'How to get crispy salmon skin without sticking?',
        ],
      });
    }

    const parts: any[] = [];
    if (image) {
      const parsed = parseImageData(image);
      parts.push({
        inlineData: {
          mimeType: parsed.mimeType,
          data: parsed.data,
        },
      });
    }

    // Build conversation context
    const conversationHistory = messages
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Chef Verse'}: ${m.content}`)
      .join('\n');

    const promptText = `
You are Chef Verse, the elite culinary mentor and food biochemist in Food Verse AI.
You provide encouraging, gourmet-grade cooking advice, molecular gastronomy tips, macro balancing, flavor pairing science, and cooking troubleshooting.

Conversation so far:
${conversationHistory}

If an image is attached, inspect the image to give hyper-specific advice (e.g. roux color, sear perfection, dough rise, plating aesthetic).

Format your response cleanly with clear markdown, bullet points for steps or swaps, and finish with 3 quick follow-up prompt ideas in a JSON block at the bottom like this:
---SUGGESTIONS---
["Question 1", "Question 2", "Question 3"]
`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
    });

    const fullResponse = response.text || '';
    let reply = fullResponse;
    let suggestedPrompts = [
      'How to elevate this flavor profile?',
      'What wine or non-alcoholic beverage pairs best?',
      'How can I meal prep this ahead of time?',
    ];

    if (fullResponse.includes('---SUGGESTIONS---')) {
      const [replyPart, suggestionsPart] = fullResponse.split('---SUGGESTIONS---');
      reply = replyPart.trim();
      try {
        const parsed = JSON.parse(suggestionsPart.trim());
        if (Array.isArray(parsed) && parsed.length > 0) {
          suggestedPrompts = parsed;
        }
      } catch (e) {
        // use defaults
      }
    }

    res.json({ reply, suggestedPrompts });
  } catch (error: any) {
    console.error('Error in culinary chat:', error);
    res.status(500).json({
      error: error.message || 'Culinary assistant encountered an issue.',
    });
  }
});

// -------------------------------------------------------------
// 6. Chef Voice Audio Guidance (Gemini 3.8 Flash Lite TTS)
// -------------------------------------------------------------
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text to speak is required.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({
        mock: true,
        message: 'TTS requires GEMINI_API_KEY. Browser Web Speech fallback available.',
      });
    }

    // Call Gemini 3.8 Flash Lite TTS
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 500), // Clean clip
              speechMetadata: {
                style: 'Warm, articulate, encouraging culinary chef instructor',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from Gemini TTS.' });
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error in TTS:', error);
    res.status(500).json({
      error: error.message || 'Failed to synthesize speech.',
    });
  }
});

// -------------------------------------------------------------
// 7. Curated Demo Food & Fridge Showcase Dataset
// -------------------------------------------------------------
app.get('/api/sample-dishes', (req, res) => {
  res.json({
    dishes: [
      {
        id: 'sample-salmon-bowl',
        name: 'Wild Salmon Quinoa & Edamame Bowl',
        category: 'High-Protein Bowl',
        thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        calories: 520,
        protein: 38,
        carbs: 45,
        fat: 18,
        highlight: 'Omega-3 Rich • 38g Protein • Anti-Inflammatory',
        description: 'Pan-seared Alaskan salmon fillet resting on fluffy tri-color quinoa, steamed edamame, cucumber ribbons, and tahini-ginger dressing.',
      },
      {
        id: 'sample-avocado-toast',
        name: 'Sourdough Avocado Toast with Poached Egg',
        category: 'Brunch & Breakfast',
        thumbnail: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
        calories: 385,
        protein: 16,
        carbs: 28,
        fat: 24,
        highlight: '9g Fiber • Heart Healthy Fats • Satiety 90/100',
        description: 'Toasted rustic sourdough topped with ripe smashed avocado, soft poached egg, radishes, and toasted pumpkin seeds.',
      },
      {
        id: 'sample-berry-acai',
        name: 'Antioxidant Wild Berry Acai Smoothie Bowl',
        category: 'Superfood Breakfast',
        thumbnail: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
        calories: 310,
        protein: 9,
        carbs: 58,
        fat: 7,
        highlight: 'Polyphenol Rich • Vegan • Clean Energy',
        description: 'Thick blended Amazonian acai, wild blueberries, sliced banana, cacao nibs, and coconut flakes.',
      },
      {
        id: 'sample-mediterranean-salad',
        name: 'Greek Mediterranean Salad with Feta & Olives',
        category: 'Low-Carb & Keto',
        thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        calories: 340,
        protein: 11,
        carbs: 14,
        fat: 26,
        highlight: 'Keto-Friendly • Gut-Friendly Olive Polyphenols',
        description: 'Crisp cucumbers, vine-ripened tomatoes, Kalamata olives, creamy sheep feta block, and cold-pressed extra virgin olive oil.',
      },
      {
        id: 'sample-ramen',
        name: 'Artisan Miso Ramen with Chashu & Soft Egg',
        category: 'Comfort & Umami',
        thumbnail: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
        calories: 680,
        protein: 34,
        carbs: 72,
        fat: 28,
        highlight: 'Collagen & Mineral Rich • Umami Powerhouse',
        description: 'Slow-simmered rich miso broth, springy handcrafted noodles, tender pork chashu, menma bamboo shoots, and a 6-minute jammy nitamago.',
      },
    ],
    sampleFridges: [
      {
        id: 'fridge-pantry-1',
        title: 'Weekly Fresh Market Fridge',
        thumbnail: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
        items: ['Farm Eggs', 'Baby Spinach', 'Parmesan', 'Cooked Jasmine Rice', 'Scallions', 'Greek Yogurt'],
      },
      {
        id: 'fridge-pantry-2',
        title: 'High-Protein Fitness Prep',
        thumbnail: 'https://images.unsplash.com/photo-1584990347449-397a060d5b4a?auto=format&fit=crop&w=800&q=80',
        items: ['Chicken Breast', 'Broccoli Florets', 'Sweet Potatoes', 'Bell Peppers', 'Garlic', 'Soy Sauce'],
      },
    ],
  });
});

// -------------------------------------------------------------
// Vite middleware in dev or static files in production
// -------------------------------------------------------------
async function setupServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Food Verse AI Server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
