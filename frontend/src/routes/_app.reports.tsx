import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Car, CheckCircle2, DollarSign, Receipt, TrendingUp, Wallet } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { vehicles, expenses, monthlyStats, formatBRL } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({
    meta: [
      { title: "Relatórios — AutoProfit" },
      { name: "description", content: "Dashboard analítico completo da sua operação." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const invest = vehicles.reduce((s, v) => s + v.purchasePrice, 0);
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const lucroEsperado = (invest + totalExp) * 0.18;
  const vendidos = vehicles.filter((v) => v.status === "vendido");
  const lucroReal = vendidos.reduce((s, v) => s + ((v.soldPrice ?? 0) - v.purchasePrice), 0);
  const disponivel = vehicles.filter((v) => v.status === "disponivel").length;

  const byCategory = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const palette = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
    "var(--color-muted-foreground)",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Dashboard analítico da operação</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Total investido" value={formatBRL(invest)} icon={Wallet} />
        <StatCard
          label="Total de despesas"
          value={formatBRL(totalExp)}
          icon={Receipt}
          tone="warning"
        />
        <StatCard
          label="Lucro esperado"
          value={formatBRL(lucroEsperado)}
          icon={DollarSign}
          tone="primary"
        />
        <StatCard
          label="Lucro realizado"
          value={formatBRL(lucroReal)}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Vendidos"
          value={String(vendidos.length)}
          icon={CheckCircle2}
          tone="info"
        />
        <StatCard label="Disponíveis" value={String(disponivel)} icon={Car} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-elevated p-5 lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">Evolução mensal (R$)</h2>
          <div className="h-80">
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
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="despesas"
                  name="Despesas"
                  fill="var(--color-warning)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="lucro"
                  name="Lucro esperado"
                  fill="var(--color-primary)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-elevated p-5">
          <h2 className="mb-4 text-base font-semibold">Despesas por categoria</h2>
          <div className="h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  stroke="var(--color-card)"
                  strokeWidth={2}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                  formatter={(v: number) => formatBRL(v)}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
