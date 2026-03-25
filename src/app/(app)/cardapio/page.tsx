import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";

async function createCategory(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.category.upsert({
    where: { name },
    update: {
      displayName: String(formData.get("displayName") ?? name),
      order: Number.parseInt(String(formData.get("order") ?? "0"), 10) || 0,
      status: String(formData.get("status") ?? "Ativo"),
    },
    create: {
      name,
      displayName: String(formData.get("displayName") ?? name),
      order: Number.parseInt(String(formData.get("order") ?? "0"), 10) || 0,
      status: String(formData.get("status") ?? "Ativo"),
    },
  });

  revalidatePath("/app/cardapio");
  revalidatePath("/menu");
}

async function createItem(formData: FormData) {
  "use server";

  const name = String(formData.get("itemName") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!name || !categoryId) return;

  const item = await prisma.item.create({
    data: {
      name,
      description: String(formData.get("description") ?? ""),
      priceRaw: String(formData.get("priceRaw") ?? ""),
      imageUrl: String(formData.get("imageUrl") ?? ""),
      extra: String(formData.get("extra") ?? ""),
      status: String(formData.get("status") ?? "Ativo"),
    },
  });

  await prisma.itemCategory.create({
    data: {
      itemId: item.id,
      categoryId,
    },
  });

  revalidatePath("/app/cardapio");
  revalidatePath("/menu");
}

async function deleteItem(formData: FormData) {
  "use server";
  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) return;
  await prisma.item.delete({ where: { id: itemId } });
  revalidatePath("/app/cardapio");
  revalidatePath("/menu");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!categoryId) return;
  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/app/cardapio");
  revalidatePath("/menu");
}

export default async function CardapioPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });
  const items = await prisma.item.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      categories: {
        include: { category: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Cardapio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie categorias e itens por tenant.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/menu" target="_blank" rel="noreferrer">
              Ver cardapio publico
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nova categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCategory} className="grid gap-3">
              <Input name="name" placeholder="Nome interno" />
              <Input name="displayName" placeholder="Titulo exibido" />
              <div className="grid gap-3 md:grid-cols-2">
                <Input name="order" placeholder="Ordem" />
                <Input name="status" placeholder="Ativo" />
              </div>
              <Button type="submit">Salvar categoria</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Novo item</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createItem} className="grid gap-3">
              <Input name="itemName" placeholder="Nome do item" />
              <Input name="description" placeholder="Descricao" />
              <div className="grid gap-3 md:grid-cols-2">
                <Input name="priceRaw" placeholder="Preco (ex.: 19,90)" />
                <Input name="imageUrl" placeholder="URL da foto" />
              </div>
              <Input name="extra" placeholder="Classificacao adicional" />
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  name="categoryId"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecione categoria
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.displayName ?? category.name}
                    </option>
                  ))}
                </select>
                <Input name="status" placeholder="Ativo" />
              </div>
              <Button type="submit">Salvar item</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">Itens publicados</CardTitle>
          <div className="flex w-full max-w-xs items-center gap-2">
            <Input placeholder="Buscar item" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preco</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    {item.categories.map((rel) => rel.category.displayName ?? rel.category.name).join(", ")}
                  </TableCell>
                  <TableCell>{item.priceRaw || "Consulte"}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell className="text-right">
                    <form action={deleteItem}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <Button variant="ghost" type="submit">
                        Remover
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categorias</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
            >
              <div>
                <div className="font-medium">{category.displayName ?? category.name}</div>
                <div className="text-xs text-muted-foreground">
                  Ordem {category.order} • {category.status}
                </div>
              </div>
              <form action={deleteCategory}>
                <input type="hidden" name="categoryId" value={category.id} />
                <Button variant="ghost" type="submit">
                  Remover
                </Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
