"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PriceOption = {
  label: string;
  price: string;
};

export default function PriceGeneratorPage() {
  const [groupLabel, setGroupLabel] = useState("Selecione o tamanho");
  const [rows, setRows] = useState<PriceOption[]>([
    { label: "Pequeno", price: "19,90" },
    { label: "Grande", price: "29,90" },
  ]);

  const output = useMemo(() => {
    const items = rows
      .map((row) => `${row.label.trim()}:${row.price.trim()}`)
      .filter((row) => row !== ":");
    if (items.length === 0) return "";
    return `${groupLabel.trim()}#${items.join("/")}`;
  }, [groupLabel, rows]);

  function updateRow(index: number, field: keyof PriceOption, value: string) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, { label: "", price: "" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Gerador de precos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monte o formato de precos multiplos para usar na planilha.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuracao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Label do grupo</Label>
              <Input
                value={groupLabel}
                onChange={(event) => setGroupLabel(event.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Opcoes e precos</Label>
              <div className="space-y-3">
                {rows.map((row, index) => (
                  <div
                    key={`price-row-${index}`}
                    className="grid gap-3 md:grid-cols-[1fr_160px_auto]"
                  >
                    <Input
                      placeholder="Nome da opcao"
                      value={row.label}
                      onChange={(event) =>
                        updateRow(index, "label", event.target.value)
                      }
                    />
                    <Input
                      placeholder="0,00"
                      value={row.price}
                      onChange={(event) =>
                        updateRow(index, "price", event.target.value)
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={() => removeRow(index)}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="secondary" onClick={addRow}>
                Adicionar opcao
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea readOnly value={output} rows={4} />
            <Button onClick={copyOutput} disabled={!output}>
              Copiar para a planilha
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
