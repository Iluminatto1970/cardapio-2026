const DEFAULT_LABEL = "Selecione o tamanho";

export function parsePrice(priceString: string) {
  if (!priceString) return 0;
  let cleanValue = priceString.toString().trim();
  if (!cleanValue) return 0;

  cleanValue = cleanValue.replace(/[^\d,.-]/g, "");

  const hasComma = cleanValue.includes(",");
  const hasDot = cleanValue.includes(".");

  if (hasComma && hasDot) {
    const lastComma = cleanValue.lastIndexOf(",");
    const lastDot = cleanValue.lastIndexOf(".");
    if (lastComma > lastDot) {
      cleanValue = cleanValue.replace(/\./g, "").replace(",", ".");
    } else {
      cleanValue = cleanValue.replace(/,/g, "");
    }
  } else if (hasComma && !hasDot) {
    const parts = cleanValue.split(",");
    if (parts.length === 2 && parts[1].length <= 2) {
      cleanValue = cleanValue.replace(",", ".");
    } else {
      cleanValue = cleanValue.replace(/,/g, "");
    }
  }

  const parsed = Number.parseFloat(cleanValue);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function getPriceType(priceField: string) {
  if (!priceField) return "consultation";
  const priceStr = String(priceField).trim();
  if (!priceStr || priceStr.toLowerCase().includes("consulte")) {
    return "consultation";
  }
  if (priceStr.includes("/") && priceStr.includes(":")) {
    return "multiple";
  }
  return "fixed";
}

export function parseMultiplePrices(priceField: string) {
  if (!priceField || priceField.trim() === "") return [] as { name: string; price: number }[];

  let variationsString = priceField;
  if (priceField.includes("#")) {
    const parts = priceField.split("#");
    if (parts.length >= 2) {
      variationsString = parts.slice(1).join("#");
    }
  }

  return variationsString
    .split("/")
    .map((item) => {
      const parts = item.split(":");
      if (parts.length !== 2) return null;
      const [name, price] = parts;
      return { name: name.trim(), price: parsePrice(price.trim()) };
    })
    .filter((item): item is { name: string; price: number } => Boolean(item));
}

export function getMultiplePricesLabel(priceField: string) {
  if (!priceField || priceField.trim() === "") return DEFAULT_LABEL;
  if (priceField.includes("#")) {
    const parts = priceField.split("#");
    if (parts.length >= 2) {
      const label = parts[0].trim();
      return label || DEFAULT_LABEL;
    }
  }
  return DEFAULT_LABEL;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getPriceDisplay(priceField: string) {
  const type = getPriceType(priceField);
  if (type === "consultation") {
    return "Consulte";
  }
  if (type === "multiple") {
    const prices = parseMultiplePrices(priceField);
    if (prices.length === 0) return "Consulte";
    const values = prices.map((price) => price.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }
  return formatCurrency(parsePrice(priceField));
}
