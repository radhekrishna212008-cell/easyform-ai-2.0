// Map voice transcripts ...
// and an optional navigation target. Replies include both English and Hindi
// so the voice layer can honor the user's language preference (Auto/En/Hi).

import { matchCategory, setSelectedCategory } from "@/lib/categories";

export type CommandResult = {
  replyEn: string;
  replyHi: string;
  navigateTo?: "/exams" | "/upload" | "/verify" | "/ready" | "/errors" | "/";
  navigateToPath?: string;
};

type Intent =
  | "documents" | "photo" | "signature" | "verify" | "upload"
  | "exams" | "next" | "errors" | "ready" | "greet" | "fallback";

function classify(raw: string): Intent {
  const t = raw.toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => t.includes(k));

  if (has("document", "documents", "dastavej", "dastavez", "दस्तावेज", "कागज", "required", "zaroori", "चाहिए"))
    return "documents";
  if (has("photo", "tasveer", "तस्वीर", "फोटो", "image upload"))
    return "photo";
  if (has("signature", "sign", "hastakshar", "हस्ताक्षर", "साइन"))
    return "signature";
  if (has("verify", "verification", "jaanch", "जांच", "वेरिफ"))
    return "verify";
  if (has("upload", "अपलोड"))
    return "upload";
  if (has("exam", "pariksha", "परीक्षा", "form", "फॉर्म", "ssc", "railway", "nda"))
    return "exams";
  if (has("next", "aage", "agla", "continue", "badho", "आगे", "अगला"))
    return "next";
  if (has("error", "issue", "problem", "samasya", "समस्या", "गलती", "review"))
    return "errors";
  if (has("ready", "ssc website", "official", "website", "तैयार"))
    return "ready";
  if (has("namaste", "नमस्ते", "hello", "hi ", "help", "madad", "मदद", "kaise ho"))
    return "greet";
  return "fallback";
}

const REPLIES: Record<Intent, { en: string; hi: string }> = {
  documents: {
    en: "You will need: Aadhaar card, 10th and 12th marksheets, degree certificate, passport-size photo, and signature. Photo must be JPEG, 20 to 50 KB.",
    hi: "फॉर्म भरने के लिए आपको ये दस्तावेज़ चाहिए: आधार कार्ड, 10वीं और 12वीं की मार्कशीट, डिग्री सर्टिफिकेट, पासपोर्ट साइज़ फोटो, और सिग्नेचर। फोटो JPEG में, 20 से 50 KB के बीच होनी चाहिए।",
  },
  photo: {
    en: "Go to the Upload screen, tap Passport Photo, and pick a recent colour photo with a light background.",
    hi: "फोटो अपलोड करने के लिए Upload स्क्रीन पर जाइए, फिर Passport Photo पर टैप कीजिए और हाल की रंगीन फोटो चुनिए। बैकग्राउंड हल्का होना चाहिए।",
  },
  signature: {
    en: "Sign on white paper with black ink, scan it, and upload it in the Signature section. Keep size between 10 and 20 KB.",
    hi: "सफ़ेद कागज़ पर काली स्याही से हस्ताक्षर कीजिए, स्कैन कीजिए, और Upload स्क्रीन पर Signature सेक्शन में अपलोड कीजिए। साइज़ 10 से 20 KB रखिए।",
  },
  verify: {
    en: "Okay, starting verification. Please wait.",
    hi: "ठीक है, वेरिफिकेशन शुरू कर रहा हूँ। कृपया प्रतीक्षा कीजिए।",
  },
  upload: {
    en: "Opening the Upload screen. Upload your documents one by one.",
    hi: "Upload स्क्रीन खोल रहा हूँ। अपने दस्तावेज़ एक-एक करके अपलोड कीजिए।",
  },
  exams: {
    en: "Opening the category list. Please pick your form.",
    hi: "श्रेणी सूची खोल रहा हूँ। अपना फॉर्म चुनिए।",
  },
  next: {
    en: "Okay, moving to the next step.",
    hi: "ठीक है, अगले स्टेप पर ले जा रहा हूँ।",
  },
  errors: {
    en: "Opening the Issues screen so you can review all warnings.",
    hi: "Issues स्क्रीन खोल रहा हूँ, वहाँ आप सारी warnings देख सकते हैं।",
  },
  ready: {
    en: "You can now go to the official website. Opening the Ready screen.",
    hi: "आप अब official website पर जा सकते हैं। Ready स्क्रीन खोल रहा हूँ।",
  },
  greet: {
    en: "Hi! I am EasyForm AI. You can ask: which documents are needed, how to upload a photo, or start verification.",
    hi: "नमस्ते! मैं EasyForm AI हूँ। आप पूछ सकते हैं: कौन से दस्तावेज़ चाहिए, फोटो कैसे अपलोड करें, या वेरिफिकेशन शुरू करें।",
  },
  fallback: {
    en: "Sorry, I didn't catch that. You can ask: which documents are needed, how to upload a photo, or start verification.",
    hi: "माफ़ कीजिए, मैं समझ नहीं पाया। आप पूछ सकते हैं: कौन से दस्तावेज़ चाहिए, फोटो कैसे अपलोड करें, या वेरिफिकेशन शुरू करें।",
  },
};

const NAV: Partial<Record<Intent, CommandResult["navigateTo"]>> = {
  photo: "/upload",
  signature: "/upload",
  verify: "/verify",
  upload: "/upload",
  exams: "/exams",
  next: "/upload",
  errors: "/errors",
  ready: "/ready",
};

export function parseCommand(raw: string): CommandResult {
  const intent = classify(raw);

  // If the user said a category name (voice or text), prefer routing into
  // its dedicated guidance flow over any generic intent fallback.
  if (intent === "fallback" || intent === "exams") {
    const cat = matchCategory(raw);
    if (cat) {
      try { setSelectedCategory(cat.id); } catch { /* ignore */ }
      return {
        replyEn: `${cat.name} selected. I will guide you through every step.`,
        replyHi: `आपने ${cat.name} चुना है। मैं आपको हर स्टेप पर मार्गदर्शन करूँगा।`,
        navigateToPath: `/guidance/${cat.id}`,
      };
    }
  }

  const r = REPLIES[intent];
  return { replyEn: r.en, replyHi: r.hi, navigateTo: NAV[intent] };
}
