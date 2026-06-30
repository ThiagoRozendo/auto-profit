import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { vehicles, formatBRL, totalExpensesByVehicle } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/pricing")({
  head: () => ({
    meta: [
      { title: "Precificação — AutoProfit" },
      { name: "description", content: "Calcule preço sugerido e lucro esperado para cada veículo." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const [vehicleId, setVehicleId] = useState(vehicles[0].id);
  const [margin, setMargin] = useState(20);

  const v = vehicles.find((x) => x.id === vehicleId)!;
  const totalExp = totalExpensesByVehicle(v.id);
  const invest = v.purchasePrice + totalExp;
  const profit = invest * (margin / 100);
  const suggested = invest + profit;

  const items = useMemo(() => ([
    { label: "Valor de compra", value: formatBRL(v.purchasePrice) },
    { label: "Total de despesas", value: formatBRL(totalExp) },
    { label: "Investimento total", value: formatBRL(invest) },
  ]), [v, totalExp, invest]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Precificação</h1>
        <p className="text-sm text-muted-foreground">Defina margem de lucro e calcule o preço sugerido.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card-elevated space-y-6 p-6 lg:col-span-2">
          <div className="space-y-2">
            <Label>Veículo</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {vehicles.map((vv) => (
                  <SelectItem key={vv.id} value={vv.id}>{vv.brand} {vv.model} • {vv.plate}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <dl className="space-y-3 rounded-lg bg-muted/30 p-4">
            {items.map((i) => (
              <div key={i.label} className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">{i.label}</dt>
                <dd className="font-semibold tabular-nums">{i.value}</dd>
              </div>
            ))}
          </dl>

          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <Label>Margem de lucro</Label>
              <Input type="number" value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-24 text-right tabular-nums" />
            </div>
            <Slider value={[margin]} onValueChange={(v) => setMargin(v[0])} min={0} max={50} step={1} />
            <div className="flex justify-between text-[11px] text-muted-foreground"><span>0%</span><span>50%</span></div>
          </div>

          <Button className="w-full gradient-primary text-primary-foreground" onClick={() => toast.success("Preço calculado e salvo!")}>
            <Calculator className="mr-2 h-4 w-4" /> Aplicar precificação
          </Button>
        </div>

        <div className="lg:col-span-3">
          <div className="card-elevated relative overflow-hidden p-8">
            <div className="absolute inset-0 -z-10 opacity-20 gradient-primary" />
            <div className="absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />

            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <TrendingUp className="h-4 w-4" /> Resultado da precificação
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Lucro esperado</p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-success">{formatBRL(profit)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Margem de {margin}% sobre o investimento</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Preço sugerido</p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-gradient-primary">{formatBRL(suggested)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Para anúncio público</p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 rounded-xl border border-border bg-card/60 p-4 sm:grid-cols-3">
              <Stat label="Investimento" value={formatBRL(invest)} />
              <Stat label="Lucro líquido" value={formatBRL(profit)} accent />
              <Stat label="Preço final" value={formatBRL(suggested)} accent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-bold tabular-nums ${accent ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}
