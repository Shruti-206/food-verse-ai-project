import React, { useState } from 'react';
import { X, SlidersHorizontal, Check, Volume2, Shield } from 'lucide-react';
import { UserPreferences } from '../types/food';

interface PreferencesModalProps {
  preferences: UserPreferences;
  onSave: (newPrefs: UserPreferences) => void;
  onClose: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  preferences,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<UserPreferences>({ ...preferences });

  const dietPresets: Record<string, { cal: number; p: number; c: number; f: number }> = {
    'General Balanced & Wellness': { cal: 2000, p: 120, c: 220, f: 65 },
    'High-Protein Athletic / Hypertrophy': { cal: 2300, p: 175, c: 230, f: 65 },
    'Low-Carb / Ketogenic': { cal: 1900, p: 130, c: 35, f: 140 },
    'Plant-Based / Vegan': { cal: 1950, p: 100, c: 260, f: 55 },
    'Mediterranean Heart Health': { cal: 2050, p: 115, c: 210, f: 80 },
  };

  const allergenOptions = [
    'Gluten / Wheat',
    'Dairy / Lactose',
    'Peanuts',
    'Tree Nuts (Almonds, Walnuts, etc.)',
    'Shellfish / Crustaceans',
    'Eggs',
    'Soy',
    'Sesame',
  ];

  const voiceOptions = [
    { id: 'Kore', label: 'Kore (Warm, balanced culinary instructor)' },
    { id: 'Puck', label: 'Puck (Enthusiastic, energetic chef)' },
    { id: 'Zephyr', label: 'Zephyr (Calm, articulate guidance)' },
    { id: 'Fenrir', label: 'Fenrir (Deep, resonant authoritative)' },
    { id: 'Charon', label: 'Charon (Refined, gourmet style)' },
  ];

  const handleDietPresetChange = (dietName: string) => {
    const preset = dietPresets[dietName];
    if (preset) {
      setFormData({
        ...formData,
        dietaryGoal: dietName,
        targetCalories: preset.cal,
        targetProtein: preset.p,
        targetCarbs: preset.c,
        targetFat: preset.f,
      });
    } else {
      setFormData({ ...formData, dietaryGoal: dietName });
    }
  };

  const toggleAllergen = (allergen: string) => {
    if (formData.allergies.includes(allergen)) {
      setFormData({
        ...formData,
        allergies: formData.allergies.filter((a) => a !== allergen),
      });
    } else {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, allergen],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-900/90 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Dietary & Voice Preferences</h2>
              <p className="text-xs text-slate-400">Personalize macro targets, allergies, and chef voice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dietary Lifestyle */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Dietary Lifestyle & Focus
            </label>
            <select
              value={formData.dietaryGoal}
              onChange={(e) => handleDietPresetChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
            >
              {Object.keys(dietPresets).map((diet) => (
                <option key={diet} value={diet}>
                  {diet}
                </option>
              ))}
              <option value="Custom Nutritional Protocol">Custom Nutritional Protocol</option>
            </select>
          </div>

          {/* Daily Macro Targets */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Daily Target Macros
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  value={formData.targetCalories}
                  onChange={(e) =>
                    setFormData({ ...formData, targetCalories: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-blue-400 mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={formData.targetProtein}
                  onChange={(e) =>
                    setFormData({ ...formData, targetProtein: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-amber-400 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={formData.targetCarbs}
                  onChange={(e) =>
                    setFormData({ ...formData, targetCarbs: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-rose-400 mb-1">Fats (g)</label>
                <input
                  type="number"
                  value={formData.targetFat}
                  onChange={(e) => setFormData({ ...formData, targetFat: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>
            </div>
          </div>

          {/* Known Allergies & Sensitivities */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Allergens & Intolerances (Audit Alert Trigger)
            </label>
            <p className="text-xs text-slate-400">
              The AI will automatically flag dishes containing these allergens and recommend safe swaps.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {allergenOptions.map((allergen) => {
                const isSelected = formData.allergies.includes(allergen);
                return (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => toggleAllergen(allergen)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{allergen}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Chef Voice (TTS) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              Chef Voice Persona (Gemini 3.8 Flash Lite TTS)
            </label>
            <select
              value={formData.preferredVoice}
              onChange={(e: any) => setFormData({ ...formData, preferredVoice: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {voiceOptions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
