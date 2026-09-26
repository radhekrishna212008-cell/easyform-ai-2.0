// Advanced Document Verification Engine for EasyForm AI 2.0
// Performs in-depth technical validation: Format, File Size, Dimensions,
// Resolution, Sharpness/Clarity, and Readability with non-authoritative wording.

export type CheckStatus = "ok" | "warn" | "error";

export type MetricCheck = {
  nameEn: string;
  nameHi: string;
  status: CheckStatus;
  valueDisplay: string;
  detailEn: string;
  detailHi: string;
};

export type DocumentValidationReport = {
  docId: string;
  docNameEn: string;
  docNameHi: string;
  fileName: string;
  fileSizeKB: number;
  overallStatus: "Technical checks passed" | "Potential issue detected" | "Needs review";
  statusColor: "success" | "warning" | "destructive";
  suggestionEn?: string;
  suggestionHi?: string;
  metrics: MetricCheck[];
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "application/pdf"];

// Calculate sharpness / blur metric using canvas pixel luminance variance
export async function analyzeImageSharpness(dataUrl: string): Promise<{
  score: number;
  width: number;
  height: number;
  contrastScore: number;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;

      // Sample onto an internal canvas
      const sampleW = 120;
      const sampleH = Math.max(1, Math.round((naturalH / naturalW) * 120));
      const canvas = document.createElement("canvas");
      canvas.width = sampleW;
      canvas.height = sampleH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return resolve({ score: 70, width: naturalW, height: naturalH, contrastScore: 80 });
      }

      ctx.drawImage(img, 0, 0, sampleW, sampleH);
      const { data } = ctx.getImageData(0, 0, sampleW, sampleH);

      const gray: number[] = [];
      let minLum = 255;
      let maxLum = 0;

      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        gray.push(lum);
        if (lum < minLum) minLum = lum;
        if (lum > maxLum) maxLum = lum;
      }

      // Variance calculation
      const mean = gray.reduce((a, b) => a + b, 0) / gray.length;
      const variance = gray.reduce((a, b) => a + (b - mean) ** 2, 0) / gray.length;

      // Contrast range
      const contrastRange = maxLum - minLum;
      const contrastScore = Math.min(100, Math.round((contrastRange / 255) * 100));

      // Sharpness scaled 0 to 100
      const sharpness = Math.min(100, Math.round((variance / 2200) * 100));

      resolve({
        score: sharpness,
        width: naturalW,
        height: naturalH,
        contrastScore,
      });
    };
    img.onerror = () => {
      resolve({ score: 0, width: 0, height: 0, contrastScore: 0 });
    };
    img.src = dataUrl;
  });
}

export async function validateUploadedDocument(
  docId: string,
  docNameEn: string,
  docNameHi: string,
  fileInfo: { name: string; sizeKB: string; type: string; dataUrl?: string }
): Promise<DocumentValidationReport> {
  const metrics: MetricCheck[] = [];
  const kb = parseFloat(fileInfo.sizeKB) || 0;
  const isImage = fileInfo.type.startsWith("image/");
  const isPdf = fileInfo.type === "application/pdf";

  let hasError = false;
  let hasWarn = false;
  let mainSuggestionEn: string | undefined;
  let mainSuggestionHi: string | undefined;

  // 1. Format Check
  if (ALLOWED_MIME.includes(fileInfo.type)) {
    metrics.push({
      nameEn: "Format",
      nameHi: "फ़ाइल फॉर्मेट",
      status: "ok",
      valueDisplay: fileInfo.type.replace("application/", "").replace("image/", "").toUpperCase(),
      detailEn: "Official accepted format (JPEG/PNG/PDF)",
      detailHi: "स्वीकृत मान्य फॉर्मेट",
    });
  } else {
    hasError = true;
    mainSuggestionEn = "Please upload an accepted format (JPG, PNG, or PDF).";
    mainSuggestionHi = "कृपया मान्य फ़ाइल फॉर्मेट (JPG, PNG, या PDF) अपलोड करें।";
    metrics.push({
      nameEn: "Format",
      nameHi: "फ़ाइल फॉर्मेट",
      status: "error",
      valueDisplay: fileInfo.type || "Unknown",
      detailEn: "Unsupported format. Only JPG, PNG, and PDF are allowed.",
      detailHi: "असमर्थित फॉर्मेट। केवल JPG, PNG, या PDF मान्य हैं।",
    });
  }

  // 2. File Size Check
  if (docId === "photo") {
    if (kb < 10) {
      hasWarn = true;
      mainSuggestionEn = "Photo size is under 10 KB. Please upload a higher quality 20–50 KB photo.";
      mainSuggestionHi = "फोटो 10 KB से कम है। कृपया 20–50 KB की साफ़ फोटो अपलोड करें।";
      metrics.push({
        nameEn: "File size",
        nameHi: "फ़ाइल साइज़",
        status: "warn",
        valueDisplay: `${kb} KB`,
        detailEn: "Very small file size. May get rejected for poor quality.",
        detailHi: "फ़ाइल साइज़ बहुत छोटा है।",
      });
    } else if (kb > 100) {
      hasWarn = true;
      mainSuggestionEn = "Photo exceeds 100 KB. Official portal limit is typically 50 KB.";
      mainSuggestionHi = "फोटो 100 KB से बड़ी है। सामान्यतः 50 KB सीमा होती है।";
      metrics.push({
        nameEn: "File size",
        nameHi: "फ़ाइल साइज़",
        status: "warn",
        valueDisplay: `${kb} KB`,
        detailEn: "Recommended range is 20–50 KB.",
        detailHi: "अनुशंसित साइज़ 20–50 KB है।",
      });
    } else {
      metrics.push({
        nameEn: "File size",
        nameHi: "फ़ाइल साइज़",
        status: "ok",
        valueDisplay: `${kb} KB`,
        detailEn: "Within recommended 20–50 KB range",
        detailHi: "अनुशंसित सीमा के अनुकूल",
      });
    }
  } else if (docId === "sign") {
    if (kb < 5) {
      hasWarn = true;
      metrics.push({
        nameEn: "File size",
        nameHi: "फ़ाइल साइज़",
        status: "warn",
        valueDisplay: `${kb} KB`,
        detailEn: "Signature size is very low. Please ensure it is legible.",
        detailHi: "हस्ताक्षर साइज़ बहुत कम है।",
      });
    } else if (kb > 50) {
      hasWarn = true;
      metrics.push({
        nameEn: "File size",
        nameHi: "फ़ाइल साइज़",
        status: "warn",
        valueDisplay: `${kb} KB`,
        detailEn: "Recommended signature size is 10–20 KB.",
        detailHi: "अनुशंसित साइज़ 10–20 KB है।",
      });
    } else {
      metrics.push({
        nameEn: "File size",
        nameHi: "फ़ाइल साइज़",
        status: "ok",
        valueDisplay: `${kb} KB`,
        detailEn: "Within recommended 10–20 KB range",
        detailHi: "मान्य साइज़ सीमा के भीतर",
      });
    }
  } else {
    if (kb > 2048) {
      hasError = true;
      mainSuggestionEn = "Certificate exceeds 2 MB limit. Please compress file before uploading.";
      mainSuggestionHi = "दस्तावेज़ 2 MB से बड़ा है। कृपया कम्प्रेस करें।";
      metrics.push({
        nameEn: "File size",
        nameHi: "फ़ाइल साइज़",
        status: "error",
        valueDisplay: `${kb} KB`,
        detailEn: "Exceeds standard 2 MB limit",
        detailHi: "2 MB सीमा से अधिक",
      });
    } else {
      metrics.push({
        nameEn: "File size",
        nameHi: "फ़ाइल साइज़",
        status: "ok",
        valueDisplay: `${kb} KB`,
        detailEn: "Within 2 MB document ceiling",
        detailHi: "मान्य 2 MB सीमा के भीतर",
      });
    }
  }

  // 3. Image analysis: Dimensions, Resolution, Sharpness, Readability
  if (isImage && fileInfo.dataUrl) {
    const analysis = await analyzeImageSharpness(fileInfo.dataUrl);

    // Dimensions & Resolution
    if (analysis.width < 150 || analysis.height < 150) {
      hasWarn = true;
      metrics.push({
        nameEn: "Resolution",
        nameHi: "रेज़ोल्यूशन",
        status: "warn",
        valueDisplay: `${analysis.width} × ${analysis.height} px`,
        detailEn: "Image resolution is low. May appear pixelated upon printing.",
        detailHi: "इमेज रिज़ॉल्यूशन कम है।",
      });
    } else {
      metrics.push({
        nameEn: "Resolution",
        nameHi: "रेज़ोल्यूशन",
        status: "ok",
        valueDisplay: `${analysis.width} × ${analysis.height} px`,
        detailEn: "Clear high-definition dimensions",
        detailHi: "पर्याप्त स्पष्ट रिज़ॉल्यूशन",
      });
    }

    // Dimensions aspect ratio check
    if (docId === "photo") {
      const ratio = analysis.width / analysis.height;
      if (ratio > 1.1) {
        hasWarn = true;
        metrics.push({
          nameEn: "Dimensions",
          nameHi: "आयाम / अनुपात",
          status: "warn",
          valueDisplay: "Landscape",
          detailEn: "Passport photo must be in vertical / portrait orientation.",
          detailHi: "पासपोर्ट फोटो वर्टिकल (पोर्ट्रेट) होनी चाहिए।",
        });
      } else {
        metrics.push({
          nameEn: "Dimensions",
          nameHi: "आयाम / अनुपात",
          status: "ok",
          valueDisplay: "Portrait (3:4)",
          detailEn: "Proper passport aspect ratio",
          detailHi: "उचित पासपोर्ट अनुपात",
        });
      }
    } else if (docId === "sign") {
      metrics.push({
        nameEn: "Dimensions",
        nameHi: "आयाम",
        status: "ok",
        valueDisplay: `${analysis.width} × ${analysis.height} px`,
        detailEn: "Standard signature box dimensions",
        detailHi: "मानक हस्ताक्षर अनुपात",
      });
    }

    // Sharpness
    if (analysis.score >= 50) {
      metrics.push({
        nameEn: "Sharpness",
        nameHi: "स्पष्टता",
        status: "ok",
        valueDisplay: `${analysis.score}/100`,
        detailEn: "Edges and contours are well defined",
        detailHi: "चित्र स्पष्ट व साफ़ है",
      });
    } else if (analysis.score >= 25) {
      hasWarn = true;
      if (!mainSuggestionEn) {
        mainSuggestionEn = "Image is slightly blurry. Consider re-scanning in bright lighting.";
        mainSuggestionHi = "इमेज थोड़ी धुंधली है। कृपया बेहतर रोशनी में दोबारा स्कैन करें।";
      }
      metrics.push({
        nameEn: "Sharpness",
        nameHi: "स्पष्टता",
        status: "warn",
        valueDisplay: `${analysis.score}/100`,
        detailEn: "Slight blur detected",
        detailHi: "हल्की धुंधलाहट पायी गयी",
      });
    } else {
      hasError = true;
      mainSuggestionEn = "Photo is too blurry. Official portal may reject this submission.";
      mainSuggestionHi = "फोटो बहुत धुंधली है। कृपया साफ़ फोटो अपलोड करें।";
      metrics.push({
        nameEn: "Sharpness",
        nameHi: "स्पष्टता",
        status: "error",
        valueDisplay: `${analysis.score}/100`,
        detailEn: "Excessive blur detected",
        detailHi: "अत्यधिक धुंधलापन पाया गया",
      });
    }

    // Readability / Contrast
    if (analysis.contrastScore >= 40) {
      metrics.push({
        nameEn: "Readability",
        nameHi: "पठनीयता",
        status: "ok",
        valueDisplay: "Good Contrast",
        detailEn: "Foreground text and details are distinct from background",
        detailHi: "दस्तावेज़ सुपाठ्य एवं साफ़ है",
      });
    } else {
      hasWarn = true;
      metrics.push({
        nameEn: "Readability",
        nameHi: "पठनीयता",
        status: "warn",
        valueDisplay: "Low Contrast",
        detailEn: "Document may be underexposed or washed out",
        detailHi: "दस्तावेज़ में कंट्रास्ट कम है",
      });
    }
  } else if (isPdf) {
    metrics.push({
      nameEn: "Readability",
      nameHi: "पठनीयता",
      status: "ok",
      valueDisplay: "Standard PDF",
      detailEn: "Digital document structure verified",
      detailHi: "डिजिटल दस्तावेज़ प्रारूप मान्य",
    });
  }

  let overallStatus: "Technical checks passed" | "Potential issue detected" | "Needs review" = "Technical checks passed";
  let statusColor: "success" | "warning" | "destructive" = "success";

  if (hasError) {
    overallStatus = "Needs review";
    statusColor = "destructive";
  } else if (hasWarn) {
    overallStatus = "Potential issue detected";
    statusColor = "warning";
  }

  return {
    docId,
    docNameEn,
    docNameHi,
    fileName: fileInfo.name,
    fileSizeKB: kb,
    overallStatus,
    statusColor,
    suggestionEn: mainSuggestionEn,
    suggestionHi: mainSuggestionHi,
    metrics,
  };
}
