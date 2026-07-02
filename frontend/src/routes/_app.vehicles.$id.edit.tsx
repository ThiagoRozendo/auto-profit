import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
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
import { useVehicleStore } from "@/lib/vehicle-store";
import type { Vehicle } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/vehicles/$id/edit")({
  head: ({ params }) => ({ meta: [{ title: `Editar veículo ${params.id} — AutoProfit` }] }),
  component: EditVehiclePage,
});

function EditVehiclePage() {
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

  return <EditVehicleForm vehicle={v} />;
}

function EditVehicleForm({ vehicle: v }: { vehicle: Vehicle }) {
  const nav = useNavigate();
  const { updateVehicle } = useVehicleStore();

  const [form, setForm] = useState({
    brand: v.brand,
    model: v.model,
    year: v.year,
    plate: v.plate,
    purchasePrice: v.purchasePrice,
    status: v.status,
    notes: v.notes ?? "",
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link to="/vehicles/$id" params={{ id: v.id }}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Editar veículo</h1>
        <p className="text-sm text-muted-foreground">
          Atualize as informações de {v.brand} {v.model}.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateVehicle(v.id, form);
          toast.success("Veículo atualizado!");
          nav({ to: "/vehicles/$id", params: { id: v.id } });
        }}
        className="card-elevated space-y-5 p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Marca</Label>
            <Input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Modelo</Label>
            <Input
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Ano</Label>
            <Input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Placa</Label>
            <Input
              value={form.plate}
              onChange={(e) => setForm({ ...form, plate: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Valor de compra</Label>
            <Input
              type="number"
              step="0.01"
              value={form.purchasePrice}
              onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(s) => setForm({ ...form, status: s as typeof form.status })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="reservado">Reservado</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="vendido">Vendido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Observações</Label>
          <Textarea
            rows={4}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Detalhes relevantes, histórico, etc."
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline">
            <Link to="/vehicles/$id" params={{ id: v.id }}>
              Cancelar
            </Link>
          </Button>
          <Button type="submit" className="gradient-primary text-primary-foreground">
            Salvar alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
