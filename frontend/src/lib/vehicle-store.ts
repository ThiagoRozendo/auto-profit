import { useCallback, useEffect, useState } from "react";
import { vehicles as initialVehicles, type Vehicle, type VehicleStatus } from "@/lib/mock-data";

const VEHICLES_STORAGE_KEY = "autoprofit:vehicles";
const VEHICLES_EVENT = "autoprofit:vehicles-updated";

export type VehicleDraft = {
  brand: string;
  model: string;
  year: number;
  plate: string;
  purchasePrice: number;
  status: VehicleStatus;
  notes?: string;
};

function hasStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function makeVehicleId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `v-${crypto.randomUUID()}`;
  }
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeDraft(draft: VehicleDraft): VehicleDraft {
  return {
    ...draft,
    brand: draft.brand.trim(),
    model: draft.model.trim(),
    plate: draft.plate.trim().toUpperCase(),
    notes: draft.notes?.trim() || undefined,
  };
}

export function readVehicleSnapshot(): Vehicle[] {
  if (!hasStorage()) return initialVehicles;

  try {
    const raw = window.localStorage.getItem(VEHICLES_STORAGE_KEY);
    if (!raw) return initialVehicles;

    const parsed = JSON.parse(raw) as Vehicle[];
    return Array.isArray(parsed) ? parsed : initialVehicles;
  } catch {
    return initialVehicles;
  }
}

function writeVehicleSnapshot(nextVehicles: Vehicle[]) {
  if (!hasStorage()) return;

  window.localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(nextVehicles));
  window.dispatchEvent(new CustomEvent(VEHICLES_EVENT));
}

export function useVehicleStore() {
  const [items, setItems] = useState<Vehicle[]>(initialVehicles);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setItems(readVehicleSnapshot());
      setIsReady(true);
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(VEHICLES_EVENT, sync as EventListener);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(VEHICLES_EVENT, sync as EventListener);
    };
  }, []);

  const addVehicle = useCallback((draft: VehicleDraft) => {
    const clean = normalizeDraft(draft);
    const created: Vehicle = {
      ...clean,
      id: makeVehicleId(),
      createdAt: today(),
    };
    const nextVehicles = [created, ...readVehicleSnapshot()];
    writeVehicleSnapshot(nextVehicles);
    return created;
  }, []);

  const updateVehicle = useCallback((id: string, draft: VehicleDraft) => {
    const clean = normalizeDraft(draft);
    const nextVehicles = readVehicleSnapshot().map((vehicle) =>
      vehicle.id === id
        ? {
            ...vehicle,
            ...clean,
            soldAt: clean.status === "vendido" ? (vehicle.soldAt ?? today()) : undefined,
          }
        : vehicle,
    );
    writeVehicleSnapshot(nextVehicles);
    return nextVehicles.find((vehicle) => vehicle.id === id);
  }, []);

  const markVehicleSold = useCallback((id: string) => {
    const nextVehicles = readVehicleSnapshot().map((vehicle) =>
      vehicle.id === id
        ? {
            ...vehicle,
            status: "vendido" as VehicleStatus,
            soldAt: vehicle.soldAt ?? today(),
          }
        : vehicle,
    );
    writeVehicleSnapshot(nextVehicles);
  }, []);

  const removeVehicle = useCallback((id: string) => {
    writeVehicleSnapshot(readVehicleSnapshot().filter((vehicle) => vehicle.id !== id));
  }, []);

  return {
    vehicles: items,
    isReady,
    addVehicle,
    updateVehicle,
    markVehicleSold,
    removeVehicle,
  };
}
