export type VehicleStatus = "disponivel" | "vendido" | "manutencao" | "reservado";

export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  purchasePrice: number;
  status: VehicleStatus;
  notes?: string;
  createdAt: string;
  soldPrice?: number;
  soldAt?: string;
};

export type ExpenseCategory =
  | "Manutenção"
  | "Documentação"
  | "Peças"
  | "Transporte"
  | "Limpeza"
  | "Outros";

export type Expense = {
  id: string;
  vehicleId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
};

export type Notification = {
  id: string;
  type: "despesa_alta" | "veiculo_vendido" | "veiculo_parado" | "info";
  title: string;
  description: string;
  date: string;
  read: boolean;
};

export const vehicles: Vehicle[] = [
  { id: "v1", brand: "Toyota", model: "Corolla XEi", year: 2020, plate: "ABC-1D23", purchasePrice: 78000, status: "disponivel", createdAt: "2025-04-12", notes: "Único dono, revisões em dia." },
  { id: "v2", brand: "Honda", model: "Civic EXL", year: 2019, plate: "DEF-4G56", purchasePrice: 92000, status: "disponivel", createdAt: "2025-05-02" },
  { id: "v3", brand: "Hyundai", model: "HB20 Comfort", year: 2021, plate: "GHI-7J89", purchasePrice: 54000, status: "vendido", createdAt: "2025-02-18", soldPrice: 68500, soldAt: "2025-05-30" },
  { id: "v4", brand: "Chevrolet", model: "Onix LTZ", year: 2022, plate: "JKL-0M12", purchasePrice: 62000, status: "disponivel", createdAt: "2025-05-21" },
  { id: "v5", brand: "Volkswagen", model: "T-Cross Highline", year: 2021, plate: "MNO-3P45", purchasePrice: 105000, status: "manutencao", createdAt: "2025-03-11" },
  { id: "v6", brand: "Jeep", model: "Renegade Sport", year: 2020, plate: "PQR-6S78", purchasePrice: 89000, status: "reservado", createdAt: "2025-06-01" },
  { id: "v7", brand: "Fiat", model: "Pulse Drive", year: 2023, plate: "STU-9V01", purchasePrice: 73000, status: "vendido", createdAt: "2025-01-09", soldPrice: 89000, soldAt: "2025-04-20" },
  { id: "v8", brand: "Renault", model: "Kwid Zen", year: 2022, plate: "VWX-2Y34", purchasePrice: 45000, status: "disponivel", createdAt: "2025-05-28" },
];

export const expenses: Expense[] = [
  { id: "e1", vehicleId: "v1", category: "Manutenção", description: "Revisão geral + troca de óleo", amount: 1450, date: "2025-04-20" },
  { id: "e2", vehicleId: "v1", category: "Limpeza", description: "Polimento e higienização", amount: 380, date: "2025-04-22" },
  { id: "e3", vehicleId: "v2", category: "Documentação", description: "Transferência DETRAN", amount: 920, date: "2025-05-08" },
  { id: "e4", vehicleId: "v2", category: "Peças", description: "Pastilhas de freio + filtros", amount: 760, date: "2025-05-15" },
  { id: "e5", vehicleId: "v3", category: "Manutenção", description: "Suspensão dianteira", amount: 2100, date: "2025-03-02" },
  { id: "e6", vehicleId: "v3", category: "Documentação", description: "Licenciamento anual", amount: 230, date: "2025-03-10" },
  { id: "e7", vehicleId: "v4", category: "Transporte", description: "Guincho leilão SP", amount: 680, date: "2025-05-25" },
  { id: "e8", vehicleId: "v5", category: "Peças", description: "Câmbio – kit de reparo", amount: 4200, date: "2025-04-02" },
  { id: "e9", vehicleId: "v5", category: "Manutenção", description: "Mão de obra mecânica", amount: 1800, date: "2025-04-12" },
  { id: "e10", vehicleId: "v6", category: "Limpeza", description: "Detalhamento premium", amount: 540, date: "2025-06-03" },
  { id: "e11", vehicleId: "v7", category: "Documentação", description: "Transferência + IPVA", amount: 1500, date: "2025-02-04" },
  { id: "e12", vehicleId: "v7", category: "Peças", description: "Pneus novos x4", amount: 2800, date: "2025-02-18" },
  { id: "e13", vehicleId: "v8", category: "Outros", description: "Anúncio destaque", amount: 220, date: "2025-06-05" },
];

export const notifications: Notification[] = [
  { id: "n1", type: "despesa_alta", title: "Despesa acima do limite", description: "VW T-Cross • Câmbio – kit de reparo: R$ 4.200,00", date: "2025-06-18", read: false },
  { id: "n2", type: "veiculo_vendido", title: "Venda registrada", description: "Hyundai HB20 vendido por R$ 68.500,00", date: "2025-05-30", read: false },
  { id: "n3", type: "veiculo_parado", title: "Veículo parado no estoque", description: "Jeep Renegade está há 90+ dias sem movimentação", date: "2025-06-10", read: true },
  { id: "n4", type: "info", title: "Novo relatório mensal disponível", description: "Resumo de maio/2025 pronto para visualização", date: "2025-06-01", read: true },
  { id: "n5", type: "despesa_alta", title: "Despesa acima do limite", description: "Fiat Pulse • Pneus novos x4: R$ 2.800,00", date: "2025-02-18", read: true },
];

export const monthlyStats = [
  { month: "Jan", despesas: 4300, lucro: 9800 },
  { month: "Fev", despesas: 5100, lucro: 12400 },
  { month: "Mar", despesas: 6800, lucro: 14200 },
  { month: "Abr", despesas: 7500, lucro: 18600 },
  { month: "Mai", despesas: 6200, lucro: 21300 },
  { month: "Jun", despesas: 3100, lucro: 11800 },
];

export function totalExpensesByVehicle(vehicleId: string) {
  return expenses.filter((e) => e.vehicleId === vehicleId).reduce((s, e) => s + e.amount, 0);
}

export function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function statusLabel(s: VehicleStatus) {
  return { disponivel: "Disponível", vendido: "Vendido", manutencao: "Manutenção", reservado: "Reservado" }[s];
}
