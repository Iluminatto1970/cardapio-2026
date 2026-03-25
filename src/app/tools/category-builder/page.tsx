"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CategoryRow = {
  name: string;
  displayName: string;
  order: string;
  status: "Ativo" | "Inativo";
};

export default function CategoryBuilderPage() {
  const [rows, setRows] = useState<CategoryRow[]>([
    { name: "Lanches", displayName: "Lanches", order: "1", status: "Ativo" },
  ]);

  const output = useMemo(() => {
    const header = "nome_categoria,titulo_exibicao,ordem,status";
    const lines = rows
      .map((row) =>
        [row.name, row.displayName, row.order, row.status]
          .map((value) => `"${value.replace(/"/g, '""')}"`)
          .join(",")
      )
      .filter((line) => line.replace(/"/g, "").trim().length > 0);
    return [header, ...lines].join("\n");
  }, [rows]);

  function updateRow(index: number, field: keyof CategoryRow, value: string) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { name: "", displayName: "", order: String(prev.length + 1), status: "Ativo" },
    ]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Construtor de categorias</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gere o CSV da aba Categorias com ordem e status.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categorias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rows.map((row, index) => (
              <div
                key={`category-row-${index}`}
                className="grid gap-3 md:grid-cols-[1fr_1fr_120px_140px_auto]"
              >
                <Input
                  placeholder="Nome interno"
                  value={row.name}
                  onChange={(event) => updateRow(index, "name", event.target.value)}
                />
                <Input
                  placeholder="Titulo exibido"
                  value={row.displayName}
                  onChange={(event) => updateRow(index, "displayName", event.target.value)}
                />
                <Input
                  placeholder="Ordem"
                  value={row.order}
                  onChange={(event) => updateRow(index, "order", event.target.value)}
                />
                <Input
                  placeholder="Ativo"
                  value={row.status}
                  onChange={(event) =>
                    updateRow(
                      index,
                      "status",
                      event.target.value === "Inativo" ? "Inativo" : "Ativo"
                    )
                  }
                />
                <Button variant="outline" onClick={() => removeRow(index)}>
                  Remover
                </Button>
              </div>
            ))}
            <Button variant="secondary" onClick={addRow}>
              Adicionar categoria
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">CSV gerado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea readOnly value={output} rows={6} />
            <Button onClick={copyOutput}>Copiar CSV</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
