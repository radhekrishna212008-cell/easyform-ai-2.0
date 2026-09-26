import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, ShieldCheck, Sparkles, ExternalLink, Calendar, GraduationCap, Users } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { getCategory } from "@/lib/categories";
import {
  getEligibilityRule,
  evaluateEligibility,
  saveEligibilityState,
  loadEligibilityState,
  calculateAge,
  type UserEligibilityInput,
  type EligibilityCriteriaResult,
} from "@/lib/eligibility";
import { trackApplication } from "@/lib/applications-store";
import { ExplainField } from "@/components/ExplainField";

export const Route = createFileRoute("/eligibility/$examId")({
  head: () => ({
    meta: [
      { title: "Check Eligibility — EasyForm AI 2.0" },
      { name: "description", content: "Smart, non-definitive eligibility verification tool for government application forms." },
    ],
  }),
  component: EligibilityPage,
});

function EligibilityPage() {
  const { examId } = Route.useParams();
  const [lang] = useLang();
  const navigate = useNavigate();

  const category = getCategory(examId);
  const examName = category?.name || examId.toUpperCase();
  const rule = getEligibilityRule(examId);

  // Form state
  const [input, setInput] = useState<UserEligibilityInput>(() => {
    const saved = loadEligibilityState(examId);
    return (
      saved || {
        dob: "2001-07-15",
        educationLevel: "graduate",
        category: "General",
        isPwd: false,
        nationality: "Indian",
        percentage: 65,
        state: "Delhi",
        customAnswers: {},
      }
    );
  });

  const [evaluated, setEvaluated] = useState(false);
  const [review, setReview] = useState<{
    overallStatus: "satisfied" | "needs_confirmation" | "not_satisfied";
    criteria: EligibilityCriteriaResult[];
    officialNoticeEn: string;
    officialNoticeHi: string;
  } | null>(null);

  useEffect(() => {
    trackApplication(examId);
  }, [examId]);

  const runEvaluation = (e?: React.FormEvent) => {
    e?.preventDefault();
    const result = evaluateEligibility(examId, input);
    setReview(result);
    saveEligibilityState(examId, input);
    setEvaluated(true);
  };

  const handleProceedToChecklist = () => {
    saveEligibilityState(examId, input);
    navigate({ to: "/checklist/$examId", params: { examId } });
  };

  const calculatedAge = calculateAge(input.dob);

  return (
    <AppShell title={lang === "hi" ? "पात्रता जाँच" : "Eligibility Checker"} back="/exams" examId={examId}>
      <div className="space-y-6 animate-fade-in">
        {/* Banner */}
        <div className="rounded-3xl glass p-5 shadow-card border border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                  Step 1: Eligibility Check
                </span>
                <h1 className="text-xl font-bold tracking-tight mt-0.5">{examName}</h1>
                <p className="text-xs text-muted-foreground">
                  {lang === "hi" ? "आधिकारिक अधिसूचना के अनुसार पात्रता जांचें" : "Verify eligibility criteria before uploading documents"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!evaluated ? (
          /* Question Form */
          <form onSubmit={runEvaluation} className="rounded-3xl glass p-5 shadow-card border border-border/60 space-y-5">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {lang === "hi" ? `${examName} के लिए आवश्यक विवरण` : `Required Details for ${examName}`}
            </h2>

            {/* Field 1: DOB & Age */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>{lang === "hi" ? "जन्म तिथि (Date of Birth)" : "Date of Birth"}</span>
                </label>
                <span className="text-xs font-bold text-primary">{calculatedAge} Years Old</span>
              </div>
              <input
                type="date"
                required
                value={input.dob}
                onChange={(e) => setInput({ ...input, dob: e.target.value })}
                className="w-full rounded-2xl border border-input bg-card/60 px-4 py-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Field 2: Highest Qualification */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  <span>{lang === "hi" ? "शैक्षणिक योग्यता (Education Level)" : "Highest Qualification Level"}</span>
                </label>
              </div>
              <select
                value={input.educationLevel}
                onChange={(e) => setInput({ ...input, educationLevel: e.target.value as any })}
                className="w-full rounded-2xl border border-input bg-card/60 px-3.5 py-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="10th">10th Standard / Matriculation</option>
                <option value="12th">12th Standard / Higher Secondary (10+2)</option>
                <option value="diploma">Polytechnic Diploma / ITI</option>
                <option value="graduate">Bachelor's Degree / Graduation (B.A, B.Sc, B.Tech, B.Com)</option>
                <option value="postgraduate">Post Graduate / Master's Degree</option>
              </select>
            </div>

            {/* Field 3: Percentage / Marks */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {lang === "hi" ? "योग्यता में प्रतिशत (Marks Percentage)" : "Qualifying Exam Marks (%)"}
                </label>
                <span className="text-xs font-bold text-primary">{input.percentage}%</span>
              </div>
              <input
                type="number"
                min={30}
                max={100}
                value={input.percentage || 60}
                onChange={(e) => setInput({ ...input, percentage: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-2xl border border-input bg-card/60 px-4 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Field 4: Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span>{lang === "hi" ? "आरक्षण श्रेणी (Category)" : "Reservation Category"}</span>
                </label>
                <ExplainField fieldKey="categorySubcaste" label="Explain Category" />
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {(["General", "OBC", "SC", "ST", "EWS"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setInput({ ...input, category: c })}
                    className={`rounded-2xl border py-2 text-xs font-semibold transition-all ${
                      input.category === c
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card/60 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 5: PwD Status */}
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card/40 p-3">
              <div>
                <span className="text-xs font-semibold block text-foreground">
                  {lang === "hi" ? "दिव्यांग श्रेणी (PwD / Divyangjan)?" : "Persons with Benchmark Disability (PwD)?"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {lang === "hi" ? "आयु और शुल्क में विशेष छूट हेतु" : "For age relaxation and scribe benefits"}
                </span>
              </div>
              <input
                type="checkbox"
                checked={input.isPwd || false}
                onChange={(e) => setInput({ ...input, isPwd: e.target.checked })}
                className="h-4 w-4 accent-primary rounded cursor-pointer"
              />
            </div>

            {/* Form-specific extra questions */}
            {rule.formSpecificQuestions?.map((q) => (
              <div key={q.id} className="rounded-2xl border border-border bg-card/40 p-3 space-y-2">
                <span className="text-xs font-semibold block text-foreground">
                  {lang === "hi" ? q.questionHi : q.questionEn}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setInput({
                        ...input,
                        customAnswers: { ...input.customAnswers, [q.id]: "true" },
                      })
                    }
                    className={`flex-1 rounded-xl border py-1.5 text-xs font-semibold ${
                      input.customAnswers?.[q.id] === "true"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {lang === "hi" ? "हाँ (Yes)" : "Yes"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setInput({
                        ...input,
                        customAnswers: { ...input.customAnswers, [q.id]: "false" },
                      })
                    }
                    className={`flex-1 rounded-xl border py-1.5 text-xs font-semibold ${
                      input.customAnswers?.[q.id] === "false"
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {lang === "hi" ? "नहीं (No)" : "No"}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-glow active:scale-95 transition-transform"
            >
              <Sparkles className="h-4 w-4" />
              {lang === "hi" ? "पात्रता समीक्षा देखें" : "Review My Eligibility"}
            </button>
          </form>
        ) : (
          /* Eligibility Review Screen */
          <div className="space-y-5 animate-fade-in">
            <div className="rounded-3xl glass p-5 shadow-card border border-border/60 space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  ELIGIBILITY REVIEW
                </h2>
                <button
                  type="button"
                  onClick={() => setEvaluated(false)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {lang === "hi" ? "विवरण बदलें" : "Edit Answers"}
                </button>
              </div>

              {/* Status Header */}
              <div
                className={`rounded-2xl p-4 border flex items-start gap-3 ${
                  review?.overallStatus === "satisfied"
                    ? "bg-success/10 border-success/30 text-success-foreground"
                    : review?.overallStatus === "needs_confirmation"
                    ? "bg-warning/10 border-warning/30 text-warning-foreground"
                    : "bg-destructive/10 border-destructive/30 text-destructive-foreground"
                }`}
              >
                {review?.overallStatus === "satisfied" ? (
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                ) : review?.overallStatus === "needs_confirmation" ? (
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {review?.overallStatus === "satisfied"
                      ? lang === "hi"
                        ? "आप प्राथमिक मानदंड पूरे करते प्रतीत होते हैं"
                        : "Appears to meet listed criteria"
                      : review?.overallStatus === "needs_confirmation"
                      ? lang === "hi"
                        ? "कुछ मानदंडों की आधिकारिक पुष्टि आवश्यक है"
                        : "Criteria require confirmation"
                      : lang === "hi"
                      ? "कुछ मानदंड पूरे नहीं होते प्रतीत होते हैं"
                      : "Criteria may not be satisfied"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === "hi"
                      ? "दी गई जानकारी के आधार पर तैयार किया गया प्रारंभिक विश्लेषण।"
                      : "Based on the information provided. Please verify against latest official notification."}
                  </p>
                </div>
              </div>

              {/* Criteria List */}
              <div className="space-y-3 pt-2">
                {review?.criteria.map((c) => {
                  const isOk = c.status === "satisfied";
                  const isWarn = c.status === "needs_confirmation";
                  return (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-border/80 bg-card/60 p-3.5 space-y-1.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground">
                          {lang === "hi" ? c.criterionHi : c.criterionEn}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            isOk
                              ? "bg-success/15 text-success"
                              : isWarn
                              ? "bg-warning/15 text-warning"
                              : "bg-destructive/15 text-destructive"
                          }`}
                        >
                          {isOk ? "Satisfied" : isWarn ? "Confirm" : "Review"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {lang === "hi" ? c.explanationHi : c.explanationEn}
                      </p>
                      <div className="text-[11px] text-muted-foreground/80 flex items-center justify-between pt-1 border-t border-border/40">
                        <span>Your info: <strong className="text-foreground">{c.userAnswer}</strong></span>
                        <span>Requirement: {lang === "hi" ? c.requirementHi : c.requirementEn}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mandatory Official Guidance Notice */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground space-y-1">
                <span className="font-bold text-primary block">Official Notification Reference:</span>
                <p>{lang === "hi" ? review?.officialNoticeHi : review?.officialNoticeEn}</p>
                {category?.url && (
                  <a
                    href={category.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary underline mt-1"
                  >
                    {lang === "hi" ? "आधिकारिक पोर्टल खोलें" : "Open Official Portal"} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Next Action: Proceed to Dynamic Checklist */}
            <button
              type="button"
              onClick={handleProceedToChecklist}
              className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-4 font-semibold text-primary-foreground shadow-glow active:scale-95 transition-transform"
            >
              <span>{lang === "hi" ? "दस्तावेज़ चेकलिस्ट देखें" : "View Document Checklist"}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
