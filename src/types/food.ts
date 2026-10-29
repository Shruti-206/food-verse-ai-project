/**
 * Food Verse AI - Core Type Definitions
 * Clean, well-commented types for Multimodal Food Intelligence
 */

export interface Micronutrient {
  name: string;
  amount: string;
  dailyValuePercentage?: number;
}

export interface IngredientPortion {
  name: string;
  estimatedWeightGrams: number;
  calories: number;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  saturatedFat?: number;
  cholesterol?: number;
  micronutrients?: Micronutrient[];
}

export interface MealAnalysisResult {
  dishName: string;
  cuisine: string;
  description: string;
  servingSizeEstimate: string;
  confidenceScore: number;
  nutrition: NutritionData;
  healthScore: number; // 0-100
  glycemicIndex: 'Low' | 'Medium' | 'High' | string;
  ingredients: IngredientPortion[];
  allergens: string[];
  dietaryBadges: string[];
  dietitianVerdict: string;
  smartTweaks: string[];
  mock?: boolean;
  imageThumbnail?: string;
  analyzedAt?: string;
}

export interface DetectedFridgeItem {
  name: string;
  freshness: string;
  category: 'Produce' | 'Dairy & Eggs' | 'Meat & Seafood' | 'Bakery' | 'Pantry' | string;
  shelfLifeDays?: number;
}

export interface RecipeSuggestion {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced' | string;
  servings: number;
  caloriesPerServing: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  matchedIngredients: string[];
  pantryStaplesNeeded: string[];
  optionalUpgrades: string[];
  instructions: string[];
}

export interface FridgeScanResult {
  detectedItems: DetectedFridgeItem[];
  recipes: RecipeSuggestion[];
  mock?: boolean;
}

export interface SafetyAuditResult {
  foodIdentified: string;
  verdict: 'SAFE' | 'CONSUME_SOON' | 'CAUTION' | 'DISCARD';
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  freshnessScore: number; // 1-10
  visualFindings: string[];
  shelfLifeRemaining: string;
  sensoryChecklist: string[];
  preservationAction: string;
  storageRecommendation: string;
  mock?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: string;
}

export interface LoggedMeal {
  id: string;
  name: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  timestamp: string;
  imageUrl?: string;
}

export interface UserPreferences {
  dietaryGoal: string;
  allergies: string[];
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  preferredVoice: 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon';
}

export interface SampleDish {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  highlight: string;
  description: string;
}

export interface SampleFridge {
  id: string;
  title: string;
  thumbnail: string;
  items: string[];
}
