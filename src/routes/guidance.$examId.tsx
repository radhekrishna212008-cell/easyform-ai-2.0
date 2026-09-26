import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell, SarthiAvatar } from "@/components/AppShell";
import { Mic, Volume2, ArrowRight, ShieldCheck, ListChecks, Upload, ExternalLink, Sparkles } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useVoice } from "@/hooks/useVoice";
import { parseCommand } from "@/lib/commands";
import { getCategory, setSelectedCategory } from "@/lib/categories";
import { useLang } from "@/lib/i18n";
import { loadEligibilityState } from "@/lib/eligibility";
import { generateDynamicChecklist } from "@/lib/dynamic-checklist";
import { calculateApplicationReadiness } from "@/lib/readiness";
import { analyzeDeadline } from "@/lib/deadlines";

export const Route = createFileRoute("/guidance/$examId")({
  head: () => ({ meta: [{ title: "AI Guidance & Assistant — EasyForm AI 2.0" }] }),
  component: Guidance,
});

function introMessages(name: string, hi: boolean) {
  if (hi) {
    return [
      { from: "ai" as const, text: `नमस्ते! मैं EasyForm AI हूँ। आपने ${name} चुना है — मैं आपकी पूरी मदद करूँगी।` },
      { from: "ai" as const, text: "सबसे पहले 'Check Eligibility' पर टैप करके अपनी आयु और योग्यता की पुष्टि कर लें।" },
      { from: "ai" as const, text: "इसके बाद हम आपके लिए अनुकूलित दस्तावेज़ चेकलिस्ट तैयार करेंगे।" },
    ];
  }
  return [
    { from: "ai" as const, text: `Hi! I am EasyForm AI. You selected ${name} — I will guide you through every step.` },
    { from: "ai" as const, text: "First, verify your criteria using the Smart Eligibility Checker." },
    { from: "ai" as const, text: "Next, we will assemble your dynamic document checklist with zero missing items." },
  ];
}

function Guidance() {
  const { examId } = Route.useParams();
  const [lang] = useLang();
  const category = getCategory(examId);
  const name = category?.name ?? examId.toUpperCase();
  const { speakBilingual, isSpeaking, isListening, startListening, stopListening, transcript, interim, clearTranscript, noSpeechTick } = useVoice();
  const [chat, setChat] = useState<{ from: "ai" | "user"; text: string }[]>(() => introMessages(name, lang === "hi"));
  const navigate = useNavigate();

  const eligibility = useMemo(() => loadEligibilityState(examId), [examId]);
  const checklist = useMemo(() => generateDynamicChecklist(examId, eligibility), [examId, eligibility]);
  const deadlineInfo = useMemo(() => analyzeDeadline(examId), [examId]);

  useEffect(() => {
    setSelectedCategory(examId);
    speakBilingual(
      `${name} selected. I will guide you through every step of your preparation.`,
      `आपने ${name} चुना है। मैं तैयारी के हर स्टेप पर आपका मार्गदर्शन करूँगी।`,
    );
  }, [examId, name, speakBilingual]);

  useEffect(() => {
    if (!transcript) return;
    const lower = transcript.toLowerCase();

    // Context-aware replies
    let replyEn = "";
    let replyHi = "";
    let target: string | undefined;

    if (lower.includes("eligible") || lower.includes("eligibility") || lower.includes("patra")) {
      target = `/eligibility/${examId}`;
      replyEn = "Opening the Eligibility Checker so we can evaluate your age and qualification criteria.";
      replyHi = "पात्रता जाँच स्क्रीन खोल रही हूँ ताकि आयु और शैक्षणिक योग्यता की पुष्टि कर सकें।";
    } else if (lower.includes("checklist") || lower.includes("document") || lower.includes("dastavej") || lower.includes("kaagaz")) {
      target = `/checklist/${examId}`;
      replyEn = `For ${name}, you will need ${checklist.required.length} required documents. Opening checklist.`;
      replyHi = `${name} के लिए आपको ${checklist.required.length} अनिवार्य दस्तावेज़ चाहिए। चेकलिस्ट खोल रही हूँ।`;
    } else {
      const parsed = parseCommand(transcript);
      replyEn = parsed.replyEn;
      replyHi = parsed.replyHi;
      target = parsed.navigateToPath ?? parsed.navigateTo;
    }

    const display = lang === "hi" ? replyHi : replyEn;
    setChat((c) => [...c, { from: "user", text: transcript }, { from: "ai", text: display }]);
    speakBilingual(replyEn, replyHi);
    clearTranscript();

    if (target) {
      const t = setTimeout(() => navigate({ to: target as any }), 2000);
      return () => clearTimeout(t);
    }
  }, [transcript, speakBilingual, clearTranscript, navigate, lang, examId, name, checklist.required.length]);

  useEffect(() => {
    if (noSpeechTick === 0) return;
    const en = "Sorry, I didn't catch that. Please say it again.";
    const hi = "माफ़ कीजिए, मैं सुन नहीं पाई। कृपया दोबारा बोलिए।";
    setChat((c) => [...c, { from: "ai", text: lang === "hi" ? hi : en }]);
    speakBilingual(en, hi);
  }, [noSpeechTick, speakBilingual, lang]);

  const active = isListening || isSpeaking;

  return (
    <AppShell title={name} back="/exams" examId={examId}>
      <div className="space-y-6 animate-fade-in">
        {/* Banner with AI status */}
        <div className="flex items-center gap-3 rounded-3xl glass p-5 shadow-card border border-border/60">
          <SarthiAvatar speaking={active} />
          <div className="flex-1">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
              EasyForm AI Voice Assistant
            </span>
            <h1 className="font-bold text-base text-foreground mt-0.5">{name} Guide</h1>
            <p className="text-xs text-muted-foreground">
              {isListening ? "Listening to your voice..." : isSpeaking ? "Speaking..." : "Tap microphone to ask anything"}
            </p>
          </div>
        </div>

        {/* 4 Quick Action Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            to="/eligibility/$examId"
            params={{ examId }}
            className="flex flex-col gap-1 rounded-2xl glass border border-border/70 p-3 hover:border-primary/40 transition-colors shadow-xs"
          >
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-bold text-xs text-foreground mt-1">
              {lang === "hi" ? "1. पात्रता जाँचें" : "1. Check Eligibility"}
            </span>
            <span className="text-[10px] text-muted-foreground">Age & Qualifications</span>
          </Link>

          <Link
            to="/checklist/$examId"
            params={{ examId }}
            className="flex flex-col gap-1 rounded-2xl glass border border-border/70 p-3 hover:border-primary/40 transition-colors shadow-xs"
          >
            <ListChecks className="h-5 w-5 text-primary" />
            <span className="font-bold text-xs text-foreground mt-1">
              {lang === "hi" ? "2. चेकलिस्ट देखें" : "2. Dynamic Checklist"}
            </span>
            <span className="text-[10px] text-muted-foreground">Tailored documents</span>
          </Link>

          <Link
            to="/upload"
            className="flex flex-col gap-1 rounded-2xl glass border border-border/70 p-3 hover:border-primary/40 transition-colors shadow-xs"
          >
            <Upload className="h-5 w-5 text-primary" />
            <span className="font-bold text-xs text-foreground mt-1">
              {lang === "hi" ? "3. अपलोड करें" : "3. Upload Files"}
            </span>
            <span className="text-[10px] text-muted-foreground">Photo, Sign, Marks</span>
          </Link>

          {category?.url ? (
            <a
              href={category.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1 rounded-2xl glass border border-border/70 p-3 hover:border-primary/40 transition-colors shadow-xs"
            >
              <ExternalLink className="h-5 w-5 text-primary" />
              <span className="font-bold text-xs text-foreground mt-1">
                {lang === "hi" ? "4. सरकारी पोर्टल" : "4. Official Portal"}
              </span>
              <span className="text-[10px] text-muted-foreground">Direct URL</span>
            </a>
          ) : null}
        </div>

        {/* Chat History */}
        <div className="space-y-3">
          {chat.map((m, i) => (
            <div key={i} className={`flex ${m.from === "ai" ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-card ${
                  m.from === "ai"
                    ? "glass rounded-tl-xs border border-border/60"
                    : "gradient-primary text-primary-foreground rounded-tr-xs"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Voice Control Pad */}
        <div className="flex flex-col items-center rounded-3xl glass p-6 shadow-card border border-border/60">
          <div className="mb-3 flex h-8 items-end gap-1">
            {[...Array(7)].map((_, i) => (
              <span
                key={i}
                className={`w-1.5 rounded-full ${active ? "gradient-primary animate-wave" : "bg-muted"}`}
                style={{ height: "100%", animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => (isListening ? stopListening() : startListening())}
            className={`relative grid h-16 w-16 place-items-center rounded-full gradient-primary shadow-glow transition-all active:scale-95 ${
              isListening ? "ring-4 ring-primary/40 ring-offset-2 ring-offset-background" : ""
            }`}
          >
            {active && <span className="absolute inset-0 rounded-full gradient-primary animate-pulse-ring" />}
            {isListening && <span className="absolute -inset-2 rounded-full bg-primary/20 blur-md animate-pulse" />}
            <Mic className="relative h-7 w-7 text-primary-foreground" />
          </button>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Volume2 className="h-3.5 w-3.5" />
            {isListening ? "Listening to you..." : isSpeaking ? "Speaking..." : "Tap mic and speak in Hindi or English"}
          </p>

          {(interim || isListening) && (
            <p className="mt-2 text-center text-xs font-semibold text-foreground">
              {interim || "..."}
            </p>
          )}

          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Try: "Documents kya chahiye", "Am I eligible", "Verification shuru karein"
          </p>
        </div>

        {/* Primary Step Trigger */}
        <Link
          to="/eligibility/$examId"
          params={{ examId }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-4 font-bold text-primary-foreground shadow-glow active:scale-95 transition-transform"
        >
          <ShieldCheck className="h-5 w-5" />
          <span>{lang === "hi" ? "पात्रता जाँच शुरू करें" : "Start Eligibility Check"}</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </AppShell>
  );
}
