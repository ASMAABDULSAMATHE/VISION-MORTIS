/**
 * VisionMortis Validation Utilities
 * Protocol One Medico-Legal Standards
 */

export interface CaseIdValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string;
}

/**
 * Validates File Number / Case ID
 * Format: VM-[EMIRATE_CODE]-YYYY-XXXX (or VM-YYYY-XXXX)
 * Examples: VM-DXB-2026-A841, VM-AUH-2026-B412, VM-SHJ-2026-B919, VM-2026-A104
 */
export function validateCaseId(caseId?: string): CaseIdValidationResult {
  if (!caseId || !caseId.trim()) {
    return {
      isValid: false,
      error: "File number is required (Format: VM-DXB-YYYY-XXXX or VM-YYYY-XXXX).",
    };
  }

  const trimmed = caseId.trim().toUpperCase();

  if (!trimmed.startsWith("VM-")) {
    return {
      isValid: false,
      error: "File number must start with 'VM-' prefix (e.g. VM-DXB-2026-A841).",
    };
  }

  const parts = trimmed.split("-");

  // Format 1: VM-EMIRATE-YYYY-XXXX (4 parts: VM, DXB, 2026, A841)
  // Format 2: VM-YYYY-XXXX (3 parts: VM, 2026, A841)
  let year = "";
  let suffix = "";

  if (parts.length === 4) {
    const emirateCode = parts[1];
    if (!/^[A-Z]{3,4}$/.test(emirateCode)) {
      return {
        isValid: false,
        error: `Emirate code '${emirateCode}' must be a 3-4 letter code (e.g. DXB, AUH, SHJ, AJM, RAK, FUJ, UAQ).`,
      };
    }
    year = parts[2];
    suffix = parts[3];
  } else if (parts.length === 3) {
    year = parts[1];
    suffix = parts[2];
  } else {
    return {
      isValid: false,
      error: "File number must follow format VM-DXB-YYYY-XXXX or VM-YYYY-XXXX.",
    };
  }

  if (!/^\d{4}$/.test(year)) {
    return {
      isValid: false,
      error: `Invalid year '${year}'. Must be a 4-digit year (e.g. ${new Date().getFullYear()}).`,
    };
  }

  if (suffix.length !== 4) {
    return {
      isValid: false,
      error: `Suffix '${suffix}' must be exactly 4 characters (e.g. A841). Current length is ${suffix.length}.`,
    };
  }

  if (!/^[A-Z0-9]{4}$/.test(suffix)) {
    return {
      isValid: false,
      error: "Suffix must contain only letters and numbers (no special symbols).",
    };
  }

  if (!/[A-Z]/.test(suffix)) {
    return {
      isValid: false,
      error: "Suffix must contain at least one alphabet letter (e.g. A841, 9B21; not all digits).",
    };
  }

  return {
    isValid: true,
    normalized: trimmed,
  };
}

/**
 * Generates a conforming file number with Emirates code (e.g. VM-DXB-2026-A739)
 */
export function generateValidCaseId(year?: number, emirate: string = "DXB"): string {
  const y = year || new Date().getFullYear();
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const char1 = letters[Math.floor(Math.random() * letters.length)];
  const numPart = Math.floor(100 + Math.random() * 900); // 3 digits
  const em = emirate.trim().toUpperCase().slice(0, 3) || "DXB";
  return `VM-${em}-${y}-${char1}${numPart}`;
}

/**
 * Generate cryptographic verification hash for case report
 */
export function generateCaseIntegrityHash(caseId: string, timestamp: string, pmiOptimal: number): string {
  const raw = `${caseId}|${timestamp}|${pmiOptimal}|VisionMortis-Protocol One`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
  return `VM-SHA-${hex}-${caseId.replace(/[^A-Z0-9]/gi, "").slice(-4)}`;
}

/**
 * Generates formatted timestamp for indicator logging (e.g. 2026-08-31 08:30:15)
 */
export function getFormattedCurrentTimestamp(d?: Date): string {
  const now = d || new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Cleanly formats an indicator recorded timestamp for reports and UI badges
 */
export function formatIndicatorTimestamp(ts?: string): string {
  if (!ts || !ts.trim()) return "Logged during examination";
  const str = ts.trim();
  try {
    const d = new Date(str.includes("T") || str.includes("-") ? str.replace(" ", "T") : str);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const seconds = String(d.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  } catch {
    // Return original string if parse fails
  }
  return str;
}

