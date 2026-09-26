import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, SarthiAvatar } from "@/components/AppShell";
import { AlertCircle, Lightbulb, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useVoice } from "@/hooks/useVoice";

export const Route = createFileRoute("/errors")({
  head: () => ({ meta: [{ title: "AI Error Detection — EasyForm" }] }),
  component: Errors,
});

const issues = [
  {
    title: "Photo background incorrect",
    desc: "Detected dark background. Govt forms require light/white background.",
    fix: "Retake the photo against a plain white wall in good daylight.",
  },
  {
    title: "DOB mismatch detected",
    desc: "Aadhaar shows 12-Mar-2003 but Marksheet shows 21-Mar-2003.",
    fix: "Update DOB on one document or upload an affidavit before applying.",
  },
  {
    title: "Signature size too large",
    desc: "Current size 64 KB — exceeds 20 KB limit.",
    fix: "Compress or rescan signature at 200 DPI to reduce file size.",
  },
];

function Errors() {
  const { speakBilingual, isSpeaking } = useVoice();
  useEffect(() => {
    speakBilingual(
      `EasyForm AI found ${issues.length} issues. Let's fix them together.`,
      `EasyForm AI को ${issues.length} issues मिले हैं। आइए इन्हें मिलकर ठीक करते हैं।`,
    );
  }, [speakBilingual]);
  return (
    <AppShell title="Issues Found" back="/verify">
      <div className="flex items-center gap-3 rounded-2xl glass p-4 shadow-card">
        <SarthiAvatar speaking={isSpeaking} />
        <div>
          <p className="font-semibold">Let's fix these together</p>
          <p className="text-xs text-muted-foreground">EasyForm AI found {issues.length} issues</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {issues.map((i) => (
          <div key={i.title} className="overflow-hidden rounded-2xl glass shadow-card">
            <div className="flex items-start gap-3 border-b border-border/50 bg-destructive/5 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="font-semibold">{i.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{i.desc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <p className="text-xs font-semibold text-warning">Suggested fix</p>
                <p className="mt-0.5 text-sm">{i.fix}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/ready"
        onClick={() => speakBilingual("Great! You have fixed the issues.", "बहुत बढ़िया! आपने issues ठीक कर दिए हैं।")}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary px-6 py-4 font-semibold text-primary-foreground shadow-glow active:scale-95"
      >
        I have fixed these <ArrowRight className="h-5 w-5" />
      </Link>
    </AppShell>
  );
}
