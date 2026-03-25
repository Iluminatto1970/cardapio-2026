export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12 text-zinc-900">
      <main className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">Cardapio 2026</h1>
          <p className="text-base leading-7 text-zinc-600">
            Sistema iniciado a partir do HTML legado e config.js. Abra o legado
            para validar o funcionamento enquanto migramos para o SaaS.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-800"
            href="/legacy"
          >
            Abrir cardapio legado
          </a>
          <a
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
            href="/menu"
          >
            Ver cardapio publico
          </a>
          <a
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            href="/app/dashboard"
          >
            Entrar no SaaS
          </a>
          <a
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
            href="/legacy"
            target="_blank"
            rel="noreferrer"
          >
            Abrir em nova aba
          </a>
        </div>
      </main>
    </div>
  );
}
