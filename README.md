# Say It Smooth

> **Note**: This was a vibecoded application built for **DevFestDC 2026** using **Antigravity**, **Antigravity IDE**, and **Vercel**.

**[Click here to access the live website!](https://say-it-smooth.vercel.app)**

---

## Video Demo

Check out the demo walkthrough on Loom:

**[Watch the Demo Here!](https://www.loom.com/share/a7d6306d13fc424eb99d60b3df2e4e68)**

---

## What "Say It Smooth" Accomplishes

**Say It Smooth** is an interactive, multilingual speech and pronunciation coach designed to help language learners and travelers practice real-world, culturally polite phrases with confidence.

Instead of boring vocabulary flashcards, **Say It Smooth** immerses users in common daily scenarios (ordering coffee at a café, asking for the bill at a restaurant, requesting discounts at traditional markets, or business networking) across multiple languages—including **English (US)** 🇺🇸, **Spanish** 🇪🇸, and **Korean** 🇰🇷.

Users can listen to native pronunciation, record their own voice, and receive instant algorithmic accuracy scores, word-by-word diff feedback, and cultural politeness & tone tips.

---

## How It Works

```
┌─────────────────┐       ┌────────────────────────┐       ┌────────────────────────┐
│  Audio Input    │ ───>  │   Data Processing      │ ───>  │   Interactive Output   │
│  (Microphone)   │       │   (Levenshtein / Diff) │       │   (Score, Diff, Tips)  │
└─────────────────┘       └────────────────────────┘       └────────────────────────┘
```

### 1. Data Acquisition
- **Voice Capture**: User speech is captured via the microphone through the browser's native **Web Speech Recognition API** (`SpeechRecognition` / `webkitSpeechRecognition`), dynamically targeted to the scenario's locale (`en-US`, `es-ES`, `ko-KR`).
- **Curated Scenario Library**: Pre-configured phrase catalogs provide target sentences, international phonetic alphabet (IPA) / romanized pronunciation guides, English translations, and politeness tips.

### 2. Data Processing & Algorithms
- **Speech-to-Text Transcription**: The speech engine captures spoken audio into raw transcript text.
- **Text Normalization**: Punctuation (`.,/#!$%^&*;:{}=\-_~()?¿¡`) and whitespace are sanitized and normalized for case-insensitive phonetic matching.
- **Levenshtein Distance Similarity**: Calculates the normalized difference between the target phrase and spoken transcript to derive an exact accuracy score percentage (0–100%):
  $$\text{Similarity} = \left(1 - \frac{\text{Distance}}{\max(\text{len}_1, \text{len}_2)}\right) \times 100$$
- **Word-Level Diff**: Tokenizes the target sentence and maps it against the user transcript sequence, identifying matched words vs. omitted or mispronounced words.

### 3. Output & User Feedback
- **Color-Coded Accuracy Score**: Immediate visual score badge.
- **Word-Level Diff**: Visual tags showing correctly spoken words (green) and missed or mispronounced words (strikethrough red).
- **Native Audio Playback**: Speech synthesis playback (`SpeechSynthesisUtterance`) for target phrases.
- **Tone & Politeness Tips**: Actionable guidance to help users sound more natural and polite while speaking.

---

## Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router architecture)
- **UI Library**: [React 19](https://react.dev/) (Client Components & React Compiler)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for strict type safety
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) for fluid, modern, glassmorphic UI design
- **Web Speech APIs**:
  - **Web Speech Synthesis API** (`window.speechSynthesis`) for native voice synthesis playback
  - **Web Speech Recognition API** (`webkitSpeechRecognition`) for low-latency voice capture and live transcription

### Backend, Tooling & Infrastructure
- **Serverless & Edge Runtime**: Next.js App Router running on **Vercel** serverless infrastructure
- **Deployment Platform**: **Vercel** for continuous deployment, asset optimization, and CDN delivery
- **AI & IDE Environment**: Built with **Antigravity** and **Antigravity IDE** for rapid vibecoding and pair-programming

---

## What I Learned

1. **Speech APIs**:
   - Learned how to interface with `SpeechRecognition` and `SpeechSynthesis` across different browser engines without requiring expensive third-party speech API keys or heavy backend streaming proxies.
2. **Text Metrics & Diff Algorithms**:
   - Implemented dynamic programming algorithms (Levenshtein Distance) and sequential word diff tokenizers in TypeScript for millisecond-fast scoring and interactive visual feedback.
3. **Multilingual UX & Phonetics Design**:
   - Designed intuitive interfaces that accommodate diverse language scripts (Latin, Hangul) along with phonetic guides and cultural etiquette indicators.
4. **Vibecoding with Antigravity & Vercel**:
   - Experienced the speed of ideating, prototyping, and deploying a fully functional, polished web app for **DevFestDC 2026** by pairing with Antigravity IDE and deploying directly to Vercel.
5. **Future Updates**:
   - Adding more languages, scenarios, and different accents within each language.
   - Adding AI-powered voice synthesis for users to practice with.

---

## Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.17 or later)
- npm, pnpm, or yarn

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/say-it-smooth.git
cd say-it-smooth

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser (Google Chrome or Safari recommended for full Web Speech API support).
