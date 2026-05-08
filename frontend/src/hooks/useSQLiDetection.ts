import { useRef } from "react";

const SQLI_PATTERNS = [
  /(\b(SELECT|UPDATE|DELETE|INSERT|DROP|ALTER|UNION)\b.*)/i,
  /('|--|;|\/\*|\*\/|xp_)/i,
  /\bOR\b\s+\d+=\d+/i,
  /\bAND\b\s+\d+=\d+/i,
  /["'][\s]*or[\s]*["']/i,
];
  const XSS_PATTERNS = [
    /<script\b[^>]*>(.*?)<\/script>/gi,
    /<\/?(img|svg|iframe|object|embed|video|audio)[^>]*>/gi,
    /onerror\s*=|onload\s*=|onclick\s*=|onmouseover\s*=/gi,
    /javascript:/gi,
  ];
export function useSQLiDetection(onDetected: () => void) {
  const attempts = useRef(0);

  function checkAll(value: string) {
    const sqli = SQLI_PATTERNS.some((pat) => pat.test(value));
    const xss = XSS_PATTERNS.some((pat) => pat.test(value));
    if (sqli || xss) {
      attempts.current += 1;
      if (attempts.current >= 3) {
        onDetected();
      }
      return true;
    }
    return false;
  }

  return { checkAll };
}

