import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
  {
    title: "Gerador de precos",
    description: "Crie formatos de preco fixo ou multiplo.",
    href: "/tools/price-generator",
  },
  {
    title: "Construtor de categorias",
    description: "Crie a planilha de categorias com ordem.",
    href: "/tools/category-builder",
  },
  {
    title: "Gerador de variacoes",
    description: "Monte classificacoes adicionais com regras.",
    href: "/tools/variation-generator",
  },
  {
    title: "Gerador de cores",
    description: "Combine cores e copie o resultado.",
    href: "/tools/color-generator",
  },
  {
    title: "Gerador de QR Codes",
    description: "Crie QR Codes para mesas e links.",
    href: "/tools/qrcode",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">Ferramentas</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Utilize os geradores abaixo para configurar seu cardapio.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((tool) => (
            <Card key={tool.title}>
              <CardHeader>
                <CardTitle className="text-base">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{tool.description}</p>
                <Link
                  href={tool.href}
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  Abrir ferramenta
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
