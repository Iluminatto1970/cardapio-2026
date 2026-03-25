"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ColorGeneratorPage() {
  const [primary, setPrimary] = useState("#1f2937");
  const [secondary, setSecondary] = useState("#f97316");
  const [accent, setAccent] = useState("#10b981");

  const output = useMemo(() => {
    return [
      `cor_primaria=${primary}`,
      `cor_secundaria=${secondary}`,
      `cor_terciaria=${accent}`,
    ].join("\n");
  }, [primary, secondary, accent]);

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Gerador de cores</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Defina as cores principais e copie para a planilha.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paleta</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Primaria</Label>
              <Input value={primary} onChange={(event) => setPrimary(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Secundaria</Label>
              <Input value={secondary} onChange={(event) => setSecondary(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Terciaria</Label>
              <Input value={accent} onChange={(event) => setAccent(event.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea readOnly value={output} rows={4} />
            <Button onClick={copyOutput}>Copiar valores</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
