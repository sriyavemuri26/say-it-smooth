'use client';

import React, { useState, useEffect, useRef } from 'react';

// Interfaces for Web Speech API typescript support
interface WordDiff {
  word: string;
  matched: boolean;
}

interface Feedback {
  score: number;
  transcript: string;
  wordDiff: WordDiff[];
  pronunciationTip: string;
  politenessTip: string;
}

interface Scenario {
  id: string;
  lang: 'en-US' | 'es-ES' | 'ko-KR';
  langLabel: string;
  category: string;
  categoryIcon: string;
  title: string;
  targetPhrase: string;
  phoneticGuide: string;
  translation: string;
  pronunciationTip: string;
  politenessTip: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "en-1",
    lang: "en-US",
    langLabel: "English (US)",
    category: "Café / Ordering",
    categoryIcon: "☕",
    title: "Ordering a Special Coffee",
    targetPhrase: "Could I please get a hot latte with oat milk?",
    phoneticGuide: "kʊd aɪ pliːz ɡɛt ə hɒt ˈlɑːteɪ wɪð oʊt mɪlk",
    translation: "따뜻한 오트밀크 라떼 한 잔 주시겠어요? / ¿Podría pedir un latte caliente con leche de avena?",
    pronunciationTip: "Blend the 'l' in 'please' smoothly. The 't' in 'latte' is soft in American English, sounding almost like a 'd' ('lah-dey'). Keep the 'oat' sound round and clear.",
    politenessTip: "Starting with 'Could I please get...' is a classic polite customer opener in the US. Standard tone should rise slightly on 'milk' to indicate a request."
  },
  {
    id: "en-2",
    lang: "en-US",
    langLabel: "English (US)",
    category: "Professional / Networking",
    categoryIcon: "🤝",
    title: "Expressing Appreciation",
    targetPhrase: "Thank you for taking the time to meet with me today.",
    phoneticGuide: "θæŋk juː fɔːr ˈteɪkɪŋ ðə taɪm tuː miːt wɪð miː təˈdeɪ",
    translation: "오늘 저를 만나기 위해 시간을 내주셔서 감사합니다. / Gracias por tomarse el tiempo para reunirse conmigo hoy.",
    pronunciationTip: "Make sure the 'th' in 'Thank' is voiceless and breathy (tongue between teeth), not a hard 'T'. Connect 'with me' as if it's one word 'with-me'.",
    politenessTip: "Deliver this line with a steady, warm smile and direct eye contact. In a professional setting, a firm handshake right after is custom."
  },
  {
    id: "es-1",
    lang: "es-ES",
    langLabel: "Español (España)",
    category: "Restaurante / Dining",
    categoryIcon: "🍽️",
    title: "Asking for the Bill",
    targetPhrase: "Hola, ¿me podría traer la cuenta, por favor?",
    phoneticGuide: "OH-lah, meh poh-DREE-ah try-EHR lah KWEHN-tah, pohr fah-VOHR",
    translation: "Hello, could you bring me the bill, please? / 안녕하세요, 계산서 좀 갖다 주시겠어요?",
    pronunciationTip: "The letter 'H' in 'Hola' is silent. For 'traer', roll the 'r' slightly at the end. The 'v' in 'favor' should sound soft, similar to a soft 'b'.",
    politenessTip: "In Spain, 'por favor' is essential. You can gently raise your hand to get the waiter's attention, but avoid waving aggressively or snapping fingers."
  },
  {
    id: "es-2",
    lang: "es-ES",
    langLabel: "Español (España)",
    category: "Direcciones / Navigation",
    categoryIcon: "📍",
    title: "Asking for a Pharmacy",
    targetPhrase: "Disculpe, ¿sabe si hay una farmacia cerca de aquí?",
    phoneticGuide: "dees-KOOL-peh, SAH-beh see eye OO-nah fahr-MAH-syah SEHR-kah deh ah-KEE",
    translation: "Excuse me, do you know if there is a pharmacy near here? / 실례합니다, 이 근처에 약국이 있는지 아시나요?",
    pronunciationTip: "The 'H' in 'hay' is completely silent (sounds like 'eye'). In European Spanish, the 'c' in 'farmacia' sounds like the English 'th' in 'thin'.",
    politenessTip: "Always start with 'Disculpe' (Excuse me) to politely interrupt a stranger. It establishes a respectful tone before asking for directions."
  },
  {
    id: "ko-KR",
    lang: "ko-KR",
    langLabel: "한국어 (대한민국)",
    category: "식당 / Restaurant",
    categoryIcon: "💧",
    title: "Requesting Water",
    targetPhrase: "안녕하세요, 물 좀 주시겠어요?",
    phoneticGuide: "An-nyeong-ha-se-yo, mul jom ju-si-ges-seo-yo?",
    translation: "Hello, could I please have some water? / Hola, ¿me podría dar un poco de agua, por favor?",
    pronunciationTip: "Ensure the pitch rises slightly at the very end of '주시겠어요?' to mark it as a polite request rather than a demand.",
    politenessTip: "When requesting items or receiving a glass of water from a server in Korea, it is polite to receive it with both hands as a sign of respect."
  },
  {
    id: "ko-KR",
    lang: "ko-KR",
    langLabel: "한국어 (대한민국)",
    category: "상점 / Shopping",
    categoryIcon: "🛍️",
    title: "Asking for a Discount",
    targetPhrase: "이것은 얼마인가요? 조금 깎아주실 수 있나요?",
    phoneticGuide: "I-geo-seun eol-ma-in-ga-yo? Jo-geum kkak-ka-ju-sil su in-na-yo?",
    translation: "How much is this? Could you give me a small discount? / ¿Cuánto cuesta esto? ¿Me podría hacer un pequeño descuento?",
    pronunciationTip: "For '깎아주실' (kkak-ka-ju-sil), make sure to emphasize the double '깎' as a tense, crisp double-k sound without puffing out air.",
    politenessTip: "Bargaining is common and friendly in traditional markets (like Namdaemun) but never done in malls or franchise stores. Pair this phrase with a pleasant, polite smile!"
  }
];

// Helper to normalize and compute similarity score via Levenshtein Distance
function getLevenshteinSimilarity(str1: string, str2: string): number {
  const clean = (s: string) => 
    s.trim()
     .toLowerCase()
     .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿¡]/g, "")
     .replace(/\s+/g, " ");

  const s1 = clean(str1);
  const s2 = clean(str2);
  
  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;
  
  const track = Array(s2.length + 1).fill(null).map(() =>
    Array(s1.length + 1).fill(null)
  );
  
  for (let i = 0; i <= s1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= s2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j - 1][i] + 1, // deletion
        track[j][i - 1] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  const distance = track[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return Math.round((1 - distance / maxLength) * 100);
}

// Compare user speech tokens to highlight matches in the target phrase
function getWordDiff(target: string, transcript: string): WordDiff[] {
  const cleanWord = (w: string) => 
    w.toLowerCase()
     .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿¡]/g, "")
     .trim();

  const targetWords = target.split(/\s+/);
  const transcriptCleaned = transcript.split(/\s+/).map(cleanWord);
  
  let lastIndex = -1;
  return targetWords.map((word) => {
    const cleaned = cleanWord(word);
    // Find matching word in spoken array starting after the last matched position
    const idx = transcriptCleaned.indexOf(cleaned, lastIndex + 1);
    if (idx !== -1) {
      lastIndex = idx;
      return { word, matched: true };
    }
    return { word, matched: false };
  });
}

export default function Home() {
  const [selectedLang, setSelectedLang] = useState<'all' | 'en-US' | 'es-ES' | 'ko-KR'>('all');
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [speechIsPlaying, setSpeechIsPlaying] = useState<string | null>(null);
  const [cardFeedbacks, setCardFeedbacks] = useState<Record<string, Feedback>>({});
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  // Initialize SpeechSynthesis voices
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const loadVoices = () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
    };
    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Check recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Text to Speech logic
  const handleListen = (phrase: string, langCode: string, id: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setSpeechIsPlaying(id);

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = langCode;

    // Select suitable voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase())
      || voices.find(v => v.lang.toLowerCase().startsWith(langCode.split('-')[0].toLowerCase()));
    
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => setSpeechIsPlaying(null);
    utterance.onerror = () => setSpeechIsPlaying(null);

    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition logic
  const handleRecordToggle = (scenario: Scenario) => {
    if (activeRecordingId === scenario.id) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    // If another is recording, abort it
    if (activeRecordingId && recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = scenario.lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setActiveRecordingId(scenario.id);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const score = getLevenshteinSimilarity(scenario.targetPhrase, transcript);
      const wordDiff = getWordDiff(scenario.targetPhrase, transcript);

      setCardFeedbacks(prev => ({
        ...prev,
        [scenario.id]: {
          score,
          transcript,
          wordDiff,
          pronunciationTip: scenario.pronunciationTip,
          politenessTip: scenario.politenessTip
        }
      }));
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error", event.error);
      let errMsg = "Speech recognition error. Please try again.";
      if (event.error === 'not-allowed') {
        errMsg = "Microphone access blocked. Please allow mic access in browser settings.";
      } else if (event.error === 'no-speech') {
        errMsg = "No speech detected. Please speak closer and louder.";
      }

      setCardFeedbacks(prev => ({
        ...prev,
        [scenario.id]: {
          score: 0,
          transcript: `[Error: ${errMsg}]`,
          wordDiff: [],
          pronunciationTip: "Try practice in a quiet room.",
          politenessTip: "Speak clearly directly after clicking the record button!"
        }
      }));
    };

    recognition.onend = () => {
      setActiveRecordingId(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleReset = () => {
    setCardFeedbacks({});
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setActiveRecordingId(null);
  };

  // Filtered list
  const filteredScenarios = selectedLang === 'all' 
    ? SCENARIOS 
    : SCENARIOS.filter(s => s.lang === selectedLang);

  // Performance calculations
  const practicedIds = Object.keys(cardFeedbacks);
  const totalPracticed = practicedIds.length;
  const averageScore = totalPracticed > 0 
    ? Math.round(Object.values(cardFeedbacks).reduce((acc, f) => acc + f.score, 0) / totalPracticed)
    : 0;

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-start items-center">
      {/* Header Panel */}
      <header className="w-full max-w-5xl text-center mb-10 mt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          ✨ Voice AI Accent Companion
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
          <span className="gradient-text">Say It Smooth</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Practice standard pronunciation, learn polite cultural communication cues, and instantly grade your conversational fluency in English, Spanish, and Korean.
        </p>
      </header>

      {/* Main dashboard stats & selector container */}
      <main className="w-full max-w-5xl flex flex-col gap-8">
        
        {/* Quick Stats Panel */}
        {totalPracticed > 0 && (
          <div className="glass-panel rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-6 border-indigo-500/20 transition-all duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-200">Practice Summary Dashboard</h3>
              <p className="text-xs text-slate-400">Your live accent statistics and learning history</p>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-center">
                <span className="block text-3xl font-extrabold text-brand-primary">{totalPracticed} / {SCENARIOS.length}</span>
                <span className="text-xs text-slate-400">Scenarios Practiced</span>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="flex items-center gap-3">
                {/* Visual score ring */}
                <div className="relative h-14 w-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="24" stroke="rgba(30, 41, 59, 0.8)" strokeWidth="4" fill="transparent" />
                    <circle 
                      cx="28" cy="28" r="24" 
                      stroke="url(#grad)" 
                      strokeWidth="4" 
                      fill="transparent" 
                      strokeDasharray="150.7" 
                      strokeDashoffset={150.7 - (150.7 * averageScore) / 100}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute text-sm font-bold text-slate-100">{averageScore}%</span>
                </div>
                <div className="text-left">
                  <span className="block text-xs font-semibold text-slate-400">Average Score</span>
                  <span className="text-xs text-brand-secondary font-medium">
                    {averageScore >= 90 ? "Excellent Fluency! 🏆" : averageScore >= 70 ? "Good Progress! 👍" : "Needs practice 🌱"}
                  </span>
                </div>
              </div>
              <div className="h-10 w-px bg-slate-800 hidden sm:block" />
              <button 
                onClick={handleReset}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-rose-500/50 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors"
              >
                Reset Stats
              </button>
            </div>
          </div>
        )}

        {/* Filters and Navigation bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
          {/* Custom Pills */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedLang('all')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                selectedLang === 'all'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              All Languages
            </button>
            <button
              onClick={() => setSelectedLang('en-US')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                selectedLang === 'en-US'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              🇺🇸 English (en-US)
            </button>
            <button
              onClick={() => setSelectedLang('es-ES')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                selectedLang === 'es-ES'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              🇪🇸 Español (es-ES)
            </button>
            <button
              onClick={() => setSelectedLang('ko-KR')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                selectedLang === 'ko-KR'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              🇰🇷 한국어 (ko-KR)
            </button>
          </div>

          <div className="flex gap-2">
            {!recognitionSupported && (
              <span className="text-rose-400 text-xs font-semibold px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                ⚠️ Mic API Restricted in Browser
              </span>
            )}
            {totalPracticed > 0 && (
              <button 
                onClick={handleReset}
                className="inline-flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-rose-500 text-slate-400 text-xs font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Scenario Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredScenarios.map((scenario) => {
            const isRecording = activeRecordingId === scenario.id;
            const isPlaying = speechIsPlaying === scenario.id;
            const feedback = cardFeedbacks[scenario.id];

            return (
              <div 
                key={scenario.id} 
                className={`glass-panel rounded-2xl p-6 shadow-xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  isRecording 
                    ? 'border-rose-500/50 shadow-rose-950/20 ring-2 ring-rose-500/10 bg-slate-900/80' 
                    : 'border-slate-800 hover:border-slate-700/80 hover:shadow-2xl'
                }`}
              >
                {/* Glowing border accent on cards */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                  scenario.lang === 'en-US' ? 'from-blue-500 to-indigo-500' :
                  scenario.lang === 'es-ES' ? 'from-amber-500 to-red-500' :
                  'from-emerald-500 to-teal-500'
                }`} />

                {/* Card Top Details */}
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                      <span>{scenario.categoryIcon}</span>
                      <span>{scenario.category}</span>
                    </span>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border border-slate-800 text-slate-400 bg-slate-950/40">
                      {scenario.langLabel}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-100 mb-4">{scenario.title}</h2>

                  {/* Target Phrase Block */}
                  <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl mb-4">
                    <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Target Phrase</span>
                    <p className="text-lg font-bold text-slate-100 leading-snug">
                      {scenario.targetPhrase}
                    </p>
                  </div>

                  {/* Phonetic and Translation details */}
                  <div className="space-y-2 mb-6">
                    <div className="flex gap-2 items-start text-sm">
                      <span className="text-slate-500 font-medium whitespace-nowrap">Pronunciation:</span>
                      <span className="italic font-mono text-slate-300 tracking-wide text-xs">{scenario.phoneticGuide}</span>
                    </div>
                    <div className="flex gap-2 items-start text-sm">
                      <span className="text-slate-500 font-medium whitespace-nowrap">Translation:</span>
                      <span className="text-slate-300 text-xs leading-relaxed">{scenario.translation}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions and Feedback Render */}
                <div>
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 mb-4">
                    {/* Listen Button */}
                    <button
                      onClick={() => handleListen(scenario.targetPhrase, scenario.lang, scenario.id)}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold text-xs inline-flex items-center justify-center gap-2 transition-all border ${
                        isPlaying 
                          ? 'bg-slate-800 text-indigo-400 border-indigo-500/30 font-medium animate-pulse'
                          : 'bg-slate-950/40 hover:bg-slate-850 text-slate-300 hover:text-white border-slate-800'
                      }`}
                    >
                      <svg className={`h-4 w-4 ${isPlaying ? 'fill-indigo-400 animate-bounce' : 'fill-slate-400'}`} viewBox="0 0 24 24">
                        <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-3 1.77L6.43 9H3v6h3.43L11 19V5z" />
                      </svg>
                      {isPlaying ? 'Speaking...' : 'Listen'}
                    </button>

                    {/* Record Button */}
                    <button
                      onClick={() => handleRecordToggle(scenario)}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-2 transition-all border ${
                        isRecording 
                          ? 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600 shadow-lg shadow-rose-950/30'
                          : 'bg-indigo-600/90 text-white border-indigo-700 hover:bg-indigo-600 shadow-md shadow-indigo-950/30'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                          <span>Recording...</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                          </svg>
                          <span>Record Practice</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Visual Feedback Box */}
                  {feedback && (
                    <div className="mt-4 p-4 rounded-xl border border-indigo-950 bg-slate-950/70 shadow-inner flex flex-col gap-4">
                      {/* Feedback Top Score Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Circle Mini Score Badge */}
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            feedback.score >= 90 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                            feedback.score >= 70 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                            'bg-red-500/20 text-red-400 border border-red-500/40'
                          }`}>
                            {feedback.score}
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-slate-300">Accuracy Score</span>
                            <span className="text-[10px] text-slate-500">
                              {feedback.score >= 90 ? "Excellent Pronunciation" : feedback.score >= 70 ? "Good Pronunciation" : "Keep Practicing"}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setCardFeedbacks(prev => {
                              const copy = { ...prev };
                              delete copy[scenario.id];
                              return copy;
                            });
                          }}
                          className="text-[10px] font-bold text-slate-500 hover:text-slate-300 hover:underline"
                        >
                          Clear
                        </button>
                      </div>

                      {/* We Heard Text Box */}
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">What we heard</span>
                        <p className="font-semibold text-slate-200">{feedback.transcript || <span className="text-slate-600 italic">No audio recorded</span>}</p>
                      </div>

                      {/* Word Match Visual Markup */}
                      {feedback.wordDiff.length > 0 && (
                        <div className="text-xs">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Word Comparison</span>
                          <div className="flex flex-wrap gap-x-1.5 gap-y-1 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
                            {feedback.wordDiff.map((wd, index) => (
                              <span 
                                key={index} 
                                className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                                  wd.matched 
                                    ? 'text-emerald-400 bg-emerald-500/10' 
                                    : 'text-rose-400 bg-rose-500/10 line-through opacity-80'
                                }`}
                              >
                                {wd.word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Custom Politeness and Pronunciation tips */}
                      <div className="flex flex-col gap-2">
                        {/* Pronunciation Advice */}
                        <div className="p-3 bg-slate-900/40 border-l-2 border-indigo-500 rounded-r-lg text-xs leading-relaxed text-slate-300">
                          <strong className="block text-indigo-400 font-bold mb-0.5">🗣️ Pronunciation tip:</strong>
                          {feedback.pronunciationTip}
                        </div>

                        {/* Politeness Advice */}
                        <div className="p-3 bg-slate-900/40 border-l-2 border-pink-500 rounded-r-lg text-xs leading-relaxed text-slate-300">
                          <strong className="block text-pink-400 font-bold mb-0.5">✨ Politeness tip:</strong>
                          {feedback.politenessTip}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Aesthetic Footer */}
      <footer className="mt-20 text-center text-slate-600 text-xs flex flex-col gap-2">
        <p>Built with Next.js App Router, Tailwind CSS, & Web Speech APIs.</p>
        <p>Say It Smooth &copy; 2026. Keep practicing to speak naturally and confidently.</p>
      </footer>
    </div>
  );
}
