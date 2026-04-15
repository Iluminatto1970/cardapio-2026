import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WhatsappLogo, QrCode, ChartLineUp, DeviceMobile, ShieldCheck, Lightning } from "@phosphor-icons/react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
              🍽️
            </div>
            <span className="text-xl font-semibold">Cardápio Digital</span>
          </div>
          <Button asChild>
            <a href="https://wa.me/5583987140791" target="_blank" rel="noreferrer">
              <WhatsappLogo className="mr-2 h-5 w-5" />
              Falar no WhatsApp
            </a>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-20">
        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Lightning className="h-4 w-4" />
            Lançamento com 30% OFF
          </div>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-6xl">
            Cardápio Digital para <br className="hidden md:block" />
            <span className="text-primary">Seu Restaurante</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground">
            Eliminie menus impressos, reduza custos operacionais e aumente suas vendas
            com um cardápio digital moderno e fácil de usar.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <a href="https://wa.me/5583987140791?text=Olá! Quero conhecer o Cardápio Digital" target="_blank" rel="noreferrer">
                <WhatsappLogo className="mr-2 h-6 w-6" />
                Quero meu cardápio
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <a href="/menu" target="_blank" rel="noreferrer">
                Ver demonstração
              </a>
            </Button>
          </div>
        </section>

        <section className="mt-32">
          <h2 className="text-center text-3xl font-bold">Por que ter um cardápio digital?</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <ChartLineUp className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Aumente suas vendas</h3>
                <p className="mt-2 text-muted-foreground">
                  Restaurantes com cardápio digital vendem até 30% mais. Clientes pedem mais
                  quando é rápido e fácil.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <QrCode className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Zero impressão</h3>
                <p className="mt-2 text-muted-foreground">
                  Acabe com menus impressos. Atualize preços e itens em tempo real,
                  sem gastar com reimpressões.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <DeviceMobile className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Mobile first</h3>
                <p className="mt-2 text-muted-foreground">
                  100% responsivo. Seus clientes acessam pelo celular com QR Code,
                  sem precisar instalar nada.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-32">
          <h2 className="text-center text-3xl font-bold">Tudo que você precisa</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              "Cardápio online responsivo",
              "QR Code para mesas",
              "Sistema de pedidos completo",
              "Integração com WhatsApp",
              "Cupons e promoções",
              "Gerenciamento de categorias",
              "Variações de itens",
              "Taxas de entrega por bairro",
              "Checkout rápido",
              "Dashboard administrativo",
              "Sem mensalidade cara",
              "Suporte incluso"
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                  ✓
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-32 text-center">
          <Card className="mx-auto max-w-3xl bg-primary/5">
            <CardContent className="py-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                <ShieldCheck className="h-4 w-4" />
                Promoção de Lançamento
              </div>
              <h2 className="mt-6 text-3xl font-bold">30% OFF + 3 meses de suporte grátis</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Comece agora e economize. Suporte técnico incluso para você
                configurar tudo do jeito certo.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild className="text-lg px-10 py-6">
                  <a href="https://wa.me/5583987140791?text=Olá! Quero o Cardápio Digital com 30% OFF" target="_blank" rel="noreferrer">
                    <WhatsappLogo className="mr-2 h-6 w-6" />
                    Garantir meu desconto
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-32 text-center">
          <h2 className="text-3xl font-bold">Dúvidas frequentes</h2>
          <div className="mt-8 space-y-4 text-left">
            {[
              {
                q: "Preciso de algum equipamento?",
                a: "Não! Só precisa de um celular ou computador para gerenciar. O cliente acessa pelo QR Code."
              },
              {
                q: "Como recebo os pedidos?",
                a: "Direto no WhatsApp! O cliente monta o pedido e envia automaticamente para seu WhatsApp."
              },
              {
                q: "Posso atualizar o cardápio?",
                a: "Sim! Você altera preços, adiciona itens e remove produtos em tempo real pelo painel admin."
              },
              {
                q: "Funciona para delivery?",
                a: "Sim! Suporta retirada no local, delivery com taxas por bairro, e tudo integrado."
              }
            ].map((faq) => (
              <Card key={faq.q}>
                <CardContent className="py-4">
                  <h3 className="font-semibold">{faq.q}</h3>
                  <p className="mt-1 text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t bg-white px-6 py-12">
        <div className="mx-auto max-w-6xl text-center text-muted-foreground">
          <p>Desenvolvido por <a href="https://iluminatto.dev.br" className="text-primary hover:underline">Iluminatto Dev</a></p>
          <p className="mt-2 text-sm">
            Transformando lógica em sistemas de alta performance
          </p>
        </div>
      </footer>
    </div>
  );
}
