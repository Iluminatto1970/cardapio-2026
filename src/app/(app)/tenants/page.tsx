import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { Trash2, ExternalLink } from "lucide-react";

async function createTenant(formData: FormData) {
  "use server";

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase().replace(/\s+/g, "-");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!slug || !name) return;

  await prisma.tenant.upsert({
    where: { slug },
    update: { name, phone },
    create: { slug, name, phone },
  });

  revalidatePath("/app/tenants");
}

async function deleteTenant(formData: FormData) {
  "use server";
  const tenantId = String(formData.get("tenantId") ?? "");
  if (!tenantId) return;
  await prisma.tenant.delete({ where: { id: tenantId } });
  revalidatePath("/app/tenants");
}

async function updateConfig(formData: FormData) {
  "use server";
  
  const section = String(formData.get("section") ?? "");
  const key = String(formData.get("key") ?? "");
  const value = String(formData.get("value") ?? "");

  if (!section || !key) return;

  await prisma.configEntry.upsert({
    where: { section_key: { section, key } },
    update: { value },
    create: { section, key, value },
  });

  revalidatePath("/app/config");
}

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
  });

  const configEntries = await prisma.configEntry.findMany();
  const configMap = new Map<string, string>();
  configEntries.forEach((entry) => {
    configMap.set(`${entry.section}.${entry.key}`, entry.value);
  });

  const menuUrl = process.env.NEXT_PUBLIC_MENU_URL || "https://seucardapio.com.br";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tenants</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie restaurantes e suas configurações.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Novo Restaurante</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createTenant} className="space-y-4">
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input
                  name="slug"
                  placeholder="meu-restaurante"
                  pattern="[a-z0-9\-]+"
                />
                <p className="text-xs text-muted-foreground">
                  Ex: meu-restaurante → {menuUrl}/menu?tenant=meu-restaurante
                </p>
              </div>
              <div className="space-y-2">
                <Label>Nome do Restaurante</Label>
                <Input name="name" placeholder="Restaurante Bom Sabor" />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp (para pedidos)</Label>
                <Input name="phone" placeholder="5599999999999" />
              </div>
              <Button type="submit" className="w-full">
                Criar Restaurante
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configurações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={updateConfig} className="space-y-4">
              <input type="hidden" name="section" value="identidade_visual" />
              <input type="hidden" name="key" value="nome_empresa" />
              <div className="space-y-2">
                <Label>Nome da Empresa</Label>
                <Input
                  name="value"
                  defaultValue={configMap.get("identidade_visual.nome_empresa") || ""}
                  placeholder="Nome do seu restaurante"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">
                Salvar Nome
              </Button>
            </form>

            <form action={updateConfig} className="space-y-4">
              <input type="hidden" name="section" value="identidade_visual" />
              <input type="hidden" name="key" value="logo_url" />
              <div className="space-y-2">
                <Label>URL do Logo</Label>
                <Input
                  name="value"
                  defaultValue={configMap.get("identidade_visual.logo_url") || ""}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">
                Salvar Logo
              </Button>
            </form>

            <form action={updateConfig} className="space-y-4">
              <input type="hidden" name="section" value="seo" />
              <input type="hidden" name="key" value="titulo_pagina" />
              <div className="space-y-2">
                <Label>Title (SEO)</Label>
                <Input
                  name="value"
                  defaultValue={configMap.get("seo.titulo_pagina") || ""}
                  placeholder="Cardápio Digital"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">
                Salvar Title
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Restaurantes Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {tenants.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum restaurante cadastrado ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Cardápio</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {tenant.slug}
                    </TableCell>
                    <TableCell>{tenant.phone || "-"}</TableCell>
                    <TableCell>
                      <a
                        href={`/menu?tenant=${tenant.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        Ver <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={deleteTenant}>
                        <input type="hidden" name="tenantId" value={tenant.id} />
                        <Button variant="ghost" size="sm" type="submit">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
