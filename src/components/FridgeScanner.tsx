import React, { useState, useRef, useEffect } from 'react';
import {
  Refrigerator,
  Camera,
  Upload,
  Sparkles,
  ChefHat,
  Clock,
  Flame,
  Check,
  AlertTriangle,
  Play,
  Volume2,
  RefreshCw,
  Plus,
  X,
  Layers,
  Zap,
} from 'lucide-react';
import {
  FridgeScanResult,
  RecipeSuggestion,
  SampleFridge,
  UserPreferences,
} from '../types/food';
import { scanFridgeApi, playChefVoiceAudio } from '../services/api';

interface FridgeScannerProps {
  userPreferences: UserPreferences;
  onSelectRecipeForCooking: (recipe: RecipeSuggestion) => void;
  sampleFridges: SampleFridge[];
}

export const FridgeScanner: React.FC<FridgeScannerProps> = ({
  userPreferences,
  onSelectRecipeForCooking,
  sampleFridges,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ingredientTags, setIngredientTags] = useState<string[]>([
    'Eggs',
    'Baby Spinach',
    'Parmesan Cheese',
    'Cooked Jasmine Rice',
    'Scallions',
  ]);
  const [newTagInput, setNewTagInput] = useState('');
  const [maxTime, setMaxTime] = useState<number>(30);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<FridgeScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with sample fridge on mount if none scanned
  useEffect(() => {
    if (!scanResult && sampleFridges.length > 0 && !selectedImage) {
      setSelectedImage(sampleFridges[0].thumbnail);
    }
  }, [sampleFridges]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        triggerFridgeScan(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectSampleFridge = (sample: SampleFridge) => {
    setSelectedImage(sample.thumbnail);
    setIngredientTags(sample.items);
    triggerFridgeScan(sample.thumbnail, sample.items);
  };

  const addIngredientTag = () => {
    if (!newTagInput.trim()) return;
    if (!ingredientTags.includes(newTagInput.trim())) {
      setIngredientTags([...ingredientTags, newTagInput.trim()]);
    }
    setNewTagInput('');
  };

  const removeIngredientTag = (index: number) => {
    setIngredientTags(ingredientTags.filter((_, i) => i !== index));
  };

  const triggerFridgeScan = async (imgToScan?: string, tagsToUse?: string[]) => {
    const targetImage = imgToScan || selectedImage;
    const targetTags = tagsToUse || ingredientTags;

    if (!targetImage && targetTags.length === 0) {
      setError('Please provide a fridge photo or enter at least one ingredient.');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const result = await scanFridgeApi({
        image: targetImage || undefined,
        ingredientTextList: targetTags.length > 0 ? targetTags : undefined,
        dietaryPreferences: userPreferences.dietaryGoal,
        maxCookingTimeMinutes: maxTime,
      });
      setScanResult(result);
    } catch (err: any) {
      console.error('Fridge scan error:', err);
      setError(err.message || 'Failed to scan fridge and generate zero-waste recipes.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleHearRecipeIntro = async (recipe: RecipeSuggestion) => {
    setIsSpeakingId(recipe.id);
    const script = `Here is ${recipe.title}. ${recipe.description}. It takes ${recipe.cookTime} to cook with approximately ${recipe.caloriesPerServing} calories and ${recipe.macros.protein} grams of protein. Ready when you are!`;
    try {
      await playChefVoiceAudio(script, userPreferences.preferredVoice);
    } finally {
      setIsSpeakingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Refrigerator className="w-3.5 h-3.5" />
            Zero-Waste Culinary Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Smart Fridge Vision & Recipe Generator
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mt-1">
            Snap your open fridge or pantry shelves. Gemini identifies ingredients, assesses freshness
            urgency, and engineers 3 personalized recipes to turn scraps into gourmet meals.
          </p>
        </div>

        <button
          onClick={() => triggerFridgeScan()}
          disabled={isScanning || (!selectedImage && ingredientTags.length === 0)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Scanning Fridge...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Recipes
            </>
          )}
        </button>
      </div>

      {/* Grid: Inputs (Photo & Tag List) on Left, Recipes on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Fridge Photo & Items */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center justify-between">
              <span>Fridge / Shelf Image</span>
              {selectedImage && (
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-xs text-slate-400 hover:text-emerald-400"
                >
                  Clear Photo
                </button>
              )}
            </h2>

            {/* Photo preview or upload box */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-slate-800 flex items-center justify-center">
              {selectedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={selectedImage}
                    alt="Fridge or pantry view"
                    className="w-full h-full object-cover"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                      <p className="text-xs font-bold text-white">Detecting Items in Fridge...</p>
                    </div>
                  )}
                  {!isScanning && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/90 text-slate-200 text-xs font-semibold backdrop-blur-md border border-slate-700"
                    >
                      Change Photo
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Refrigerator className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Upload Fridge or Shelf Photo</p>
                    <p className="text-xs text-slate-400 mt-0.5">Let Gemini detect what you have</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 mx-auto rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Browse Photo
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Manual Tag List */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Fridge Ingredients List
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addIngredientTag()}
                  placeholder="e.g. Greek yogurt, bell pepper..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={addIngredientTag}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tags Cloud */}
              <div className="flex flex-wrap gap-1.5">
                {ingredientTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-800/90 text-slate-300 border border-slate-700/80"
                  >
                    {tag}
                    <button
                      onClick={() => removeIngredientTag(idx)}
                      className="hover:text-rose-400 text-slate-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Cooking Time Preference */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-semibold text-slate-300">Max Cooking Time</span>
                <span className="text-emerald-400 font-bold">{maxTime} minutes</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={maxTime}
                onChange={(e) => setMaxTime(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Preset Sample Fridges */}
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Demo Showcase Fridges
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {sampleFridges.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => selectSampleFridge(sample)}
                  className="group rounded-2xl overflow-hidden border border-slate-800 hover:border-emerald-500/60 bg-slate-950 text-left transition-all"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={sample.thumbnail}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-bold text-slate-200 truncate group-hover:text-emerald-400">
                      {sample.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {sample.items.join(', ')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Detected Items & Zero-Waste Recipe Cards */}
        <div className="lg:col-span-7 space-y-6">
          {scanResult ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Detected Items Strip */}
              {scanResult.detectedItems && scanResult.detectedItems.length > 0 && (
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    AI Detected Inventory & Freshness Assessment
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {scanResult.detectedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-200">{item.name}</span>
                          <span className="text-slate-500 text-[10px] block">
                            {item.category}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.freshness}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recipe Cards List */}
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-emerald-400" />
                  3 Zero-Waste Chef Recipes
                </h3>

                {scanResult.recipes.map((recipe, index) => (
                  <div
                    key={recipe.id || index}
                    className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-xl space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {recipe.difficulty}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {recipe.cookTime} cook ({recipe.prepTime} prep)
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-white">{recipe.title}</h4>
                      </div>

                      {/* Calorie & Protein pill */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span className="font-bold text-white">
                          {recipe.caloriesPerServing} kcal
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-blue-400 font-semibold">
                          {recipe.macros.protein}g protein
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {recipe.description}
                    </p>

                    {/* Matched vs Pantry Staples */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="font-bold text-emerald-400 block mb-1">
                          ✓ Using from your fridge:
                        </span>
                        <p className="text-slate-300">{recipe.matchedIngredients.join(', ')}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="font-bold text-amber-400 block mb-1">
                          + Pantry staples:
                        </span>
                        <p className="text-slate-300">{recipe.pantryStaplesNeeded.join(', ')}</p>
                      </div>
                    </div>

                    {/* Action buttons: Start Hands-Free Cooking Mode & Hear Chef Voice */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => onSelectRecipeForCooking(recipe)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Cook in Hands-Free Mode
                      </button>

                      <button
                        onClick={() => handleHearRecipeIntro(recipe)}
                        disabled={isSpeakingId === recipe.id}
                        title="Listen to Chef Voice intro via Gemini TTS"
                        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-all"
                      >
                        <Volume2
                          className={`w-4 h-4 text-emerald-400 ${
                            isSpeakingId === recipe.id ? 'animate-bounce' : ''
                          }`}
                        />
                        <span className="hidden sm:inline">Hear Chef</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800/60 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <ChefHat className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-300">Ready to Scan Inventory</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Click 'Generate Recipes' or select one of the demo fridges to create 3 zero-waste meals from what you have on hand.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
