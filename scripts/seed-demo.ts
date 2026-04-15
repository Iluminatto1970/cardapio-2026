import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Creating sample data...");

  // Create tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-recife" },
    update: {},
    create: {
      slug: "demo-recife",
      name: "Demo Recife",
      phone: "5583987140791",
    },
  });
  console.log("✅ Tenant:", tenant.name);

  // Create categories
  const categories = [
    { name: "entradas", displayName: "Entradas", order: 1 },
    { name: "principais", displayName: "Pratos Principais", order: 2 },
    { name: "bebidas", displayName: "Bebidas", order: 3 },
    { name: "sobremesas", displayName: "Sobremesas", order: 4 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { displayName: cat.displayName, order: cat.order },
      create: cat,
    });
  }
  console.log("✅ Categories created");

  // Create items
  const items = [
    { name: "Bolinho de Bacalhau", description: "Tradicional bolinho crocante", price: "R$ 18,90", category: "entradas", imageUrl: "https://images.unsplash.com/photo-1604909052868-94e60e22c3c2?w=400" },
    { name: "Pastel de Camarão", description: "Pastel frito com recheio cremoso", price: "R$ 22,00", category: "entradas", imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400" },
    { name: "Moqueca de Peixe", description: "Moqueca tradicional com leite de coco", price: "R$ 68,00", category: "principais", imageUrl: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=400" },
    { name: "Arroz de Camarão", description: "Arroz cremoso com camarão", price: "R$ 72,00", category: "principais", imageUrl: "https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=400" },
    { name: "Carne de Sol", description: "Carne de sol com macaxeira e queijo", price: "R$ 58,00", category: "principais", imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400" },
    { name: "Suco de Cajá", description: "Suco natural 300ml", price: "R$ 8,00", category: "bebidas" },
    { name: "Coquetel de Caju", description: "Coquetel com caju e vodka", price: "R$ 15,00", category: "bebidas" },
    { name: "Água de Coco", description: "Coco verde natural", price: "R$ 6,00", category: "bebidas" },
    { name: "Caldo de Cana", description: "Caldo de cana gelado 300ml", price: "R$ 7,00", category: "bebidas" },
    { name: "Bolo de Rolo", description: "Fatia de bolo de rolo goiano", price: "R$ 12,00", category: "sobremesas", imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400" },
    { name: "Pudim", description: "Pudim de leite condensado", price: "R$ 10,00", category: "sobremesas" },
  ];

  for (const item of items) {
    const category = await prisma.category.findUnique({ where: { name: item.category } });
    if (!category) continue;

    const existingItem = await prisma.item.findFirst({ where: { name: item.name } });
    
    let created;
    if (existingItem) {
      created = await prisma.item.update({
        where: { id: existingItem.id },
        data: { description: item.description, priceRaw: item.price, imageUrl: item.imageUrl || "" },
      });
    } else {
      created = await prisma.item.create({
        data: { name: item.name, description: item.description, priceRaw: item.price, imageUrl: item.imageUrl || "" },
      });
    }

    const existingRelation = await prisma.itemCategory.findFirst({
      where: { itemId: created.id, categoryId: category.id }
    });
    if (!existingRelation) {
      await prisma.itemCategory.create({
        data: { itemId: created.id, categoryId: category.id },
      });
    }
  }
  console.log("✅ Items created");

  // Create config entries
  const configs = [
    { section: "identidade_visual", key: "nome_empresa", value: "Demo Recife" },
    { section: "identidade_visual", key: "slogan", value: "O melhor da culinária nordestina" },
    { section: "contato", key: "whatsapp", value: "5583987140791" },
    { section: "seo", key: "titulo_pagina", value: "Demo Recife - Cardápio Digital" },
    { section: "checkout", key: "checkout_mode", value: "Sim" },
    { section: "setup", key: "autor_name", value: "Iluminatto Dev" },
    { section: "setup", key: "autor_link", value: "https://iluminatto.dev.br" },
  ];

  for (const config of configs) {
    await prisma.configEntry.upsert({
      where: { section_key: { section: config.section, key: config.key } },
      update: { value: config.value },
      create: config,
    });
  }
  console.log("✅ Config entries created");

  console.log("\n🎉 Sample data created successfully!");
  console.log("\n📍 Access:");
  console.log("   Cardápio: http://localhost:3000/menu");
  console.log("   Admin:   http://localhost:3000/app/cardapio");
  console.log("   Landing: http://localhost:3000/landing");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
