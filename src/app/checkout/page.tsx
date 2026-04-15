"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Send, Trash2, Plus } from "lucide-react";

type CartItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const addItem = () => {
    setCart([
      ...cart,
      { id: Date.now().toString(), name: "", price: "", quantity: 1 },
    ]);
  };

  const removeItem = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof CartItem, value: string | number) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price.replace(",", "."));
    return isNaN(num) ? 0 : num;
  };

  const total = cart.reduce(
    (sum, item) => sum + formatPrice(item.price) * item.quantity,
    0
  );

  const sendToWhatsApp = async () => {
    if (!customerName || !customerPhone || cart.length === 0) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    const itemsList = cart
      .filter((item) => item.name && item.price)
      .map(
        (item) =>
          `• ${item.name} x${item.quantity} - R$ ${(
            formatPrice(item.price) * item.quantity
          ).toFixed(2)}`
      )
      .join("\n");

    const message = `🍽️ *Novo Pedido*

👤 *Cliente:* ${customerName}
📱 *Telefone:* ${customerPhone}

*Itens:*
${itemsList}

💰 *Total:* R$ ${total.toFixed(2)}

${notes ? `📝 *Observações:*\n${notes}` : ""}`;

    const phone = "5583987140791";
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
    setShowSuccess(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Finalizar Pedido</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monte seu pedido e envie pelo WhatsApp
          </p>
        </div>

        {showSuccess ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl font-bold mb-2">Pedido Enviado!</h2>
              <p className="text-muted-foreground mb-4">
                Seu pedido foi aberto no WhatsApp. Complete o pagamento com o
                restaurante.
              </p>
              <Button onClick={() => {
                setShowSuccess(false);
                setCart([]);
                setCustomerName("");
                setCustomerPhone("");
                setNotes("");
              }}>
                Fazer novo pedido
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShoppingCart className="h-5 w-5" />
                  Itens do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-2 items-end"
                  >
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Item</Label>
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          updateItem(item.id, "name", e.target.value)
                        }
                        placeholder="Nome do item"
                      />
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs">Preço</Label>
                      <Input
                        value={item.price}
                        onChange={(e) =>
                          updateItem(item.id, "price", e.target.value)
                        }
                        placeholder="0,00"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <Label className="text-xs">Qtd</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, "quantity", parseInt(e.target.value) || 1)
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>

                {cart.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Seus Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp *</Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Sem cebola, troco para R$ 50..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={sendToWhatsApp}
              disabled={isSubmitting || cart.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Enviando..." : "Enviar Pedido pelo WhatsApp"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
