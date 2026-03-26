import { describe, it, expect } from "vitest";
import { getVariationSummary } from "./variations";

describe("getVariationSummary", () => {
  it("returns empty string for empty input", () => {
    expect(getVariationSummary("")).toBe("");
  });

  it("returns empty string for whitespace only", () => {
    expect(getVariationSummary("   ")).toBe("");
  });

  it("returns 'Variacoes disponiveis' for advanced pattern", () => {
    expect(getVariationSummary("~Var:Bacon:radio")).toBe("Variacoes disponiveis");
  });

  it("returns 'Variacoes disponiveis' for # prefix", () => {
    expect(getVariationSummary("#Pequeno:10/Grande:20")).toBe("Variacoes disponiveis");
  });

  it("returns 'Variacoes disponiveis' for Var: prefix", () => {
    expect(getVariationSummary("Var:opcao1")).toBe("Variacoes disponiveis");
  });

  it("returns trimmed text for simple extras", () => {
    expect(getVariationSummary("sem cebola")).toBe("sem cebola");
  });

  it("returns trimmed text with extra spaces", () => {
    expect(getVariationSummary("  sem cebola  ")).toBe("sem cebola");
  });
});
