import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calculator,
  Calendar,
  Car,
  CheckCircle2,
  Hash,
  Pencil,
  Plus,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { StatCard } from "@/components/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { expenses, formatBRL, totalExpensesByVehicle } from "@/lib/mock-data";
import { useVehicleStore } from "@/lib/vehicle-store";

export const Route = createFileRoute("/_app/vehicles/$id/")({
  component: VehicleDetailsPage,
});

function VehicleDetailsPage() {
  const { id } = Route.useParams();
  const { vehicles, isReady } = useVehicleStore();
  const v = vehicles.find((x) => x.id === id);

  if (!v) {
    return (
      <div className="card-elevated p-10 text-center">
        <p className="text-sm text-muted-foreground">
          {isReady ? "Veículo não encontrado." : "Carregando veículo..."}
        </p>
        {isReady && (
          <Button asChild className="mt-4">
            <Link to="/vehicles">Voltar para veículos</Link>
          </Button>
        )}
      </div>
    );
  }

  const vExpenses = expenses.filter((e) => e.vehicleId === v.id);
  const totalExp = totalExpensesByVehicle(v.id);
  const invest = v.purchasePrice + totalExp;
  const margin = 0.18;
  const suggested = invest * (1 + margin);
  const profit = suggested - invest;

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link to="/vehicles">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {v.brand} {v.model}
              </h1>
              <StatusBadge status={v.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {v.year} • Placa {v.plate}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/vehicles/$id/edit" params={{ id: v.id }}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/pricing">
                <Calculator className="mr-2 h-4 w-4" />
                Calcular preço
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/expenses">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar despesa
              </Link>
            </Button>
            <Button asChild className="gradient-primary text-primary-foreground">
              <Link to="/sales">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Registrar venda
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Valor de compra" value={formatBRL(v.purchasePrice)} icon={Wallet} />
        <StatCard label="Total despesas" value={formatBRL(totalExp)} icon={Plus} tone="warning" />
        <StatCard label="Investimento total" value={formatBRL(invest)} icon={Car} tone="info" />
        <StatCard
          label="Preço sugerido"
          value={formatBRL(suggested)}
          icon={Calculator}
          tone="primary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-elevated p-5 lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">Histórico de despesas</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vExpenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs text-muted-foreground">{e.date}</TableCell>
                  <TableCell>{e.category}</TableCell>
                  <TableCell>{e.description}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatBRL(e.amount)}</TableCell>
                </TableRow>
              ))}
              {vExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhuma despesa registrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-4">
          <div className="card-elevated p-5">
            <h2 className="mb-3 text-base font-semibold">Resumo financeiro</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Margem aplicada</dt>
                <dd className="font-medium">{(margin * 100).toFixed(0)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Lucro esperado</dt>
                <dd className="font-semibold text-success">{formatBRL(profit)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Preço sugerido</dt>
                <dd className="font-bold text-primary">{formatBRL(suggested)}</dd>
              </div>
            </dl>
          </div>

          <div className="card-elevated p-5">
            <h2 className="mb-3 text-base font-semibold">Detalhes</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span>
                  {v.brand} {v.model}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Ano {v.year}</span>
              </li>
              <li className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-xs">{v.plate}</span>
              </li>
            </ul>
            {v.notes && (
              <p className="mt-3 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                {v.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
