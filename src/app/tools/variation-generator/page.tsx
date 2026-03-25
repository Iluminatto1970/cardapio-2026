"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type OptionRow = {
  name: string;
  price: string;
};

export default function VariationGeneratorPage() {
  const [title, setTitle] = useState("Escolha o ponto da carne");
  const [type, setType] = useState("radio");
  const [required, setRequired] = useState(true);
  const [minSelect, setMinSelect] = useState(1);
  const [maxSelect, setMaxSelect] = useState(1);
  const [rows, setRows] = useState<OptionRow[]>([
    { name: "Ao ponto", price: "+0,00" },
    { name: "Bem passada", price: "+0,00" },
  ]);

  const output = useMemo(() => {
    const prefix = required ? "#" : "";
    const options = rows
      .map((row) => `${row.name.trim()} ${row.price.trim()}`.trim())
      .filter((row) => row !== "");
    if (options.length === 0) return "";
    const limits = type === "checkbox" ? ` [${minSelect}-${maxSelect}]` : "";
    return `${prefix}${title.trim()}:${type}:${options.join("/")}${limits}`;
  }, [required, title, type, rows, minSelect, maxSelect]);

  function updateRow(index: number, field: keyof OptionRow, value: string) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, { name: "", price: "+0,00" }]);
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
          <h1 className="text-2xl font-semibold">Gerador de variacoes</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie classificacao adicional com regras de selecao.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuracao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Titulo</Label>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="radio">Escolha unica</SelectItem>
                    <SelectItem value="checkbox">Multiplas escolhas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Obrigatorio</Label>
                <Select
                  value={required ? "sim" : "nao"}
                  onValueChange={(value) => setRequired(value === "sim")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Nao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {type === "checkbox" ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Minimo</Label>
                    <Input
                      type="number"
                      min={0}
                      value={minSelect}
                      onChange={(event) => setMinSelect(Number(event.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximo</Label>
                    <Input
                      type="number"
                      min={0}
                      value={maxSelect}
                      onChange={(event) => setMaxSelect(Number(event.target.value))}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <Label>Opcoes</Label>
              <div className="space-y-3">
                {rows.map((row, index) => (
                  <div
                    key={`variation-row-${index}`}
                    className="grid gap-3 md:grid-cols-[1fr_160px_auto]"
                  >
                    <Input
                      placeholder="Nome da opcao"
                      value={row.name}
                      onChange={(event) => updateRow(index, "name", event.target.value)}
                    />
                    <Input
                      placeholder="+0,00"
                      value={row.price}
                      onChange={(event) => updateRow(index, "price", event.target.value)}
                    />
                    <Button variant="outline" onClick={() => removeRow(index)}>
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
