// Voice deadline reminder store + scheduler. Pure browser, no backend.
import { useEffect, useState } from "react";
import { speakBilingual } from "@/lib/voice";
import { EXAM_DEADLINES, getDeadline } from "@/lib/deadlines";

const ENABLED_KEY = "easyform:remindersEnabled"; // examId[]
const FIRED_KEY = "easyform:remindersFired"; // { [examId_day]: true }

const listeners = new Set<() => void>();

function readSet(): Set<string> {
  try {
    const raw = localStorage.getItem(ENABLED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeSet(s: Set<string>) {
  try {
    localStorage.setItem(ENABLED_KEY, JSON.stringify([...s]));
  } catch {}
  listeners.forEach((fn) => fn());
}

export function isReminderOn(examId: string): boolean {
  return readSet().has(examId);
}

export function toggleReminder(examId: string): boolean {
  const s = readSet();
  if (s.has(examId)) {
    s.delete(examId);
    writeSet(s);
    return false;
  }
  s.add(examId);
  writeSet(s);
  const d = getDeadline(examId);
  if (d) {
    const dateEn = new Date(d.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const dateHi = new Date(d.deadline).toLocaleDateString("hi-IN", { day: "numeric", month: "long", year: "numeric" });
    speakBilingual(
      `Reminder set for ${d.name}. The deadline is ${dateEn}.`,
      `${d.name} के लिए रिमाइंडर चालू कर दिया गया है। अंतिम तिथि ${dateHi} है।`,
    );
  }
  return true;
}

export function useReminderState(examId: string): [boolean, () => void] {
  const [on, setOn] = useState<boolean>(() => isReminderOn(examId));
  useEffect(() => {
    const fn = () => setOn(isReminderOn(examId));
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, [examId]);
  return [on, () => setOn(toggleReminder(examId))];
}

function firedMap(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(FIRED_KEY) || "{}");
  } catch {
    return {};
  }
}

function markFired(key: string) {
  const m = firedMap();
  m[key] = true;
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify(m));
  } catch {}
}

// Tiers (days before deadline) at which we speak a reminder, once each.
const TIERS = [7, 3, 1, 0];

function checkAndFire() {
  const enabled = readSet();
  if (!enabled.size) return;
  const fired = firedMap();
  const now = Date.now();
  for (const examId of enabled) {
    const d = EXAM_DEADLINES.find((e) => e.id === examId);
    if (!d) continue;
    const ms = new Date(d.deadline).getTime() - now;
    const daysLeft = Math.ceil(ms / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) continue;
    const tier = TIERS.find((t) => daysLeft <= t);
    if (tier === undefined) continue;
    const key = `${examId}_${tier}`;
    if (fired[key]) continue;
    markFired(key);
    const en = tier === 0
      ? `Important: today is the last day to submit your ${d.name} form. Please complete it today.`
      : `Reminder: only ${daysLeft} days left to submit your ${d.name} form.`;
    const hi = tier === 0
      ? `ज़रूरी सूचना: ${d.name} फॉर्म की अंतिम तिथि आज है। कृपया आज ही फॉर्म भर दीजिए।`
      : `रिमाइंडर: ${d.name} फॉर्म भरने के लिए सिर्फ ${daysLeft} दिन बचे हैं।`;
    speakBilingual(en, hi);
  }
}

let started = false;
export function startReminderRunner() {
  if (started || typeof window === "undefined") return;
  started = true;
  setTimeout(checkAndFire, 4000);
  setInterval(checkAndFire, 10 * 60 * 1000);
}
