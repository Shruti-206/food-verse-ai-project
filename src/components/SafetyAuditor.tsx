import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Camera,
  RefreshCw,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  Thermometer,
  Calendar,
  Eye,
} from 'lucide-react';
import { SafetyAuditResult } from '../types/food';
import { auditFoodSafetyApi } from '../services/api';

export const SafetyAuditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [foodName, setFoodName] = useState('Leftover Grilled Chicken & Salad');
  const [storageType, setStorageType] = useState('Fridge');
  const [daysStored, setDaysStored] = useState(3);
  const [userObservations, setUserObservations] = useState(
    'Slight moisture on surface, no foul odor detected'
  );
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<SafetyAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleScenarios = [
    {
      title: 'Avocado with brown spots',
      name: 'Hass Avocado (cut in half)',
      storage: 'Fridge',
      days: 2,
      obs: 'Brown discoloration on top layer, smells fine and nutty',
      img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Cooked Chicken Breast Day 4',
      name: 'Roasted Chicken Breast Leftovers',
      storage: 'Fridge',
      days: 4,
      obs: 'Slightly dry edges, stored in airtight Tupperware',
      img: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Greek Yogurt 3 Days Past Date',
      name: 'Plain Greek Yogurt',
      storage: 'Fridge',
      days: 12,
      obs: 'Clear whey liquid separation on top, sealed container',
      img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        triggerAudit(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectScenario = (sc: typeof sampleScenarios[0]) => {
    setSelectedImage(sc.img);
    setFoodName(sc.name);
    setStorageType(sc.storage);
    setDaysStored(sc.days);
    setUserObservations(sc.obs);
    triggerAudit(sc.img, sc.name, sc.storage, sc.days, sc.obs);
  };

  const triggerAudit = async (
    imgOverride?: string,
    nameOverride?: string,
    storageOverride?: string,
    daysOverride?: number,
    obsOverride?: string
  ) => {
    setIsAuditing(true);
    setError(null);

    try {
      const res = await auditFoodSafetyApi({
        image: imgOverride !== undefined ? imgOverride : selectedImage || undefined,
        foodName: nameOverride !== undefined ? nameOverride : foodName,
        storageType: storageOverride !== undefined ? storageOverride : storageType,
        daysStored: daysOverride !== undefined ? daysOverride : daysStored,
        userObservations: obsOverride !== undefined ? obsOverride : userObservations,
      });
      setAuditResult(res);
    } catch (err: any) {
      console.error('Safety audit error:', err);
      setError(err.message || 'Failed to complete safety audit.');
    } finally {
      setIsAuditing(false);
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'SAFE':
        return {
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
          label: 'Safe to Consume',
        };
      case 'CONSUME_SOON':
        return {
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          label: 'Consume Promptly',
        };
      case 'CAUTION':
        return {
          bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
          label: 'Caution / Sensory Check Required',
        };
      default:
        return {
          bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          icon: <XCircle className="w-5 h-5 text-rose-400" />,
          label: 'Discard - Pathogen / Spoilage Risk',
        };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            Microbiology & Spoilage Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Food Safety & Shelf-Life Auditor
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mt-1">
            Unsure if that leftover or refrigerated item is still safe? Multimodal Gemini audits visual
            oxidation, mold risks, bacterial indicators, and USDA safety guidelines to prevent food poisoning.
          </p>
        </div>

        <button
          onClick={() => triggerAudit()}
          disabled={isAuditing}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
        >
          {isAuditing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Auditing Safety...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run Safety Audit
            </>
          )}
        </button>
      </div>

      {/* Grid: Form on Left, Audit Report on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Food Inspection Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center justify-between">
              <span>Food Sample Details</span>
              {selectedImage && (
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-xs text-slate-400 hover:text-amber-400"
                >
                  Clear Photo
                </button>
              )}
            </h2>

            {/* Photo upload box */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-slate-800 flex items-center justify-center">
              {selectedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={selectedImage}
                    alt="Food item under inspection"
                    className="w-full h-full object-cover"
                  />
                  {isAuditing && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-center p-4">
                      <div className="w-12 h-12 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" />
                      <p className="text-xs font-bold text-white">Inspecting Visual Indicators...</p>
                    </div>
                  )}
                  {!isAuditing && (
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
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Upload Food or Leftover Photo</p>
                    <p className="text-xs text-slate-400 mt-0.5">Captures discoloration, slime, or mold</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 mx-auto rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md shadow-amber-500/20"
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

            {/* Food Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Food Name / Description
              </label>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Cooked salmon, open almond milk, stew"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Storage Type & Days in Storage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Storage Location
                </label>
                <select
                  value={storageType}
                  onChange={(e) => setStorageType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Fridge">Refrigerator (38°F / 3°C)</option>
                  <option value="Freezer">Freezer (0°F / -18°C)</option>
                  <option value="Pantry">Pantry / Room Temp</option>
                  <option value="Countertop">Countertop (Open Air)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Days in Storage: <span className="text-amber-400 font-bold">{daysStored}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="14"
                  value={daysStored}
                  onChange={(e) => setDaysStored(Number(e.target.value))}
                  className="w-full accent-amber-500 mt-2"
                />
              </div>
            </div>

            {/* User Observations */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sensory Observations (Smell, Texture, Liquid)
              </label>
              <textarea
                rows={2}
                value={userObservations}
                onChange={(e) => setUserObservations(e.target.value)}
                placeholder="e.g. Looks okay, slight sour note, white film on top..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Preset Test Scenarios */}
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Common Safety Test Scenarios
            </h3>
            <div className="space-y-2">
              {sampleScenarios.map((sc, idx) => (
                <button
                  key={idx}
                  onClick={() => selectScenario(sc)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-amber-400">
                      {sc.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {sc.days} days in {sc.storage}
                    </p>
                  </div>
                  <span className="text-[11px] text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Audit →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Microbiological & Safety Verdict Card */}
        <div className="lg:col-span-7 space-y-6">
          {auditResult ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Verdict Banner */}
              {(() => {
                const badge = getVerdictBadge(auditResult.verdict);
                return (
                  <div
                    className={`p-6 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${badge.bg}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/10">
                        {badge.icon}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">
                          AI Safety Assessment
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black">{badge.label}</h3>
                        <p className="text-xs opacity-90 mt-0.5">
                          Risk Level: <strong>{auditResult.riskLevel}</strong> • Item: {auditResult.foodIdentified}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 py-2 rounded-2xl bg-slate-950/60 border border-white/10 text-center self-stretch sm:self-auto">
                      <div className="text-xl font-black">{auditResult.freshnessScore} / 10</div>
                      <span className="text-[10px] font-semibold opacity-75">Freshness Index</span>
                    </div>
                  </div>
                );
              })()}

              {/* Shelf Life & Immediate Preservation Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Remaining Safe Window
                  </span>
                  <p className="text-sm font-semibold text-slate-200">
                    {auditResult.shelfLifeRemaining}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
                    Storage Recommendation
                  </span>
                  <p className="text-xs text-slate-300">
                    {auditResult.storageRecommendation}
                  </p>
                </div>
              </div>

              {/* Visual Findings List */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  Multimodal Visual Inspection Findings
                </h4>
                <div className="space-y-2">
                  {auditResult.visualFindings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sensory Checklist (Smell, Texture, Color) */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Sensory Verification Checklist (Before Eating)
                </h4>
                <div className="space-y-2">
                  {auditResult.sensoryChecklist.map((check, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Immediate Preservation Action */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-amber-500/30 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                  Actionable Preservation Step
                </span>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {auditResult.preservationAction}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800/60 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-300">Ready for Safety Audit</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Upload a photo or choose one of the common test scenarios on the left to evaluate microbiological risk and shelf life.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
