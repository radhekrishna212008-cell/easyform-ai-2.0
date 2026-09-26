// Smart Form Discovery Engine for EasyForm AI 2.0
// Suggests relevant government forms, exams, scholarships, and services
// based on age, education qualification, category, and interests.

import { CATEGORIES, type Category } from "@/lib/categories";
import { getEligibilityRule, calculateAge } from "@/lib/eligibility";
import { analyzeDeadline, type DeadlineAnalysis } from "@/lib/deadlines";

export type DiscoveryAnswers = {
  dob?: string;
  age?: number;
  education: "10th" | "12th" | "diploma" | "graduate" | "postgraduate";
  category: "General" | "OBC" | "SC" | "ST" | "EWS";
  interest: "All" | "Government Jobs" | "Entrance Exams" | "Scholarships" | "Defence" | "Government Services";
  state?: string;
};

export type DiscoveredForm = {
  category: Category;
  matchScore: number; // 0 to 100
  matchReasonsEn: string[];
  matchReasonsHi: string[];
  deadlineInfo: DeadlineAnalysis | null;
  tag: string;
};

export function discoverForms(answers: DiscoveryAnswers): DiscoveredForm[] {
  const userAge = answers.age || (answers.dob ? calculateAge(answers.dob) : 22);
  const results: DiscoveredForm[] = [];

  for (const cat of CATEGORIES) {
    // Interest filter
    if (answers.interest !== "All") {
      if (answers.interest === "Entrance Exams" && cat.section !== "Education & Entrance Exams" && cat.section !== "Admissions") {
        continue;
      }
      if (answers.interest === "Government Jobs" && cat.section !== "Government Jobs") {
        continue;
      }
      if (answers.interest === "Defence" && cat.section !== "Defence") {
        continue;
      }
      if (answers.interest === "Scholarships" && cat.section !== "Scholarships") {
        continue;
      }
      if (answers.interest === "Government Services" && cat.section !== "Government Services" && cat.section !== "Documents & Certificates") {
        continue;
      }
    }

    const rule = getEligibilityRule(cat.id);
    let matchScore = 50;
    const reasonsEn: string[] = [];
    const reasonsHi: string[] = [];

    // Education match
    if (rule.requiredEducation.includes(answers.education)) {
      matchScore += 30;
      reasonsEn.push(`Matches your ${answers.education.toUpperCase()} qualification`);
      reasonsHi: `आपकी ${answers.education.toUpperCase()} योग्यता के अनुकूल`;
    } else {
      matchScore -= 20;
    }

    // Age suitability
    let maxAge = rule.maxAgeGeneral;
    if (answers.category === "OBC") maxAge += rule.ageRelaxation.OBC;
    if (answers.category === "SC" || answers.category === "ST") maxAge += rule.ageRelaxation.SC;
    if (userAge >= rule.minAge && userAge <= maxAge) {
      matchScore += 20;
      reasonsEn.push(`Within age limit (${rule.minAge}–${maxAge} yrs)`);
    } else {
      matchScore -= 30;
    }

    // Specific scheme tags
    let tag = "Active Form";
    if (cat.id.includes("ssc")) tag = "Central Govt Job";
    else if (cat.id.includes("jee") || cat.id.includes("neet")) tag = "National Entrance";
    else if (cat.section === "Defence") tag = "Armed Forces";
    else if (cat.section === "Scholarships") tag = "Financial Aid";

    const deadlineInfo = analyzeDeadline(cat.id);

    if (matchScore >= 40) {
      results.push({
        category: cat,
        matchScore: Math.min(100, Math.max(10, matchScore)),
        matchReasonsEn: reasonsEn.length > 0 ? reasonsEn : ["Matches general application criteria"],
        matchReasonsHi: reasonsHi.length > 0 ? reasonsHi : ["सामान्य आवेदन मानदंडों के अनुकूल"],
        deadlineInfo,
        tag,
      });
    }
  }

  // Sort by highest match score, then by upcoming deadline
  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}
