// Local Applications Store for EasyForm AI 2.0
// Manages real, multi-form application tracking with real readiness scores and deadlines.

import { getCategory, type Category } from "@/lib/categories";
import { analyzeDeadline, type DeadlineAnalysis } from "@/lib/deadlines";
import { calculateApplicationReadiness } from "@/lib/readiness";

export type TrackedApplication = {
  examId: string;
  name: string;
  section: string;
  readinessScore: number;
  lastUpdated: string; // ISO date
  officialUrl: string;
  deadlineInfo: DeadlineAnalysis | null;
  issuesCount: number;
};

const STORAGE_KEY = "easyform:tracked_applications";

export function getTrackedApplications(): TrackedApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Default to initial active category if exists, or prime with SSC CGL as an example
      const defaultList: string[] = ["ssc-cgl", "railway", "nsp"];
      const seeded: TrackedApplication[] = defaultList.map((id) => buildApplicationEntry(id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded.map((a) => a.examId)));
      return seeded;
    }
    const ids: string[] = JSON.parse(raw);
    return ids.map((id) => buildApplicationEntry(id));
  } catch {
    return [];
  }
}

export function trackApplication(examId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(examId)) {
      ids.unshift(examId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }
  } catch {}
}

export function untrackApplication(examId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const ids: string[] = JSON.parse(raw);
    const next = ids.filter((id) => id !== examId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

export function buildApplicationEntry(examId: string): TrackedApplication {
  const cat = getCategory(examId);
  const deadlineInfo = analyzeDeadline(examId);

  // Load uploaded files for readiness calculation
  let uploads = {};
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem("formsathi:uploads");
      if (raw) uploads = JSON.parse(raw);
    } catch {}
  }

  const report = calculateApplicationReadiness(examId, uploads);

  return {
    examId,
    name: cat?.name || examId.toUpperCase(),
    section: cat?.section || "Government Forms",
    readinessScore: report.score,
    lastUpdated: new Date().toISOString(),
    officialUrl: cat?.url || "https://india.gov.in",
    deadlineInfo,
    issuesCount: report.issues.length,
  };
}
