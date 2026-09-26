import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState, useEffect } from "react";
import { LayoutDashboard, Plus, Clock, AlertTriangle, CheckCircle2, ArrowRight, ExternalLink, RefreshCw } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { getTrackedApplications, untrackApplication, type TrackedApplication } from "@/lib/applications-store";
import { setSelectedCategory } from "@/lib/categories";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Applications — EasyForm AI 2.0" },
      { name: "description", content: "Track your active government application preparations, readiness scores, and upcoming deadlines." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [lang] = useLang();
  const navigate = useNavigate();
  const [apps, setApps] = useState<TrackedApplication[]>([]);

  useEffect(() => {
    setApps(getTrackedApplications());
  }, []);

  const handleContinue = (examId: string) => {
    setSelectedCategory(examId);
    navigate({ to: "/checklist/$examId", params: { examId } });
  };

  const handleFixIssues = (examId: string) => {
    setSelectedCategory(examId);
    navigate({ to: "/ready" });
  };

  const handleReview = (examId: string) => {
    setSelectedCategory(examId);
    navigate({ to: "/review/$examId", params: { examId } });
  };

  return (
    <AppShell title={lang === "hi" ? "मेरे आवेदन" : "My Applications"} back="/">
      <div className="space-y-6 animate-fade-in">
        {/* Banner */}
        <div className="rounded-3xl glass p-5 shadow-card border border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow shrink-0">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  {lang === "hi" ? "मेरे आवेदन" : "My Applications"}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lang === "hi"
                    ? "तैयारी की स्थिति, तत्परता स्कोर और समय-सीमा ट्रैक करें"
                    : "Real-time readiness progress & deadline tracker"}
                </p>
              </div>
            </div>

            <Link
              to="/discovery"
              className="hidden xs:flex items-center gap-1.5 rounded-2xl gradient-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-glow hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              <span>{lang === "hi" ? "नया जोड़ें" : "Add Form"}</span>
            </Link>
          </div>
        </div>

        {/* Applications List */}
        {apps.length === 0 ? (
          <div className="rounded-3xl glass p-8 text-center border border-border space-y-3">
            <p className="text-sm font-semibold text-foreground">
              {lang === "hi" ? "कोई सक्रिय आवेदन नहीं मिला" : "No active applications being prepared"}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "hi"
                ? "फॉर्म खोजें या श्रेणी से फॉर्म चुनकर अपनी तैयारी शुरू करें।"
                : "Discover new forms or choose from categories to start your guided preparation."}
            </p>
            <Link
              to="/discovery"
              className="inline-flex items-center gap-2 rounded-2xl gradient-primary px-5 py-3 text-xs font-semibold text-primary-foreground shadow-glow"
            >
              <Plus className="h-4 w-4" />
              <span>{lang === "hi" ? "फॉर्म चुनें" : "Start a New Application"}</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => {
              const isHigh = app.readinessScore >= 75;
              const hasIssues = app.issuesCount > 0;

              return (
                <div
                  key={app.examId}
                  className="rounded-3xl glass p-5 shadow-card border border-border/70 space-y-4 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                        {app.section}
                      </span>
                      <h2 className="text-base font-bold text-foreground mt-1">{app.name}</h2>
                    </div>

                    {/* Readiness Badge */}
                    <div className="text-right">
                      <span
                        className={`inline-block font-black text-lg ${
                          isHigh ? "text-success" : app.readinessScore >= 50 ? "text-warning" : "text-destructive"
                        }`}
                      >
                        {app.readinessScore}%
                      </span>
                      <span className="block text-[10px] text-muted-foreground font-semibold">
                        {lang === "hi" ? "तैयार" : "Ready"}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all duration-500 ease-out ${
                          isHigh ? "bg-success" : app.readinessScore >= 50 ? "bg-warning" : "bg-destructive"
                        }`}
                        style={{ width: `${Math.max(8, app.readinessScore)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                      <span>
                        {hasIssues
                          ? `${app.issuesCount} issue(s) remaining`
                          : "Documents & criteria aligned"}
                      </span>
                      {app.deadlineInfo && (
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Clock className="h-3 w-3 text-warning" />
                          {app.deadlineInfo.formattedDeadline} ({app.deadlineInfo.daysRemaining}d left)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                    {app.readinessScore < 70 ? (
                      <button
                        type="button"
                        onClick={() => handleContinue(app.examId)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl gradient-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-glow active:scale-95 transition-transform"
                      >
                        <span>{lang === "hi" ? "जारी रखें" : "Continue"}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : hasIssues ? (
                      <button
                        type="button"
                        onClick={() => handleFixIssues(app.examId)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-warning/20 border border-warning/40 py-2.5 text-xs font-bold text-warning-foreground hover:bg-warning/30 transition-colors"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                        <span>{lang === "hi" ? "समस्याएं ठीक करें" : "Fix Issues"}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReview(app.examId)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl gradient-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-glow active:scale-95 transition-transform"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{lang === "hi" ? "समीक्षा करें" : "Final Review"}</span>
                      </button>
                    )}

                    <a
                      href={app.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center gap-1"
                      title="Open official website"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-primary" />
                      <span className="hidden xs:inline">{lang === "hi" ? "पोर्टल" : "Portal"}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
