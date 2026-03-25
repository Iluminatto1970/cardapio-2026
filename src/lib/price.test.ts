import { describe, it, expect } from "vitest";
import {
  parsePrice,
  getPriceType,
  parseMultiplePrices,
  getMultiplePricesLabel,
  formatCurrency,
  getPriceDisplay,
} from "./price";

describe("parsePrice", () => {
  it("parses simple number", () => {
    expect(parsePrice("29.90")).toBe(29.9);
  });

  it("parses comma decimal", () => {
    expect(parsePrice("29,90")).toBe(29.9);
  });

  it("parses with currency symbol", () => {
    expect(parsePrice("R$ 29,90")).toBe(29.9);
  });

  it("returns 0 for empty string", () => {
    expect(parsePrice("")).toBe(0);
  });

  it("handles multiple dots", () => {
    expect(parsePrice("1.234.567,89")).toBe(1234567.89);
  });
});

describe("getPriceType", () => {
  it("returns consultation for empty", () => {
    expect(getPriceType("")).toBe("consultation");
  });

  it("returns consultation for 'consulte'", () => {
    expect(getPriceType("consulte")).toBe("consultation");
  });

  it("returns multiple for price with / and :", () => {
    expect(getPriceType("Pequeno:10.00/Grande:20.00")).toBe("multiple");
  });

  it("returns fixed for simple price", () => {
    expect(getPriceType("29.90")).toBe("fixed");
  });
});

describe("parseMultiplePrices", () => {
  it("parses multiple prices", () => {
    const result = parseMultiplePrices("Pequeno:10.00/Grande:20.00");
    expect(result).toEqual([
      { name: "Pequeno", price: 10 },
      { name: "Grande", price: 20 },
    ]);
  });

  it("returns empty array for empty string", () => {
    expect(parseMultiplePrices("")).toEqual([]);
  });

  it("handles price with # prefix", () => {
    const result = parseMultiplePrices("#Pequeno:10.00/Grande:20.00");
    expect(result).toEqual([
      { name: "Pequeno", price: 10 },
      { name: "Grande", price: 20 },
    ]);
  });
});

describe("getMultiplePricesLabel", () => {
  it("returns label from # separator", () => {
    expect(getMultiplePricesLabel("Tamanho#Pequeno:10/Grande:20")).toBe("Tamanho");
  });

  it("returns default label when no #", () => {
    expect(getMultiplePricesLabel("Pequeno:10.00/Grande:20.00")).toBe("Selecione o tamanho");
  });
});

describe("formatCurrency", () => {
  it("formats BRL currency", () => {
    expect(formatCurrency(29.9)).toContain("29,90");
  });
});

describe("getPriceDisplay", () => {
  it("returns Consulte for consultation", () => {
    expect(getPriceDisplay("consulte")).toBe("Consulte");
  });

  it("returns formatted price for fixed", () => {
    expect(getPriceDisplay("29.90")).toContain("29,90");
  });

  it("returns range for multiple prices", () => {
    const result = getPriceDisplay("Pequeno:10.00/Grande:20.00");
    expect(result).toContain("10,00");
    expect(result).toContain("20,00");
  });
});
