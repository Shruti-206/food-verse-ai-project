import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Flame,
  Activity,
  Heart,
  AlertCircle,
  PlusCircle,
  CheckCircle,
  CheckCircle2,
  RotateCw,
  RefreshCw,
  Zap,
  Info,
  ChevronRight,
  MessageSquare,
  Wheat,
  UtensilsCrossed,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  MealAnalysisResult,
  SampleDish,
  UserPreferences,
  LoggedMeal,
} from '../types/food';
import { analyzeMealApi } from '../services/api';

interface MealVisionScannerProps {
  userPreferences: UserPreferences;
  onLogMeal: (meal: Omit<LoggedMeal, 'id' | 'timestamp'>) => void;
  onNavigateToChef: (initialPrompt: string, image?: string) => void;
  sampleDishes: SampleDish[];
}

export const MealVisionScanner: React.FC<MealVisionScannerProps> = ({
  userPreferences,
  onLogMeal,
  onNavigateToChef,
  sampleDishes,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize with sample dish on first load if no result exists
  useEffect(() => {
    if (!analysisResult && sampleDishes.length > 0 && !selectedImage) {
      const defaultDish = sampleDishes[0];
      setSelectedImage(defaultDish.thumbnail);
    }
  }, [sampleDishes]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('Camera access denied or unavailable. You can upload an image instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      stopCamera();
      triggerAnalysis(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        triggerAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectSample = (sample: SampleDish) => {
    stopCamera();
    setSelectedImage(sample.thumbnail);
    setCustomText(sample.name);
    triggerAnalysis(sample.thumbnail, sample.name);
  };

  const triggerAnalysis = async (imgToAnalyze?: string, textOverride?: string) => {
    const targetImage = imgToAnalyze || selectedImage;
    const targetText = textOverride !== undefined ? textOverride : customText;

    if (!targetImage && !targetText) {
      setError('Please provide a food photo or enter dish details.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setIsLogged(false);

    try {
      const result = await analyzeMealApi({
        image: targetImage || undefined,
        textDescription: targetText || undefined,
        dietaryGoal: userPreferences.dietaryGoal,
        userAllergies: userPreferences.allergies,
      });
      setAnalysisResult({
        ...result,
        imageThumbnail: targetImage || undefined,
        analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze meal with Gemini multimodal vision.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogMeal = () => {
    if (!analysisResult) return;
    onLogMeal({
      name: analysisResult.dishName,
      mealType: 'Lunch',
      calories: analysisResult.nutrition.calories,
      protein: analysisResult.nutrition.protein,
      carbs: analysisResult.nutrition.carbs,
      fat: analysisResult.nutrition.fat,
      fiber: analysisResult.nutrition.fiber,
      imageUrl: analysisResult.imageThumbnail,
    });
    setIsLogged(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#10b981', '#f59e0b', '#3b82f6'],
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-orange-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Zap className="w-3.5 h-3.5" />
            Multimodal Food Intelligence Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Meal Vision & Macro Scanner
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mt-1">
            Capture or upload any meal. Gemini Vision identifies the dish, breaks down portion weights,
            calculates complete macros and micronutrients, scores nutritional density, and audits allergens.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => triggerAnalysis()}
            disabled={isAnalyzing || (!selectedImage && !customText)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Scanning with Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Plate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Upload & Viewfinder on Left, Analysis Report on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Visual Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
            <h2 className="text-base font-bold text-white mb-3 flex items-center justify-between">
              <span>Visual Food Input</span>
              {selectedImage && (
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalysisResult(null);
                    stopCamera();
                  }}
                  className="text-xs text-slate-400 hover:text-orange-400 flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  Clear
                </button>
              )}
            </h2>

            {/* Viewfinder / Upload Preview */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-slate-800 flex items-center justify-center group">
              {isCameraActive ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-orange-500/50 rounded-2xl pointer-events-none" />
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 z-20">
                    <button
                      onClick={capturePhoto}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-xl transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      Take Snapshot
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2.5 rounded-full bg-slate-800/90 text-slate-200 text-sm font-semibold hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : selectedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={selectedImage}
                    alt="Food to analyze"
                    className="w-full h-full object-cover"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
                        <Sparkles className="w-6 h-6 text-orange-400 absolute inset-0 m-auto" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">Analyzing Food Matrix</p>
                        <p className="text-xs text-slate-400">Gemini 3.8 Flash Vision Scanning...</p>
                      </div>
                    </div>
                  )}
                  {!isAnalyzing && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold backdrop-blur-md border border-slate-700 shadow-md"
                      >
                        Change Photo
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Snap or Upload Your Meal</p>
                    <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, WebP</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={startCamera}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
                    >
                      <Camera className="w-3.5 h-3.5 text-orange-400" />
                      Live Camera
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-all shadow-md shadow-orange-500/20"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload File
                    </button>
                  </div>
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

            {/* Quick text / recipe context input */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Additional Notes or Cooking Details (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g. Cooked in 1 tbsp olive oil, no added sugar, large serving"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Curated Demo Dishes for 1-Click Testing */}
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick Demo Showcase Dishes
              </h3>
              <span className="text-[11px] text-slate-500">Instant 1-Click Fill</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {sampleDishes.map((dish) => (
                <button
                  key={dish.id}
                  onClick={() => selectSample(dish)}
                  className="group relative rounded-2xl overflow-hidden border border-slate-800 hover:border-orange-500/60 transition-all text-left bg-slate-950"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={dish.thumbnail}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold text-slate-200 truncate group-hover:text-orange-400">
                      {dish.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {dish.calories} kcal • {dish.protein}g protein
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Multimodal Intelligence Report */}
        <div className="lg:col-span-7 space-y-6">
          {analysisResult ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Title Card */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {analysisResult.cuisine}
                      </span>
                      <span className="text-xs text-slate-400">
                        Portion: {analysisResult.servingSizeEstimate}
                      </span>
                      <span className="text-xs text-emerald-400 font-medium">
                        • {Math.round(analysisResult.confidenceScore * 100)}% Match
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                      {analysisResult.dishName}
                    </h2>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      {analysisResult.description}
                    </p>
                  </div>

                  {/* Health Score Gauge */}
                  <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[90px]">
                    <div className="text-2xl font-black text-emerald-400">
                      {analysisResult.healthScore}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Health Index
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      GI: {analysisResult.glycemicIndex}
                    </span>
                  </div>
                </div>

                {/* Dietary Badges */}
                {analysisResult.dietaryBadges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-800/80">
                    {analysisResult.dietaryBadges.map((badge, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      >
                        ✓ {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Macro & Nutrition Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Calories */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="w-8 h-8 mx-auto rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-2">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {analysisResult.nutrition.calories}
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Calories</span>
                  <div className="mt-2 text-[10px] text-slate-500">
                    {Math.round(
                      (analysisResult.nutrition.calories / userPreferences.targetCalories) * 100
                    )}% of daily {userPreferences.targetCalories}
                  </div>
                </div>

                {/* Protein */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="w-8 h-8 mx-auto rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-blue-400">
                    {analysisResult.nutrition.protein}g
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Protein</span>
                  <div className="mt-2 text-[10px] text-slate-500">
                    {Math.round(
                      (analysisResult.nutrition.protein / userPreferences.targetProtein) * 100
                    )}% of daily {userPreferences.targetProtein}g
                  </div>
                </div>

                {/* Carbs */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="w-8 h-8 mx-auto rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
                    <Wheat className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-amber-400">
                    {analysisResult.nutrition.carbs}g
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Carbohydrates</span>
                  <div className="mt-2 text-[10px] text-slate-500">
                    Fiber: {analysisResult.nutrition.fiber}g • Sugar: {analysisResult.nutrition.sugar}g
                  </div>
                </div>

                {/* Fats */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="w-8 h-8 mx-auto rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-rose-400">
                    {analysisResult.nutrition.fat}g
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Total Fats</span>
                  <div className="mt-2 text-[10px] text-slate-500">
                    Sodium: {analysisResult.nutrition.sodium}mg
                  </div>
                </div>
              </div>

              {/* Ingredients & Estimated Portions */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-orange-400" />
                  Detected Plate Ingredients & Estimated Weights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {analysisResult.ingredients.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{item.name}</p>
                        <p className="text-[11px] text-slate-400">~{item.estimatedWeightGrams}g portion</p>
                      </div>
                      <span className="text-xs font-bold text-orange-400">
                        {item.calories} kcal
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergens warning banner if any */}
              {analysisResult.allergens && analysisResult.allergens.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Allergen & Sensitivity Notice
                    </h4>
                    <p className="text-xs text-amber-200/90 mt-1">
                      Contains: {analysisResult.allergens.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Dietitian Clinical Verdict & Actionable Tweaks */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Dietitian Nutritional Appraisal
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {analysisResult.dietitianVerdict}
                  </p>
                </div>

                {analysisResult.smartTweaks.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Recommended Smart Tweaks
                    </h5>
                    <ul className="space-y-1.5">
                      {analysisResult.smartTweaks.map((tweak, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                          <span className="text-orange-400 font-bold">•</span>
                          <span>{tweak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons: Log Meal & Ask Chef Verse */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleLogMeal}
                  disabled={isLogged}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg transition-all ${
                    isLogged
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                  }`}
                >
                  {isLogged ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Logged to Daily Diary
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      Log to Daily Diary ({analysisResult.nutrition.calories} kcal)
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    onNavigateToChef(
                      `I just analyzed ${analysisResult.dishName}. How can I cook a healthier homemade version of this, and what are good seasoning pairings?`,
                      analysisResult.imageThumbnail
                    )
                  }
                  className="flex items-center gap-2 py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-orange-400" />
                  Ask Chef About Dish
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800/60 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-300">Awaiting Plate Scan</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Upload an image of your meal or select one of the demo showcase dishes on the left to see full multimodal breakdown.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
