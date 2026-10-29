import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MealVisionScanner } from './components/MealVisionScanner';
import { FridgeScanner } from './components/FridgeScanner';
import { SafetyAuditor } from './components/SafetyAuditor';
import { ChefChat } from './components/ChefChat';
import { DailyDiary } from './components/DailyDiary';
import { CookingModeModal } from './components/CookingModeModal';
import { PreferencesModal } from './components/PreferencesModal';
import { DeveloperGuideModal } from './components/DeveloperGuideModal';
import {
  LoggedMeal,
  UserPreferences,
  RecipeSuggestion,
  SampleDish,
  SampleFridge,
} from './types/food';
import { checkServerHealth, fetchSampleData, HealthResponse } from './services/api';

const DEFAULT_PREFERENCES: UserPreferences = {
  dietaryGoal: 'General Balanced & Wellness',
  allergies: ['Gluten / Wheat'],
  targetCalories: 2100,
  targetProtein: 135,
  targetCarbs: 210,
  targetFat: 70,
  preferredVoice: 'Kore',
};

const DEFAULT_INITIAL_MEALS: LoggedMeal[] = [
  {
    id: 'meal-init-1',
    name: 'Antioxidant Wild Berry Acai Bowl',
    mealType: 'Breakfast',
    calories: 310,
    protein: 9,
    carbs: 58,
    fat: 7,
    timestamp: '08:30 AM',
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=400&q=80',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'meal-vision' | 'fridge' | 'safety' | 'chat' | 'diary'>('meal-vision');
  const [healthInfo, setHealthInfo] = useState<HealthResponse | null>(null);
  const [sampleDishes, setSampleDishes] = useState<SampleDish[]>([]);
  const [sampleFridges, setSampleFridges] = useState<SampleFridge[]>([]);

  // Persistent user preferences
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('foodverse_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  // Persistent logged meals
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>(() => {
    try {
      const saved = localStorage.getItem('foodverse_diary');
      return saved ? JSON.parse(saved) : DEFAULT_INITIAL_MEALS;
    } catch {
      return DEFAULT_INITIAL_MEALS;
    }
  });

  // Modals state
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isDevGuideOpen, setIsDevGuideOpen] = useState(false);
  const [activeCookingRecipe, setActiveCookingRecipe] = useState<RecipeSuggestion | null>(null);

  // Cross-tab prompt hand-off to Chef Verse
  const [chefHandoffPrompt, setChefHandoffPrompt] = useState<string | undefined>(undefined);
  const [chefHandoffImage, setChefHandoffImage] = useState<string | undefined>(undefined);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('foodverse_preferences', JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to save preferences to localStorage', e);
    }
  }, [preferences]);

  useEffect(() => {
    try {
      localStorage.setItem('foodverse_diary', JSON.stringify(loggedMeals));
    } catch (e) {
      console.warn('Failed to save diary to localStorage', e);
    }
  }, [loggedMeals]);

  // Initial health check & sample data fetch
  useEffect(() => {
    checkServerHealth()
      .then(setHealthInfo)
      .catch((err) => console.warn('Health check note:', err));

    fetchSampleData()
      .then((data) => {
        setSampleDishes(data.dishes || []);
        setSampleFridges(data.sampleFridges || []);
      })
      .catch((err) => console.warn('Sample data load note:', err));
  }, []);

  const handleLogMeal = (mealData: Omit<LoggedMeal, 'id' | 'timestamp'>) => {
    const newMeal: LoggedMeal = {
      ...mealData,
      id: `meal-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setLoggedMeals((prev) => [newMeal, ...prev]);
  };

  const handleDeleteMeal = (id: string) => {
    setLoggedMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const handleNavigateToChef = (initialPrompt: string, image?: string) => {
    setChefHandoffPrompt(initialPrompt);
    setChefHandoffImage(image);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col culinary-mesh selection:bg-orange-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
        onOpenDevGuide={() => setIsDevGuideOpen(true)}
        healthInfo={healthInfo}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'meal-vision' && (
          <MealVisionScanner
            userPreferences={preferences}
            onLogMeal={handleLogMeal}
            onNavigateToChef={handleNavigateToChef}
            sampleDishes={sampleDishes}
          />
        )}

        {activeTab === 'fridge' && (
          <FridgeScanner
            userPreferences={preferences}
            onSelectRecipeForCooking={(recipe) => setActiveCookingRecipe(recipe)}
            sampleFridges={sampleFridges}
          />
        )}

        {activeTab === 'safety' && <SafetyAuditor />}

        {activeTab === 'chat' && (
          <ChefChat
            userPreferences={preferences}
            initialPrompt={chefHandoffPrompt}
            initialImage={chefHandoffImage}
          />
        )}

        {activeTab === 'diary' && (
          <DailyDiary
            loggedMeals={loggedMeals}
            userPreferences={preferences}
            onDeleteMeal={handleDeleteMeal}
            onAddCustomMeal={handleLogMeal}
            onNavigateToScanner={() => setActiveTab('meal-vision')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Food Verse AI</span>
            <span>•</span>
            <span>Multimodal Food Intelligence Agent</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsDevGuideOpen(true)}
              className="hover:text-emerald-400 transition-colors"
            >
              Architecture & Local Setup
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPreferencesOpen(true)}
              className="hover:text-orange-400 transition-colors"
            >
              Dietary Goals
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {activeCookingRecipe && (
        <CookingModeModal
          recipe={activeCookingRecipe}
          onClose={() => setActiveCookingRecipe(null)}
          userPreferences={preferences}
        />
      )}

      {isPreferencesOpen && (
        <PreferencesModal
          preferences={preferences}
          onSave={setPreferences}
          onClose={() => setIsPreferencesOpen(false)}
        />
      )}

      {isDevGuideOpen && (
        <DeveloperGuideModal onClose={() => setIsDevGuideOpen(false)} />
      )}
    </div>
  );
}
