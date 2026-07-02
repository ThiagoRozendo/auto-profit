import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Bell, CheckCircle2, Info, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notifications as initial } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notificações — AutoProfit" }] }),
  component: NotificationsPage,
});

const ICONS = {
  despesa_alta: { icon: AlertTriangle, color: "text-warning bg-warning/15" },
  veiculo_vendido: { icon: CheckCircle2, color: "text-success bg-success/15" },
  veiculo_parado: { icon: Timer, color: "text-info bg-info/15" },
  info: { icon: Info, color: "text-primary bg-primary/15" },
} as const;

function NotificationsPage() {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<string>("todas");

  const filtered = items.filter(
    (n) => filter === "todas" || (filter === "nao_lidas" && !n.read) || n.type === filter,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Notificações</h1>
          <p className="text-sm text-muted-foreground">
            {items.filter((i) => !i.read).length} não lidas
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setItems(items.map((i) => ({ ...i, read: true })))}
        >
          Marcar todas como lidas
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="nao_lidas">Não lidas</TabsTrigger>
          <TabsTrigger value="despesa_alta">Despesa alta</TabsTrigger>
          <TabsTrigger value="veiculo_vendido">Veículo vendido</TabsTrigger>
          <TabsTrigger value="veiculo_parado">Veículo parado</TabsTrigger>
          <TabsTrigger value="info">Informações</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="card-elevated">
        <ul className="divide-y divide-border">
          {filtered.map((n) => {
            const meta = ICONS[n.type];
            const Icon = meta.icon;
            return (
              <li
                key={n.id}
                className={cn(
                  "flex items-start gap-4 p-5 transition",
                  !n.read && "bg-primary/[0.03]",
                )}
              >
                <div
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
                    meta.color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{n.title}</p>
                    <span className="shrink-0 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {n.date}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.description}</p>
                </div>
                {!n.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setItems(items.map((i) => (i.id === n.id ? { ...i, read: true } : i)))
                    }
                  >
                    Marcar como lida
                  </Button>
                )}
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="flex flex-col items-center justify-center gap-2 p-12 text-center">
              <Bell className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação por aqui.</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
