// Application Readiness Engine & Issue Resolver for EasyForm AI 2.0
// Dynamically computes true readiness score (0-100%) and itemizes solvable problems.

import { loadEligibilityState } from "@/lib/eligibility";
import { generateDynamicChecklist } from "@/lib/dynamic-checklist";
import { loadProfile } from "@/lib/profile";

export type ApplicationIssue = {
  id: string;
  category: "eligibility" | "document" | "profile";
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  severity: "critical" | "warning";
  targetRoute: string;
  actionLabelEn: string;
  actionLabelHi: string;
};

export type ReadinessBreakdownItem = {
  labelEn: string;
  labelHi: string;
  status: "ok" | "warn" | "error";
  detailEn: string;
  detailHi: string;
  pointsEarned: number;
  totalPoints: number;
};

export type ApplicationReadinessReport = {
  score: number; // 0 to 100
  items: ReadinessBreakdownItem[];
  issues: ApplicationIssue[];
  isReadyForPortal: boolean;
};

export function calculateApplicationReadiness(
  examId: string,
  uploads: Record<string, { name: string; sizeKB: string; type: string; dataUrl?: string }> = {}
): ApplicationReadinessReport {
  const eligibility = loadEligibilityState(examId);
  const checklist = generateDynamicChecklist(examId, eligibility);
  const profile = loadProfile();

  const items: ReadinessBreakdownItem[] = [];
  const issues: ApplicationIssue[] = [];

  let totalScore = 0;

  // 1. Eligibility Check Component (Max 25 pts)
  if (eligibility && eligibility.dob) {
    totalScore += 25;
    items.push({
      labelEn: "Eligibility Information",
      labelHi: "पात्रता जानकारी",
      status: "ok",
      detailEn: "Eligibility criteria answered and reviewed against standard rules",
      detailHi: "पात्रता प्रश्नों की समीक्षा पूर्ण हुई",
      pointsEarned: 25,
      totalPoints: 25,
    });
  } else {
    items.push({
      labelEn: "Eligibility Information",
      labelHi: "पात्रता जानकारी",
      status: "warn",
      detailEn: "Eligibility checker not yet completed for this form",
      detailHi: "पात्रता जाँच अभी पूरी नहीं की गई है",
      pointsEarned: 0,
      totalPoints: 25,
    });
    issues.push({
      id: "eligibility-missing",
      category: "eligibility",
      titleEn: "Eligibility checker incomplete",
      titleHi: "पात्रता जाँच अधूरी है",
      descriptionEn: "Complete the 2-minute Smart Eligibility Checker to verify age and qualification rules.",
      descriptionHi: "आयु और योग्यता नियमों की पुष्टि के लिए पात्रता जाँच पूरी करें।",
      severity: "warning",
      targetRoute: `/eligibility/${examId}`,
      actionLabelEn: "Check Eligibility",
      actionLabelHi: "पात्रता जाँचें",
    });
  }

  // 2. Required Documents Upload & Quality (Max 45 pts)
  const reqDocs = checklist.required;
  if (reqDocs.length === 0) {
    totalScore += 45;
  } else {
    const pointsPerDoc = 45 / reqDocs.length;
    let docsPoints = 0;

    for (const req of reqDocs) {
      const upload = uploads[req.doc.id];
      if (!upload) {
        issues.push({
          id: `missing-${req.doc.id}`,
          category: "document",
          titleEn: `Missing required: ${req.doc.nameEn}`,
          titleHi: `ज़रूरी दस्तावेज़ बाकी: ${req.doc.nameHi}`,
          descriptionEn: req.reasonEn,
          descriptionHi: req.reasonHi,
          severity: "critical",
          targetRoute: "/upload",
          actionLabelEn: `Upload ${req.doc.nameEn}`,
          actionLabelHi: `${req.doc.nameHi} अपलोड करें`,
        });
      } else {
        // Document present
        const kb = parseFloat(upload.sizeKB) || 0;
        let qualityWarn = false;

        if (req.doc.id === "photo" && (kb < 10 || kb > 100)) {
          qualityWarn = true;
          issues.push({
            id: `warn-${req.doc.id}`,
            category: "document",
            titleEn: "Passport photo size warning",
            titleHi: "फोटो साइज़ चेतावनी",
            descriptionEn: `Uploaded photo is ${kb} KB. Official recommendation is 20–50 KB.`,
            descriptionHi: `फोटो ${kb} KB की है। आधिकारिक अनुशंसित साइज़ 20–50 KB है।`,
            severity: "warning",
            targetRoute: "/upload",
            actionLabelEn: "Re-upload Photo",
            actionLabelHi: "फोटो बदलें",
          });
        }

        if (req.doc.id === "sign" && (kb < 5 || kb > 50)) {
          qualityWarn = true;
          issues.push({
            id: `warn-${req.doc.id}`,
            category: "document",
            titleEn: "Signature size needs attention",
            titleHi: "हस्ताक्षर साइज़ ध्यान देने योग्य",
            descriptionEn: `Signature is ${kb} KB. Recommended range is 10–20 KB.`,
            descriptionHi: `हस्ताक्षर ${kb} KB का है। अनुशंसित साइज़ 10–20 KB है।`,
            severity: "warning",
            targetRoute: "/upload",
            actionLabelEn: "Re-upload Signature",
            actionLabelHi: "हस्ताक्षर बदलें",
          });
        }

        if (qualityWarn) {
          docsPoints += pointsPerDoc * 0.7; // partial points for warning
        } else {
          docsPoints += pointsPerDoc;
        }
      }
    }

    const roundedDocsPts = Math.round(docsPoints);
    totalScore += roundedDocsPts;

    const missingCount = reqDocs.filter((r) => !uploads[r.doc.id]).length;
    items.push({
      labelEn: "Required Documents",
      labelHi: "ज़रूरी दस्तावेज़",
      status: missingCount === 0 ? "ok" : missingCount < reqDocs.length ? "warn" : "error",
      detailEn: `${reqDocs.length - missingCount} of ${reqDocs.length} required documents uploaded`,
      detailHi: `${reqDocs.length} में से ${reqDocs.length - missingCount} ज़रूरी दस्तावेज़ अपलोड हुए`,
      pointsEarned: roundedDocsPts,
      totalPoints: 45,
    });
  }

  // 3. Conditional / Category Documents (Max 15 pts)
  const condDocs = checklist.conditional.filter((c) => c.conditionMet);
  if (condDocs.length === 0) {
    totalScore += 15;
    items.push({
      labelEn: "Conditional Certificates",
      labelHi: "सशर्त प्रमाणपत्र",
      status: "ok",
      detailEn: "No additional category certificates required based on your profile",
      detailHi: "आपकी प्रोफ़ाइल के अनुसार किसी अतिरिक्त प्रमाणपत्र की आवश्यकता नहीं है",
      pointsEarned: 15,
      totalPoints: 15,
    });
  } else {
    let condPoints = 0;
    const ptsPerCond = 15 / condDocs.length;
    for (const c of condDocs) {
      if (uploads[c.doc.id]) {
        condPoints += ptsPerCond;
      } else {
        issues.push({
          id: `cond-missing-${c.doc.id}`,
          category: "document",
          titleEn: `Conditional document missing: ${c.doc.nameEn}`,
          titleHi: `सशर्त प्रमाणपत्र बाकी: ${c.doc.nameHi}`,
          descriptionEn: c.reasonEn,
          descriptionHi: c.reasonHi,
          severity: "warning",
          targetRoute: "/upload",
          actionLabelEn: `Upload ${c.doc.nameEn}`,
          actionLabelHi: `${c.doc.nameHi} अपलोड करें`,
        });
      }
    }
    const roundedCond = Math.round(condPoints);
    totalScore += roundedCond;
    items.push({
      labelEn: "Conditional Certificates",
      labelHi: "सशर्त प्रमाणपत्र",
      status: condPoints === 15 ? "ok" : "warn",
      detailEn: `${condDocs.filter((c) => uploads[c.doc.id]).length} of ${condDocs.length} certificates prepared`,
      detailHi: `${condDocs.length} में से ${condDocs.filter((c) => uploads[c.doc.id]).length} प्रमाणपत्र तैयार`,
      pointsEarned: roundedCond,
      totalPoints: 15,
    });
  }

  // 4. Profile Completeness (Max 15 pts)
  let profilePoints = 0;
  if (profile) {
    if (profile.fullName) profilePoints += 4;
    if (profile.dob) profilePoints += 3;
    if (profile.phone || profile.email) profilePoints += 4;
    if (profile.aadhaar) profilePoints += 4;
  }

  if (profilePoints < 15) {
    issues.push({
      id: "profile-incomplete",
      category: "profile",
      titleEn: "Profile information incomplete",
      titleHi: "प्रोफ़ाइल अधूरी है",
      descriptionEn: "Save your name, phone, and masked Aadhaar once to reuse across applications.",
      descriptionHi: "सभी फॉर्म में उपयोग हेतु अपना नाम, फ़ोन व आधार सेव करें।",
      severity: "warning",
      targetRoute: "/profile",
      actionLabelEn: "Complete Profile",
      actionLabelHi: "प्रोफ़ाइल भरें",
    });
  }

  totalScore += profilePoints;
  items.push({
    labelEn: "Profile & Identity Setup",
    labelHi: "प्रोफ़ाइल एवं पहचान",
    status: profilePoints >= 12 ? "ok" : "warn",
    detailEn: profilePoints >= 12 ? "Profile details saved securely locally" : "Some profile fields are blank",
    detailHi: profilePoints >= 12 ? "प्रोफ़ाइल विवरण सुरक्षित सेव हैं" : "कुछ विवरण खाली हैं",
    pointsEarned: profilePoints,
    totalPoints: 15,
  });

  const finalScore = Math.min(100, Math.max(0, Math.round(totalScore)));
  const isReadyForPortal = finalScore >= 75 && !issues.some((i) => i.severity === "critical");

  return {
    score: finalScore,
    items,
    issues,
    isReadyForPortal,
  };
}
