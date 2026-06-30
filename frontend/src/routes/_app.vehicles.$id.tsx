import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/vehicles/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Veículo ${params.id} — AutoProfit` }],
  }),
  component: VehicleLayout,
});

function VehicleLayout() {
  return <Outlet />;
}
