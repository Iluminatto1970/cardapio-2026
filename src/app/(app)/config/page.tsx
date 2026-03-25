import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getConfigMap, upsertConfig } from "@/lib/db-config";

async function saveConfig(formData: FormData) {
  "use server";

  const entries = [
    {
      section: "identidade_visual",
      key: "nome_empresa",
      value: String(formData.get("companyName") ?? ""),
    },
    {
      section: "identidade_visual",
      key: "slogan",
      value: String(formData.get("slogan") ?? ""),
    },
    {
      section: "contato",
      key: "endereco",
      value: String(formData.get("address") ?? ""),
    },
    {
      section: "contato",
      key: "telefone",
      value: String(formData.get("phone") ?? ""),
    },
    {
      section: "contato",
      key: "email",
      value: String(formData.get("email") ?? ""),
    },
    {
      section: "contato",
      key: "whatsapp",
      value: String(formData.get("whatsapp") ?? ""),
    },
    {
      section: "checkout",
      key: "mensagem_boas_vindas",
      value: String(formData.get("welcomeMessage") ?? ""),
    },
  ];

  await upsertConfig(entries);
  revalidatePath("/app/config");
  revalidatePath("/menu");
}

export default async function ConfigPage() {
  const configMap = await getConfigMap();

  const defaults = {
    companyName: configMap.get("identidade_visual.nome_empresa") ?? "",
    slogan: configMap.get("identidade_visual.slogan") ?? "",
    address: configMap.get("contato.endereco") ?? "",
    phone: configMap.get("contato.telefone") ?? "",
    email: configMap.get("contato.email") ?? "",
    whatsapp: configMap.get("contato.whatsapp") ?? "",
    welcomeMessage: configMap.get("checkout.mensagem_boas_vindas") ?? "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configuracoes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajustes gerais do tenant e informacoes publicas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identidade</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveConfig} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome da empresa</Label>
              <Input name="companyName" defaultValue={defaults.companyName} />
            </div>
            <div className="space-y-2">
              <Label>Slogan</Label>
              <Input name="slogan" defaultValue={defaults.slogan} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Endereco</Label>
              <Input name="address" defaultValue={defaults.address} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input name="phone" defaultValue={defaults.phone} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input name="email" defaultValue={defaults.email} />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input name="whatsapp" defaultValue={defaults.whatsapp} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Mensagem de boas-vindas</Label>
              <Textarea
                name="welcomeMessage"
                defaultValue={defaults.welcomeMessage}
                placeholder="Digite uma mensagem para o topo do cardapio"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">Salvar configuracoes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
