import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const metrics = [
  { label: "Tenants ativos", value: "0", badge: "MVP" },
  { label: "Itens publicados", value: "0", badge: "Catalogo" },
  { label: "Pedidos hoje", value: "0", badge: "Beta" },
  { label: "Tempo de resposta", value: "-", badge: "Ops" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Base do SaaS multi-tenant pronta para evoluir do legado.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              <Badge variant="secondary">{metric.badge}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">Atualize via API</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proximos passos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <div>1. Criar tenants e usuarios</div>
          <div>2. Migrar categorias e itens do legado</div>
          <div>3. Publicar cardapio por tenant</div>
        </CardContent>
      </Card>
    </div>
  );
}
