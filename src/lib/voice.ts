// Browser Web Speech API wrapper for EasyForm AI.
// Safe no-op on SSR or unsupported browsers.

import { getVoiceMode } from "@/lib/i18n";
const VOICE_KEY = "formsathi:voiceEnabled";

export function isVoiceEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const v = localStorage.getItem(VOICE_KEY);
    return v === null ? true : v === "true";
  } catch {
    return true;
  }
}

export function setVoiceEnabled(on: boolean) {
  try {
    localStorage.setItem(VOICE_KEY, String(on));
  } catch {}
  if (!on) stopSpeaking();
}

function pickVoiceFor(lang: "en" | "hi"): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  if (lang === "hi") {
    // Priority: Female Hindi voices (Microsoft Swara, Microsoft Kalpana, Google हिन्दी, Lekha, Heera, etc.)
    return (
      voices.find((v) => /hi-IN|hi_IN|^hi\b/i.test(v.lang) && /swara|kalpana|kavya|lekha|heera|neerja|female|google/i.test(v.name)) ||
      voices.find((v) => /swara|kalpana|kavya|lekha/i.test(v.name)) ||
      voices.find((v) => /hi-IN|hi_IN|^hi\b/i.test(v.lang) && !/male|david|ravi|george|mark/i.test(v.name)) ||
      voices.find((v) => /hi-IN|hi_IN|^hi\b/i.test(v.lang)) ||
      voices.find((v) => /en-IN/i.test(v.lang) && /swara|heera|neerja|female/i.test(v.name)) ||
      voices.find((v) => /female|zira|jenny|samantha|aria|sonia/i.test(v.name)) ||
      voices[0]
    );
  }

  // English: Female Indian English or Female English
  return (
    voices.find((v) => /en-IN/i.test(v.lang) && /swara|neerja|heera|kavya|female/i.test(v.name)) ||
    voices.find((v) => /en-IN/i.test(v.lang) && !/male|prabhat|ravi|george/i.test(v.name)) ||
    voices.find((v) => /^en/i.test(v.lang) && /female|zira|jenny|samantha|aria|sonia|victoria|karen/i.test(v.name)) ||
    voices.find((v) => /^en/i.test(v.lang) && !/male|david|mark|george/i.test(v.name)) ||
    voices[0]
  );
}

export type SpeakOpts = {
  onStart?: () => void;
  onEnd?: () => void;
  rate?: number;
  pitch?: number;
  lang?: "en" | "hi";
};

export function speak(text: string, opts: SpeakOpts = {}) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) {
    opts.onEnd?.();
    return;
  }
  if (!isVoiceEnabled()) {
    opts.onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const which: "en" | "hi" =
      opts.lang ?? (/[\u0900-\u097F]/.test(text) ? "hi" : "en");
    const v = pickVoiceFor(which);
    if (v) u.voice = v;
    u.lang = v?.lang || (which === "hi" ? "hi-IN" : "en-IN");
    u.rate = opts.rate ?? 0.95;
    u.pitch = opts.pitch ?? 1;
    u.onstart = () => opts.onStart?.();
    u.onend = () => opts.onEnd?.();
    u.onerror = () => opts.onEnd?.();
    window.speechSynthesis.speak(u);
  } catch {
    opts.onEnd?.();
  }
}

// Speak a message respecting the user's selected voice mode.
// - "en"  → speak English only
// - "hi"  → speak Hindi only
// - "auto"→ speak English, then Hindi back-to-back
export async function speakBilingual(en: string, hi: string, opts: SpeakOpts = {}) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window) || !isVoiceEnabled()) {
    opts.onEnd?.();
    return;
  }
  const mode = getVoiceMode();
  const queue: { text: string; lang: "en" | "hi" }[] = [];
  if (mode === "en") queue.push({ text: en, lang: "en" });
  else if (mode === "hi") queue.push({ text: hi, lang: "hi" });
  else {
    queue.push({ text: en, lang: "en" });
    queue.push({ text: hi, lang: "hi" });
  }

  try {
    window.speechSynthesis.cancel();
    const total = queue.length;
    queue.forEach((q, i) => {
      const u = new SpeechSynthesisUtterance(q.text);
      const v = pickVoiceFor(q.lang);
      if (v) u.voice = v;
      u.lang = v?.lang || (q.lang === "hi" ? "hi-IN" : "en-IN");
      u.rate = opts.rate ?? 0.95;
      u.pitch = opts.pitch ?? 1;
      if (i === 0) u.onstart = () => opts.onStart?.();
      if (i === total - 1) {
        u.onend = () => opts.onEnd?.();
        u.onerror = () => opts.onEnd?.();
      } else {
        u.onerror = () => {};
      }
      window.speechSynthesis.speak(u);
    });
  } catch {
    opts.onEnd?.();
  }
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export function createRecognizer(): any | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!Ctor) return null;
  try {
    const r = new Ctor();
    r.lang = "hi-IN";
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;
    return r;
  } catch {
    return null;
  }
}

// Warm up voices list (Chrome loads asynchronously).
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  } catch {}
}
