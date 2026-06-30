import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Configurações — AutoProfit" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [margin, setMargin] = useState(18);
  const [highExpense, setHighExpense] = useState(2500);
  const [maxDays, setMaxDays] = useState(60);
  const [notifs, setNotifs] = useState({ email: true, push: true, weekly: false });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Configurações</h1>
        <p className="text-sm text-muted-foreground">Preferências gerais da sua revenda</p>
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => { e.preventDefault(); toast.success("Configurações salvas com sucesso!"); }}
      >
        <Section title="Operação" description="Padrões usados nos cálculos e alertas do sistema.">
          <Field label="Margem padrão de lucro (%)">
            <Input type="number" value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="max-w-xs" />
          </Field>
          <Field label="Limite para despesa alta (R$)">
            <Input type="number" value={highExpense} onChange={(e) => setHighExpense(Number(e.target.value))} className="max-w-xs" />
          </Field>
          <Field label="Tempo máximo em estoque (dias)">
            <Input type="number" value={maxDays} onChange={(e) => setMaxDays(Number(e.target.value))} className="max-w-xs" />
          </Field>
        </Section>

        <Section title="Notificações" description="Escolha como deseja receber alertas.">
          <Toggle label="Alertas por e-mail" checked={notifs.email} onChange={(v) => setNotifs({ ...notifs, email: v })} />
          <Toggle label="Notificações push" checked={notifs.push} onChange={(v) => setNotifs({ ...notifs, push: v })} />
          <Toggle label="Resumo semanal" checked={notifs.weekly} onChange={(v) => setNotifs({ ...notifs, weekly: v })} />
        </Section>

        <div className="flex justify-end">
          <Button type="submit" className="gradient-primary text-primary-foreground"><Save className="mr-2 h-4 w-4" /> Salvar alterações</Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="card-elevated p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Separator className="mb-4" />
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
      <Label className="text-sm font-medium">{label}</Label>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm font-medium">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
