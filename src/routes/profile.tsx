import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { Check, User, Shield, Eye, EyeOff, Sparkles, Lock } from "lucide-react";
import { EMPTY_PROFILE, loadProfile, saveProfile, type UserProfile } from "@/lib/profile";
import { t, useLang } from "@/lib/i18n";
import { ExplainField } from "@/components/ExplainField";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile & Privacy — EasyForm AI 2.0" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [lang] = useLang();
  const [p, setP] = useState<UserProfile>(EMPTY_PROFILE);
  const [saved, setSaved] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);

  useEffect(() => {
    const existing = loadProfile();
    if (existing) setP(existing);
  }, []);

  const update = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) =>
    setP((prev) => ({ ...prev, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(p);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const getMaskedAadhaar = (val: string) => {
    if (!val) return "";
    const clean = val.replace(/\D/g, "");
    if (clean.length < 4) return clean;
    const last4 = clean.slice(-4);
    return `•••• •••• ${last4}`;
  };

  return (
    <AppShell title={t("profile", lang)} back="/">
      <div className="space-y-6 animate-fade-in">
        {/* Banner */}
        <div className="rounded-3xl glass p-5 shadow-card border border-border/60">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow shrink-0">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{t("profile", lang)}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lang === "hi"
                  ? "एक बार विवरण सेव करें और सभी फॉर्म में उपयोग करें (केवल आपके डिवाइस में सुरक्षित)"
                  : "Save your application profile once to reuse safely across all forms"}
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Notice Card */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground">
          <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-foreground">Local Storage Only:</strong> All personal data and masked identifiers remain exclusively in your local browser storage. No server transmission or secret exposure.
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={submit} className="rounded-3xl glass p-5 shadow-card border border-border/60 space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              {t("full_name", lang)} (As per 10th Certificate)
            </label>
            <input
              type="text"
              required
              value={p.fullName || ""}
              onChange={(e) => update("fullName", e.target.value)}
              className="w-full rounded-2xl border border-input bg-card/60 px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Rahul Kumar"
            />
          </div>

          {/* DOB & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                {t("dob", lang)}
              </label>
              <input
                type="date"
                required
                value={p.dob || ""}
                onChange={(e) => update("dob", e.target.value)}
                className="w-full rounded-2xl border border-input bg-card/60 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                {t("phone", lang)}
              </label>
              <input
                type="tel"
                value={p.phone || ""}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full rounded-2xl border border-input bg-card/60 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="10-digit mobile"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              {t("email", lang)}
            </label>
            <input
              type="email"
              value={p.email || ""}
              onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-2xl border border-input bg-card/60 px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="applicant@example.com"
            />
          </div>

          {/* Masked Aadhaar Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("aadhaar_no", lang)} (Stored Locally & Masked)
              </label>
              <ExplainField fieldKey="aadhaarNumber" label="Explain Aadhaar" />
            </div>
            <div className="relative">
              <input
                type={showAadhaar ? "text" : "password"}
                maxLength={14}
                value={p.aadhaar || ""}
                onChange={(e) => update("aadhaar", e.target.value)}
                className="w-full rounded-2xl border border-input bg-card/60 px-4 py-2.5 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="12-digit Aadhaar Number"
              />
              <button
                type="button"
                onClick={() => setShowAadhaar(!showAadhaar)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                title={showAadhaar ? "Hide Aadhaar" : "Show Aadhaar"}
              >
                {showAadhaar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {p.aadhaar && !showAadhaar && (
              <span className="text-[11px] text-muted-foreground block mt-1">
                Masked display: <strong>{getMaskedAadhaar(p.aadhaar)}</strong>
              </span>
            )}
          </div>

          {/* Permanent Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("address", lang)}
              </label>
              <ExplainField fieldKey="domicileState" label="Domicile Info" />
            </div>
            <textarea
              rows={2}
              value={p.address || ""}
              onChange={(e) => update("address", e.target.value)}
              className="w-full rounded-2xl border border-input bg-card/60 px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="House, street, tehsil, district, state & PIN code"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-glow active:scale-95 transition-transform"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" /> {t("saved", lang)}
              </>
            ) : (
              t("save_profile", lang)
            )}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
