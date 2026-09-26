import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ChevronRight, Search, Bell, BellRing, FolderOpen, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { speakBilingual } from "@/lib/voice";
import { useReminderState } from "@/lib/reminders";
import { getDeadline, analyzeDeadline } from "@/lib/deadlines";
import { useLang } from "@/lib/i18n";
import { CATEGORIES, SECTIONS, categoriesBySection, setSelectedCategory, type Category } from "@/lib/categories";

export const Route = createFileRoute("/exams")({
  head: () => ({ meta: [{ title: "Choose Category — EasyForm AI 2.0" }] }),
  component: Exams,
});

function ReminderBell({ examId }: { examId: string }) {
  const [on, toggle] = useReminderState(examId);
  const [lang] = useLang();
  const d = getDeadline(examId);
  const dateStr = d
    ? new Date(d.deadline).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
        day: "numeric",
        month: "short",
      })
    : lang === "hi" ? "रिमाइंडर" : "Remind";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      aria-label={on ? "Disable reminder" : "Enable reminder"}
      className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors ${
        on ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {on ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      <span>{dateStr}</span>
    </button>
  );
}

function CategoryRow({ c, lang }: { c: Category; lang: "en" | "hi" }) {
  const deadlineInfo = analyzeDeadline(c.id);

  return (
    <div className="group rounded-3xl glass p-3.5 shadow-card border border-border/70 hover:border-primary/40 transition-colors space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/eligibility/$examId"
          params={{ examId: c.id }}
          onClick={() => {
            setSelectedCategory(c.id);
            speakBilingual(
              `${c.name} selected. Let's check your eligibility first.`,
              `आपने ${c.name} चुना है। चलिए पहले आपकी पात्रता जाँचते हैं।`,
            );
          }}
          className="flex flex-1 items-center gap-3 min-w-0"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-primary text-xs font-bold text-primary-foreground shadow-glow">
            {c.name.split(" ").slice(0, 2).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{c.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{c.section}</p>
          </div>
        </Link>

        {deadlineInfo && (
          <span className="shrink-0 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-semibold text-warning flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {deadlineInfo.daysRemaining}d left
          </span>
        )}

        <ReminderBell examId={c.id} />
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-border/40 text-xs">
        <Link
          to="/eligibility/$examId"
          params={{ examId: c.id }}
          onClick={() => setSelectedCategory(c.id)}
          className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary py-1.5 font-semibold transition-colors"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{lang === "hi" ? "पात्रता जाँचें" : "Check Eligibility"}</span>
        </Link>
        <Link
          to="/guidance/$examId"
          params={{ examId: c.id }}
          onClick={() => setSelectedCategory(c.id)}
          className="rounded-xl border border-border px-3 py-1.5 text-muted-foreground hover:bg-muted font-medium transition-colors"
        >
          {lang === "hi" ? "AI गाइड" : "AI Guide"}
        </Link>
      </div>
    </div>
  );
}

function Exams() {
  const [lang] = useLang();
  const [q, setQ] = useState("");
  const grouped = useMemo(() => categoriesBySection(), []);
  const ql = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!ql) return null;
    return CATEGORIES.filter((c) =>
      c.name.toLowerCase().includes(ql) ||
      c.section.toLowerCase().includes(ql) ||
      (c.aliases ?? []).some((a) => a.toLowerCase().includes(ql)),
    );
  }, [ql]);

  return (
    <AppShell title={lang === "hi" ? "श्रेणी चुनें" : "Choose Category"} back="/">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold leading-tight">
            {lang === "hi" ? "आप किस फॉर्म की तैयारी कर रहे हैं?" : "Which form are you preparing for?"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {lang === "hi"
              ? "50+ श्रेणियाँ — EasyForm AI हर स्टेप पर पात्रता, दस्तावेज़ और पोर्टल का मार्गदर्शन देगी।"
              : "50+ categories with instant eligibility checks, checklists, and official portals."}
          </p>
        </div>

        {/* Search Input */}
        <div className="sticky top-2 z-10 -mx-1 px-1 py-1 backdrop-blur-md">
          <div className="flex items-center gap-2 rounded-2xl glass px-3.5 py-2.5 shadow-card border border-border/60">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={lang === "hi" ? "खोजें: SSC, Railway, NEET, NDA, पासपोर्ट…" : "Search: SSC, Railway, NEET, NDA, Passport…"}
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
            {q && (
              <button onClick={() => setQ("")} className="text-xs text-muted-foreground hover:text-foreground">
                ✕
              </button>
            )}
          </div>
        </div>

        {filtered ? (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                {lang === "hi" ? "कोई परिणाम नहीं मिला।" : "No matching forms found."}
              </p>
            ) : (
              filtered.map((c) => <CategoryRow key={c.id} c={c} lang={lang} />)
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {SECTIONS.map((s) => (
              <section key={s} className="space-y-2.5">
                <div className="flex items-center gap-2 px-1">
                  <FolderOpen className="h-4 w-4 text-primary" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{s}</h2>
                  <span className="text-[10px] text-muted-foreground font-semibold">({grouped[s]?.length ?? 0})</span>
                </div>
                <div className="space-y-2.5">
                  {grouped[s]?.map((c) => <CategoryRow key={c.id} c={c} lang={lang} />)}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
