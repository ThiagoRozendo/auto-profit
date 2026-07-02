import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vehicles, formatBRL, totalExpensesByVehicle } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/sales")({
  head: () => ({ meta: [{ title: "Registrar venda — AutoProfit" }] }),
  component: SalesPage,
});

function SalesPage() {
  const [vehicleId, setVehicleId] = useState(vehicles[0].id);
  const [price, setPrice] = useState<number>(0);

  const v = vehicles.find((x) => x.id === vehicleId)!;
  const invest = useMemo(() => v.purchasePrice + totalExpensesByVehicle(v.id), [v]);
  const suggested = invest * 1.18;
  const diff = price - suggested;
  const profit = price - invest;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Registrar venda</h1>
        <p className="text-sm text-muted-foreground">Conclua a venda e visualize o lucro real.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <form
          className="card-elevated space-y-4 p-6 lg:col-span-3"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Venda registrada com sucesso!");
          }}
        >
          <div className="space-y-2">
            <Label>Veículo</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vv) => (
                  <SelectItem key={vv.id} value={vv.id}>
                    {vv.brand} {vv.model} • {vv.plate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Preço final de venda</Label>
              <Input
                type="number"
                step="0.01"
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Data da venda</Label>
              <Input type="date" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea rows={4} placeholder="Comprador, forma de pagamento, etc." />
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="gradient-primary text-primary-foreground">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Registrar venda
            </Button>
          </div>
        </form>

        <div className="space-y-4 lg:col-span-2">
          <div className="card-elevated p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Preço sugerido</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-primary">
              {formatBRL(suggested)}
            </p>
          </div>
          <div className="card-elevated p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Diferença vs. sugerido
            </p>
            <p
              className={`mt-2 text-2xl font-bold tabular-nums ${diff >= 0 ? "text-success" : "text-destructive"}`}
            >
              {formatBRL(diff)}
            </p>
          </div>
          <div className="card-elevated p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Lucro real</p>
            <p
              className={`mt-2 text-3xl font-bold tabular-nums ${profit >= 0 ? "text-gradient-primary" : "text-destructive"}`}
            >
              {formatBRL(profit)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Investimento: {formatBRL(invest)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
