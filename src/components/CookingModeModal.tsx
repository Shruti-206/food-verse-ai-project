import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  HelpCircle,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RecipeSuggestion, UserPreferences } from '../types/food';
import { playChefVoiceAudio, sendChefChatMessage } from '../services/api';

interface CookingModeModalProps {
  recipe: RecipeSuggestion;
  onClose: () => void;
  userPreferences: UserPreferences;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  recipe,
  onClose,
  userPreferences,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(180); // default 3 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [substitutionQuery, setSubstitutionQuery] = useState('');
  const [substitutionAnswer, setSubstitutionAnswer] = useState<string | null>(null);
  const [isAskingSub, setIsAskingSub] = useState(false);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Play ding chime
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.2);
      } catch (e) {
        // audio context not allowed
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const totalSteps = recipe.instructions.length;
  const currentStep = recipe.instructions[currentStepIndex];

  const handleReadCurrentStep = async () => {
    setIsSpeaking(true);
    const textToRead = `Step ${currentStepIndex + 1} of ${recipe.title}. ${currentStep}`;
    try {
      await playChefVoiceAudio(textToRead, userPreferences.preferredVoice);
    } finally {
      setIsSpeaking(false);
    }
  };

  const toggleStepCompleted = (idx: number) => {
    if (completedSteps.includes(idx)) {
      setCompletedSteps(completedSteps.filter((s) => s !== idx));
    } else {
      const nextCompleted = [...completedSteps, idx];
      setCompletedSteps(nextCompleted);
      if (nextCompleted.length === totalSteps) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      }
    }
  };

  const nextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleQuickTimerPreset = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(true);
  };

  const handleAskSubstitution = async () => {
    if (!substitutionQuery.trim()) return;
    setIsAskingSub(true);
    try {
      const result = await sendChefChatMessage({
        messages: [
          {
            role: 'user',
            content: `I am currently cooking "${recipe.title}". Quick substitution question: ${substitutionQuery}`,
          },
        ],
      });
      setSubstitutionAnswer(result.reply);
    } catch (e: any) {
      setSubstitutionAnswer('Substitute with equivalent cooking oil, butter, or broth as appropriate.');
    } finally {
      setIsAskingSub(false);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-5 sm:p-6 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <span>Interactive Cooking Mode</span>
              <span>•</span>
              <span>Hands-Free Chef Voice Guidance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{recipe.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Step Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
              <span>
                {Math.round((completedSteps.length / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Step Spotlight Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-slate-800/90 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Active Step {currentStepIndex + 1}
              </span>

              {/* Read Aloud Button */}
              <button
                onClick={handleReadCurrentStep}
                disabled={isSpeaking}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
              >
                <Volume2
                  className={`w-4 h-4 text-emerald-400 ${isSpeaking ? 'animate-pulse' : ''}`}
                />
                {isSpeaking ? 'Speaking Step...' : 'Read Aloud (TTS)'}
              </button>
            </div>

            <p className="text-lg sm:text-xl font-medium text-white leading-relaxed pt-2">
              {currentStep}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <button
                onClick={() => toggleStepCompleted(currentStepIndex)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  completedSteps.includes(currentStepIndex)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {completedSteps.includes(currentStepIndex) ? 'Completed' : 'Mark as Done'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextStep}
                  disabled={currentStepIndex === totalSteps - 1}
                  className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Kitchen Timer Widget */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Kitchen Timer
                </span>
                <div className="text-2xl font-black font-mono text-white">
                  {formatTimer(timerSeconds)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Presets */}
              <button
                onClick={() => handleQuickTimerPreset(1)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-300 hover:bg-slate-700"
              >
                1m
              </button>
              <button
                onClick={() => handleQuickTimerPreset(3)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-300 hover:bg-slate-700"
              >
                3m
              </button>
              <button
                onClick={() => handleQuickTimerPreset(5)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-300 hover:bg-slate-700"
              >
                5m
              </button>

              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all ${
                  isTimerRunning
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isTimerRunning ? 'Pause' : 'Start'}
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(180);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Chef Substitution Query */}
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Need a quick substitution or swap?
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={substitutionQuery}
                onChange={(e) => setSubstitutionQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskSubstitution()}
                placeholder="e.g. Can I swap butter for olive oil? or make this dairy-free?"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={handleAskSubstitution}
                disabled={isAskingSub || !substitutionQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold disabled:opacity-50"
              >
                {isAskingSub ? 'Asking...' : 'Ask Chef'}
              </button>
            </div>

            {substitutionAnswer && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed animate-fadeIn">
                <span className="font-bold text-orange-400 block mb-1">Chef Verse Tip:</span>
                {substitutionAnswer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
