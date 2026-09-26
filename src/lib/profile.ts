// One-time user profile saved locally (browser-only).
export type UserProfile = {
  fullName: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  aadhaar: string;
  documents?: Record<string, { name: string; sizeKB: string; type: string; dataUrl?: string }>;
};

const KEY = "easyform:profile";

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: UserProfile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

export function clearProfile() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export const EMPTY_PROFILE: UserProfile = {
  fullName: "",
  dob: "",
  email: "",
  phone: "",
  address: "",
  aadhaar: "",
};
