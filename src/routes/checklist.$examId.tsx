import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useMemo } from "react";
import { ListChecks, ArrowRight, Check, AlertCircle, FileText, Upload, Sparkles, HelpCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { getCategory, setSelectedCategory } from "@/lib/categories";
import { loadEligibilityState } from "@/lib/eligibility";
import { generateDynamicChecklist, type ChecklistItem } from "@/lib/dynamic-checklist";
import { ExplainField } from "@/components/ExplainField";

export const Route = createFileRoute("/checklist/$examId")({
  head: () => ({
    meta: [
      { title: "Dynamic Checklist — EasyForm AI 2.0" },
      { name: "description", content: "Personalized document checklist dynamically generated for your category and eligibility." },
    ],
  }),
  component: ChecklistPage,
});

function ChecklistPage() {
  const { examId } = Route.useParams();
  const [lang] = useLang();
  const navigate = useNavigate();

  const category = getCategory(examId);
  const examName = category?.name || examId.toUpperCase();

  const eligibility = useMemo(() => loadEligibilityState(examId), [examId]);
  const checklist = useMemo(() => generateDynamicChecklist(examId, eligibility), [examId, eligibility]);

  const handleStartUpload = () => {
    setSelectedCategory(examId);
    // Store required docs for upload page
    try {
      sessionStorage.setItem("easyform:requiredDocs", JSON.stringify(checklist.allApplicable));
    } catch {}
    navigate({ to: "/upload" });
  };

  return (
    <AppShell title={lang === "hi" ? "दस्तावेज़ चेकलिस्ट" : "Document Checklist"} back="/exams" examId={examId}>
      <div className="space-y-6 animate-fade-in">
        {/* Banner */}
        <div className="rounded-3xl glass p-5 shadow-card border border-border/60">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow shrink-0">
              <ListChecks className="h-6 w-6" />
            </div>
            <div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                Step 2: Dynamic Checklist
              </span>
              <h1 className="text-xl font-bold tracking-tight mt-0.5">{examName}</h1>
              <p className="text-xs text-muted-foreground">
                {lang === "hi"
                  ? `आपकी श्रेणी (${eligibility?.category || "General"}) व योग्यता के अनुसार अनुकूलित सूची`
                  : `Personalized for your ${eligibility?.category || "General"} category & qualification`}
              </p>
            </div>
          </div>
        </div>

        {/* REQUIRED Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-destructive flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              {lang === "hi" ? "अनिवार्य दस्तावेज़ (Required)" : "REQUIRED DOCUMENTS"}
            </h2>
            <span className="text-[11px] text-muted-foreground">{checklist.required.length} items</span>
          </div>

          <div className="space-y-2.5">
            {checklist.required.map((item) => (
              <div
                key={item.doc.id}
                className="rounded-2xl border border-destructive/20 bg-card/60 p-4 shadow-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">
                    {lang === "hi" ? item.doc.nameHi : item.doc.nameEn}
                  </span>
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive uppercase">
                    Mandatory
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === "hi" ? item.reasonHi : item.reasonEn}
                </p>
                <div className="text-[11px] text-muted-foreground pt-1 flex items-center justify-between">
                  <span>Format: <strong>{item.doc.accept.replace(/image\//g, "").replace(/application\//g, "").toUpperCase()}</strong></span>
                  <span>Specification: {item.doc.hintEn}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONDITIONAL Section */}
        {checklist.conditional.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-warning flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-warning" />
                {lang === "hi" ? "सशर्त दस्तावेज़ (Conditional)" : "CONDITIONAL DOCUMENTS"}
              </h2>
              <span className="text-[11px] text-muted-foreground">{checklist.conditional.length} items</span>
            </div>

            <div className="space-y-2.5">
              {checklist.conditional.map((item) => (
                <div
                  key={item.doc.id}
                  className={`rounded-2xl border p-4 shadow-xs space-y-1 ${
                    item.conditionMet
                      ? "border-warning/30 bg-warning/5"
                      : "border-border/60 bg-muted/20 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">
                      {lang === "hi" ? item.doc.nameHi : item.doc.nameEn}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        item.conditionMet
                          ? "bg-warning/15 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.conditionMet ? "Applicable for You" : "Not Required"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {lang === "hi" ? item.reasonHi : item.reasonEn}
                  </p>
                  <div className="text-[11px] text-muted-foreground pt-1 flex items-center justify-between">
                    <span>Target: {item.doc.hintEn}</span>
                    {item.doc.id.includes("category") && (
                      <ExplainField fieldKey="categorySubcaste" label="Explain" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OPTIONAL Section */}
        {checklist.optional.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                {lang === "hi" ? "वैकल्पिक दस्तावेज़ (Optional)" : "OPTIONAL DOCUMENTS"}
              </h2>
              <span className="text-[11px] text-muted-foreground">{checklist.optional.length} items</span>
            </div>

            <div className="space-y-2.5">
              {checklist.optional.map((item) => (
                <div
                  key={item.doc.id}
                  className="rounded-2xl border border-border/50 bg-card/40 p-3.5 space-y-1 text-muted-foreground"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">
                      {lang === "hi" ? item.doc.nameHi : item.doc.nameEn}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Optional
                    </span>
                  </div>
                  <p className="text-xs">{lang === "hi" ? item.reasonHi : item.reasonEn}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button: Upload Documents */}
        <button
          type="button"
          onClick={handleStartUpload}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-4 font-semibold text-primary-foreground shadow-glow active:scale-95 transition-transform"
        >
          <Upload className="h-5 w-5" />
          <span>{lang === "hi" ? "दस्तावेज़ अपलोड करें" : "Proceed to Upload"}</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </AppShell>
  );
}
