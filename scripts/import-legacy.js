/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

process.env.DATABASE_URL ||= "file:./dev.db";

const prisma = new PrismaClient();

function parseCSV(csvText) {
  if (!csvText || csvText.trim().length === 0) return [];

  const text = csvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
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

  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => header.replace(/^"|"$/g, "").trim());
  const data = [];

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const rowValues = rows[rowIndex];
    const row = {};

    headers.forEach((header, colIndex) => {
      let value = rowValues[colIndex] ?? "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      value = value.replace(/""/g, '"');
      row[header] = value;
    });

    data.push(row);
  }

  return data;
}

function getLegacyConfigUrls() {
  const configPath = path.resolve(process.cwd(), "..", "..", "config.js");
  const configJs = fs.readFileSync(configPath, "utf-8");
  const values = {};

  const stringRegex = /const\s+([A-Z_]+)\s*=\s*['"]([^'"]*)['"]/g;
  let match = stringRegex.exec(configJs);
  while (match) {
    values[match[1]] = match[2];
    match = stringRegex.exec(configJs);
  }

  const boolRegex = /const\s+([A-Z_]+)\s*=\s*(true|false|\d+)\s*;/g;
  match = boolRegex.exec(configJs);
  while (match) {
    values[match[1]] = match[2];
    match = boolRegex.exec(configJs);
  }

  const arrayRegex = /const\s+([A-Z_]+)\s*=\s*(\[[\s\S]*?\]);/g;
  match = arrayRegex.exec(configJs);
  while (match) {
    values[match[1]] = match[2];
    match = arrayRegex.exec(configJs);
  }

  const objectRegex = /const\s+([A-Z_]+)\s*=\s*(\{[\s\S]*?\});/g;
  match = objectRegex.exec(configJs);
  while (match) {
    values[match[1]] = match[2];
    match = objectRegex.exec(configJs);
  }

  return {
    menu: values.MENU_CSV_URL,
    categories: values.CATEGORIES_CSV_URL,
    config: values.CONFIG_CSV_URL,
    hours: values.HOURS_CSV_URL,
    neighborhoods: values.NEIGHBORHOODS_CSV_URL,
    coupons: values.COUPONS_CSV_URL,
    constants: values,
  };
}

function parseArrayLiteral(value) {
  if (!value) return [];
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return [];
  const content = trimmed.slice(1, -1);
  return content
    .split(",")
    .map((part) => part.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

function parseObjectLiteral(value) {
  if (!value) return {};
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return {};
  const content = trimmed.slice(1, -1);
  const entries = {};
  content.split(",").forEach((pair) => {
    const [key, raw] = pair.split(":").map((item) => item.trim());
    if (!key || raw === undefined) return;
    const cleanKey = key.replace(/^['"]|['"]$/g, "");
    const cleanValue = raw.replace(/^['"]|['"]$/g, "");
    entries[cleanKey] = cleanValue;
  });
  return entries;
}

async function fetchCSV(url) {
  if (!url) return [];
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load CSV: ${response.status}`);
  }
  const text = await response.text();
  return parseCSV(text);
}

function processImageUrl(url) {
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

async function resetDatabase() {
  await prisma.itemCategory.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  await prisma.configEntry.deleteMany();
  await prisma.legacyExtra.deleteMany();
}

async function importConfig(entries) {
  const rows = entries
    .filter((entry) => entry.section && entry.key)
    .map((entry) => ({
      section: entry.section,
      key: entry.key,
      value: entry.value ?? "",
    }));

  for (const row of rows) {
    await prisma.configEntry.upsert({
      where: { section_key: { section: row.section, key: row.key } },
      update: { value: row.value },
      create: row,
    });
  }
}

async function importLegacyConstants(constants) {
  if (!constants) return;

  const entries = [];
  const traducao = constants.TRADUCAO;
  if (typeof traducao !== "undefined") {
    entries.push({ section: "setup", key: "traducao", value: String(traducao) });
  }

  if (constants.LANGS) {
    const langs = parseArrayLiteral(constants.LANGS);
    entries.push({ section: "setup", key: "langs", value: langs.join(",") });
  }

  if (constants.BANDEIRAS) {
    const flags = parseObjectLiteral(constants.BANDEIRAS);
    entries.push({ section: "setup", key: "bandeiras", value: JSON.stringify(flags) });
  }

  if (constants.TIMEZONE) {
    entries.push({ section: "setup", key: "timezone", value: String(constants.TIMEZONE) });
  }

  if (constants.PRELOADER_LOGO_URL) {
    entries.push({ section: "setup", key: "preloader_logo_url", value: String(constants.PRELOADER_LOGO_URL) });
    entries.push({ section: "setup", key: "preloader_ativo", value: "Sim" });
  }

  if (constants.PRELOADER_COLOR) {
    entries.push({ section: "setup", key: "preloader_color", value: String(constants.PRELOADER_COLOR) });
    entries.push({ section: "setup", key: "preloader_ativo", value: "Sim" });
  }

  for (const entry of entries) {
    await prisma.configEntry.upsert({
      where: { section_key: { section: entry.section, key: entry.key } },
      update: { value: entry.value },
      create: entry,
    });
  }
}

async function importCategories(entries) {
  const rows = entries
    .filter((entry) => entry.nome_categoria)
    .map((entry) => ({
      name: entry.nome_categoria,
      displayName: entry.titulo_exibicao || entry.nome_categoria,
      order: Number.parseInt(entry.ordem, 10) || 0,
      status: entry.status || "Ativo",
    }));

  for (const row of rows) {
    await prisma.category.upsert({
      where: { name: row.name },
      update: {
        displayName: row.displayName,
        order: row.order,
        status: row.status,
      },
      create: row,
    });
  }
}

async function ensureCategory(name) {
  if (!name) return null;
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return existing;
  return prisma.category.create({
    data: { name, displayName: name, order: 0, status: "Ativo" },
  });
}

async function importItems(entries) {
  for (const entry of entries) {
    if (entry.status && entry.status !== "Ativo") continue;
    const item = await prisma.item.create({
      data: {
        name: entry.item || "Item",
        description: entry.descricao || "",
        priceRaw: entry.preco || "",
        imageUrl: processImageUrl(entry.foto_url),
        sku: entry.SKU || "",
        notes: entry.observacoes || "",
        extra: entry.classificacao_adicional || "",
        status: entry.status || "Ativo",
      },
    });

    const categories = (entry.categoria || "")
      .split(/[,;]/)
      .map((category) => category.trim())
      .filter(Boolean);

    for (const categoryName of categories) {
      const category = await ensureCategory(categoryName);
      if (!category) continue;
      await prisma.itemCategory.create({
        data: {
          itemId: item.id,
          categoryId: category.id,
        },
      });
    }
  }
}

async function importExtras(kind, rows) {
  if (!rows.length) return;
  await prisma.legacyExtra.createMany({
    data: rows.map((row) => ({ kind, data: row })),
  });
}

async function main() {
  const args = process.argv.slice(2);
  const shouldReset = args.includes("--reset");

  const urls = getLegacyConfigUrls();
  const [configRows, categoryRows, menuRows, hoursRows, neighborhoodRows, couponRows] =
    await Promise.all([
      fetchCSV(urls.config),
      fetchCSV(urls.categories),
      fetchCSV(urls.menu),
      fetchCSV(urls.hours),
      fetchCSV(urls.neighborhoods),
      fetchCSV(urls.coupons),
    ]);

  if (shouldReset) {
    await resetDatabase();
  }

  await importConfig(configRows);
  await importLegacyConstants(urls.constants);
  await importCategories(categoryRows);
  await importItems(menuRows);
  await importExtras("hours", hoursRows);
  await importExtras("neighborhoods", neighborhoodRows);
  await importExtras("coupons", couponRows);

  console.log("Legacy import completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
