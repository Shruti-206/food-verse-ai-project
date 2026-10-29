import React, { useState } from 'react';
import {
  X,
  Code2,
  Terminal,
  Cpu,
  Github,
  BookOpen,
  CheckCircle,
  Sparkles,
  Layers,
  Copy,
  Check,
} from 'lucide-react';

interface DeveloperGuideModalProps {
  onClose: () => void;
}

export const DeveloperGuideModal: React.FC<DeveloperGuideModalProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'setup' | 'github' | 'testing'>('architecture');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const setupCommands = `# 1. Clone your repository
git clone https://github.com/your-username/food-verse-ai.git
cd food-verse-ai

# 2. Install all dependencies
npm install

# 3. Configure Environment Variables
cp .env.example .env
# Open .env and insert your GEMINI_API_KEY="your-key-here"

# 4. Launch Full-Stack Dev Server (Express + Vite)
npm run dev

# 5. Open in your browser:
# http://localhost:3000`;

  const readmeSnippet = `# Food Verse AI — Multimodal Food Intelligence Agent

An end-to-end multimodal food intelligence platform powered by Google Gemini 3.8 Flash and Gemini 3.8 Flash Lite TTS.

## Key Features
- 📸 **Multimodal Meal Vision & Macro Scanner**: Instant dish identification, portion weights, macro & micronutrient breakdown, health index, and allergen alerts.
- 🧊 **Smart Fridge Vision**: Zero-waste recipe generator using open fridge and pantry photos.
- 👨‍🍳 **Interactive Cooking Mode**: Step-by-step guidance with hands-free chef voiceover (Gemini TTS) and kitchen timers.
- 🛡️ **Food Safety & Spoilage Auditor**: Visual microbiological inspection, shelf-life estimation, and preservation actions.
- 💬 **Chef Verse Assistant**: Multimodal culinary dialogue with pan/dish photo attachments.
- 📊 **Daily Food Diary**: Dynamic calorie & macro goal progress rings.

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas-Confetti
- **Backend**: Node.js, Express, tsx
- **AI / Multimodal**: Google GenAI SDK (@google/genai) with \`gemini-3.8-flash\` & \`gemini-3.8-flash-lite-tts\`

## Quick Start
1. \`npm install\`
2. Set \`GEMINI_API_KEY\` in \`.env\`
3. \`npm run dev\` -> visit http://localhost:3000`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-900/90 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Developer Architecture & Setup Guide</h2>
              <p className="text-xs text-slate-400">
                Modular full-stack implementation notes for beginners & GitHub submission
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSection('architecture')}
            className={`flex items-center gap-1.5 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeSection === 'architecture'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Architecture & Pipeline
          </button>
          <button
            onClick={() => setActiveSection('setup')}
            className={`flex items-center gap-1.5 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeSection === 'setup'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Local Setup & Run
          </button>
          <button
            onClick={() => setActiveSection('github')}
            className={`flex items-center gap-1.5 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeSection === 'github'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-4 h-4" />
            GitHub Submission
          </button>
          <button
            onClick={() => setActiveSection('testing')}
            className={`flex items-center gap-1.5 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeSection === 'testing'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Demo & Testing Tips
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6">
          {activeSection === 'architecture' && (
            <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Full-Stack Architecture Overview
                </h3>
                <p>
                  Food Verse AI is built as a production-grade full-stack Node.js / Express + React 19 application.
                  Gemini API calls are securely executed exclusively on the server side (`server.ts`) using the modern
                  <code>@google/genai</code> TypeScript SDK, ensuring API keys are never exposed in browser bundles.
                </p>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                  <div>[Client / Browser (React 19 SPA)]</div>
                  <div className="text-emerald-400">  │  Photo Upload / Camera Frame / User Query</div>
                  <div className="text-emerald-400">  ▼</div>
                  <div>[Express Server (server.ts - port 3000)]</div>
                  <div className="text-orange-400">  │  /api/analyze-meal • /api/scan-fridge • /api/safety-audit • /api/tts</div>
                  <div className="text-orange-400">  ▼</div>
                  <div>[@google/genai SDK (Google GenAI Engine)]</div>
                  <div className="text-blue-400">  │  gemini-3.8-flash (Multimodal Vision & JSON Schema Extraction)</div>
                  <div className="text-blue-400">  │  gemini-3.8-flash-lite-tts (Natural Chef Voice Guidance)</div>
                  <div className="text-blue-400">  ▼</div>
                  <div>[Structured JSON & Audio Data returned to React State]</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider text-orange-400">
                    Multimodal Vision Pipeline
                  </h4>
                  <p>
                    Images from live webcam capture or file uploads are sent as Base64 strings.
                    The server constructs an inlineData part with standard MIME types and asks
                    Gemini 3.8 Flash to return strict JSON matching our TypeScript types.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider text-emerald-400">
                    Voiceover & TTS Pipeline
                  </h4>
                  <p>
                    Hands-free cooking mode queries <code>gemini-3.8-flash-lite-tts</code>. The server
                    receives full WAV audio (24kHz, mono) and transmits Base64 audio to the browser,
                    which plays instantly through an HTML5 Audio object with browser Web Speech fallback.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'setup' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Terminal Commands to Run Locally
                </h3>
                <button
                  onClick={() => copyToClipboard(setupCommands, 'setup')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  {copiedCode === 'setup' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === 'setup' ? 'Copied' : 'Copy Commands'}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                {setupCommands}
              </pre>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-white">Prerequisites:</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li>Node.js v18.0 or higher installed on your machine.</li>
                  <li>A Gemini API key from Google AI Studio (free tier available).</li>
                  <li>No Docker or external database required—everything runs seamlessly out of the box!</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'github' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Github className="w-4 h-4 text-white" />
                  GitHub Submission & README Template
                </h3>
                <button
                  onClick={() => copyToClipboard(readmeSnippet, 'readme')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  {copiedCode === 'readme' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === 'readme' ? 'Copied' : 'Copy README.md'}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-60">
                {readmeSnippet}
              </pre>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-white">GitHub Push Steps:</h4>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                  <li>Verify <code>.env</code> is included in <code>.gitignore</code> so keys aren't pushed.</li>
                  <li>Run <code>git init && git add .</code></li>
                  <li>Run <code>git commit -m "feat: initial commit of Food Verse AI multimodal agent"</code></li>
                  <li>Create a new repository on GitHub and run <code>git remote add origin ...</code> and <code>git push -u origin main</code></li>
                </ol>
              </div>
            </div>
          )}

          {activeSection === 'testing' && (
            <div className="space-y-4 text-xs text-slate-300">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Live Demo & Evaluation Checklist
              </h3>
              <p>Follow these quick scenarios for a flawless live demo presentation:</p>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-orange-500/10 text-orange-400 shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-white">Meal Vision Scanner Test</h4>
                    <p className="text-slate-400 mt-0.5">
                      Click the "Wild Salmon Quinoa & Edamame Bowl" demo dish or upload any meal.
                      Observe the confidence score, macro breakdown, portion weights, health score, and allergen audit.
                      Click "Log to Daily Diary" to trigger the confetti celebration.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-white">Smart Fridge & Hands-Free Cooking Test</h4>
                    <p className="text-slate-400 mt-0.5">
                      Switch to "Smart Fridge". Click on "Weekly Fresh Market Fridge".
                      Click "Generate Recipes". Once generated, click "Cook in Hands-Free Mode".
                      Test the "Read Aloud (TTS)" button and start the countdown timer!
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-white">Food Safety Spoilage Audit Test</h4>
                    <p className="text-slate-400 mt-0.5">
                      Switch to "Safety Audit". Select the "Cooked Chicken Breast Day 4" scenario.
                      Notice the risk badge (CAUTION), microbiological visual analysis, sensory test checklist, and immediate preservation action.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">4</div>
                  <div>
                    <h4 className="font-bold text-white">Chef Verse Multimodal Chat Test</h4>
                    <p className="text-slate-400 mt-0.5">
                      Ask "How do I fix an oversalted soup?" or click any suggested pill.
                      Click "Voice" to hear the chef advice read aloud.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
