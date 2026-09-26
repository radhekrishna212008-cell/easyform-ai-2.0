import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState, useEffect } from "react";
import { Languages, Mic, Moon, ShieldCheck, User } from "lucide-react";
import { isVoiceEnabled, setVoiceEnabled } from "@/lib/voice";
import { useLang, t, useVoiceMode, type AppLang, type VoiceMode } from "@/lib/i18n";
import { speakBilingual } from "@/lib/voice";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — EasyForm" }] }),
  component: SettingsPage,
});

const LANG_OPTIONS: { code: AppLang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
];

function SettingsPage() {
  const [lang, setLangPref] = useLang();
  const [voiceMode, setVoiceModePref] = useVoiceMode();
  const [voice, setVoice] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setVoice(isVoiceEnabled());
  }, []);

  useEffect(() => {
    setVoiceEnabled(voice);
  }, [voice]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <AppShell title="Settings" back="/">
      <h1 className="text-2xl font-bold">
        {lang === "hi" ? "प्राथमिकताएँ" : "Preferences"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {lang === "hi"
          ? "EasyForm AI को अपनी पसंद के अनुसार सेट करें।"
          : "Customize EasyForm AI to your style."}
      </p>

      <section className="mt-6 rounded-2xl glass p-4 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <Languages className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">{t("language", lang)}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {LANG_OPTIONS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLangPref(l.code)}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                lang === l.code
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{t("more_soon", lang)}</p>
      </section>

      <section className="mt-4 rounded-2xl glass p-4 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <Mic className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">{t("voice_language", lang)}</p>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">{t("voice_language_desc", lang)}</p>
        <div className="grid grid-cols-3 gap-2">
          {(["en", "hi", "auto"] as VoiceMode[]).map((m) => {
            const label = m === "en" ? t("english", lang) : m === "hi" ? t("hindi", lang) : t("auto", lang);
            return (
              <button
                key={m}
                onClick={() => {
                  setVoiceModePref(m);
                  // Preview the new voice mode immediately.
                  setTimeout(
                    () => speakBilingual("Voice language updated.", "वॉइस भाषा अपडेट हो गई है।"),
                    50,
                  );
                }}
                className={`rounded-xl px-2 py-2.5 text-xs font-medium transition-all ${
                  voiceMode === m
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-4 space-y-3">
        <Toggle
          icon={Mic}
          label={lang === "hi" ? "वॉइस असिस्टेंट" : "Voice Assistant"}
          desc={lang === "hi" ? "EasyForm AI की आवाज़ चालू करें" : "Enable EasyForm AI voice"}
          value={voice}
          onChange={setVoice}
        />
        <Toggle
          icon={Moon}
          label={lang === "hi" ? "डार्क मोड" : "Dark Mode"}
          desc={lang === "hi" ? "रात में आँखों के लिए आरामदायक" : "Easier on the eyes at night"}
          value={dark}
          onChange={setDark}
        />
      </section>

      <section className="mt-4 space-y-3">
        <NavRow to="/profile" icon={User} label={t("profile", lang)} desc={t("profile_desc", lang)} />
        <NavRow
          to="/privacy"
          icon={ShieldCheck}
          label={t("privacy_policy", lang)}
          desc={lang === "hi" ? "हम आपके डेटा की रक्षा कैसे करते हैं" : "How we protect your data"}
        />
      </section>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        EasyForm v1.0 · {lang === "hi" ? "मार्गदर्शन ऐप" : "Guidance app"} ·{" "}
        {lang === "hi" ? "किसी सरकारी संस्था से संबद्ध नहीं" : "Not affiliated with any government body"}
      </p>
    </AppShell>
  );
}

function NavRow({
  to,
  icon: Icon,
  label,
  desc,
}: {
  to: string;
  icon: typeof Mic;
  label: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="flex w-full items-center gap-3 rounded-2xl glass p-4 shadow-card text-left active:scale-[0.99]"
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </Link>
  );
}

function Toggle({
  icon: Icon,
  label,
  desc,
  value,
  onChange,
}: {
  icon: typeof Mic;
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex w-full items-center gap-3 rounded-2xl glass p-4 shadow-card text-left"
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${value ? "gradient-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
