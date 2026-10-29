# Food Verse AI — Multimodal Food Intelligence Agent

![Food Verse AI Banner](https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80)

**Food Verse AI** is a multimodal food intelligence platform powered by **Google Gemini 3.8 Flash** and **Gemini 3.8 Flash Lite TTS**. It combines computer vision, nutritional biochemistry, food safety microbiology, and conversational agent intelligence into a seamless, modern culinary experience.

---

## 🌟 Key Capabilities

### 1. 📸 Multimodal Meal Vision & Calorie/Macro Scanner
- **Live Camera & Drag-and-Drop Photo Upload**: Snap any plate or choose from curated gourmet presets (Salmon Quinoa Bowl, Sourdough Avocado Toast, Acai Bowl, Greek Salad, Tonkotsu Ramen).
- **Plate Decomposition**: Detects dish name, cuisine origin, estimated portion weights, and component ingredients.
- **Nutritional Diagnostics**: Computes total Calories, Protein, Carbohydrates, Fats, Dietary Fiber, Sugars, Sodium, Saturated Fats, and Cholesterol.
- **Micronutrient & Health Scoring**: Evaluates micronutrients (Iron, Calcium, Vitamin C, Potassium) with % Daily Values, calculates a 0-100 Health Density Score, and estimates Glycemic Index (GI).
- **Allergen Auditing**: Flags common allergens (Gluten, Dairy, Peanuts, Tree Nuts, Shellfish, Eggs, Soy).
- **Clinical Dietitian Appraisal**: Actionable smart culinary tweaks (e.g. adding lemon juice for iron bioavailability).
- **1-Click Food Diary Logging**: Adds the meal to your daily dashboard with celebratory confetti.

### 2. 🧊 Smart Fridge Vision & Zero-Waste Recipe Generator
- **Visual Inventory Recognition**: Snap an open fridge or pantry shelf to detect all visible items with shelf-life urgency tags.
- **3 Creative Chef Recipes**: Generates 3 recipes utilizing primarily what you already have, minimizing food waste.
- **Matched vs. Pantry Staples**: Clearly highlights ingredients you have vs. common staples required (olive oil, salt, garlic).

### 3. 👨‍🍳 Interactive Cooking Mode with Hands-Free Chef Voice Guidance
- **Gemini 3.8 Flash Lite TTS**: Reads out each step clearly in a friendly chef voice (`Kore`, `Puck`, `Zephyr`, `Fenrir`, `Charon`).
- **Interactive Kitchen Timer**: Quick presets (1m, 3m, 5m) with start/pause/reset and sound chimes.
- **Substitution Assistant**: Instant AI answers for on-the-fly ingredient swaps while cooking.

### 4. 🛡️ Food Safety & Spoilage / Shelf-Life Auditor
- **Microbiological Risk Assessment**: Evaluates suspect leftovers or browning produce.
- **Verdict Badges**: `SAFE`, `CONSUME_SOON`, `CAUTION`, `DISCARD`.
- **Sensory Verification**: Smell, texture, and color check guidelines.
- **Actionable Preservation**: Immediate steps to safely prolong shelf life.

### 5. 💬 Chef Verse Multimodal Culinary Assistant
- **Photo-Enabled Cooking Chat**: Ask cooking science questions, fix kitchen mistakes (e.g., oversalted soup), or attach in-progress cooking photos.
- **Audio Output**: Listen to chef advice read aloud via Gemini TTS.

### 6. 📊 Daily Macro Dashboard & Diary
- **Goal Progress Rings**: Track daily targets for Calories, Protein, Carbs, and Fats.
- **Meal Timeline**: View and manage breakfast, lunch, dinner, and snack entries.
- **JSON Export**: Download complete food log records.

---

## 🛠️ Architecture & Tech Stack

```
[Browser / Client (React 19)]
        │
        ▼ (Base64 Photos & Prompts)
[Express Server (server.ts - port 3000)]
        │
        ▼ (@google/genai TypeScript SDK)
[Google Gemini Models]
   ├── gemini-3.8-flash (Multimodal Vision, Reasoning, JSON Schema)
   └── gemini-3.8-flash-lite-tts (Natural Chef Voice Guidance)
```

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas-Confetti, Motion
- **Backend**: Node.js, Express, tsx
- **SDK**: `@google/genai` (version ^2.4.0) with server-side proxy routes under `/api/*`

---

## 🚀 Quick Start / Local Setup

Follow these simple steps to run Food Verse AI on your local computer:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/food-verse-ai.git
cd food-verse-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and add your Google Gemini API key:
```env
GEMINI_API_KEY="your-google-ai-studio-gemini-api-key"
```

### 4. Run the full-stack development server
```bash
npm run dev
```

### 5. Open in browser
Visit **`http://localhost:3000`** in your web browser.

---

## 🧪 Live Demo & Testing Checklist

1. **Meal Vision**: Click on any of the demo showcase dishes (e.g., *Wild Salmon Quinoa Bowl*) or upload a food photo. Inspect the calculated macros and click **Log to Daily Diary**.
2. **Smart Fridge**: Switch to **Smart Fridge**, choose a sample fridge or snap your own, click **Generate Recipes**, and launch **Cook in Hands-Free Mode** to experience the step voiceover and timer.
3. **Safety Audit**: Select a scenario like *Cooked Chicken Breast Day 4* or *Avocado with brown spots* to view microbiological findings and risk levels.
4. **Chef Verse**: Ask culinary questions or request a quick ingredient substitution.

---

## 📄 License
Apache-2.0
