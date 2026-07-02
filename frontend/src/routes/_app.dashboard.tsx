import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Car,
  CheckCircle2,
  DollarSign,
  Receipt,
  TrendingUp,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import {
  vehicles,
  expenses,
  monthlyStats,
  notifications,
  formatBRL,
  totalExpensesByVehicle,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AutoProfit" },
      {
        name: "description",
        content: "Visão geral do estoque, despesas e lucro esperado da sua revenda.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const total = vehicles.length;
  const disponivel = vehicles.filter((v) => v.status === "disponivel").length;
  const vendidos = vehicles.filter((v) => v.status === "vendido").length;
  const invest = vehicles.reduce((s, v) => s + v.purchasePrice, 0);
  const despesas = expenses.reduce((s, e) => s + e.amount, 0);
  const margin = 0.18;
  const lucro = (invest + despesas) * margin;

  const recent = [...vehicles].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Resumo financeiro e operacional da sua revenda
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Total de veículos" value={String(total)} icon={Car} tone="primary" />
        <StatCard
          label="Disponíveis"
          value={String(disponivel)}
          icon={CheckCircle2}
          tone="success"
          delta={{ value: "+3 este mês", direction: "up" }}
        />
        <StatCard
          label="Vendidos"
          value={String(vendidos)}
          icon={TrendingUp}
          tone="info"
          delta={{ value: "+2 este mês", direction: "up" }}
        />
        <StatCard label="Total investido" value={formatBRL(invest)} icon={Wallet} />
        <StatCard
          label="Total de despesas"
          value={formatBRL(despesas)}
          icon={Receipt}
          tone="warning"
          delta={{ value: "-8% vs. abril", direction: "down" }}
        />
        <StatCard
          label="Lucro esperado"
          value={formatBRL(lucro)}
          icon={DollarSign}
          tone="success"
          delta={{ value: "+12% MoM", direction: "up" }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-elevated p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Despesas vs. Lucro esperado</h2>
              <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={monthlyStats}>
                <defs>
                  <linearGradient id="lp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ld" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-warning)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-warning)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                  formatter={(v: number) => formatBRL(v)}
                />
                <Area
                  type="monotone"
                  dataKey="lucro"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  fill="url(#lp)"
                />
                <Area
                  type="monotone"
                  dataKey="despesas"
                  stroke="var(--color-warning)"
                  strokeWidth={2.5}
                  fill="url(#ld)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-elevated p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold">Despesas por mês</h2>
            <p className="text-xs text-muted-foreground">Distribuição mensal</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={monthlyStats}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                  formatter={(v: number) => formatBRL(v)}
                />
                <Bar dataKey="despesas" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-elevated lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">Últimos veículos cadastrados</h2>
              <p className="text-xs text-muted-foreground">Os 5 mais recentes</p>
            </div>
            <Link
              to="/vehicles"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Ver tudo <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recent.map((v) => {
              const inv = v.purchasePrice + totalExpensesByVehicle(v.id);
              return (
                <li key={v.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/40">
                    <Car className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {v.brand} {v.model}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {v.year} • {v.plate}
                    </p>
                  </div>
                  <StatusBadge status={v.status} />
                  <p className="hidden w-28 text-right text-sm font-semibold tabular-nums sm:block">
                    {formatBRL(inv)}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card-elevated">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">Notificações</h2>
              <p className="text-xs text-muted-foreground">Recentes</p>
            </div>
            <Link to="/notifications" className="text-xs font-medium text-primary hover:underline">
              Ver tudo
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {notifications.slice(0, 4).map((n) => (
              <li key={n.id} className="px-5 py-3">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-muted-foreground/40" : "bg-primary"}`}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{n.description}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {n.date}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
