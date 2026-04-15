import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Star, Users, TrendingUp, QrCode, Smartphone, WhatsAppLogo, ShieldCheck, Clock, ArrowsClockwise, Wallet, Headset } from "@phosphor-icons/react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-lg font-bold text-white">
              🍽️
            </div>
            <span className="text-xl font-bold text-gray-900">Cardápio Digital</span>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <a href="https://wa.me/5583987140791?text=Olá! Quero conhecer o Cardápio Digital" target="_blank" rel="noreferrer">
              <WhatsAppLogo className="mr-2 h-5 w-5" />
              Falar no WhatsApp
            </a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-green-50 to-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 mb-6">
              <Star className="h-4 w-4" weight="fill" />
              Lançamento com 30% OFF
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Cardápio Digital para{" "}
              <span className="text-green-600">Seu Restaurante</span>
            </h1>
            
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Elimine menus impressos, reduza custos operacionais e aumente suas vendas 
              com um cardápio digital moderno que conecta clientes direto ao seu WhatsApp.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-6 bg-green-600 hover:bg-green-700">
                <a href="https://wa.me/5583987140791?text=Olá! Quero conhecer o Cardápio Digital" target="_blank" rel="noreferrer">
                  <WhatsAppLogo className="mr-2 h-6 w-6" />
                  Quero meu cardápio
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <a href="/menu" target="_blank" rel="noreferrer">
                  Ver demonstração
                </a>
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>+50 restaurantes já usam</span>
              <span className="mx-2">•</span>
              <span>Suporte incluso</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Você ainda imprime cardápio?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Veja os problemas do cardápio tradicional
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "💸", title: "Custo alto", desc: "Cada reimpressão custa R$ 50 a R$ 200. Por ano: até R$ 2.400!" },
              { icon: "😰", title: "Preços desatualizados", desc: "Muda preço do insumo? Precisa reimprimir tudo." },
              { icon: "📱", title: "Fora do digital", desc: "Seus clientes buscam no celular. Você perde vendas." },
            ].map((item) => (
              <Card key={item.title} className="text-center">
                <CardContent className="pt-8">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              A solução: Cardápio Digital
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Simples, moderno e que aumenta suas vendas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: QrCode, title: "QR Code na mesa", desc: "Cliente escaneia com celular" },
              { icon: Smartphone, title: "100% Mobile", desc: "Funciona em qualquer celular" },
              { icon: WhatsAppLogo, title: "Pedido no WhatsApp", desc: "Receba pedidos organizados" },
              { icon: TrendingUp, title: "+30% nas vendas", desc: "Dados comprovados" },
              { icon: Clock, title: "Atualização instantânea", desc: "Mude preços em 30 segundos" },
              { icon: Wallet, title: "Economia", desc: "Zero custo de impressão" },
              { icon: ArrowsClockwise, title: "Fácil de usar", desc: "Você gerencia sozinho" },
              { icon: Headset, title: "Suporte incluso", desc: "Ajuda sempre disponível" },
            ].map((item) => (
              <Card key={item.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 mb-4">
                    <item.icon className="h-6 w-6" weight="fill" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 bg-green-600 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Como funciona?
            </h2>
            <p className="mt-4 text-lg text-green-100">
              4 passos simples para começar
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Cadastre", desc: "Adicione seus pratos, fotos e preços no painel admin" },
              { step: "2", title: "Gere", desc: "Crie o QR Code personalizado do seu restaurante" },
              { step: "3", title: "Imprima", desc: "Coloque os QR Codes nas mesas ou exibidos no balcão" },
              { step: "4", title: "Venda", desc: "Cliente escaneia, faz pedido e você recebe no WhatsApp!" },
            ].map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-green-600 text-2xl font-bold mx-auto">
                  {item.step}
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-green-500 -translate-x-1/2" />
                )}
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-green-100">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6" id="precos">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Investimento
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Escolha o plano ideal para seu restaurante
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium">
              🔥 Oferta de lançamento: 30% OFF por tempo limitado!
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Básico */}
            <Card className="relative">
              <CardContent className="pt-8">
                <h3 className="text-xl font-semibold text-gray-900">Básico</h3>
                <div className="mt-4">
                  <span className="text-gray-400 line-through text-lg">R$ 97</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-green-600">R$ 68</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  {["Cardápio digital ilimitado", "QR Code personalizado", "Integração WhatsApp", "Suporte técnico", "Até 100 itens"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-5 w-5 text-green-600" weight="bold" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-8 bg-green-600 hover:bg-green-700" asChild>
                  <a href="https://wa.me/5583987140791?text=Olá! Quero o Plano Básico" target="_blank" rel="noreferrer">
                    Quero este plano
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            {/* Profissional - Destaque */}
            <Card className="relative border-green-600 shadow-xl scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Mais popular
              </div>
              <CardContent className="pt-8">
                <h3 className="text-xl font-semibold text-gray-900">Profissional</h3>
                <div className="mt-4">
                  <span className="text-gray-400 line-through text-lg">R$ 197</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-green-600">R$ 138</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  {["Tudo do Básico", "Itens ilimitados", "Cupons e promoções", "Taxas de entrega", "Múltiplos cardápios", "Relatórios básicos"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-5 w-5 text-green-600" weight="bold" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-8 bg-green-600 hover:bg-green-700" asChild>
                  <a href="https://wa.me/5583987140791?text=Olá! Quero o Plano Profissional" target="_blank" rel="noreferrer">
                    Quero este plano
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            {/* Empresarial */}
            <Card className="relative">
              <CardContent className="pt-8">
                <h3 className="text-xl font-semibold text-gray-900">Empresarial</h3>
                <div className="mt-4">
                  <span className="text-gray-400 line-through text-lg">R$ 397</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-green-600">R$ 278</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  {["Tudo do Profissional", "Franquia/Rede", "API de integração", "Relatórios avançados", "Suporte prioritário", "Treinamento in-company"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-5 w-5 text-green-600" weight="bold" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-8" variant="outline" asChild>
                  <a href="https://wa.me/5583987140791?text=Olá! Quero o Plano Empresarial" target="_blank" rel="noreferrer">
                    Solicitar orçamento
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-center mt-8 text-gray-600">
            Setup incluso gratuitamente! • Sem taxa de setup • Cancele quando quiser
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Perguntas frequentes
            </h2>
          </div>
          
          <div className="space-y-4">
            {[
              { q: "Preciso de algum equipamento?", a: "Não! Só precisa de um celular ou computador para gerenciar. O cliente acessa pelo QR Code no navegador, sem instalar nada." },
              { q: "Como recebo os pedidos?", a: "Direto no seu WhatsApp! O cliente monta o pedido e envia automaticamente, formatado e organizado." },
              { q: "Posso atualizar o cardápio?", a: "Sim! Você altera preços, adiciona itens e remove produtos em tempo real pelo painel admin." },
              { q: "Funciona para delivery?", a: "Sim! Suporta retirada no local, delivery com taxas por bairro, e tudo integrado ao WhatsApp." },
              { q: "O cliente precisa instalar algo?", a: "Não! O cardápio abre no navegador do celular. Acessível para qualquer smartphone." },
              { q: "Posso testar antes de assinar?", a: "Sim! Oferecemos um período de teste para você conhecer a plataforma." },
            ].map((faq) => (
              <Card key={faq.q}>
                <CardContent className="py-4">
                  <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                  <p className="mt-2 text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <ShieldCheck className="h-16 w-16 mx-auto mb-6" weight="fill" />
          <h2 className="text-3xl md:text-4xl font-bold">
            Comece agora com 30% de desconto!
          </h2>
          <p className="mt-4 text-xl text-green-100">
            Oferta válida para os primeiros 20 restaurantes.
            Suporte técnico incluso.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild className="text-lg px-10 py-6 bg-white text-green-700 hover:bg-green-50">
              <a href="https://wa.me/5583987140791?text=Olá! Quero garantir a oferta de 30% OFF!" target="_blank" rel="noreferrer">
                <WhatsAppLogo className="mr-2 h-6 w-6" />
                Garantir meu desconto agora
              </a>
            </Button>
          </div>
          <p className="mt-4 text-green-100 text-sm">
            ou ligue: (83) 98714-0791
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-lg font-bold text-white">
                🍽️
              </div>
              <span className="text-xl font-bold text-white">Cardápio Digital</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://instagram.com/iluminatto" target="_blank" rel="noreferrer" className="hover:text-white">
                Instagram
              </a>
              <a href="https://youtube.com/@amentemotivada1970" target="_blank" rel="noreferrer" className="hover:text-white">
                YouTube
              </a>
              <a href="https://wa.me/5583987140791" target="_blank" rel="noreferrer" className="hover:text-white">
                WhatsApp
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>Desenvolvido por <a href="https://iluminatto.dev.br" className="text-green-500 hover:underline" target="_blank" rel="noreferrer">Iluminatto Dev</a></p>
            <p className="mt-2">30+ anos de experiência em desenvolvimento de software</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
