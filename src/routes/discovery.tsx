import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Compass, ArrowRight, CheckCircle2, Clock, Sparkles, Filter, Building2, BookOpen, Shield, Award } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { discoverForms, type DiscoveryAnswers, type DiscoveredForm } from "@/lib/discovery";
import { setSelectedCategory } from "@/lib/categories";

export const Route = createFileRoute("/discovery")({
  head: () => ({
    meta: [
      { title: "Find Forms for Me — EasyForm AI 2.0" },
      { name: "description", content: "Smart Government Form and Exam discovery tool based on your qualification, age, and interests." },
    ],
  }),
  component: DiscoveryPage,
});

function DiscoveryPage() {
  const [lang] = useLang();
  const navigate = useNavigate();

  const [step, setStep] = useState<"questions" | "results">("questions");
  const [answers, setAnswers] = useState<DiscoveryAnswers>({
    education: "graduate",
    age: 23,
    category: "General",
    interest: "All",
    state: "All India",
  });

  const [results, setResults] = useState<DiscoveredForm[]>([]);

  const handleSearch = () => {
    const list = discoverForms(answers);
    setResults(list);
    setStep("results");
  };

  const handleStartPrep = (examId: string) => {
    setSelectedCategory(examId);
    navigate({ to: "/eligibility/$examId", params: { examId } });
  };

  return (
    <AppShell title={lang === "hi" ? "फॉर्म खोजें" : "Form Discovery"} back="/">
      <div className="space-y-6 animate-fade-in">
        {/* Banner */}
        <div className="rounded-3xl glass p-5 shadow-card border border-border/60">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow shrink-0">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {lang === "hi" ? "मेरे लिए फॉर्म खोजें" : "Find Forms for Me"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lang === "hi"
                  ? "अपनी योग्यता और उम्र के अनुसार उपयुक्त सरकारी फॉर्म व परीक्षाएं खोजें"
                  : "Discover tailored government jobs, scholarships, and entrance exams"}
              </p>
            </div>
          </div>
        </div>

        {step === "questions" ? (
          <div className="rounded-3xl glass p-5 shadow-card border border-border/60 space-y-5">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {lang === "hi" ? "अपनी जानकारी दर्ज करें" : "Answer a few quick questions"}
            </h2>

            {/* Question 1: Highest Education */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2">
                {lang === "hi" ? "उच्चतम शैक्षणिक योग्यता (Highest Qualification)" : "Highest Qualification"}
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { id: "10th", label: "10th Pass" },
                  { id: "12th", label: "12th Pass" },
                  { id: "diploma", label: "Diploma / ITI" },
                  { id: "graduate", label: "Graduate (B.A/B.Sc/B.Tech)" },
                  { id: "postgraduate", label: "Post Graduate" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAnswers({ ...answers, education: item.id as any })}
                    className={`rounded-2xl border p-2.5 text-xs font-medium text-left transition-all ${
                      answers.education === item.id
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-border bg-card/60 hover:bg-muted text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Age */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  {lang === "hi" ? "आपकी वर्तमान आयु (Current Age)" : "Current Age"}
                </label>
                <span className="text-xs font-bold text-primary">{answers.age} Years</span>
              </div>
              <input
                type="range"
                min={15}
                max={40}
                value={answers.age}
                onChange={(e) => setAnswers({ ...answers, age: parseInt(e.target.value, 10) })}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>15 yrs</span>
                <span>25 yrs</span>
                <span>40 yrs</span>
              </div>
            </div>

            {/* Question 3: Category */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2">
                {lang === "hi" ? "आरक्षण श्रेणी (Social Category)" : "Reservation Category"}
              </label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {(["General", "OBC", "SC", "ST", "EWS"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAnswers({ ...answers, category: cat })}
                    className={`rounded-2xl border py-2 text-xs font-medium transition-all text-center ${
                      answers.category === cat
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border bg-card/60 hover:bg-muted text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 4: Primary Interest */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2">
                {lang === "hi" ? "आपकी रुचि (What are you looking for?)" : "Area of Interest"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "All", labelEn: "All Opportunities", labelHi: "सभी अवसर" },
                  { id: "Government Jobs", labelEn: "Government Jobs (SSC/RRB)", labelHi: "सरकारी नौकरी" },
                  { id: "Entrance Exams", labelEn: "Entrance Exams (JEE/NEET/CUET)", labelHi: "प्रवेश परीक्षाएं" },
                  { id: "Defence", labelEn: "Defence (Army/NDA/Air Force)", labelHi: "रक्षा सेवाएं" },
                  { id: "Scholarships", labelEn: "Scholarships & Financial Aid", labelHi: "छात्रवृत्ति" },
                  { id: "Government Services", labelEn: "Citizen Certificates & ID", labelHi: "सरकारी सेवाएं" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAnswers({ ...answers, interest: item.id as any })}
                    className={`rounded-2xl border p-2.5 text-xs text-left transition-all ${
                      answers.interest === item.id
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border bg-card/60 hover:bg-muted text-foreground"
                    }`}
                  >
                    {lang === "hi" ? item.labelHi : item.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit search button */}
            <button
              type="button"
              onClick={handleSearch}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-glow active:scale-95 transition-transform"
            >
              <Sparkles className="h-4 w-4" />
              {lang === "hi" ? "सुझाए गए फॉर्म देखें" : "Discover Matching Forms"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {lang === "hi" ? `${results.length} फॉर्म मिले` : `Found ${results.length} Matching Forms`}
              </span>
              <button
                type="button"
                onClick={() => setStep("questions")}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Filter className="h-3.5 w-3.5" />
                {lang === "hi" ? "फ़िल्टर बदलें" : "Edit Preferences"}
              </button>
            </div>

            {/* Results List */}
            {results.length === 0 ? (
              <div className="rounded-3xl glass p-8 text-center border border-border">
                <p className="text-sm font-semibold text-foreground">
                  {lang === "hi" ? "कोई फॉर्म नहीं मिला" : "No exact matching forms found"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "hi"
                    ? "कृपया अपनी आयु या रुचि फ़िल्टर बदलकर दोबारा प्रयास करें।"
                    : "Try broadening your interest area or age parameters."}
                </p>
                <button
                  type="button"
                  onClick={() => setStep("questions")}
                  className="mt-4 inline-block text-xs font-semibold text-primary underline"
                >
                  {lang === "hi" ? "दोबारा फ़िल्टर करें" : "Reset Filters"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {results.slice(0, 12).map((item) => (
                  <div
                    key={item.category.id}
                    className="rounded-3xl glass p-4 shadow-card border border-border/70 hover:border-primary/50 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                            {item.tag}
                          </span>
                          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                            {item.matchScore}% Match
                          </span>
                        </div>
                        <h3 className="mt-1 text-base font-bold text-foreground">
                          {item.category.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{item.category.section}</p>
                      </div>

                      {item.deadlineInfo && (
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            <Clock className="h-3 w-3 text-warning" />
                            {item.deadlineInfo.daysRemaining}d left
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Match Reasons */}
                    <div className="rounded-2xl bg-muted/40 p-2.5 text-xs text-muted-foreground space-y-1">
                      {item.matchReasonsEn.map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleStartPrep(item.category.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl gradient-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-glow active:scale-95 transition-transform"
                      >
                        <span>{lang === "hi" ? "तैयारी शुरू करें" : "Start Preparation"}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      <Link
                        to="/guidance/$examId"
                        params={{ examId: item.category.id }}
                        className="rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        {lang === "hi" ? "विवरण" : "Info"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
