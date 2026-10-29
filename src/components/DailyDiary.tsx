import React, { useState } from 'react';
import {
  BarChart3,
  Flame,
  Activity,
  Wheat,
  Heart,
  Plus,
  Trash2,
  Download,
  Calendar,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { LoggedMeal, UserPreferences } from '../types/food';

interface DailyDiaryProps {
  loggedMeals: LoggedMeal[];
  userPreferences: UserPreferences;
  onDeleteMeal: (id: string) => void;
  onAddCustomMeal: (meal: Omit<LoggedMeal, 'id' | 'timestamp'>) => void;
  onNavigateToScanner: () => void;
}

export const DailyDiary: React.FC<DailyDiaryProps> = ({
  loggedMeals,
  userPreferences,
  onDeleteMeal,
  onAddCustomMeal,
  onNavigateToScanner,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState(300);
  const [customProtein, setCustomProtein] = useState(20);
  const [customCarbs, setCustomCarbs] = useState(25);
  const [customFat, setCustomFat] = useState(10);
  const [customMealType, setCustomMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');

  // Aggregated totals
  const totalCalories = loggedMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = loggedMeals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = loggedMeals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFat = loggedMeals.reduce((acc, m) => acc + m.fat, 0);

  const calProgress = Math.min(100, Math.round((totalCalories / userPreferences.targetCalories) * 100));
  const proProgress = Math.min(100, Math.round((totalProtein / userPreferences.targetProtein) * 100));
  const carbProgress = Math.min(100, Math.round((totalCarbs / userPreferences.targetCarbs) * 100));
  const fatProgress = Math.min(100, Math.round((totalFat / userPreferences.targetFat) * 100));

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAddCustomMeal({
      name: customName.trim(),
      mealType: customMealType,
      calories: Number(customCalories),
      protein: Number(customProtein),
      carbs: Number(customCarbs),
      fat: Number(customFat),
    });
    setCustomName('');
    setShowAddModal(false);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(loggedMeals, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `foodverse-diary-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-orange-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            Nutritional Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Today's Food Diary & Macro Tracker
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mt-1">
            Every analyzed meal or quick entry updates your daily caloric and macronutrient targets in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Plus className="w-4 h-4 text-orange-400" />
            Quick Entry
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all"
          >
            <Download className="w-4 h-4" />
            Export Diary
          </button>
        </div>
      </div>

      {/* Daily Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              Calories
            </span>
            <span className="text-xs font-bold text-orange-400">{calProgress}%</span>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {totalCalories}{' '}
              <span className="text-xs font-normal text-slate-500">
                / {userPreferences.targetCalories} kcal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {userPreferences.targetCalories - totalCalories > 0
                ? `${userPreferences.targetCalories - totalCalories} kcal remaining`
                : `${totalCalories - userPreferences.targetCalories} kcal over target`}
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
              style={{ width: `${calProgress}%` }}
            />
          </div>
        </div>

        {/* Protein */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" />
              Protein
            </span>
            <span className="text-xs font-bold text-blue-400">{proProgress}%</span>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {totalProtein}g{' '}
              <span className="text-xs font-normal text-slate-500">
                / {userPreferences.targetProtein}g
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {Math.max(0, userPreferences.targetProtein - totalProtein)}g remaining
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${proProgress}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wheat className="w-4 h-4 text-amber-400" />
              Carbs
            </span>
            <span className="text-xs font-bold text-amber-400">{carbProgress}%</span>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {totalCarbs}g{' '}
              <span className="text-xs font-normal text-slate-500">
                / {userPreferences.targetCarbs}g
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {Math.max(0, userPreferences.targetCarbs - totalCarbs)}g remaining
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
              style={{ width: `${carbProgress}%` }}
            />
          </div>
        </div>

        {/* Fats */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400" />
              Fats
            </span>
            <span className="text-xs font-bold text-rose-400">{fatProgress}%</span>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {totalFat}g{' '}
              <span className="text-xs font-normal text-slate-500">
                / {userPreferences.targetFat}g
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {Math.max(0, userPreferences.targetFat - totalFat)}g remaining
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-400 transition-all duration-500"
              style={{ width: `${fatProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Logged Meals List */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-400" />
            Logged Items Today ({loggedMeals.length})
          </h2>
          <button
            onClick={onNavigateToScanner}
            className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
          >
            + Scan New Dish
          </button>
        </div>

        {loggedMeals.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500">
              <PieChart className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No meals logged yet today</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scan a plate with the Meal Vision camera or use Quick Entry to record your breakfast, lunch, or snack.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {loggedMeals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center gap-3">
                  {meal.imageUrl ? (
                    <img
                      src={meal.imageUrl}
                      alt={meal.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {meal.mealType[0]}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{meal.name}</h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-400">
                        {meal.mealType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="font-semibold text-white">{meal.calories} kcal</span>
                      <span>•</span>
                      <span className="text-blue-400">{meal.protein}g P</span>
                      <span>•</span>
                      <span className="text-amber-400">{meal.carbs}g C</span>
                      <span>•</span>
                      <span className="text-rose-400">{meal.fat}g F</span>
                      <span>•</span>
                      <span className="text-slate-500">{meal.timestamp}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteMeal(meal.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-all"
                  title="Remove from diary"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Custom Meal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Quick Log Meal</h3>
            <form onSubmit={handleCreateCustom} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Meal Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Oatmeal with Whey & Berries"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Meal Type</label>
                  <select
                    value={customMealType}
                    onChange={(e: any) => setCustomMealType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fats (g)</label>
                  <input
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
