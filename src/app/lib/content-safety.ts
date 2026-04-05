type SafetyRule = {
  pattern: RegExp;
  category: "hate" | "sexual" | "harassment" | "violence";
};

const SAFETY_RULES: SafetyRule[] = [
  // Hate speech / extremist terms
  { pattern: /\b(white\s*power|kkk|heil\s*hitler|nazi)\b/i, category: "hate" },
  // Sexual / nudity explicit language
  { pattern: /\b(nude|nudes|porn|pornographic|explicit\s*sex|sexualized)\b/i, category: "sexual" },
  // Harassment / abuse phrases
  { pattern: /\b(kill\s*yourself|kys|you\s*should\s*die)\b/i, category: "harassment" },
  // Violent intent language
  { pattern: /\b(i[' ]?ll\s*kill\s*you|shoot\s*them|rape\s*them)\b/i, category: "violence" },
];

export type ContentSafetyResult = {
  ok: boolean;
  message?: string;
  category?: SafetyRule["category"];
};

function normalizeText(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/[@]/g, "a")
    .replace(/[0]/g, "o")
    .replace(/[1!]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t");
}

export function checkContentSafety(text: string): ContentSafetyResult {
  const normalized = normalizeText(text);
  for (const rule of SAFETY_RULES) {
    if (rule.pattern.test(normalized)) {
      return {
        ok: false,
        category: rule.category,
        message:
          "This content may violate KIN community standards. Please remove harmful, hateful, sexualized, or abusive language and try again.",
      };
    }
  }
  return { ok: true };
}
