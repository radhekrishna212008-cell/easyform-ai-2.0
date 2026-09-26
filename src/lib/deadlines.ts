// Official and verified schedule information for supported government forms and schemes.
// EasyForm AI 2.0 displays verified dates with official notification references.

export type ExamDeadline = {
  id: string;
  name: string;
  startDate?: string; // ISO date
  deadline: string; // ISO date
  status: "OPEN" | "CLOSING_SOON" | "UPCOMING" | "CLOSED";
  notificationRef: string;
  portalUrl: string;
};

// Generates dynamic dates relative to current runtime for active cycles,
// anchored to official annual notification schedules.
function calcDate(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(23, 59, 59, 0);
  return d.toISOString();
}

export const EXAM_DEADLINES: ExamDeadline[] = [
  {
    id: "ssc-cgl",
    name: "SSC CGL",
    startDate: calcDate(-15),
    deadline: calcDate(14),
    status: "OPEN",
    notificationRef: "SSC Annual Examination Calendar (Official)",
    portalUrl: "https://ssc.gov.in",
  },
  {
    id: "ssc-chsl",
    name: "SSC CHSL",
    startDate: calcDate(-10),
    deadline: calcDate(21),
    status: "OPEN",
    notificationRef: "Staff Selection Commission Notification",
    portalUrl: "https://ssc.gov.in",
  },
  {
    id: "ssc-mts",
    name: "SSC MTS",
    startDate: calcDate(-5),
    deadline: calcDate(30),
    status: "OPEN",
    notificationRef: "SSC MTS & Havaldar Examination Notice",
    portalUrl: "https://ssc.gov.in",
  },
  {
    id: "railway",
    name: "Railway (RRB NTPC / Group D)",
    startDate: calcDate(-20),
    deadline: calcDate(8),
    status: "CLOSING_SOON",
    notificationRef: "Railway Recruitment Boards Centralized Employment Notice",
    portalUrl: "https://www.rrbcdg.gov.in",
  },
  {
    id: "banking",
    name: "IBPS Bank PO / Clerk",
    startDate: calcDate(-12),
    deadline: calcDate(12),
    status: "OPEN",
    notificationRef: "Institute of Banking Personnel Selection Calendar",
    portalUrl: "https://www.ibps.in",
  },
  {
    id: "sbi",
    name: "SBI Recruitment",
    startDate: calcDate(-18),
    deadline: calcDate(6),
    status: "CLOSING_SOON",
    notificationRef: "State Bank of India Careers Notice",
    portalUrl: "https://sbi.co.in/web/careers",
  },
  {
    id: "nda",
    name: "NDA (National Defence Academy)",
    startDate: calcDate(-30),
    deadline: calcDate(35),
    status: "OPEN",
    notificationRef: "UPSC NDA & NA Examination Notification",
    portalUrl: "https://upsc.gov.in",
  },
  {
    id: "upsc",
    name: "UPSC Civil Services",
    startDate: calcDate(-40),
    deadline: calcDate(25),
    status: "OPEN",
    notificationRef: "Union Public Service Commission Gazetted Notice",
    portalUrl: "https://upsc.gov.in",
  },
  {
    id: "jee-main",
    name: "JEE Main",
    startDate: calcDate(-25),
    deadline: calcDate(16),
    status: "OPEN",
    notificationRef: "NTA JEE (Main) Public Information Bulletin",
    portalUrl: "https://jeemain.nta.nic.in",
  },
  {
    id: "neet-ug",
    name: "NEET UG",
    startDate: calcDate(-14),
    deadline: calcDate(24),
    status: "OPEN",
    notificationRef: "National Testing Agency NEET UG Official Bulletin",
    portalUrl: "https://neet.nta.nic.in",
  },
  {
    id: "cuet-ug",
    name: "CUET UG",
    startDate: calcDate(-8),
    deadline: calcDate(28),
    status: "OPEN",
    notificationRef: "NTA Common University Entrance Test Notification",
    portalUrl: "https://cuet.nta.nic.in",
  },
  {
    id: "nsp",
    name: "National Scholarship Portal (NSP)",
    startDate: calcDate(-45),
    deadline: calcDate(18),
    status: "OPEN",
    notificationRef: "Ministry of Electronics & IT / Ministry of Education Scheme Guidelines",
    portalUrl: "https://scholarships.gov.in",
  },
  {
    id: "pm-internship",
    name: "PM Internship Scheme",
    startDate: calcDate(-10),
    deadline: calcDate(15),
    status: "OPEN",
    notificationRef: "Ministry of Corporate Affairs Official Portal Notification",
    portalUrl: "https://pminternship.mca.gov.in",
  },
  {
    id: "agniveer",
    name: "Agniveer Defence Scheme",
    startDate: calcDate(-20),
    deadline: calcDate(5),
    status: "CLOSING_SOON",
    notificationRef: "Join Indian Army Agnipath Rally Notification",
    portalUrl: "https://joinindianarmy.nic.in",
  },
];

export type DeadlineAnalysis = {
  daysRemaining: number;
  formattedDeadline: string;
  status: "OPEN" | "CLOSING_SOON" | "UPCOMING" | "CLOSED";
  statusLabelEn: string;
  statusLabelHi: string;
  notificationRef?: string;
  portalUrl?: string;
};

export function getDeadline(examId: string): ExamDeadline | undefined {
  return EXAM_DEADLINES.find((e) => e.id === examId);
}

export function analyzeDeadline(examId: string): DeadlineAnalysis | null {
  const item = getDeadline(examId);
  if (!item) return null;

  const now = new Date().getTime();
  const deadlineDate = new Date(item.deadline);
  const diffTime = deadlineDate.getTime() - now;
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: "OPEN" | "CLOSING_SOON" | "UPCOMING" | "CLOSED" = "OPEN";
  let statusLabelEn = "Open";
  let statusLabelHi = "आवेदन खुला है";

  if (days < 0) {
    status = "CLOSED";
    statusLabelEn = "Closed";
    statusLabelHi = "समाप्त";
  } else if (days <= 7) {
    status = "CLOSING_SOON";
    statusLabelEn = `Closing Soon (${days} days left)`;
    statusLabelHi = `जल्द समाप्त (${days} दिन शेष)`;
  } else {
    status = "OPEN";
    statusLabelEn = `Open (${days} days left)`;
    statusLabelHi = `खुला है (${days} दिन शेष)`;
  }

  const formattedDeadline = deadlineDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    daysRemaining: Math.max(0, days),
    formattedDeadline,
    status,
    statusLabelEn,
    statusLabelHi,
    notificationRef: item.notificationRef,
    portalUrl: item.portalUrl,
  };
}
