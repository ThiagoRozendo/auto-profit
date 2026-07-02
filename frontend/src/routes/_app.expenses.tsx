import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { vehicles, expenses, formatBRL } from "@/lib/mock-data";
import { toast } from "sonner";

const categories = [
  "Manutenção",
  "Documentação",
  "Peças",
  "Transporte",
  "Limpeza",
  "Outros",
] as const;

export const Route = createFileRoute("/_app/expenses")({
  head: () => ({
    meta: [
      { title: "Despesas — AutoProfit" },
      { name: "description", content: "Controle todas as despesas dos veículos da sua revenda." },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const [vehicleId, setVehicleId] = useState("todos");
  const [category, setCategory] = useState("todas");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return expenses.filter((e) => {
      const v = vehicles.find((x) => x.id === e.vehicleId);
      const matchesV = vehicleId === "todos" || e.vehicleId === vehicleId;
      const matchesC = category === "todas" || e.category === category;
      const text = `${e.description} ${v?.brand} ${v?.model}`.toLowerCase();
      return matchesV && matchesC && text.includes(q.toLowerCase());
    });
  }, [vehicleId, category, q]);

  const total = rows.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Despesas</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} despesas • Total{" "}
            <span className="font-semibold text-foreground">{formatBRL(total)}</span>
          </p>
        </div>
        <ExpenseDialog />
      </div>

      <div className="card-elevated">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar despesas..."
              className="pl-9"
            />
          </div>
          <Select value={vehicleId} onValueChange={setVehicleId}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os veículos</SelectItem>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.brand} {v.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => {
              const v = vehicles.find((x) => x.id === e.vehicleId);
              return (
                <TableRow key={e.id}>
                  <TableCell className="text-xs text-muted-foreground">{e.date}</TableCell>
                  <TableCell className="font-medium">
                    {v?.brand} {v?.model}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md bg-accent/50 px-2 py-0.5 text-xs">
                      {e.category}
                    </span>
                  </TableCell>
                  <TableCell>{e.description}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatBRL(e.amount)}
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                  Nenhuma despesa encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ExpenseDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground shadow-[var(--shadow-elegant)]">
          <Plus className="mr-2 h-4 w-4" /> Nova despesa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova despesa</DialogTitle>
          <DialogDescription>Registre uma nova despesa associada a um veículo.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Despesa cadastrada!");
            setOpen(false);
          }}
        >
          <div className="space-y-2">
            <Label>Veículo</Label>
            <Select defaultValue={vehicles[0].id}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.brand} {v.model} • {v.plate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select defaultValue="Manutenção">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input type="number" step="0.01" placeholder="0,00" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea rows={3} placeholder="Descreva a despesa" required />
          </div>
          <div className="space-y-2">
            <Label>Data</Label>
            <Input type="date" required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-primary text-primary-foreground">
              Salvar despesa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
