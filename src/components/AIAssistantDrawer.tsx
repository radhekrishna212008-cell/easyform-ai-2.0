// Context-Aware AI Assistant Drawer for EasyForm AI 2.0
// Answers questions about documents, eligibility, issues, readiness score, and official links.

import { useState, useEffect, useRef } from "react";
import { SarthiAvatar } from "@/components/AppShell";
import { Mic, Send, X, Sparkles, AlertCircle, ArrowRight, Volume2 } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { useLang } from "@/lib/i18n";
import { getSelectedCategory } from "@/lib/categories";
import { calculateApplicationReadiness } from "@/lib/readiness";
import { loadEligibilityState } from "@/lib/eligibility";
import { generateDynamicChecklist } from "@/lib/dynamic-checklist";
import { analyzeDeadline } from "@/lib/deadlines";

export function AIAssistantDrawer({
  currentExamId,
  isOpen,
  onClose,
}: {
  currentExamId?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [lang] = useLang();
  const cat = currentExamId ? { id: currentExamId, name: currentExamId.toUpperCase() } : getSelectedCategory();
  const activeExamId = cat?.id || "ssc-cgl";

  const { speakBilingual, isSpeaking, isListening, startListening, stopListening, transcript, interim, clearTranscript } = useVoice();
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState<{ from: "ai" | "user"; text: string }[]>(() => [
    {
      from: "ai",
      text:
        lang === "hi"
          ? `नमस्ते! मैं EasyForm AI हूँ। आप मुझसे पात्रता, दस्तावेज़, एरर या ऑफिशियल पोर्टल के बारे में कुछ भी पूछ सकते हैं।`
          : `Hello! I'm EasyForm AI. Ask me anything about your documents, eligibility, issues, or official portals.`,
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Voice transcript listener
  useEffect(() => {
    if (transcript) {
      handleUserQuery(transcript);
      clearTranscript();
    }
  }, [transcript]);

  // Answer generator using live context
  const handleUserQuery = (query: string) => {
    const q = query.toLowerCase();

    // 1. Gather context
    let uploads = {};
    try {
      const raw = sessionStorage.getItem("formsathi:uploads");
      if (raw) uploads = JSON.parse(raw);
    } catch {}

    const eligibility = loadEligibilityState(activeExamId);
    const checklist = generateDynamicChecklist(activeExamId, eligibility);
    const readiness = calculateApplicationReadiness(activeExamId, uploads);
    const deadlineInfo = analyzeDeadline(activeExamId);

    let replyEn = "";
    let replyHi = "";

    if (q.includes("document") || q.includes("dastavej") || q.includes("kaagaz") || q.includes("need")) {
      const reqList = checklist.required.map((r) => r.doc.nameEn).join(", ");
      const condList = checklist.conditional.filter((c) => c.conditionMet).map((c) => c.doc.nameEn).join(", ");
      replyEn = `For ${cat?.name || "your selected form"}, you need: ${reqList}.${condList ? ` Plus category documents: ${condList}.` : ""}`;
      replyHi = `${cat?.name || "आपके फॉर्म"} के लिए आवश्यक दस्तावेज़: ${checklist.required.map((r) => r.doc.nameHi).join(", ")}।`;
    } else if (q.includes("eligible") || q.includes("eligibility") || q.includes("patra")) {
      if (eligibility && eligibility.dob) {
        replyEn = `Based on your stated details (DOB: ${eligibility.dob}, Education: ${eligibility.educationLevel}), you appear to meet the primary criteria. Please check the official notification for final terms.`;
        replyHi = `आपकी दी गई जानकारी के अनुसार आप प्राथमिक पात्रता मानदंडों को पूरा करते प्रतीत होते हैं। अंतिम पुष्टि के लिए आधिकारिक अधिसूचना अवश्य देखें।`;
      } else {
        replyEn = `You haven't completed the Eligibility Checker yet for ${cat?.name || "this form"}. Tap 'Check Eligibility' to verify in 2 minutes.`;
        replyHi = `आपने अभी तक पात्रता जाँच पूरी नहीं की है। कृपया 'Check Eligibility' पर टैप करके 2 मिनट में जाँचें।`;
      }
    } else if (q.includes("ready") || q.includes("score") || q.includes("percent") || q.includes("how much")) {
      replyEn = `Your application is currently ${readiness.score}% ready. ${readiness.issues.length ? `You have ${readiness.issues.length} item(s) to resolve.` : "All required items look great!"}`;
      replyHi = `आपका आवेदन वर्तमान में ${readiness.score}% तैयार है। ${readiness.issues.length ? `आपको ${readiness.issues.length} समस्या(एं) ठीक करनी हैं।` : "सभी आवश्यक चीजें तैयार हैं!"}`;
    } else if (q.includes("fix") || q.includes("first") || q.includes("problem") || q.includes("error") || q.includes("issue")) {
      if (readiness.issues.length > 0) {
        const top = readiness.issues[0];
        replyEn = `The most important issue to fix first is: ${top.titleEn}. ${top.descriptionEn}`;
        replyHi = `सबसे पहले यह समस्या ठीक करें: ${top.titleHi}। ${top.descriptionHi}`;
      } else {
        replyEn = "Great news! EasyForm found no pending errors in your current application.";
        replyHi = "बधाई! आपके वर्तमान आवेदन में कोई त्रुटि नहीं पाई गई है।";
      }
    } else if (q.includes("apply") || q.includes("where") || q.includes("portal") || q.includes("website") || q.includes("link")) {
      const url = cat && "url" in cat ? (cat as any).url : "https://india.gov.in";
      replyEn = `Official applications must be completed on the authoritative portal: ${url}. EasyForm prepares your files so you can fill it without errors.`;
      replyHi = `आधिकारिक आवेदन केवल सरकारी पोर्टल (${url}) पर ही भरा जाएगा। EasyForm आपके दस्तावेज़ तैयार करता है ताकि फॉर्म भरते समय कोई गलती न हो।`;
    } else if (q.includes("deadline") || q.includes("date") || q.includes("last date")) {
      if (deadlineInfo) {
        replyEn = `The listed application deadline for ${cat?.name || "this form"} is ${deadlineInfo.formattedDeadline} (${deadlineInfo.statusLabelEn}).`;
        replyHi = `${cat?.name || "इस फॉर्म"} की अंतिम तिथि ${deadlineInfo.formattedDeadline} है (${deadlineInfo.statusLabelHi})।`;
      } else {
        replyEn = "Application schedules are updated based on official gazette notifications. Check the official portal.";
        replyHi = "आवेदन तिथियां आधिकारिक अधिसूचनाओं के आधार पर अपडेट होती हैं। पोर्टल देखें।";
      }
    } else {
      replyEn = `I am here to guide your preparation for ${cat?.name || "government applications"}. You can ask about required documents, eligibility criteria, fixing photo/signature issues, or deadlines.`;
      replyHi = `मैं आपके फॉर्म की तैयारी में मदद करने के लिए उपलब्ध हूँ। आप दस्तावेज़, पात्रता, फोटो/हस्ताक्षर त्रुटि सुधार या अंतिम तिथि के बारे में पूछ सकते हैं।`;
    }

    const displayText = lang === "hi" ? replyHi : replyEn;
    setMessages((prev) => [...prev, { from: "user", text: query }, { from: "ai", text: displayText }]);
    speakBilingual(replyEn, replyHi);
  };

  const submitQuery = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;
    const txt = inputVal.trim();
    setInputVal("");
    handleUserQuery(txt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fade-in sm:items-center sm:justify-center">
      <div className="flex h-[85vh] w-full max-w-md flex-col rounded-t-3xl sm:rounded-3xl bg-card border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/40 px-5 py-4">
          <div className="flex items-center gap-3">
            <SarthiAvatar size="sm" speaking={isSpeaking || isListening} />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm">EasyForm AI Assistant</h3>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">2.0</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isListening ? "Listening to you..." : isSpeaking ? "Speaking..." : cat?.name || "Preparation Guide"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex gap-2 overflow-x-auto border-b border-border/40 bg-card px-4 py-2.5 scrollbar-none">
          {[
            { label: lang === "hi" ? "दस्तावेज़ क्या चाहिए?" : "What documents do I need?", q: "What documents do I need?" },
            { label: lang === "hi" ? "मेरी पात्रता क्या है?" : "Am I eligible?", q: "Am I eligible?" },
            { label: lang === "hi" ? "तैयारी कितनी हुई?" : "How ready is my application?", q: "How ready is my application?" },
            { label: lang === "hi" ? "पहले क्या ठीक करें?" : "What should I fix first?", q: "What should I fix first?" },
            { label: lang === "hi" ? "अप्लाई कहाँ करें?" : "Where do I apply?", q: "Where do I apply?" },
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleUserQuery(chip.q)}
              className="shrink-0 rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-[11px] font-medium text-foreground hover:bg-primary/10 hover:border-primary/40 transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "ai" ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                  m.from === "ai"
                    ? "glass rounded-tl-xs border border-border/60"
                    : "gradient-primary text-primary-foreground rounded-tr-xs"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input box + Voice button */}
        <form onSubmit={submitQuery} className="border-t border-border/50 bg-card p-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition-all ${
                isListening
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "bg-muted text-primary hover:bg-muted/80"
              }`}
              title={isListening ? "Stop listening" : "Speak to AI"}
            >
              <Mic className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={lang === "hi" ? "पूछिए: 'दस्तावेज़ क्या चाहिए?'..." : "Ask: 'What should I fix first?'..."}
              className="flex-1 rounded-2xl border border-input bg-muted/30 px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-primary text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
