const MULTI_VARIATION_PATTERN = /^(#|Var:|~Var:)/;
const ADVANCED_VARIATION_PATTERN = /:(radio|checkbox):/;

export function getVariationSummary(extra: string) {
  if (!extra) return "";
  const trimmed = extra.trim();
  if (!trimmed) return "";

  if (ADVANCED_VARIATION_PATTERN.test(trimmed)) {
    return "Variacoes disponiveis";
  }

  if (MULTI_VARIATION_PATTERN.test(trimmed)) {
    return "Variacoes disponiveis";
  }

  return trimmed;
}
