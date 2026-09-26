import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Check, ExternalLink, AlertTriangle, ArrowRight, ShieldCheck, Wrench, RefreshCw, XCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useVoice } from "@/hooks/useVoice";
import { getSelectedCategory, type Category } from "@/lib/categories";
import { useLang } from "@/lib/i18n";
import { calculateApplicationReadiness, type ApplicationReadinessReport, type ApplicationIssue } from "@/lib/readiness";
import { analyzeDeadline } from "@/lib/deadlines";
import { speakBilingual } from "@/lib/voice";

export const Route = createFileRoute("/ready")({
  head: () => ({ meta: [{ title: "Application Readiness — EasyForm AI 2.0" }] }),
  component: ReadyPage,
});

function ReadyPage() {
  const [lang] = useLang();
  const navigate = useNavigate();
  const { speakBilingual } = useVoice();

  const [cat, setCat] = useState<Category | undefined>(undefined);
  const [uploads, setUploads] = useState<Record<string, any>>({});
  const [fixingIssueId, setFixingIssueId] = useState<string | null>(null);

  useEffect(() => {
    const c = getSelectedCategory();
    setCat(c);

    let rawUploads = {};
    try {
      const stored = sessionStorage.getItem("formsathi:uploads");
      if (stored) rawUploads = JSON.parse(stored);
    } catch {}
    setUploads(rawUploads);
  }, []);

  const examId = cat?.id || "ssc-cgl";
  const deadlineInfo = useMemo(() => analyzeDeadline(examId), [examId]);
  const readiness: ApplicationReadinessReport = useMemo(() => {
    return calculateApplicationReadiness(examId, uploads);
  }, [examId, uploads]);

  useEffect(() => {
    if (readiness.score >= 75) {
      speakBilingual(
        `Great job! Your application is ${readiness.score}% ready. You can review remaining details or proceed to the final review.`,
        `शानदार! आपका आवेदन ${readiness.score}% तैयार है। आप अंतिम समीक्षा की ओर बढ़ सकते हैं।`,
      );
    } else {
      speakBilingual(
        `Your application is ${readiness.score}% ready. EasyForm found ${readiness.issues.length} issue(s) that need attention.`,
        `आपका आवेदन ${readiness.score}% तैयार है। ${readiness.issues.length} समस्याओं पर ध्यान देने की आवश्यकता है।`,
      );
    }
  }, [readiness.score, readiness.issues.length, speakBilingual]);

  const handleFixIssue = (issue: ApplicationIssue) => {
    navigate({ to: issue.targetRoute as any });
  };

  const handleProceedToReview = () => {
    navigate({ to: "/review/$examId", params: { examId } });
  };

  return (
    <AppShell title={lang === "hi" ? "आवेदन तत्परता" : "Readiness Score"} back="/verify" examId={examId}>
      <div className="space-y-6 animate-fade-in">
        {/* Readiness Dial Card */}
        <div className="rounded-3xl glass p-6 shadow-card border border-border/60 text-center space-y-4">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary uppercase">
            APPLICATION READINESS SCORE
          </span>

          <div className="relative inline-flex items-center justify-center">
            <div className="grid h-32 w-32 place-items-center rounded-full gradient-primary shadow-glow text-primary-foreground">
              <div>
                <span className="text-4xl font-black">{readiness.score}%</span>
                <span className="block text-[11px] font-semibold opacity-90">
                  {lang === "hi" ? "तैयारी पूर्ण" : "Prepared"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-foreground">
              {readiness.score >= 80
                ? lang === "hi" ? "आपका आवेदन लगभग तैयार है! 🎉" : "Your application is almost ready! 🎉"
                : readiness.score >= 50
                ? lang === "hi" ? "आवेदन प्रगति पर है" : "Application in progress"
                : lang === "hi" ? "कुछ महत्वपूर्ण कमियां बाकी हैं" : "Important items require attention"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {readiness.issues.length === 0
                ? lang === "hi"
                  ? "सभी आवश्यक दस्तावेज़ और पात्रता जाँच सफलतापूर्वक पूरी हो गई है।"
                  : "All required criteria and documents have passed validation."
                : lang === "hi"
                ? `EasyForm ने ${readiness.issues.length} कमियां पाई हैं। इन्हें ठीक करके 100% स्कोर प्राप्त करें।`
                : `EasyForm found ${readiness.issues.length} issue(s). Resolve them below for an error-free submission.`}
            </p>
          </div>

          {/* Target Form & Deadline Card */}
          {cat && (
            <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-3 text-xs border border-border/50 text-left">
              <div>
                <span className="text-muted-foreground text-[10px] block">Target Form</span>
                <span className="font-bold text-foreground">{cat.name}</span>
              </div>
              {deadlineInfo && (
                <div className="text-right">
                  <span className="text-muted-foreground text-[10px] block">Deadline Status</span>
                  <span className="font-bold text-warning">{deadlineInfo.statusLabelEn}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Breakdown Items List */}
        <div className="rounded-3xl glass p-5 shadow-card border border-border/60 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {lang === "hi" ? "तत्परता घटक (Breakdown)" : "READINESS BREAKDOWN"}
          </h2>

          <div className="space-y-2.5">
            {readiness.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/50 p-3.5 shadow-xs"
              >
                {item.status === "ok" ? (
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                ) : item.status === "warn" ? (
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">
                      {lang === "hi" ? item.labelHi : item.labelEn}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {item.pointsEarned}/{item.totalPoints} pts
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {lang === "hi" ? item.detailHi : item.detailEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature 5: "Fix My Application" Section */}
        {readiness.issues.length > 0 && (
          <div className="rounded-3xl border border-warning/40 bg-warning/5 p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-warning" />
                <h2 className="text-sm font-bold text-foreground">
                  {lang === "hi"
                    ? `EasyForm ने ${readiness.issues.length} समस्याएं पाई हैं:`
                    : `EasyForm found ${readiness.issues.length} issue(s):`}
                </h2>
              </div>
              <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold text-warning-foreground">
                Action Required
              </span>
            </div>

            <div className="space-y-3">
              {readiness.issues.map((issue, idx) => (
                <div
                  key={issue.id}
                  className="rounded-2xl border border-warning/30 bg-card/80 p-3.5 space-y-2 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-warning/20 text-[10px] font-bold text-warning-foreground">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs text-foreground">
                        {lang === "hi" ? issue.titleHi : issue.titleEn}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        issue.severity === "critical"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-warning/15 text-warning"
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    {lang === "hi" ? issue.descriptionHi : issue.descriptionEn}
                  </p>

                  <div className="pt-1 pl-7">
                    <button
                      type="button"
                      onClick={() => handleFixIssue(issue)}
                      className="inline-flex items-center gap-1.5 rounded-xl gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-95"
                    >
                      <Wrench className="h-3 w-3" />
                      <span>{lang === "hi" ? issue.actionLabelHi : issue.actionLabelEn}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proceed to Final Review */}
        <button
          type="button"
          onClick={handleProceedToReview}
          className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-4 font-bold text-primary-foreground shadow-glow active:scale-95 transition-transform"
        >
          <span>{lang === "hi" ? "अंतिम समीक्षा की ओर बढ़ें" : "Proceed to Final Review"}</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </AppShell>
  );
}
