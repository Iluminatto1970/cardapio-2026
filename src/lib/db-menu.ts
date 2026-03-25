import { prisma } from "@/lib/prisma";

export type DbMenuItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  sku: string;
  extra: string;
};

export type DbCategory = {
  id: string;
  name: string;
  displayName: string;
  order: number;
  items: DbMenuItem[];
};

export type DbMenuConfig = {
  displayName: string;
  slogan: string;
  whatsapp: string;
};

export async function getMenuFromDb() {
  const [configEntries, categories] = await Promise.all([
    prisma.configEntry.findMany(),
    prisma.category.findMany({
      where: { status: "Ativo" },
      orderBy: { order: "asc" },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    }),
  ]);

  const configMap = new Map<string, string>();
  configEntries.forEach((entry) => {
    configMap.set(`${entry.section}.${entry.key}`, entry.value);
  });

  const menuConfig: DbMenuConfig = {
    displayName: configMap.get("identidade_visual.nome_empresa") ?? "Cardapio Digital",
    slogan: configMap.get("identidade_visual.slogan") ?? "Pedido rapido e sem fila",
    whatsapp: configMap.get("contato.whatsapp") ?? "",
  };

  const formattedCategories: DbCategory[] = categories.map((category) => {
    const items = category.items
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
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      id: category.id,
      name: category.name,
      displayName: category.displayName ?? category.name,
      order: category.order,
      items,
    };
  });

  return {
    config: menuConfig,
    categories: formattedCategories,
  };
}
