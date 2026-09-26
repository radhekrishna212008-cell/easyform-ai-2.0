import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Upload, User, PenTool, IdCard, FileText, Check, ArrowRight, X, Home, Landmark, Wallet, Baby, Sparkles } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import { speakBilingual } from "@/lib/voice";
import { getSelectedCategory } from "@/lib/categories";
import { getRequirements, docName, docHint, type DocReq, type IconKey } from "@/lib/requirements";
import { useLang } from "@/lib/i18n";
import { loadEligibilityState } from "@/lib/eligibility";
import { generateDynamicChecklist } from "@/lib/dynamic-checklist";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Upload Documents — EasyForm AI 2.0" }] }),
  component: UploadPage,
});

type FileInfo = { name: string; sizeKB: string; type: string; dataUrl?: string };

const ALLOWED = ["image/jpeg", "image/png", "application/pdf"];

const ICONS: Record<IconKey, typeof User> = {
  user: User,
  sign: PenTool,
  id: IdCard,
  file: FileText,
  address: Home,
  birth: Baby,
  bank: Wallet,
  income: Landmark,
};

function UploadPage() {
  const [lang] = useLang();
  const cat = typeof window !== "undefined" ? getSelectedCategory() : undefined;
  const examId = cat?.id || "ssc-cgl";

  // Use dynamic checklist if eligibility state exists, otherwise fallback to default requirements
  const docs: DocReq[] = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("easyform:requiredDocs");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    const eligibility = loadEligibilityState(examId);
    if (eligibility) {
      return generateDynamicChecklist(examId, eligibility).allApplicable;
    }
    return getRequirements(cat?.id);
  }, [cat?.id, examId]);

  const [files, setFiles] = useState<Record<string, FileInfo>>({});
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("formsathi:uploads");
      if (stored) setFiles(JSON.parse(stored));
    } catch {}
  }, []);

  const allDone = docs.length > 0 && docs.every((d) => files[d.id]);
  const missing = docs.filter((d) => !files[d.id]);

  useEffect(() => {
    // Persist the active doc id set so /verify checks the right ones.
    try {
      sessionStorage.setItem("easyform:requiredDocs", JSON.stringify(docs));
    } catch {}
  }, [docs]);

  const handleFile = (d: DocReq, file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setError(
        lang === "hi"
          ? "केवल JPG, PNG, और PDF फ़ाइलें मान्य हैं।"
          : "Only JPG, PNG, and PDF files are allowed.",
      );
      speakBilingual(
        "This file format is not supported. Please upload JPG, PNG, or PDF.",
        "यह फ़ाइल फॉर्मेट समर्थित नहीं है। कृपया JPG, PNG, या PDF अपलोड कीजिए।",
      );
      return;
    }
    const info: FileInfo = {
      name: file.name,
      sizeKB: (file.size / 1024).toFixed(2),
      type: file.type,
    };
    const commit = (final: FileInfo) => {
      setFiles((f) => {
        const next = { ...f, [d.id]: final };
        try {
          sessionStorage.setItem("formsathi:uploads", JSON.stringify(next));
        } catch {}
        const stillMissing = docs.find((x) => !next[x.id]);
        if (stillMissing) {
          speakBilingual(
            `${d.nameEn} uploaded successfully. Please upload your ${stillMissing.nameEn}.`,
            `${d.nameHi} सफलतापूर्वक अपलोड हो गया। कृपया अपना ${stillMissing.nameHi} अपलोड करें।`,
          );
        } else {
          speakBilingual(
            `${d.nameEn} uploaded. All required documents are ready. Now verify with EasyForm AI.`,
            `${d.nameHi} अपलोड हो गया। सभी ज़रूरी दस्तावेज़ तैयार हैं। अब EasyForm AI से वेरिफ़ाई कीजिए।`,
          );
        }
        return next;
      });
    };

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => commit({ ...info, dataUrl: e.target?.result as string });
      reader.readAsDataURL(file);
    } else {
      commit(info);
    }
  };

  const remove = (id: string) => {
    setFiles((f) => {
      const next = { ...f };
      delete next[id];
      try {
        sessionStorage.setItem("formsathi:uploads", JSON.stringify(next));
      } catch {}
      return next;
    });
    const input = inputs.current[id];
    if (input) input.value = "";
  };

  return (
    <AppShell title={lang === "hi" ? "दस्तावेज़ अपलोड" : "Upload"} back="/exams" examId={examId}>
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-3xl glass p-5 shadow-card border border-border/60">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
            Step 3: Upload
          </span>
          <h1 className="text-xl font-bold tracking-tight mt-1">
            {lang === "hi" ? "अपने दस्तावेज़ अपलोड करें" : "Upload your documents"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {cat
              ? lang === "hi"
                ? `${cat.name} के लिए आवश्यक दस्तावेज़। JPG, PNG, या PDF।`
                : `Documents required for ${cat.name}. JPG, PNG, or PDF only.`
              : lang === "hi"
                ? "कार्ड पर टैप करके अपलोड करें। JPG, PNG, या PDF।"
                : "Tap a card to upload. JPG, PNG, or PDF only."}
          </p>
        </div>

        {missing.length > 0 && (
          <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning-foreground">
            <span className="font-semibold">
              {lang === "hi" ? "बाकी दस्तावेज़: " : "Still missing: "}
            </span>
            {missing.map((m) => docName(m, lang)).join(", ")}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {docs.map((d) => {
            const info = files[d.id];
            const done = Boolean(info);
            const Icon = ICONS[d.iconKey] ?? FileText;
            return (
              <div
                key={d.id}
                className={`rounded-3xl border-2 border-dashed p-4 transition-all ${
                  done ? "border-success bg-success/5" : "border-border glass"
                }`}
              >
                <button
                  type="button"
                  onClick={() => inputs.current[d.id]?.click()}
                  className="flex w-full items-center gap-3.5 text-left active:scale-[0.99]"
                >
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${
                      done ? "bg-success text-success-foreground" : "gradient-primary text-primary-foreground"
                    } shadow-card shrink-0`}
                  >
                    {done ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-foreground">{docName(d, lang)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {info ? `${info.name} · ${info.sizeKB} KB` : docHint(d, lang)}
                    </p>
                  </div>
                  <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                </button>

                <input
                  ref={(el) => {
                    inputs.current[d.id] = el;
                  }}
                  type="file"
                  accept={d.accept}
                  className="hidden"
                  onChange={(e) => handleFile(d, e.target.files?.[0])}
                />

                {info && (
                  <div className="mt-3.5 flex items-start gap-3 rounded-2xl bg-card/80 border border-border/60 p-3">
                    {info.dataUrl ? (
                      <img
                        src={info.dataUrl}
                        alt={info.name}
                        className="h-16 w-16 rounded-xl object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="grid h-16 w-16 place-items-center rounded-xl bg-muted shrink-0">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-foreground truncate max-w-[180px]">{info.name}</p>
                      <p className="text-muted-foreground text-[11px]">{info.sizeKB} KB</p>
                      <p className="text-success font-semibold mt-1">
                        {info.type === "application/pdf" ? "PDF document ready" : "Image ready for verification"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(d.id)}
                      className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Link
          to="/verify"
          onClick={() =>
            speakBilingual(
              "EasyForm AI is verifying your documents. Please wait a moment.",
              "EasyForm AI आपके दस्तावेज़ verify कर रहा है। कृपया थोड़ी देर प्रतीक्षा कीजिए।",
            )
          }
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold shadow-glow transition-all active:scale-95 ${
            allDone
              ? "gradient-primary text-primary-foreground"
              : "bg-muted text-muted-foreground pointer-events-none"
          }`}
        >
          <span>{lang === "hi" ? "EasyForm AI से जाँचें" : "Verify with EasyForm AI"}</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </AppShell>
  );
}
