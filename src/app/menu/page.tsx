import { prisma } from "@/lib/prisma";
import MenuClient from "@/app/menu/MenuClient";

type ExtraRow = {
  kind: string;
  data: Record<string, string>;
};

export async function generateMetadata() {
  const configEntries = await prisma.configEntry.findMany();
  const configMap = new Map<string, string>();
  configEntries.forEach((entry) => {
    configMap.set(`${entry.section}.${entry.key}`, entry.value);
  });

  const title =
    configMap.get("seo.titulo_pagina") ||
    configMap.get("identidade_visual.nome_empresa") ||
    "Cardapio Digital";
  const description =
    configMap.get("seo.descricao_seo") ||
    configMap.get("identidade_visual.slogan") ||
    "Cardapio digital";
  const keywords = configMap.get("seo.palavras_chave") || undefined;
  const logo = configMap.get("identidade_visual.logo_url") || undefined;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: logo ? [{ url: logo }] : undefined,
    },
  };
}

export default async function PublicMenuPage() {
  const [configEntries, categories, extras] = await Promise.all([
    prisma.configEntry.findMany(),
    prisma.category.findMany({
      where: { status: "Ativo" },
      orderBy: { order: "asc" },
      include: {
        items: {
          include: { item: true },
        },
      },
    }),
    prisma.legacyExtra.findMany({
      where: { kind: { in: ["hours", "neighborhoods", "coupons"] } },
    }),
  ]);

  const config: Record<string, Record<string, string>> = {};
  configEntries.forEach((entry) => {
    if (!config[entry.section]) config[entry.section] = {};
    config[entry.section][entry.key] = entry.value;
  });

  const formattedCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    displayName: category.displayName ?? category.name,
    order: category.order,
    items: category.items
      .map((rel) => rel.item)
      .filter((item) => item.status === "Ativo")
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description ?? "",
        price: item.priceRaw ?? "",
        imageUrl: item.imageUrl ?? "",
        sku: item.sku ?? "",
        extra: item.extra ?? "",
      })),
  }));

  return (
    <MenuClient
      categories={formattedCategories}
      config={config}
      extras={extras as unknown as ExtraRow[]}
    />
  );
}
