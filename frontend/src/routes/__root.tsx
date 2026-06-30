import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço acessado não existe ou foi movido.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-md gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Ir para o Dashboard
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Não foi possível carregar</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente novamente em alguns instantes.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Tentar de novo
          </button>
          <a href="/dashboard" className="rounded-md border border-border bg-card px-4 py-2 text-sm">Início</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AutoProfit — Gestão de revenda de veículos" },
      { name: "description", content: "Plataforma SaaS para revendedores: controle de estoque, despesas, precificação e lucros." },
      { property: "og:title", content: "AutoProfit" },
      { property: "og:description", content: "Gestão completa de revenda de veículos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
