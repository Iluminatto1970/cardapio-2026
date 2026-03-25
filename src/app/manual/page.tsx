import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    title: "Configuracao basica",
    items: [
      "Compartilhar planilha e config.js",
      "Timezone e preloader",
      "Traducao e idiomas",
    ],
  },
  {
    title: "Planilha",
    items: [
      "Aba Config",
      "Aba Horarios",
      "Aba Cupons",
      "Aba Categorias",
      "Aba Itens",
      "Aba Bairros (opcional)",
    ],
  },
  {
    title: "Ferramentas",
    items: [
      "Gerador de precos",
      "Gerador de variacoes",
      "Construtor de categorias",
      "Gerador de cores",
      "Gerador de QR Codes",
    ],
  },
];

const tools = [
  {
    title: "Gerador de precos",
    description: "Crie formatos de preco fixo ou multiplo.",
    href: "/tools/price-generator",
  },
  {
    title: "Gerador de variacoes",
    description: "Monte classificacoes adicionais com regras.",
    href: "/tools/variation-generator",
  },
  {
    title: "Construtor de categorias",
    description: "Crie a planilha de categorias com ordem.",
    href: "/tools/category-builder",
  },
  {
    title: "Gerador de cores",
    description: "Combine cores principais e copie o resultado.",
    href: "/tools/color-generator",
  },
  {
    title: "Gerador de QR Codes",
    description: "Crie QR Code para mesas e links.",
    href: "/tools/qrcode",
  },
];

export default function ManualPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-3">
          <Badge variant="secondary">Manual</Badge>
          <h1 className="text-3xl font-semibold">Manual do Cardapio Sheets</h1>
          <p className="text-sm text-muted-foreground">
            Documentacao oficial para configurar, publicar e manter o cardapio.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {section.items.map((item) => (
                  <div key={item}>• {item}</div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Ferramentas internas</h2>
          <p className="text-sm text-muted-foreground">
            Use os geradores abaixo para preencher preco, categoria, variacoes e QR.
          </p>
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
    </div>
  );
}
