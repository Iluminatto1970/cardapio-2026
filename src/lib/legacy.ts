import fs from "fs";
import path from "path";

type LegacyConfigUrls = {
  menu?: string;
  categories?: string;
  config?: string;
};

type LegacyConfig = Record<string, Record<string, string>>;

export type LegacyMenuItem = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  sku: string;
  notes: string;
  extra: string;
};

export type LegacyCategory = {
  name: string;
  displayName: string;
  order: number;
  items: LegacyMenuItem[];
};

function parseCSV(csvText: string) {
  if (!csvText || csvText.trim().length === 0) return [] as Record<string, string>[];

  const text = csvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === "\"") {
      if (inQuotes && nextChar === "\"") {
        currentField += "\"";
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if (char === "\n" && !inQuotes) {
      currentRow.push(currentField.trim());
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }

    i += 1;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) return [] as Record<string, string>[];

  const headers = rows[0].map((header) => header.replace(/^"|"$/g, "").trim());
  const data: Record<string, string>[] = [];

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const rowValues = rows[rowIndex];
    const row: Record<string, string> = {};

    headers.forEach((header, colIndex) => {
      let value = rowValues[colIndex] ?? "";
      if (value.startsWith("\"") && value.endsWith("\"")) {
        value = value.slice(1, -1);
      }
      value = value.replace(/""/g, "\"");
      row[header] = value;
    });

    data.push(row);
  }

  return data;
}

function getLegacyConfigUrls(): LegacyConfigUrls {
  const configPath = path.resolve(process.cwd(), "..", "..", "config.js");
  const configJs = fs.readFileSync(configPath, "utf-8");
  const values: Record<string, string> = {};

  const regex = /const\s+([A-Z_]+)\s*=\s*['"]([^'"]*)['"]/g;
  let match: RegExpExecArray | null = regex.exec(configJs);
  while (match) {
    values[match[1]] = match[2];
    match = regex.exec(configJs);
  }

  return {
    menu: values.MENU_CSV_URL,
    categories: values.CATEGORIES_CSV_URL,
    config: values.CONFIG_CSV_URL,
  };
}

async function fetchCSV(url?: string) {
  if (!url) return [] as Record<string, string>[];
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load CSV: ${response.status}`);
  }
  const text = await response.text();
  return parseCSV(text);
}

function processConfigData(configItems: Record<string, string>[]) {
  const config: LegacyConfig = {
    identidade_visual: {},
    cores: {},
    contato: {},
    horario: {},
    redes_sociais: {},
    seo: {},
    checkout: {},
    envio: {},
    setup: {},
  };

  configItems.forEach((item) => {
    const section = item.section;
    const key = item.key;
    const value = item.value;

    if (section && key && config[section]) {
      config[section][key] = value;
    }
  });

  return config;
}

function processImageUrl(url?: string) {
  if (!url) return "";
  let processedUrl = url.trim();

  if (processedUrl.includes("drive.google.com")) {
    const fileId = processedUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
    }
  }

  if (processedUrl.includes("dropbox.com")) {
    processedUrl = processedUrl.replace("?dl=0", "?raw=1").replace("?dl=1", "?raw=1");
    if (!processedUrl.includes("?raw=1")) {
      processedUrl += processedUrl.includes("?") ? "&raw=1" : "?raw=1";
    }
    return processedUrl;
  }

  return processedUrl;
}

export async function getLegacyMenuData() {
  const urls = getLegacyConfigUrls();
  const [configItems, categoriesData, menuItems] = await Promise.all([
    fetchCSV(urls.config),
    fetchCSV(urls.categories),
    fetchCSV(urls.menu),
  ]);

  const appConfig = processConfigData(configItems);
  const activeCategories = categoriesData
    .filter((category) => category.status === "Ativo")
    .map((category) => ({
      name: category.nome_categoria,
      displayName: category.titulo_exibicao || category.nome_categoria,
      order: Number.parseInt(category.ordem, 10) || 0,
      items: [] as LegacyMenuItem[],
    }))
    .sort((a, b) => a.order - b.order);

  const categoryMap = new Map(activeCategories.map((category) => [category.name, category]));

  menuItems.forEach((item, index) => {
    if (item.status !== "Ativo") return;
    const categories = (item.categoria || "")
      .split(/[,;]/)
      .map((category) => category.trim())
      .filter((category) => categoryMap.has(category));

    if (categories.length === 0) return;

    const menuItem: LegacyMenuItem = {
      name: item.item || `Item ${index + 1}`,
      description: item.descricao || "",
      price: item.preco || "",
      imageUrl: processImageUrl(item.foto_url),
      sku: item.SKU || "",
      notes: item.observacoes || "",
      extra: item.classificacao_adicional || "",
    };

    categories.forEach((categoryName) => {
      categoryMap.get(categoryName)?.items.push({ ...menuItem });
    });
  });

  return {
    appConfig,
    categories: activeCategories,
  };
}
