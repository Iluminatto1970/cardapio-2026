import { prisma } from "@/lib/prisma";

export type ConfigInput = {
  companyName: string;
  slogan: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  welcomeMessage: string;
};

export async function getConfigMap() {
  const entries = await prisma.configEntry.findMany();
  const map = new Map<string, string>();
  entries.forEach((entry) => {
    map.set(`${entry.section}.${entry.key}`, entry.value);
  });
  return map;
}

export async function upsertConfig(entries: Array<{ section: string; key: string; value: string }>) {
  for (const entry of entries) {
    await prisma.configEntry.upsert({
      where: { section_key: { section: entry.section, key: entry.key } },
      update: { value: entry.value },
      create: entry,
    });
  }
}
