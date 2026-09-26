import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell, SarthiAvatar } from "@/components/AppShell";
import { Check, AlertTriangle, ArrowRight, Loader2, FileText, RefreshCw, XCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useVoice } from "@/hooks/useVoice";
import { getSelectedCategory } from "@/lib/categories";
import { getRequirements } from "@/lib/requirements";
import { useLang } from "@/lib/i18n";
import { validateUploadedDocument, type DocumentValidationReport } from "@/lib/advanced-doc-check";
import { loadEligibilityState } from "@/lib/eligibility";
import { generateDynamicChecklist } from "@/lib/dynamic-checklist";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Technical Document Verification — EasyForm AI 2.0" }] }),
  component: Verify,
});

type FileInfo = { name: string; sizeKB: string; type: string; dataUrl?: string };
type Uploads = Record<string, FileInfo>;

function Verify() {
  const [lang] = useLang();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState<Uploads>({});
  const [reports, setReports] = useState<DocumentValidationReport[] | null>(null);
  const [missingDocs, setMissingDocs] = useState<{ id: string; nameEn: string; nameHi: string }[]>([]);
  const [progress, setProgress] = useState(0);
  const { speakBilingual, isSpeaking } = useVoice();

  const cat = getSelectedCategory();
  const examId = cat?.id || "ssc-cgl";

  useEffect(() => {
    let data: Uploads = {};
    try {
      const raw = sessionStorage.getItem("formsathi:uploads");
      if (raw) data = JSON.parse(raw);
    } catch {}
    setUploads(data);

    const eligibility = loadEligibilityState(examId);
    const checklist = generateDynamicChecklist(examId, eligibility);
    const applicableDocs = checklist.allApplicable;

    const missing = applicableDocs.filter((d) => !data[d.id]);
    setMissingDocs(missing.map((m) => ({ id: m.id, nameEn: m.nameEn, nameHi: m.nameHi })));

    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(95, p + Math.random() * 20);
      setProgress(p);
    }, 180);

    const runAllChecks = async () => {
      const results: DocumentValidationReport[] = [];
      for (const [id, info] of Object.entries(data)) {
        const docDef = applicableDocs.find((d) => d.id === id) || {
          id,
          nameEn: info.name,
          nameHi: info.name,
        };
        const report = await validateUploadedDocument(id, docDef.nameEn, (docDef as any).nameHi || docDef.nameEn, info);
        results.push(report);
      }
      return results;
    };

    runAllChecks().then((repList) => {
      setTimeout(() => {
        clearInterval(tick);
        setProgress(100);
        setReports(repList);

        const hasErrors = repList.some((r) => r.overallStatus === "Needs review") || missing.length > 0;
        const hasWarnings = repList.some((r) => r.overallStatus === "Potential issue detected");

        if (missing.length > 0) {
          speakBilingual(
            `Verification check complete. Some required documents are still missing.`,
            `जाँच पूरी हुई। कुछ ज़रूरी दस्तावेज़ अभी बाकी हैं।`,
          );
        } else if (hasErrors || hasWarnings) {
          speakBilingual(
            `Document check complete. Potential issues detected. Please review the highlighted suggestions.`,
            `दस्तावेज़ जाँच पूरी हुई। कुछ संभावित समस्याएं पायी गयी हैं। कृपया सुझाव देखें।`,
          );
        } else {
          speakBilingual(
            `All technical checks passed! Your documents are within the required guidelines.`,
            `सभी तकनीकी जाँच पास हो गईं! आपके दस्तावेज़ सही हैं।`,
          );
        }
      }, 1200);
    });

    return () => clearInterval(tick);
  }, [examId, speakBilingual]);

  const verifying = reports === null;
  const docCount = Object.keys(uploads).length;
  const issuesFound = reports?.filter((r) => r.overallStatus !== "Technical checks passed").length || 0;

  return (
    <AppShell title={lang === "hi" ? "दस्तावेज़ सत्यापन" : "AI Verification"} back="/upload" examId={examId}>
      <div className="space-y-6 animate-fade-in">
        {/* Banner */}
        <div className="flex items-center gap-3 rounded-3xl glass p-5 shadow-card border border-border/60">
          <SarthiAvatar speaking={verifying || isSpeaking} />
          <div className="flex-1">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
              Step 4: Quality & Integrity Check
            </span>
            <h1 className="text-base font-bold text-foreground mt-0.5">
              {verifying
                ? "EasyForm AI is inspecting files…"
                : issuesFound > 0 || missingDocs.length > 0
                ? `${issuesFound + (missingDocs.length ? 1 : 0)} item(s) need attention`
                : "Technical checks passed"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {verifying
                ? `Analyzing ${docCount} uploaded document(s) against official parameters`
                : "Inspected format, dimensions, size, sharpness, and readability"}
            </p>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full gradient-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Missing Documents Alert */}
        {!verifying && missingDocs.length > 0 && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-sm">
              <XCircle className="h-4 w-4" />
              <span>{lang === "hi" ? "अनुपस्थित ज़रूरी दस्तावेज़:" : "Required documents missing:"}</span>
            </div>
            <p className="leading-relaxed">
              {missingDocs.map((m) => (lang === "hi" ? m.nameHi : m.nameEn)).join(", ")}
            </p>
            <div className="pt-1">
              <Link to="/upload" className="font-semibold underline">
                {lang === "hi" ? "अभी अपलोड करें →" : "Upload missing documents →"}
              </Link>
            </div>
          </div>
        )}

        {/* In-depth per-document inspection cards */}
        <div className="space-y-4">
          {verifying ? (
            [0, 1].map((i) => (
              <div key={i} className="rounded-3xl glass p-5 shadow-card border border-border/60 flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-2 w-1/2 rounded bg-muted/60 animate-pulse" />
                </div>
              </div>
            ))
          ) : reports && reports.length === 0 ? (
            <div className="rounded-3xl glass p-6 text-center border border-border text-xs text-muted-foreground">
              No documents uploaded yet. Please upload your files first.
            </div>
          ) : (
            reports?.map((rep) => {
              const isPassed = rep.overallStatus === "Technical checks passed";
              const isPotential = rep.overallStatus === "Potential issue detected";

              return (
                <div
                  key={rep.docId}
                  className="rounded-3xl glass p-5 shadow-card border border-border/70 space-y-3.5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2.5">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">
                        {lang === "hi" ? rep.docNameHi : rep.docNameEn}
                      </h3>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                        {rep.fileName} ({rep.fileSizeKB} KB)
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isPassed
                          ? "bg-success/15 text-success"
                          : isPotential
                          ? "bg-warning/15 text-warning"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {rep.overallStatus}
                    </span>
                  </div>

                  {/* Metrics Table */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {rep.metrics.map((m, idx) => {
                      const ok = m.status === "ok";
                      const warn = m.status === "warn";
                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-border/60 bg-muted/30 p-2.5 space-y-0.5"
                        >
                          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                            <span>{lang === "hi" ? m.nameHi : m.nameEn}</span>
                            <span>{ok ? "✅" : warn ? "⚠️" : "❌"}</span>
                          </div>
                          <span className="font-bold text-xs text-foreground block">{m.valueDisplay}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Suggestion alert if issue */}
                  {rep.suggestionEn && (
                    <div className="rounded-2xl bg-warning/10 border border-warning/30 p-3 text-xs text-warning-foreground space-y-1">
                      <span className="font-bold block flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                        {lang === "hi" ? "सुधार सुझाव:" : "Suggested Action:"}
                      </span>
                      <p className="text-[11px]">{lang === "hi" ? rep.suggestionHi : rep.suggestionEn}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Disclaimer on technical verification */}
        <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-4">
          EasyForm AI checks file formatting, image clarity, and byte limits. It does not certify legal government authenticity.
        </p>

        {/* Continue to Readiness / Ready Screen */}
        {!verifying && (
          <Link
            to="/ready"
            className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-4 font-semibold text-primary-foreground shadow-glow active:scale-95 transition-transform"
          >
            <span>{lang === "hi" ? "आवेदन तत्परता स्कोर देखें" : "View Application Readiness"}</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        )}
      </div>
    </AppShell>
  );
}
