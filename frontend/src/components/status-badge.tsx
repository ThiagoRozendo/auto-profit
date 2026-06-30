import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VehicleStatus } from "@/lib/mock-data";
import { statusLabel } from "@/lib/mock-data";

const styles: Record<VehicleStatus, string> = {
  disponivel: "bg-success/15 text-success border-success/30",
  vendido: "bg-info/15 text-info border-info/30",
  manutencao: "bg-warning/15 text-warning border-warning/30",
  reservado: "bg-primary/15 text-primary border-primary/30",
};

export function StatusBadge({ status }: { status: VehicleStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", styles[status])}>
      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel(status)}
    </Badge>
  );
}
