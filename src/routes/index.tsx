import { createFileRoute, Link } from "@tanstack/react-router";
import { SarthiAvatar } from "@/components/AppShell";
import { ArrowRight, Settings, Sparkles, ShieldCheck, Mic, Compass, LayoutDashboard, CheckCircle2, Globe, FileCheck2, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useVoice } from "@/hooks/useVoice";
import { speak as speakRaw, stopSpeaking } from "@/lib/voice";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EasyForm AI 2.0 — Government Application Preparation Assistant" },
      { name: "description", content: "Government Forms. Made Simple. AI-guided eligibility checking, document verification, readiness scoring, and deadline tracking for government exams and schemes." },
    ],
  }),
  component: Welcome,
});

const INTRO_HI =
  "नमस्ते! ईज़ी फॉर्म एआई 2.0 में आपका स्वागत है। मैं आपका व्यक्तिगत सरकारी फॉर्म सहायक हूँ। मैं आपकी पात्रता जाँचने, आवश्यक दस्तावेज़ तैयार कराने, उनकी गुणवत्ता सत्यापित करने और आपको सही आवेदन पोर्टल तक पहुँचाने में पूरी मदद करूँगा।";

function Welcome() {
  const [lang, setLang] = useLang();
  const { isSpeaking } = useVoice();
  const [speakingIntro, setSpeakingIntro] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const t = setTimeout(() => {
      try {
        setSpeakingIntro(true);
        let ended = false;
        const finish = () => {
          if (ended) return;
          ended = true;
          setSpeakingIntro(false);
        };
        speakRaw(INTRO_HI, { lang: "hi", onEnd: finish });
        window.setTimeout(finish, 14000);
      } catch {
        setSpeakingIntro(false);
      }
    }, 400);
    return () => {
      clearTimeout(t);
      stopSpeaking();
    };
  }, []);

  const flowSteps = [
    { num: 1, titleEn: "Choose a Form", titleHi: "फॉर्म चुनें", descEn: "SSC, Railway, NDA, UPSC or 50+ schemes" },
    { num: 2, titleEn: "Check Eligibility", titleHi: "पात्रता जाँच", descEn: "Age, qualification, and category relaxation" },
    { num: 3, titleEn: "Dynamic Checklist", titleHi: "दस्तावेज़ चेकलिस्ट", descEn: "Tailored required and conditional files" },
    { num: 4, titleEn: "Verify Quality", titleHi: "गुणवत्ता सत्यापन", descEn: "Size, format, sharpness, and readability" },
    { num: 5, titleEn: "Review & Score", titleHi: "तत्परता स्कोर", descEn: "Fix remaining issues before submission" },
    { num: 6, titleEn: "Official Portal", titleHi: "आधिकारिक पोर्टल", descEn: "Apply directly on verified government portal" },
  ];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 pb-24 pt-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">
              Easy<span className="gradient-text">Form</span> <span className="text-xs font-semibold text-primary">2.0</span>
            </span>
            <span className="block text-[10px] text-muted-foreground">Govt Application Preparation</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold shadow-xs hover:bg-muted"
          >
            <Globe className="h-3 w-3 text-primary" />
            <span>{lang === "en" ? "हिन्दी" : "EN"}</span>
          </button>
          <Link to="/settings" className="grid h-9 w-9 place-items-center rounded-full glass" title="Settings">
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="mt-8 flex flex-col items-center text-center">
        <SarthiAvatar size="lg" speaking={isSpeaking || speakingIntro} />
        
        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Government Forms. Made Simple.</span>
        </div>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Government Application <span className="gradient-text">Preparation Assistant</span>
        </h1>
        <p className="mt-2.5 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {lang === "hi"
            ? "सरकारी फॉर्म भरने से पहले पात्रता जाँचें, दस्तावेज़ तैयार करें, और बिना किसी त्रुटि के आधिकारिक पोर्टल पर आवेदन करें।"
            : "Verify eligibility, assemble verified documents, check quality standards, and submit error-free on official portals."}
        </p>

        {/* Feature Highlights Grid */}
        <div className="mt-6 grid w-full grid-cols-3 gap-3">
          {[
            { icon: ShieldCheck, labelEn: "Smart Checks", labelHi: "स्मार्ट जाँच" },
            { icon: Mic, labelEn: "Voice AI", labelHi: "वॉयस गाइड" },
            { icon: FileCheck2, labelEn: "Readiness Score", labelHi: "तत्परता स्कोर" },
          ].map((f) => (
            <div key={f.labelEn} className="glass rounded-2xl p-3 text-center shadow-card border border-border/60">
              <f.icon className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-1 text-xs font-semibold">{lang === "hi" ? f.labelHi : f.labelEn}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="mt-8 space-y-3">
        <Link
          to="/discovery"
          className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-4 text-base font-bold text-primary-foreground shadow-glow transition-transform active:scale-95"
        >
          <Compass className="h-5 w-5" />
          <span>{lang === "hi" ? "मेरे लिए फॉर्म खोजें" : "Find Forms for Me"}</span>
          <ArrowRight className="h-5 w-5" />
        </Link>

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            to="/exams"
            className="flex items-center justify-center gap-2 rounded-2xl glass border border-border/80 py-3.5 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-xs"
          >
            <span>{lang === "hi" ? "50+ सरकारी फॉर्म देखें" : "Explore All 50+ Forms"}</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 rounded-2xl glass border border-border/80 py-3.5 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-xs"
          >
            <LayoutDashboard className="h-4 w-4 text-primary" />
            <span>{lang === "hi" ? "मेरा डैशबोर्ड" : "My Dashboard"}</span>
          </Link>
        </div>
      </div>

      {/* 6-Step Visual Flow */}
      <div className="mt-10 rounded-3xl glass p-5 shadow-card border border-border/60 space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {lang === "hi" ? "EasyForm 2.0 तैयारी प्रक्रिया" : "HOW EASYFORM 2.0 WORKS"}
          </h2>
          <span className="text-[10px] font-semibold text-primary">Zero Rejections</span>
        </div>

        <div className="space-y-2.5">
          {flowSteps.map((s) => (
            <div key={s.num} className="flex items-start gap-3 rounded-2xl bg-card/50 border border-border/50 p-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-xl gradient-primary text-primary-foreground text-xs font-bold shrink-0">
                {s.num}
              </span>
              <div className="flex-1">
                <span className="font-bold text-xs text-foreground block">
                  {lang === "hi" ? s.titleHi : s.titleEn}
                </span>
                <span className="text-[11px] text-muted-foreground">{s.descEn}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer & Disclaimer */}
      <div className="mt-8 text-center space-y-2 text-xs text-muted-foreground">
        <p className="text-[11px] leading-relaxed">
          Guidance platform only · Not affiliated with any government body · Always verify on official portal
        </p>
        <div className="flex items-center justify-center gap-3 text-[11px]">
          <Link to="/profile" className="hover:text-primary font-medium">My Profile</Link>
          <span>·</span>
          <Link to="/dashboard" className="hover:text-primary font-medium">Dashboard</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-primary font-medium">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
