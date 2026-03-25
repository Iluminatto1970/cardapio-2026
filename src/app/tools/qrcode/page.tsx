"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function QRCodePage() {
  const [text, setText] = useState("https://cardapiosheets.com.br");
  const [size, setSize] = useState(320);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(text, { width: size, margin: 2 })
      .then((url: string) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl(null);
      });
    return () => {
      active = false;
    };
  }, [text, size]);

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Gerador de QR Code</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gere QR Codes para mesas, links e cardapios.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuracao</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Conteudo do QR Code</Label>
              <Textarea value={text} onChange={(event) => setText(event.target.value)} rows={5} />
            </div>
            <div className="space-y-2">
              <Label>Tamanho (px)</Label>
              <Input
                type="number"
                min={120}
                max={800}
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
              />
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                {dataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={dataUrl} alt="QR Code" className="mx-auto h-auto w-full max-w-xs" />
                ) : (
                  <div className="text-sm text-muted-foreground">QR Code indisponivel</div>
                )}
              </div>
              {dataUrl ? (
                <Button asChild>
                  <a href={dataUrl} download="qrcode.png">
                    Baixar PNG
                  </a>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
