import { signIn } from "./actions";

interface LoginPageProps {
  searchParams: { error?: string; redirect?: string };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const error = searchParams.error;
  const redirectTo = searchParams.redirect ?? "/";

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-0 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-zinc-850 bg-surface-1 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.svg" alt="GM Educação" className="h-8 w-8" />
          </div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-fg">
            GM Educação
          </h1>
          <p className="mt-1 text-[12px] font-medium text-fg-muted">
            Acesso restrito · Dashboards internos
          </p>
        </div>

        <form
          action={signIn}
          className="flex flex-col gap-3 rounded-2xl border border-zinc-850 bg-surface-1 p-6 shadow-xl"
        >
          <input type="hidden" name="redirect" value={redirectTo} />

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[1px] text-fg-muted">
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              autoFocus
              className="rounded-lg border border-zinc-850 bg-surface-2 px-3 py-2.5 text-[14px] text-fg outline-none transition-colors focus:border-amber-400/60"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[1px] text-fg-muted">
              Senha
            </span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="rounded-lg border border-zinc-850 bg-surface-2 px-3 py-2.5 text-[14px] text-fg outline-none transition-colors focus:border-amber-400/60"
            />
          </label>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] font-medium text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="mt-2 rounded-lg bg-amber-400 px-4 py-2.5 text-[13px] font-bold text-zinc-950 transition-colors hover:bg-amber-300"
          >
            Entrar
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-fg-muted">
          Problemas para acessar? Contate o administrador.
        </p>
      </div>
    </main>
  );
}
