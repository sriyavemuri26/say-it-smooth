'use client';

import React, { useState, useRef } from 'react';

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
  toneStatus: string;
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
  toneStatus: string;
}

const LANGUAGES = [
  { id: 'en-US', code: 'en-US' as const, label: 'English', flag: '🇺🇸' },
  { id: 'es-ES', code: 'es-ES' as const, label: 'Spanish', flag: '🇪🇸' },
  { id: 'ko-KR', code: 'ko-KR' as const, label: 'Korean', flag: '🇰🇷' },
];

const SCENARIOS: Scenario[] = [
  {
    id: "en-1",
    lang: "en-US",
    langLabel: "English (US)",
    category: "Café",
    categoryIcon: "☕",
    title: "Ordering Coffee",
    targetPhrase: "Could I please get a hot latte with oat milk?",
    phoneticGuide: "kʊd aɪ pliːz ɡɛt ə hɒt ˈlɑːteɪ wɪð oʊt mɪlk",
    translation: "Could I please get a hot latte with oat milk?",
    pronunciationTip: "Blend 'l' in 'please'. Soft 't' in 'latte' (sounds like 'lah-dey').",
    politenessTip: "Starting with 'Could I please get...' is standard polite US English.",
    toneStatus: "Polite Request"
  },
  {
    id: "en-2",
    lang: "en-US",
    langLabel: "English (US)",
    category: "Networking",
    categoryIcon: "🤝",
    title: "Expressing Gratitude",
    targetPhrase: "Thank you for taking the time to meet with me today.",
    phoneticGuide: "θæŋk juː fɔːr ˈteɪkɪŋ ðə taɪm tuː miːt wɪð miː təˈdeɪ",
    translation: "Thank you for taking the time to meet with me today.",
    pronunciationTip: "Voiceless 'th' sound in 'Thank'. Connect 'with me' smoothly.",
    politenessTip: "Warm, professional opener for formal or business settings.",
    toneStatus: "Professional Formal"
  },
  {
    id: "es-1",
    lang: "es-ES",
    langLabel: "Español",
    category: "Dining",
    categoryIcon: "🍽️",
    title: "Asking for the Bill",
    targetPhrase: "Hola, ¿me podría traer la cuenta, por favor?",
    phoneticGuide: "OH-lah, meh poh-DREE-ah try-EHR lah KWEHN-tah, pohr fah-VOHR",
    translation: "Hello, could you bring me the bill, please?",
    pronunciationTip: "Silent 'H' in 'Hola'. Roll 'r' in 'traer'. Soft 'v' in 'favor'.",
    politenessTip: "Always use 'por favor' when requesting service in Spain.",
    toneStatus: "Polite Customer"
  },
  {
    id: "es-2",
    lang: "es-ES",
    langLabel: "Español",
    category: "Navigation",
    categoryIcon: "📍",
    title: "Asking for Directions",
    targetPhrase: "Disculpe, ¿sabe si hay una farmacia cerca de aquí?",
    phoneticGuide: "dees-KOOL-peh, SAH-beh see eye OO-nah fahr-MAH-syah SEHR-kah deh ah-KEE",
    translation: "Excuse me, do you know if there is a pharmacy near here?",
    pronunciationTip: "Silent 'H' in 'hay'. European 'c' in 'farmacia' sounds like English 'th'.",
    politenessTip: "Start with 'Disculpe' to respectfully get someone's attention.",
    toneStatus: "Polite Interruption"
  },
  {
    id: "ko-1",
    lang: "ko-KR",
    langLabel: "한국어",
    category: "Restaurant",
    categoryIcon: "💧",
    title: "Requesting Water",
    targetPhrase: "안녕하세요, 물 좀 주시겠어요?",
    phoneticGuide: "An-nyeong-ha-se-yo, mul jom ju-si-ges-seo-yo?",
    translation: "Hello, could I please have some water?",
    pronunciationTip: "Slightly rise pitch at the end of '주시겠어요?' for a polite request.",
    politenessTip: "Polite honorific tone with '-요'. Receive items with both hands.",
    toneStatus: "Honorific Polite"
  },
  {
    id: "ko-2",
    lang: "ko-KR",
    langLabel: "한국어",
    category: "Shopping",
    categoryIcon: "🛍️",
    title: "Asking for a Discount",
    targetPhrase: "이것은 얼마인가요? 조금 깎아주실 수 있나요?",
    phoneticGuide: "I-geo-seun eol-ma-in-ga-yo? Jo-geum kkak-ka-ju-sil su in-na-yo?",
    translation: "How much is this? Could you give me a small discount?",
    pronunciationTip: "Emphasize double '깎' as a crisp, tense double-k sound.",
    politenessTip: "Common at traditional markets. Use '조금' to soften the request.",
    toneStatus: "Friendly Softened"
  }
];

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
        track[j - 1][i] + 1,
        track[j][i - 1] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  
  const distance = track[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return Math.round((1 - distance / maxLength) * 100);
}

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
    const idx = transcriptCleaned.indexOf(cleaned, lastIndex + 1);
    if (idx !== -1) {
      lastIndex = idx;
      return { word, matched: true };
    }
    return { word, matched: false };
  });
}

export default function Home() {
  const [selectedLang, setSelectedLang] = useState<'en-US' | 'es-ES' | 'ko-KR'>('en-US');
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const recognitionRef = useRef<any>(null);

  const activeScenarios = SCENARIOS.filter(s => s.lang === selectedLang);
  const currentScenario = activeScenarios[activePhraseIndex] || activeScenarios[0];

  const handleTabChange = (langCode: 'en-US' | 'es-ES' | 'ko-KR') => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsPlaying(false);
    setIsRecording(false);
    setFeedback(null);
    setSelectedLang(langCode);
    setActivePhraseIndex(0);
  };

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(currentScenario.targetPhrase);
    utterance.lang = currentScenario.lang;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.toLowerCase() === currentScenario.lang.toLowerCase())
      || voices.find(v => v.lang.toLowerCase().startsWith(currentScenario.lang.split('-')[0].toLowerCase()));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Safari.");
      return;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }

    const recognition = new SpeechRecognition();
    recognition.lang = currentScenario.lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const score = getLevenshteinSimilarity(currentScenario.targetPhrase, transcript);
      const wordDiff = getWordDiff(currentScenario.targetPhrase, transcript);

      setFeedback({
        score,
        transcript,
        wordDiff,
        pronunciationTip: currentScenario.pronunciationTip,
        politenessTip: currentScenario.politenessTip,
        toneStatus: currentScenario.toneStatus
      });
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error", event.error);
      setIsRecording(false);
      setFeedback({
        score: 0,
        transcript: "No speech detected. Please try speaking clearly.",
        wordDiff: [],
        pronunciationTip: currentScenario.pronunciationTip,
        politenessTip: currentScenario.politenessTip,
        toneStatus: "Try Again"
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between items-center selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* Top Navigation Bar: Classic Title on Left & Scrolling Tab Bar */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20 py-3 px-4 sm:px-6 shadow-sm flex items-center justify-between gap-4">
        {/* Leftmost Corner Classic Font Title */}
        <div className="flex items-center shrink-0">
          <span className="font-serif font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 select-none">
            Say It Smooth
          </span>
        </div>

        {/* Horizontal Scrolling Tab Bar */}
        <div className="overflow-x-auto scrollbar-none flex items-center justify-end gap-2 py-1 px-1 max-w-md">
          {LANGUAGES.map((lang) => {
            const isActive = selectedLang === lang.code;
            return (
              <button
                key={lang.id}
                onClick={() => handleTabChange(lang.code)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Centered Core Interaction Area: Clean Audio Player Console */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-lg mx-auto my-auto">
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center space-y-6 transition-all">
          
          {/* Phrase Category Header & Pagination */}
          <div className="w-full flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-3">
            <span className="flex items-center gap-1.5 font-semibold text-slate-500">
              <span>{currentScenario.categoryIcon}</span>
              <span>{currentScenario.category}</span>
            </span>
            
            {activeScenarios.length > 1 && (
              <div className="flex items-center gap-2 font-mono text-slate-400">
                <button
                  key="prev-phrase-btn"
                  onClick={() => {
                    setActivePhraseIndex((prev) => (prev > 0 ? prev - 1 : activeScenarios.length - 1));
                    setFeedback(null);
                  }}
                  className="hover:text-indigo-600 px-1 text-sm font-bold transition-colors"
                  title="Previous phrase"
                >
                  ‹
                </button>
                <span>{activePhraseIndex + 1} / {activeScenarios.length}</span>
                <button
                  key="next-phrase-btn"
                  onClick={() => {
                    setActivePhraseIndex((prev) => (prev < activeScenarios.length - 1 ? prev + 1 : 0));
                    setFeedback(null);
                  }}
                  className="hover:text-indigo-600 px-1 text-sm font-bold transition-colors"
                  title="Next phrase"
                >
                  ›
                </button>
              </div>
            )}
          </div>

          {/* Target Phrase Display */}
          <div className="space-y-3 w-full">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
              {currentScenario.targetPhrase}
            </h2>
            <p className="text-xs sm:text-sm font-mono text-slate-400 tracking-wide">
              {currentScenario.phoneticGuide}
            </p>
            <p className="text-sm font-normal text-slate-500">
              {currentScenario.translation}
            </p>
          </div>

          {/* Two Rounded Icon Buttons Side-by-Side */}
          <div className="flex items-center gap-3 w-full pt-2">
            {/* Speak Target (Left) */}
            <button
              key="speak-target-btn"
              onClick={handleSpeak}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all border ${
                isPlaying
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200 animate-pulse'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200/60'
              }`}
            >
              <svg className={`h-4 w-4 ${isPlaying ? 'fill-indigo-600' : 'fill-slate-600'}`} viewBox="0 0 24 24">
                <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-3 1.77L6.43 9H3v6h3.43L11 19V5z" />
              </svg>
              <span>{isPlaying ? 'Speaking...' : 'Speak Target'}</span>
            </button>

            {/* Record User Voice (Right) */}
            <button
              key="record-voice-btn"
              onClick={handleRecordToggle}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all shadow-md ${
                isRecording
                  ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200 animate-pulse'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {isRecording ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                  </svg>
                  <span>Record User Voice</span>
                </>
              )}
            </button>
          </div>

          {/* Score & Feedback Section */}
          {feedback && (
            <div className="w-full mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center space-y-3 transition-all">
              {/* Score & Tone Badge */}
              <div className="flex flex-col items-center gap-1">
                <span className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
                  feedback.score >= 80 ? 'text-emerald-600' :
                  feedback.score >= 60 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {feedback.score}%
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mt-1">
                  <span>✨</span>
                  <span>{feedback.toneStatus}</span>
                </span>
              </div>

              {/* Spoken Transcript & Word Comparison */}
              {feedback.transcript && (
                <div className="w-full text-xs space-y-2 pt-2 border-t border-slate-200/60 text-center">
                  <p className="text-slate-500 italic">"{feedback.transcript}"</p>
                  {feedback.wordDiff.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 pt-1">
                      {feedback.wordDiff.map((wd, idx) => (
                        <span
                          key={`wd-${wd.word}-${idx}`}
                          className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                            wd.matched
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800 line-through'
                          }`}
                        >
                          {wd.word}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

