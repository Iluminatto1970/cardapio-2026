import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/tenants", label: "Tenants" },
  { href: "/app/cardapio", label: "Cardapio" },
  { href: "/app/config", label: "Configuracoes" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-border bg-card px-6 py-8 md:flex">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              C26
            </span>
            Cardapio 2026
          </div>
          <nav className="mt-10 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-3">
            <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              MVP multi-tenant em construcao.
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/legacy">Ver cardapio legado</Link>
            </Button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Ambiente
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                Staging
              </span>
            </div>
            <div className="flex items-center gap-3">
              <form action="/api/auth/logout" method="POST">
              <Button variant="secondary" size="sm" type="submit">
                Sair
              </Button>
            </form>
            </div>
          </header>

          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
