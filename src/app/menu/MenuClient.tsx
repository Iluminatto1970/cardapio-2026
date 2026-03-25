"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getMultiplePricesLabel, getPriceDisplay, getPriceType, parseMultiplePrices, parsePrice } from "@/lib/price";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  sku: string;
  extra: string;
};

type Category = {
  id: string;
  name: string;
  displayName: string;
  order: number;
  items: MenuItem[];
};

type ConfigSections = Record<string, Record<string, string>>;

type LegacyExtra = {
  kind: string;
  data: Record<string, string>;
};

type CartItem = {
  id: string;
  name: string;
  basePrice: number;
  displayPrice: string;
  quantity: number;
  notes: string;
  variations: string[];
};

type VariationOption = {
  name: string;
  price: number;
};

type VariationGroup = {
  name: string;
  type: "radio" | "checkbox";
  required: boolean;
  minSelect?: number;
  maxSelect?: number;
  options: VariationOption[];
};

const STORAGE_KEY = "cardapio_cart";

function parseVariations(extra: string): VariationGroup[] {
  if (!extra) return [];
  const trimmed = extra.trim();
  if (!trimmed) return [];

  const lines = trimmed.split("\n").map((line) => line.trim()).filter(Boolean);
  const hasAdvanced = lines.some((line) => /:(radio|checkbox):/.test(line));
  if (hasAdvanced) {
    const groups: VariationGroup[] = [];
    lines.forEach((line) => {
      const match = line.match(/^(#?)(?:(~)?Var:\s*|Var:\s*)?([^:]+):(radio|checkbox):(.+?)(?:\s*\[(\d+)(?:-(\d+))?\])?$/);
      if (!match) return;
      const [, requiredFlag, , name, type, optionsStr, minSelect, maxSelect] = match;
      const options = optionsStr.split("/").map((optionStr) => {
        const trimmedOption = optionStr.trim();
        const maxSelectMatch = trimmedOption.match(/maxselect=(\d+):(.+)/);
        const cleanedOption = maxSelectMatch ? maxSelectMatch[2] : trimmedOption;
        const priceMatch = cleanedOption.match(/([+-])(\d+(?:[,.]\d{2})?)/);
        let optionName = cleanedOption;
        let price = 0;
        if (priceMatch) {
          const [fullMatch, sign, valueStr] = priceMatch;
          optionName = cleanedOption.replace(fullMatch, "").trim();
          price = parseFloat(valueStr.replace(",", "."));
          if (sign === "-") price = -price;
        }
        return { name: optionName, price };
      });
      groups.push({
        name: name.trim(),
        type: type as "radio" | "checkbox",
        required: Boolean(requiredFlag),
        minSelect: minSelect ? Number.parseInt(minSelect, 10) : undefined,
        maxSelect: maxSelect ? Number.parseInt(maxSelect, 10) : undefined,
        options,
      });
    });
    return groups;
  }

  const isRequiredVariation = trimmed.startsWith("#Var:");
  const isOptionalVariation = trimmed.startsWith("Var:");
  if (isRequiredVariation || isOptionalVariation) {
    const variationText = trimmed.replace(/^#?Var:\s*/, "");
    const options = variationText
      .split("/")
      .map((variation) => {
        const option = variation.trim();
        const priceMatch = option.match(/\+(\d+(?:[,.]\d{2})?)/);
        let optionName = option;
        let price = 0;
        if (priceMatch) {
          optionName = option.replace(priceMatch[0], "").trim();
          price = parseFloat(priceMatch[1].replace(",", "."));
        }
        return { name: optionName, price };
      })
      .filter((option) => option.name);

    return [
      {
        name: "Variacao",
        type: "radio",
        required: isRequiredVariation,
        options,
      },
    ];
  }

  return [];
}

function buildConfig(config: ConfigSections, section: string, key: string, fallback = "") {
  return config?.[section]?.[key] ?? fallback;
}

function hexToHsl(hex: string) {
  const clean = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function parseOptionConfig(raw: string) {
  if (!raw) {
    return { shouldShow: true, title: "", subtitle: "" };
  }
  const parts = raw.split("|").map((part) => part.trim());
  const shouldShow = parts[0]?.toLowerCase() !== "nao";
  return {
    shouldShow,
    title: parts[1] ?? "",
    subtitle: parts[2] ?? "",
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function parseCouponDate(dateStr?: string) {
  if (!dateStr) return null;
  const trimmed = String(dateStr).trim();
  if (!trimmed || trimmed === "-") return null;

  const [datePart, timePart] = trimmed.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  if (!day || !month || !year) return null;
  if (timePart) {
    const [hours, minutes] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hours || 0, minutes || 0, 0);
  }
  return new Date(year, month - 1, day, 0, 0, 0);
}

export default function MenuClient({
  categories,
  config,
  extras,
}: {
  categories: Category[];
  config: ConfigSections;
  extras: LegacyExtra[];
}) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored) as CartItem[];
    } catch {
      return [];
    }
  });
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [selectedBasePrice, setSelectedBasePrice] = useState<number | null>(null);
  const [selectedVariations, setSelectedVariations] = useState<Record<number, string[]>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [deliveryType, setDeliveryType] = useState("");
  const [address, setAddress] = useState({
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    zip: "",
    complement: "",
  });
  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [preloaderDismissed, setPreloaderDismissed] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Record<string, string> | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);

  const checkoutConfig = {
    enabled: buildConfig(config, "checkout", "checkout_mode", "Sim").toLowerCase() === "sim",
    showObservations: buildConfig(config, "checkout", "step1_itens_obs", "Sim") === "Sim",
    step2DeliveryFeeMessage: buildConfig(
      config,
      "checkout",
      "step2_taxa_delivery",
      "Consulte taxa de entrega pelo WhatsApp"
    ),
    showPayments: buildConfig(config, "checkout", "step3_show_formas_pag", "Sim") === "Sim",
    paymentMethods: buildConfig(config, "checkout", "step3_formas_pag", ""),
    showTable: buildConfig(config, "checkout", "step3_mesa_comanda", "Sim") === "Sim",
    onlyNeighborhoodMode: buildConfig(config, "checkout", "only_bairro_mode", "Nao") === "Sim",
    whatsapp: buildConfig(config, "contato", "whatsapp", ""),
    webhook: buildConfig(config, "envio", "webhook_url", ""),
    whatsappWeb: buildConfig(config, "envio", "whatsapp_web", "Sim") === "Sim",
  };

  const contactInfo = {
    phone: buildConfig(config, "contato", "telefone", ""),
    email: buildConfig(config, "contato", "email", ""),
    whatsapp: buildConfig(config, "contato", "whatsapp", ""),
    instagram: buildConfig(config, "contato", "instagram", ""),
    facebook: buildConfig(config, "contato", "facebook", ""),
    address: buildConfig(config, "contato", "endereco", ""),
  };

  const authorInfo = {
    name: buildConfig(config, "setup", "autor_name", ""),
    link: buildConfig(config, "setup", "autor_link", ""),
  };

  const deliveryOptions = {
    local: parseOptionConfig(buildConfig(config, "checkout", "step2_opc1", "Sim|No local|")),
    pickup: parseOptionConfig(buildConfig(config, "checkout", "step2_opc2", "Sim|Retirada|")),
    delivery: parseOptionConfig(buildConfig(config, "checkout", "step2_opc3", "Sim|Delivery|")),
    default: parseOptionConfig(buildConfig(config, "checkout", "step2_opc4", "Sim|Outro|")),
  };

  const coupons = useMemo(
    () => extras.filter((extra) => extra.kind === "coupons").map((extra) => extra.data),
    [extras]
  );
  const neighborhoods = useMemo(
    () =>
      extras
        .filter((extra) => extra.kind === "neighborhoods")
        .map((extra) => extra.data)
        .map((row) => ({
          name: (row.bairro || row.nome_bairro || row.BAIRRO || "").toString(),
          fee: parseFloat(String(row.taxa || row.valor_taxa || row.TAXA || "0").replace(",", ".")) || 0,
        }))
        .filter((row) => row.name),
    [extras]
  );

  const hoursEntries = useMemo(
    () => extras.filter((extra) => extra.kind === "hours").map((extra) => extra.data),
    [extras]
  );

  const hoursStatus = useMemo(() => {
    if (hoursEntries.length === 0) return null;
    const today = new Date();
    const dayIndex = today.getDay();
    const dayNames = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
    const dayName = dayNames[dayIndex];

    const row = hoursEntries.find((entry) => {
      const raw = String(entry.dia || entry.dia_semana || entry.weekday || entry.DIA || "").toLowerCase();
      return raw.includes(dayName);
    });
    if (!row) return null;

    const status = String(row.status || row.ativo || row.aberto || "").toLowerCase();
    if (status.includes("nao") || status.includes("fechado")) {
      return { isOpen: false, label: "Fechado" };
    }

    const openStr = String(row.abertura || row.abre || row.inicio || row.hora_abre || "");
    const closeStr = String(row.fechamento || row.fecha || row.fim || row.hora_fecha || "");
    if (!openStr || !closeStr) return { isOpen: true, label: "Aberto" };

    const [openH, openM] = openStr.split(":").map(Number);
    const [closeH, closeM] = closeStr.split(":").map(Number);
    const nowMinutes = today.getHours() * 60 + today.getMinutes();
    const openMinutes = openH * 60 + (openM || 0);
    const closeMinutes = closeH * 60 + (closeM || 0);

    if (Number.isNaN(openMinutes) || Number.isNaN(closeMinutes)) {
      return { isOpen: true, label: "Aberto" };
    }

    const isOpen = nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
    const label = isOpen ? `Aberto ate ${closeStr}` : `Abre as ${openStr}`;
    return { isOpen, label };
  }, [hoursEntries]);

  const preloaderEnabled =
    buildConfig(config, "setup", "preloader_ativo", "").toLowerCase() === "sim";

  const translationEnabled =
    buildConfig(config, "setup", "traducao", "").toLowerCase() === "true" ||
    buildConfig(config, "setup", "traducao", "").toLowerCase() === "sim";
  const translationLangs = buildConfig(config, "setup", "langs", "");
  const translationFlags = buildConfig(config, "setup", "bandeiras", "");

  useEffect(() => {
    if (!preloaderEnabled) return;
    const timer = window.setTimeout(() => setPreloaderDismissed(true), 900);
    return () => window.clearTimeout(timer);
  }, [preloaderEnabled]);

  useEffect(() => {
    if (!translationEnabled) return;
    const langs = translationLangs
      ? translationLangs.split(",").map((lang) => lang.trim()).filter(Boolean)
      : ["pt", "en", "es"];

    const flags = (() => {
      if (!translationFlags) return undefined;
      try {
        return JSON.parse(translationFlags);
      } catch {
        return undefined;
      }
    })();

    // @ts-expect-error gtranslate settings
    window.gtranslateSettings = {
      default_language: langs[0] ?? "pt",
      native_language_names: true,
      detect_browser_language: true,
      languages: langs,
      wrapper_selector: "#gtranslate_wrapper",
      float: "right",
      flag_style: "3d",
      switcher_type: "flags",
      switcher_open_direction: "bottom",
      alt_flags: flags,
    };

    const script = document.createElement("script");
    script.src = "https://cdn.gtranslate.net/widgets/latest/float.js";
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      script.remove();
      const wrapper = document.getElementById("gtranslate_wrapper");
      if (wrapper) wrapper.innerHTML = "";
    };
  }, [translationEnabled, translationLangs, translationFlags]);

  useEffect(() => {
    if (!qrOpen) return;
    const url = window.location.href;
    QRCode.toDataURL(url, { width: 320, margin: 2 })
      .then((dataUrl) => setQrImage(dataUrl))
      .catch(() => setQrImage(null));
  }, [qrOpen]);

  useEffect(() => {
    const root = document.documentElement;
    const primary = buildConfig(config, "cores", "cor_primaria", "");
    const secondary = buildConfig(config, "cores", "cor_secundaria", "");
    const accent = buildConfig(config, "cores", "cor_terciaria", "");
    const background = buildConfig(config, "cores", "cor_fundo", "");
    const foreground = buildConfig(config, "cores", "cor_texto", "");

    const map = [
      { key: "--primary", value: primary },
      { key: "--secondary", value: secondary },
      { key: "--accent", value: accent },
      { key: "--background", value: background },
      { key: "--foreground", value: foreground },
    ];

    map.forEach(({ key, value }) => {
      const hsl = hexToHsl(value);
      if (hsl) {
        root.style.setProperty(key, `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      }
    });

    if (background) {
      document.body.style.backgroundColor = background;
    }
  }, [config]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const subtotal = cart.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
  const total = Math.max(0, subtotal + (deliveryFee ?? 0) - couponDiscount);

  const selectedItemVariations = modalItem ? parseVariations(modalItem.extra) : [];

  function openItem(item: MenuItem) {
    setModalItem(item);
    setSelectedBasePrice(null);
    setSelectedVariations({});
  }

  function addToCart(item: MenuItem, basePrice: number, displayPrice: string, variations: string[]) {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.id === item.id && entry.displayPrice === displayPrice);
      if (existing) {
        return prev.map((entry) =>
          entry === existing ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          basePrice,
          displayPrice,
          quantity: 1,
          notes: "",
          variations,
        },
      ];
    });
  }

  function handleAdd(item: MenuItem) {
    const priceType = getPriceType(item.price);
    if (priceType === "multiple" || selectedItemVariations.length > 0) {
      openItem(item);
      return;
    }
    const basePrice = priceType === "consultation" ? 0 : parsePrice(item.price);
    addToCart(item, basePrice, getPriceDisplay(item.price), []);
  }

  function changeQuantity(index: number, delta: number) {
    setCart((prev) =>
      prev
        .map((item, idx) =>
          idx === index ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    const coupon = coupons.find((row) =>
      String(row.codigo_cupom || row.codigo || "").toUpperCase() === code
    );
    if (!coupon) return;

    const start = parseCouponDate(String(coupon.data_inicio || coupon.inicio || ""));
    const end = parseCouponDate(String(coupon.data_fim || coupon.fim || ""));
    const now = new Date();
    if (start && now < start) return;
    if (end && now > end) return;

    const discountType = String(coupon.tipo_desconto || coupon.tipo || "").toLowerCase();
    const discountValue = String(coupon.valor_desconto || coupon.valor || "0");
    let discount = 0;

    if (discountType.includes("percent") || discountType.includes("%")) {
      const percent = parsePrice(discountValue);
      discount = (subtotal * percent) / 100;
    } else if (discountType.includes("frete")) {
      discount = deliveryFee ?? 0;
    } else {
      discount = parsePrice(discountValue);
    }

    setAppliedCoupon(coupon);
    setCouponDiscount(Math.min(discount, subtotal + (deliveryFee ?? 0)));
  }

  function selectNeighborhood(value: string) {
    setAddress((prev) => ({ ...prev, neighborhood: value }));
    const match = neighborhoods.find((row) => row.name.toLowerCase() === value.toLowerCase());
    setDeliveryFee(match ? match.fee : null);
  }

  function resetDelivery() {
    setDeliveryFee(null);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  }

  function openCheckout() {
    if (!checkoutConfig.enabled) return;
    if (hoursStatus && !hoursStatus.isOpen) return;
    setCheckoutOpen(true);
    setCheckoutStep(1);
  }

  function finalizeOrder() {
    const itemsText = cart
      .map((item) => `${item.quantity}x ${item.name} (${item.displayPrice})`)
      .join("\n");
    const message = [
      `Pedido - ${customerName || "Cliente"}`,
      itemsText,
      deliveryType ? `Entrega: ${deliveryType}` : "",
      address.neighborhood ? `Bairro: ${address.neighborhood}` : "",
      deliveryFee !== null ? `Taxa: ${formatCurrency(deliveryFee)}` : "",
      appliedCoupon ? `Cupom: ${couponCode}` : "",
      paymentMethod ? `Pagamento: ${paymentMethod}` : "",
      tableNumber ? `Mesa/Comanda: ${tableNumber}` : "",
      `Total: ${formatCurrency(total)}`,
    ]
      .filter(Boolean)
      .join("\n");

    if (checkoutConfig.webhook) {
      fetch(checkoutConfig.webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerWhatsapp,
          deliveryType,
          address,
          items: cart,
          subtotal,
          deliveryFee,
          total,
          coupon: appliedCoupon,
        }),
      }).catch(() => undefined);
    }

    if (checkoutConfig.whatsapp && checkoutConfig.whatsappWeb) {
      const url = `https://wa.me/${checkoutConfig.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    }
    setCheckoutOpen(false);
  }

  return (
    <div className="min-h-screen bg-background">
      {preloaderEnabled && !preloaderDismissed ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            {buildConfig(config, "setup", "preloader_logo_url", "") ||
            buildConfig(config, "identidade_visual", "logo_url", "") ? (
              <div className="h-20 w-20 overflow-hidden rounded-2xl bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    buildConfig(config, "setup", "preloader_logo_url", "") ||
                    buildConfig(config, "identidade_visual", "logo_url", "")
                  }
                  alt="Preloader"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full w-2/3 animate-pulse rounded-full"
                style={{
                  backgroundColor: buildConfig(config, "setup", "preloader_color", "#22c55e"),
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
      <div
        id="gtranslate_wrapper"
        className="fixed bottom-6 right-6 z-40"
        style={{ display: translationEnabled ? "block" : "none" }}
      />
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              {buildConfig(config, "identidade_visual", "logo_url", "") ? (
                <div className="h-12 w-12 overflow-hidden rounded-xl bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={buildConfig(config, "identidade_visual", "logo_url", "")}
                    alt="Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cardapio Digital</p>
                <h1 className="text-3xl font-semibold">
                  {buildConfig(config, "identidade_visual", "nome_empresa", "Cardapio Digital")}
                </h1>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {buildConfig(config, "identidade_visual", "slogan", "Pedido rapido e sem fila")}
            </p>
            {hoursStatus ? (
              <div className="mt-2 inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                {hoursStatus.label}
              </div>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/legacy" target="_blank" rel="noreferrer">
                Ver legado
              </a>
            </Button>
            {checkoutConfig.whatsapp ? (
              <Button asChild>
                <a
                  href={`https://wa.me/${checkoutConfig.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Falar no WhatsApp
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <div
        className="fixed left-6 z-40"
        style={{ bottom: translationEnabled ? "92px" : "24px" }}
      >
        <Button
          variant="secondary"
          onClick={() => {
            const shareUrl = window.location.href;
            if (navigator.share) {
              navigator.share({ title: document.title, url: shareUrl }).catch(() => undefined);
              return;
            }
            navigator.clipboard.writeText(shareUrl).catch(() => undefined);
          }}
        >
          Compartilhar
        </Button>
      </div>

      <main className="mx-auto max-w-5xl space-y-10 px-6 py-10">
        {categories.map((category) => (
          <section key={category.name} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{category.displayName}</h2>
              <span className="text-xs text-muted-foreground">
                {category.items.length} itens
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {category.items.map((item) => (
                <Card key={`${category.name}-${item.id}`}>
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    {item.extra ? <Badge variant="secondary">{item.extra}</Badge> : null}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {item.imageUrl ? (
                      <div className="overflow-hidden rounded-xl bg-muted/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-40 w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                    {item.description ? (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm font-semibold">
                          {getPriceDisplay(item.price)}
                        </span>
                        {getPriceType(item.price) === "multiple" ? (
                          <div className="text-xs text-muted-foreground">
                            {getMultiplePricesLabel(item.price)}
                          </div>
                        ) : null}
                      </div>
                      <Button size="sm" onClick={() => handleAdd(item)}>
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </main>

      {cart.length > 0 ? (
        <div className="fixed bottom-6 right-6 z-50">
          <Button size="lg" onClick={openCheckout}>
            Finalizar pedido ({cart.length})
          </Button>
        </div>
      ) : null}

      <Dialog open={Boolean(modalItem)} onOpenChange={() => setModalItem(null)}>
        <DialogContent className="max-w-lg">
          {modalItem ? (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>{modalItem.name}</DialogTitle>
              </DialogHeader>
              {getPriceType(modalItem.price) === "multiple" ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{getMultiplePricesLabel(modalItem.price)}</p>
                  {parseMultiplePrices(modalItem.price).map((option) => (
                    <label key={option.name} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="basePrice"
                        value={option.price}
                        onChange={() => setSelectedBasePrice(option.price)}
                      />
                      <span>{option.name}</span>
                      <span className="ml-auto font-medium">{formatCurrency(option.price)}</span>
                    </label>
                  ))}
                </div>
              ) : null}

            {selectedItemVariations.map((group, groupIndex) => (
              <div key={group.name} className="space-y-2">
                <p className="text-sm font-medium">{group.name}</p>
                {group.options.map((option) => (
                  <label key={option.name} className="flex items-center gap-2 text-sm">
                    <input
                      type={group.type}
                      name={`variation-${groupIndex}`}
                      value={option.name}
                      onChange={(event) => {
                        const checked = event.currentTarget.checked;
                        setSelectedVariations((prev) => {
                          const current = prev[groupIndex] ?? [];
                          if (group.type === "radio") {
                            return { ...prev, [groupIndex]: [option.name] };
                          }
                          if (checked) {
                            if (group.maxSelect && current.length >= group.maxSelect) {
                              return prev;
                            }
                            return { ...prev, [groupIndex]: [...current, option.name] };
                          }
                          return { ...prev, [groupIndex]: current.filter((name) => name !== option.name) };
                        });
                      }}
                    />
                      <span>{option.name}</span>
                      {option.price ? (
                        <span className="ml-auto font-medium">{formatCurrency(option.price)}</span>
                      ) : null}
                    </label>
                  ))}
                </div>
              ))}

            <Button
              disabled={
                (getPriceType(modalItem.price) === "multiple" && selectedBasePrice === null) ||
                selectedItemVariations.some((group, idx) => {
                  const selected = selectedVariations[idx] ?? [];
                  if (group.required && selected.length === 0) return true;
                  if (group.minSelect && selected.length < group.minSelect) return true;
                  return false;
                })
              }
              onClick={() => {
                  if (!modalItem) return;
                  const base = getPriceType(modalItem.price) === "multiple"
                    ? selectedBasePrice
                    : parsePrice(modalItem.price);
                  if (getPriceType(modalItem.price) === "multiple" && base === null) return;
                  const variationLabels: string[] = [];
                  let variationSum = 0;
                  selectedItemVariations.forEach((group, idx) => {
                    const selected = selectedVariations[idx] ?? [];
                    if (group.required && selected.length === 0) return;
                    if (group.minSelect && selected.length < group.minSelect) return;
                    selected.forEach((name) => {
                      variationLabels.push(`${group.name}: ${name}`);
                      const option = group.options.find((opt) => opt.name === name);
                      if (option) variationSum += option.price;
                    });
                  });
                  const basePrice = (base ?? 0) + variationSum;
                  addToCart(modalItem, basePrice, formatCurrency(basePrice), variationLabels);
                  setModalItem(null);
                }}
              >
                Adicionar ao carrinho
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Finalizar pedido</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {checkoutStep === 1 ? (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.displayPrice}</div>
                        {item.variations.length > 0 ? (
                          <div className="text-xs text-muted-foreground">
                            {item.variations.join(", ")}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => changeQuantity(index, -1)}>
                          -
                        </Button>
                        <span>{item.quantity}</span>
                        <Button variant="outline" size="sm" onClick={() => changeQuantity(index, 1)}>
                          +
                        </Button>
                      </div>
                    </div>
                    {checkoutConfig.showObservations ? (
                      <Textarea
                        className="mt-3"
                        placeholder="Observacoes"
                        value={item.notes}
                        onChange={(event) => {
                          const value = event.target.value;
                          setCart((prev) =>
                            prev.map((cartItem, idx) =>
                              idx === index ? { ...cartItem, notes: value } : cartItem
                            )
                          );
                        }}
                      />
                    ) : null}
                  </div>
                ))}
                <Button onClick={() => setCheckoutStep(2)}>Continuar</Button>
              </div>
            ) : null}

            {checkoutStep === 2 ? (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {deliveryOptions.local.shouldShow ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="delivery"
                        value="local"
                        checked={deliveryType === "local"}
                        onChange={() => {
                          setDeliveryType("local");
                          resetDelivery();
                        }}
                      />
                      <span>{deliveryOptions.local.title || "No local"}</span>
                    </label>
                  ) : null}
                  {deliveryOptions.pickup.shouldShow ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="delivery"
                        value="pickup"
                        checked={deliveryType === "pickup"}
                        onChange={() => {
                          setDeliveryType("pickup");
                          resetDelivery();
                        }}
                      />
                      <span>{deliveryOptions.pickup.title || "Retirada"}</span>
                    </label>
                  ) : null}
                  {deliveryOptions.delivery.shouldShow ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="delivery"
                        value="delivery"
                        checked={deliveryType === "delivery"}
                        onChange={() => {
                          setDeliveryType("delivery");
                          resetDelivery();
                        }}
                      />
                      <span>{deliveryOptions.delivery.title || "Delivery"}</span>
                    </label>
                  ) : null}
                </div>

                {deliveryType === "delivery" ? (
                  <div className="grid gap-3">
                    {checkoutConfig.onlyNeighborhoodMode ? (
                      <select
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={address.neighborhood}
                        onChange={(event) => selectNeighborhood(event.target.value)}
                      >
                        <option value="">Selecione o bairro</option>
                        {neighborhoods.map((bairro) => (
                          <option key={bairro.name} value={bairro.name}>
                            {bairro.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        placeholder="Bairro"
                        value={address.neighborhood}
                        onChange={(event) => selectNeighborhood(event.target.value)}
                      />
                    )}
                    <Input
                      placeholder="Rua"
                      value={address.street}
                      onChange={(event) => setAddress((prev) => ({ ...prev, street: event.target.value }))}
                    />
                    <Input
                      placeholder="Numero"
                      value={address.number}
                      onChange={(event) => setAddress((prev) => ({ ...prev, number: event.target.value }))}
                    />
                    <Input
                      placeholder="Complemento"
                      value={address.complement}
                      onChange={(event) => setAddress((prev) => ({ ...prev, complement: event.target.value }))}
                    />
                  </div>
                ) : null}

                {deliveryType === "delivery" && deliveryFee === null ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                    {checkoutConfig.step2DeliveryFeeMessage}
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCheckoutStep(1)}>
                    Voltar
                  </Button>
                  <Button onClick={() => setCheckoutStep(3)}>Continuar</Button>
                </div>
              </div>
            ) : null}

            {checkoutStep === 3 ? (
              <div className="space-y-4">
                <Input
                  placeholder="Seu nome"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                />
                <Input
                  placeholder="WhatsApp"
                  value={customerWhatsapp}
                  onChange={(event) => setCustomerWhatsapp(event.target.value)}
                />

                {checkoutConfig.showPayments ? (
                  <Input
                    placeholder="Forma de pagamento"
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  />
                ) : null}
                {checkoutConfig.showTable ? (
                  <Input
                    placeholder="Mesa/Comanda"
                    value={tableNumber}
                    onChange={(event) => setTableNumber(event.target.value)}
                  />
                ) : null}

                <div className="grid gap-2">
                  <Input
                    placeholder="Cupom"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                  />
                  <Button variant="outline" onClick={applyCoupon}>
                    Aplicar cupom
                  </Button>
                </div>

                <div className="rounded-lg border border-border p-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {deliveryFee !== null ? (
                    <div className="flex justify-between">
                      <span>Entrega</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                  ) : null}
                  {couponDiscount > 0 ? (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto</span>
                      <span>-{formatCurrency(couponDiscount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCheckoutStep(2)}>
                    Voltar
                  </Button>
                  <Button onClick={finalizeOrder}>Enviar pedido</Button>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>QR Code do cardapio</DialogTitle>
          </DialogHeader>
          {qrImage ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImage} alt="QR Code" className="mx-auto h-56 w-56" />
              <Button asChild variant="outline">
                <a href={qrImage} download="qrcode.png">
                  Baixar PNG
                </a>
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Gerando QR Code...</div>
          )}
        </DialogContent>
      </Dialog>

      <footer className="border-t border-border bg-card px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 text-sm text-muted-foreground">
            {contactInfo.address ? <div>{contactInfo.address}</div> : null}
            {contactInfo.phone ? <div>Telefone: {contactInfo.phone}</div> : null}
            {contactInfo.email ? <div>Email: {contactInfo.email}</div> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            {contactInfo.instagram ? (
              <a
                href={contactInfo.instagram}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-primary"
              >
                Instagram
              </a>
            ) : null}
            {contactInfo.facebook ? (
              <a
                href={contactInfo.facebook}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-primary"
              >
                Facebook
              </a>
            ) : null}
            {contactInfo.whatsapp ? (
              <a
                href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-primary"
              >
                WhatsApp
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              className="text-sm font-medium text-primary"
            >
              QR Code
            </button>
          </div>
        </div>
        {authorInfo.name ? (
          <div className="mx-auto mt-6 max-w-5xl text-xs text-muted-foreground">
            Desenvolvido por{" "}
            {authorInfo.link ? (
              <a
                href={authorInfo.link}
                target="_blank"
                rel="noreferrer"
                className="text-primary"
              >
                {authorInfo.name}
              </a>
            ) : (
              authorInfo.name
            )}
          </div>
        ) : null}
      </footer>
    </div>
  );
}
