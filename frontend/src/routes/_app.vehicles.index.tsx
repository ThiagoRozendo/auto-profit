import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2, CheckCircle2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/status-badge";
import { formatBRL, totalExpensesByVehicle } from "@/lib/mock-data";
import { useVehicleStore } from "@/lib/vehicle-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/vehicles/")({
  head: () => ({
    meta: [
      { title: "Veículos — AutoProfit" },
      { name: "description", content: "Gerencie o estoque de veículos da sua revenda." },
    ],
  }),
  component: VehiclesPage,
});

function VehiclesPage() {
  const nav = useNavigate();
  const { vehicles, markVehicleSold, removeVehicle } = useVehicleStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("todos");

  const rows = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesQ = `${v.brand} ${v.model} ${v.plate}`.toLowerCase().includes(q.toLowerCase());
      const matchesS = status === "todos" || v.status === status;
      return matchesQ && matchesS;
    });
  }, [q, status, vehicles]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Veículos</h1>
          <p className="text-sm text-muted-foreground">{vehicles.length} veículos no estoque</p>
        </div>
        <Button
          asChild
          className="group bg-primary text-primary-foreground shadow-[var(--shadow-elegant)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-glow hover:shadow-lg"
        >
          <Link to="/vehicles/new">
            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" /> Novo
            veículo
          </Link>
        </Button>
      </div>

      <div className="card-elevated">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar marca, modelo ou placa..."
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="disponivel">Disponível</SelectItem>
              <SelectItem value="reservado">Reservado</SelectItem>
              <SelectItem value="manutencao">Manutenção</SelectItem>
              <SelectItem value="vendido">Vendido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Marca / Modelo</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead className="text-right">Compra</TableHead>
              <TableHead className="text-right">Preço sugerido</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((v) => {
              const invest = v.purchasePrice + totalExpensesByVehicle(v.id);
              const suggested = invest * 1.18;
              return (
                <TableRow key={v.id} className="group">
                  <TableCell>
                    <Link
                      to="/vehicles/$id"
                      params={{ id: v.id }}
                      className="font-medium hover:text-primary"
                    >
                      {v.brand} {v.model}
                    </Link>
                  </TableCell>
                  <TableCell>{v.year}</TableCell>
                  <TableCell className="font-mono text-xs">{v.plate}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBRL(v.purchasePrice)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-primary">
                    {formatBRL(suggested)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={v.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => nav({ to: "/vehicles/$id", params: { id: v.id } })}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => nav({ to: "/vehicles/$id/edit", params: { id: v.id } })}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            markVehicleSold(v.id);
                            toast.success("Veículo marcado como vendido");
                          }}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Marcar como vendido
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => {
                            removeVehicle(v.id);
                            toast.error("Veículo excluído");
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  Nenhum veículo encontrado com esses filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
