import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Gauge, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Criar conta — AutoProfit" },
      { name: "description", content: "Crie sua conta AutoProfit gratuitamente em poucos segundos." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("As senhas não conferem.");
      return;
    }
    toast.success("Conta criada com sucesso!");
    nav({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg gradient-primary">
            <Gauge className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">AutoProfit</span>
        </Link>

        <div className="card-elevated p-8">
          <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Comece a gerenciar sua revenda em minutos.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pwd">Senha</Label>
                <Input id="pwd" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpwd">Confirmar senha</Label>
                <Input id="cpwd" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground shadow-[var(--shadow-elegant)]">
              Criar conta <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/" className="font-medium text-primary hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
