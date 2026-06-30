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
import type { VehicleStatus } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/vehicles/new")({
  head: () => ({ meta: [{ title: "Novo veículo — AutoProfit" }] }),
  component: NewVehiclePage,
});

function NewVehiclePage() {
  const nav = useNavigate();
  const { addVehicle } = useVehicleStore();
  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    plate: "",
    purchasePrice: 0,
    status: "disponivel" as VehicleStatus,
    notes: "",
  });

  function submitVehicle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = addVehicle(form);
    toast.success("Veículo cadastrado com sucesso!");
    nav({ to: "/vehicles/$id", params: { id: created.id } });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link to="/vehicles">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Cadastrar veículo</h1>
        <p className="text-sm text-muted-foreground">Adicione um novo veículo ao seu estoque.</p>
      </div>

      <form onSubmit={submitVehicle} className="card-elevated space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Marca</Label>
            <Input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="Ex.: Toyota"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Modelo</Label>
            <Input
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="Ex.: Corolla XEi"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Ano</Label>
            <Input
              type="number"
              min="1950"
              max="2030"
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
              placeholder="ABC-1D23"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Valor de compra</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.purchasePrice || ""}
              onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })}
              placeholder="0,00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(status) => setForm({ ...form, status: status as VehicleStatus })}
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
            <Link to="/vehicles">Cancelar</Link>
          </Button>
          <Button type="submit" className="gradient-primary text-primary-foreground">
            Salvar veículo
          </Button>
        </div>
      </form>
    </div>
  );
}
