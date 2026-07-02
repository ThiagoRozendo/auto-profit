import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Gauge, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — AutoProfit" },
      {
        name: "description",
        content: "Acesse sua conta AutoProfit e gerencie sua revenda de veículos.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Branding side */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="absolute inset-0 -z-10 gradient-primary opacity-90" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,oklch(1_0_0/0.18),transparent_50%)]" />
        <div className="flex items-center gap-3 text-primary-foreground">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-background/15 backdrop-blur">
            <Gauge className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold tracking-tight">AutoProfit</span>
        </div>
        <div className="text-primary-foreground">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Maximize o lucro de cada veículo da sua revenda.
          </h1>
          <p className="mt-4 max-w-md text-sm/relaxed opacity-90">
            Centralize estoque, despesas, precificação e relatórios em uma plataforma feita para
            revendedores que querem escalar com inteligência.
          </p>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              { k: "+R$ 2.4M", v: "Lucro gerido" },
              { k: "12k+", v: "Veículos" },
              { k: "98%", v: "Satisfação" },
            ].map((s) => (
              <div
                key={s.v}
                className="rounded-xl border border-primary-foreground/20 bg-background/10 p-3 backdrop-blur"
              >
                <p className="text-lg font-bold">{s.k}</p>
                <p className="text-[11px] opacity-80">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-primary-foreground/80">
          © 2025 AutoProfit. Todos os direitos reservados.
        </p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-lg gradient-primary">
              <Gauge className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">AutoProfit</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre com seu e-mail e senha para continuar.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              nav({ to: "/dashboard" });
            }}
            className="mt-8 space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@empresa.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pwd">Senha</Label>
                <button type="button" className="text-xs text-primary hover:underline">
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pwd"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground shadow-[var(--shadow-elegant)]"
            >
              Entrar <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link to="/signup">Criar uma conta</Link>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
