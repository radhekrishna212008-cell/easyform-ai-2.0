import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck, FileCheck, UserCheck, Calendar, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { getCategory } from "@/lib/categories";
import { loadEligibilityState } from "@/lib/eligibility";
import { loadProfile } from "@/lib/profile";
import { calculateApplicationReadiness } from "@/lib/readiness";
import { analyzeDeadline } from "@/lib/deadlines";
import { speakBilingual } from "@/lib/voice";

export const Route = createFileRoute("/review/$examId")({
  head: () => ({
    meta: [
      { title: "Final Application Check — EasyForm AI 2.0" },
      { name: "description", content: "Comprehensive pre-submission review and official application portal redirect." },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const { examId } = Route.useParams();
  const [lang] = useLang();

  const category = getCategory(examId);
  const examName = category?.name || examId.toUpperCase();
  const officialUrl = category?.url || "https://india.gov.in";

  let uploads = {};
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem("formsathi:uploads");
      if (raw) uploads = JSON.parse(raw);
    } catch {}
  }

  const eligibility = useMemo(() => loadEligibilityState(examId), [examId]);
  const profile = useMemo(() => loadProfile(), []);
  const readiness = useMemo(() => calculateApplicationReadiness(examId, uploads), [examId, uploads]);
  const deadlineInfo = useMemo(() => analyzeDeadline(examId), [examId]);

  const docCount = Object.keys(uploads).length;
  const hasDocIssues = readiness.issues.some((i) => i.category === "document");

  const handlePortalClick = () => {
    speakBilingual(
      `Redirecting you to the official ${examName} website. All the best with your application!`,
      `आपको ${examName} के आधिकारिक पोर्टल पर भेजा जा रहा है। आपके आवेदन के लिए शुभकामनाएँ!`,
    );
  };

  return (
    <AppShell title={lang === "hi" ? "अंतिम समीक्षा" : "Final Check"} back="/ready" examId={examId}>
      <div className="space-y-6 animate-fade-in">
        {/* Banner */}
        <div className="rounded-3xl glass p-5 shadow-card border border-border/60">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                Final Step: Review & Portal
              </span>
              <h1 className="text-xl font-bold tracking-tight mt-0.5">{examName}</h1>
              <p className="text-xs text-muted-foreground">
                {lang === "hi"
                  ? "सरकारी पोर्टल पर जाने से पहले अपने सभी विवरणों की अंतिम समीक्षा करें"
                  : "Review all preparation sections before proceeding to the official portal"}
              </p>
            </div>
          </div>
        </div>

        {/* Readiness Summary Bar */}
        <div className="rounded-3xl glass p-5 shadow-card border border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {lang === "hi" ? "आवेदन तत्परता स्कोर" : "APPLICATION READINESS"}
            </span>
            <span className="text-lg font-black text-primary">{readiness.score}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full gradient-primary transition-all duration-500 ease-out"
              style={{ width: `${Math.max(10, readiness.score)}%` }}
            />
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="rounded-3xl glass p-5 shadow-card border border-border/60 space-y-3.5">
          <h2 className="text-sm font-bold text-foreground">
            {lang === "hi" ? "अंतिम आवेदन चेकलिस्ट" : "FINAL APPLICATION CHECK"}
          </h2>

          <div className="space-y-3">
            {/* 1. Personal & Profile Information */}
            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/60 p-3.5 shadow-xs">
              <UserCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {lang === "hi" ? "व्यक्तिगत विवरण (Personal Info)" : "Personal & Identity Information"}
                  </span>
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                    {profile?.fullName ? "Completed" : "Basic Ready"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Name: <strong>{profile?.fullName || "Applicant"}</strong> · Aadhaar:{" "}
                  <strong>{profile?.aadhaar ? `•••• •••• ${profile.aadhaar.slice(-4)}` : "Masked / Not stored"}</strong>
                </p>
              </div>
            </div>

            {/* 2. Eligibility Information */}
            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/60 p-3.5 shadow-xs">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {lang === "hi" ? "पात्रता जानकारी (Eligibility)" : "Eligibility Information"}
                  </span>
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                    Reviewed
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Category: <strong>{eligibility?.category || "General"}</strong> · Qualification:{" "}
                  <strong>{eligibility?.educationLevel?.toUpperCase() || "GRADUATE"}</strong>
                </p>
              </div>
            </div>

            {/* 3. Documents Status */}
            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/60 p-3.5 shadow-xs">
              {hasDocIssues ? (
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              ) : (
                <FileCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {lang === "hi" ? "दस्तावेज़ स्थिति (Documents)" : "Documents & Technical Checks"}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      hasDocIssues ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
                    }`}
                  >
                    {hasDocIssues ? "Needs Attention" : "Verified Ready"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {docCount} document(s) uploaded and checked for size, clarity, format, and resolution.
                </p>
              </div>
            </div>

            {/* 4. Deadline Information */}
            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/60 p-3.5 shadow-xs">
              <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {lang === "hi" ? "समय सीमा (Application Deadline)" : "Application Schedule"}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {deadlineInfo ? `${deadlineInfo.daysRemaining} days left` : "Active"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {deadlineInfo ? `Closing date: ${deadlineInfo.formattedDeadline}` : "Official cycle currently active."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-Submission Tips */}
        <div className="rounded-3xl border border-border/70 bg-muted/30 p-4 space-y-2 text-xs">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            {lang === "hi" ? "सरकारी पोर्टल पर जाने से पहले सुझाव:" : "Before Opening the Official Portal:"}
          </span>
          <ul className="space-y-1 text-muted-foreground list-disc pl-4 text-[11px] leading-relaxed">
            <li>Keep your 10th marksheet nearby for exact name, father's name, and roll number entry.</li>
            <li>Ensure active mobile phone and email access for OTP verification on the official website.</li>
            <li>EasyForm AI does not submit forms on government portals; it ensures you apply with zero document rejections.</li>
          </ul>
        </div>

        {/* Official Portal Action Button */}
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handlePortalClick}
          className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-4 font-bold text-primary-foreground shadow-glow active:scale-95 transition-transform"
        >
          <span>{lang === "hi" ? `${examName} की आधिकारिक वेबसाइट खोलें` : `Open Official ${examName} Portal`}</span>
          <ExternalLink className="h-5 w-5" />
        </a>

        {/* Mandatory Independent Platform Notice */}
        <p className="text-center text-[11px] text-muted-foreground px-2">
          Notice: EasyForm is an independent guidance platform. Always verify eligibility, dates, and application requirements on the official notification/website.
        </p>
      </div>
    </AppShell>
  );
}
