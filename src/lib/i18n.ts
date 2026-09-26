// Lightweight i18n + language preference store (English / Hindi, extensible).
import { useEffect, useState } from "react";

export type AppLang = "en" | "hi";
export type VoiceMode = "en" | "hi" | "auto"; // Auto = English then Hindi
const KEY = "easyform:lang";
const VKEY = "easyform:voiceMode";

const listeners = new Set<(l: AppLang) => void>();
const vListeners = new Set<(m: VoiceMode) => void>();

export function getLang(): AppLang {
  if (typeof window === "undefined") return "en";
  try {
    const v = localStorage.getItem(KEY);
    if (v === "en" || v === "hi") return v;
  } catch {}
  return "en";
}

export function setLang(l: AppLang) {
  try {
    localStorage.setItem(KEY, l);
  } catch {}
  listeners.forEach((fn) => fn(l));
}

export function useLang(): [AppLang, (l: AppLang) => void] {
  const [lang, set] = useState<AppLang>(() => getLang());
  useEffect(() => {
    const fn = (l: AppLang) => set(l);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return [lang, setLang];
}

export function getVoiceMode(): VoiceMode {
  if (typeof window === "undefined") return "auto";
  try {
    const v = localStorage.getItem(VKEY);
    if (v === "en" || v === "hi" || v === "auto") return v;
  } catch {}
  return "auto";
}

export function setVoiceMode(m: VoiceMode) {
  try {
    localStorage.setItem(VKEY, m);
  } catch {}
  vListeners.forEach((fn) => fn(m));
}

export function useVoiceMode(): [VoiceMode, (m: VoiceMode) => void] {
  const [m, set] = useState<VoiceMode>(() => getVoiceMode());
  useEffect(() => {
    const fn = (x: VoiceMode) => set(x);
    vListeners.add(fn);
    return () => {
      vListeners.delete(fn);
    };
  }, []);
  return [m, setVoiceMode];
}

type Dict = Record<string, { en: string; hi: string }>;

const D: Dict = {
  language: { en: "Language", hi: "भाषा" },
  english: { en: "English", hi: "अंग्रेज़ी" },
  hindi: { en: "Hindi", hi: "हिन्दी" },
  auto: { en: "Auto (English + Hindi)", hi: "ऑटो (अंग्रेज़ी + हिन्दी)" },
  voice_language: { en: "AI Voice Language", hi: "AI वॉइस भाषा" },
  voice_language_desc: {
    en: "Choose which language EasyForm AI speaks.",
    hi: "चुनें कि EasyForm AI किस भाषा में बोले।",
  },
  more_soon: { en: "More languages coming soon", hi: "और भाषाएँ जल्द ही" },
  profile: { en: "My Profile", hi: "मेरी प्रोफ़ाइल" },
  profile_desc: {
    en: "Save your details once, reuse for every form.",
    hi: "एक बार जानकारी सेव करें, हर फॉर्म में दोबारा उपयोग करें।",
  },
  full_name: { en: "Full Name", hi: "पूरा नाम" },
  dob: { en: "Date of Birth", hi: "जन्म तिथि" },
  email: { en: "Email", hi: "ईमेल" },
  phone: { en: "Phone", hi: "फ़ोन" },
  address: { en: "Address", hi: "पता" },
  aadhaar_no: { en: "Aadhaar Number", hi: "आधार संख्या" },
  save_profile: { en: "Save Profile", hi: "प्रोफ़ाइल सेव करें" },
  saved: { en: "Saved!", hi: "सेव हो गया!" },
  privacy_policy: { en: "Privacy Policy", hi: "गोपनीयता नीति" },
  reminders: { en: "Reminders", hi: "रिमाइंडर" },
  enable_reminder: { en: "Enable voice reminder", hi: "वॉइस रिमाइंडर चालू करें" },
  disable_reminder: { en: "Reminder enabled", hi: "रिमाइंडर चालू है" },
  deadline: { en: "Deadline", hi: "अंतिम तिथि" },
  back: { en: "Back", hi: "वापस" },
};

export function t(key: keyof typeof D, lang?: AppLang): string {
  const l = lang ?? getLang();
  return D[key]?.[l] ?? D[key]?.en ?? String(key);
}
