import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles, Home, Compass, Layers, LayoutDashboard, User, MessageSquareCode, Globe } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { AIAssistantDrawer } from "@/components/AIAssistantDrawer";

export function AppShell({
  children,
  title,
  back,
  examId,
}: {
  children: React.ReactNode;
  title?: string;
  back?: string;
  examId?: string;
}) {
  const [lang, setLang] = useLang();
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const toggleLanguage = () => {
    setLang(lang === "en" ? "hi" : "en");
  };

  const navItems = [
    { to: "/", icon: Home, labelEn: "Home", labelHi: "होम" },
    { to: "/discovery", icon: Compass, labelEn: "Discover", labelHi: "खोजें" },
    { to: "/exams", icon: Layers, labelEn: "Forms", labelHi: "फॉर्म्स" },
    { to: "/dashboard", icon: LayoutDashboard, labelEn: "Dashboard", labelHi: "डैशबोर्ड" },
    { to: "/profile", icon: User, labelEn: "Profile", labelHi: "प्रोफ़ाइल" },
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col pb-28 pt-4">
      <div className="mx-auto w-full max-w-xl px-4 flex-1">
        {/* Top Header */}
        <header className="mb-6 flex items-center justify-between border-b border-border/40 pb-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary shadow-glow group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight leading-none">
                Easy<span className="gradient-text">Form</span> <span className="text-[10px] font-semibold text-primary ml-0.5">2.0</span>
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">Govt Application Assistant</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {title && (
              <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground truncate max-w-[140px]">
                {title}
              </span>
            )}

            {/* Language Switcher Button */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full border border-border bg-card hover:bg-muted transition-colors shadow-xs"
              title="Toggle English / Hindi"
            >
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>{lang === "en" ? "हिन्दी" : "EN"}</span>
            </button>

            {/* AI Assistant Quick Trigger */}
            <button
              type="button"
              onClick={() => setAiDrawerOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full gradient-primary text-primary-foreground shadow-glow hover:opacity-95 transition-opacity"
            >
              <MessageSquareCode className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Ask AI</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main>{children}</main>

        {/* Back Link if requested */}
        {back && (
          <Link
            to={back}
            className="mt-6 block text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            ← {lang === "hi" ? "वापस जाएं" : "Back"}
          </Link>
        )}

        {/* Official Platform Disclaimer */}
        <div className="mt-12 rounded-2xl border border-border/60 bg-muted/30 p-3.5 text-center text-[11px] text-muted-foreground leading-relaxed">
          <p>
            <span className="font-semibold text-foreground/80">EasyForm AI 2.0</span> is an independent preparation and document guidance platform. Always verify eligibility, deadlines, and requirements on official government notifications.
          </p>
        </div>
      </div>

      {/* Floating Ask AI Button for Quick Mobile Access */}
      <button
        type="button"
        onClick={() => setAiDrawerOpen(true)}
        className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6 grid h-12 w-12 place-items-center rounded-full gradient-hero text-primary-foreground shadow-glow hover:scale-105 active:scale-95 transition-transform"
        title="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Persistent Bottom / Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = item.to === "/" ? currentPath === "/" : currentPath.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-primary stroke-[2.5]" : ""}`} />
                <span className="text-[10px]">{lang === "hi" ? item.labelHi : item.labelEn}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Global AI Assistant Drawer */}
      <AIAssistantDrawer
        currentExamId={examId}
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
      />
    </div>
  );
}

export function SarthiAvatar({ size = "md", speaking = false }: { size?: "sm" | "md" | "lg"; speaking?: boolean }) {
  const dim = size === "lg" ? "h-20 w-20" : size === "sm" ? "h-10 w-10" : "h-14 w-14";
  return (
    <div className={`relative ${dim} shrink-0`}>
      {speaking && <span className="absolute inset-0 rounded-full gradient-primary animate-pulse-ring" />}
      <div
        className={`relative grid h-full w-full place-items-center rounded-full gradient-hero shadow-glow ${
          speaking ? "" : "animate-float"
        }`}
      >
        <Sparkles className="h-1/2 w-1/2 text-primary-foreground" />
      </div>
    </div>
  );
}
