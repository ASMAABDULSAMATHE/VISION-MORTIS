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
 * Format: VM-YYYY-XXXX (where YYYY is a 4-digit year, and XXXX is 4 alphanumeric characters with at least ONE alphabet letter)
 * Examples: VM-2026-A104, VM-2026-9B21, VM-2025-ABCD, VM-2026-12A4
 */
export function validateCaseId(caseId?: string): CaseIdValidationResult {
  if (!caseId || !caseId.trim()) {
    return {
      isValid: false,
      error: "File number is required (Format: VM-YYYY-XXXX with at least 1 letter in suffix).",
    };
  }

  const trimmed = caseId.trim().toUpperCase();

  if (!trimmed.startsWith("VM-")) {
    return {
      isValid: false,
      error: "File number must start with 'VM-' prefix (e.g. VM-2026-A104).",
    };
  }

  const parts = trimmed.split("-");
  if (parts.length !== 3) {
    return {
      isValid: false,
      error: "File number must follow format VM-YYYY-XXXX (e.g. VM-2026-A104).",
    };
  }

  const year = parts[1];
  if (!/^\d{4}$/.test(year)) {
    return {
      isValid: false,
      error: `Invalid year '${year}'. Must be a 4-digit year (e.g. ${new Date().getFullYear()}).`,
    };
  }

  const suffix = parts[2];
  if (suffix.length !== 4) {
    return {
      isValid: false,
      error: `Suffix '${suffix}' must be exactly 4 characters (e.g. A104). Current length is ${suffix.length}.`,
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
      error: "Suffix must contain at least one alphabet letter (e.g. A104, 9B21; not all digits).",
    };
  }

  return {
    isValid: true,
    normalized: trimmed,
  };
}

/**
 * Generates a conforming file number (e.g. VM-2026-A739)
 */
export function generateValidCaseId(year?: number): string {
  const y = year || new Date().getFullYear();
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const char1 = letters[Math.floor(Math.random() * letters.length)];
  const numPart = Math.floor(100 + Math.random() * 900); // 3 digits
  return `VM-${y}-${char1}${numPart}`;
}

/**
 * Generate cryptographic verification hash for case dossier
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
