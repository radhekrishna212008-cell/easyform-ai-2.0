## Goal
Make EasyForm AI auto-introduce itself in Hindi (voice + on-screen text) as soon as the app opens, before the user sees categories/search/voice input.

## Changes

### 1. `src/routes/index.tsx` (home / startup screen)
- Replace the current short greeting (`"Namaste! Main EasyForm AI hoon..."`) with the full Hindi introduction:
  > "नमस्ते! EasyForm में आपका स्वागत है। मैं EasyForm AI हूँ, आपका व्यक्तिगत फॉर्म सहायक। मैं आपके दस्तावेज़ों की जाँच करने, आवश्यक दस्तावेज़ बताने, उनकी सत्यता की पुष्टि करने और आपको सही आवेदन पोर्टल तक पहुँचाने में सहायता करूँगा। कृपया बताइए, आप किस फॉर्म, परीक्षा, छात्रवृत्ति या सेवा के लिए सहायता चाहते हैं?"
- Speak it on mount via `speak(introHi, { lang: "hi" })` — force Hindi voice regardless of the user's `VoiceMode` setting so the very first greeting is always Hindi (per requirement "spoken in Hindi by default").
- Remove the `sessionStorage` "greeted" guard so the intro plays every time the app starts (per "Play this introduction automatically every time"). Keep a short in-component ref guard so React StrictMode double-mount doesn't double-speak in the same render.
- Render the Hindi intro text on screen inside a prominent card under the avatar (Devanagari, readable size, works on mobile 405px width and desktop).
- Gate the "Start Form Preparation" CTA + feature chips behind an `introReady` state that flips true when:
  - the speech `onEnd` fires, OR
  - the user taps "Skip intro" (small secondary button shown while speaking, so users on browsers without TTS or who want to move on aren't blocked), OR
  - a safety timeout (~12s) elapses in case `speechSynthesis` never fires `onend` (known Chrome bug on long utterances).
- Until `introReady`, hide/disable the CTA and the links to categories so categories/search/voice input only appear after the intro, matching the "introduction should play before showing categories" rule.

### 2. `src/routes/exams.tsx` (categories + search + mic)
- No content/design changes. Categories page is only reached via the CTA on `/`, which is now gated. No edits needed beyond confirming nothing else triggers it automatically.

### 3. Mobile/desktop behavior
- Use existing Tailwind responsive classes already on the page; the new intro card uses `text-base leading-relaxed` and fits in the existing `max-w-md` column. No layout regressions.
- iOS Safari requires a user gesture for `speechSynthesis.speak`. When autoplay is blocked, the on-screen Hindi text still shows and a "Tap to hear introduction" button appears (falls back gracefully without breaking the flow — the text alone satisfies the on-screen requirement, and tapping unlocks audio).

## Non-goals / preserved
- No changes to AI flow, voice mode settings, reminders, profile, privacy, document verification, or category routing.
- `speakBilingual`, `VoiceMode`, and the Settings language picker remain untouched — only the first-launch greeting is forced Hindi.
- Branding (EasyForm / EasyForm AI) unchanged.

## Technical notes
- `speak()` in `src/lib/voice.ts` already accepts `{ lang: "hi" }` and picks a `hi-IN` voice; no library changes needed.
- The intro string lives as a single `const INTRO_HI` in `src/routes/index.tsx` so voice and on-screen text stay in sync.