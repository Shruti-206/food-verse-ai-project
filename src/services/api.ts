/**
 * Food Verse AI - API Client Service
 * Connects frontend React components to full-stack Express & Gemini backend
 */

import {
  MealAnalysisResult,
  FridgeScanResult,
  SafetyAuditResult,
  SampleDish,
  SampleFridge,
} from '../types/food';

export interface HealthResponse {
  status: string;
  appName: string;
  hasGeminiKey: boolean;
  model: string;
  ttsModel: string;
  timestamp: string;
}

export async function checkServerHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchSampleData(): Promise<{
  dishes: SampleDish[];
  sampleFridges: SampleFridge[];
}> {
  const res = await fetch('/api/sample-dishes');
  if (!res.ok) {
    throw new Error('Failed to load sample dishes');
  }
  return res.json();
}

export async function analyzeMealApi(params: {
  image?: string;
  textDescription?: string;
  dietaryGoal?: string;
  userAllergies?: string[];
}): Promise<MealAnalysisResult> {
  const res = await fetch('/api/analyze-meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Meal analysis failed: ${res.statusText}`);
  }

  return res.json();
}

export async function scanFridgeApi(params: {
  image?: string;
  ingredientTextList?: string[];
  dietaryPreferences?: string;
  maxCookingTimeMinutes?: number;
}): Promise<FridgeScanResult> {
  const res = await fetch('/api/scan-fridge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Fridge scan failed: ${res.statusText}`);
  }

  return res.json();
}

export async function auditFoodSafetyApi(params: {
  image?: string;
  foodName?: string;
  storageType?: string;
  daysStored?: number;
  userObservations?: string;
}): Promise<SafetyAuditResult> {
  const res = await fetch('/api/safety-audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Food safety audit failed: ${res.statusText}`);
  }

  return res.json();
}

export async function sendChefChatMessage(params: {
  messages: Array<{ role: string; content: string }>;
  image?: string;
}): Promise<{ reply: string; suggestedPrompts: string[] }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Culinary assistant failed: ${res.statusText}`);
  }

  return res.json();
}

export async function playChefVoiceAudio(
  text: string,
  voice: string = 'Kore'
): Promise<void> {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        await audio.play();
        return;
      }
    }
  } catch (err) {
    console.warn('Gemini TTS audio playback fell back to Web Speech API:', err);
  }

  // Graceful browser Web Speech fallback if server TTS is not supported or fails
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }
}
