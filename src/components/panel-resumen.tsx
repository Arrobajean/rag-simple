"use client";

import { AlertasResumen } from "@/components/panel/alertas-resumen";
import { CargandoBloques, ErrorCarga } from "@/components/panel/estado-carga";
import { KpiCards } from "@/components/panel/kpi-cards";
import { RepartoZonas } from "@/components/panel/reparto-zonas";
import { useResumen } from "@/hooks/use-resumen";

export function PanelResumen() {
  const { datos, loading, error, recargar } = useResumen();
  if (loading && !datos) return <CargandoBloques n={4} />;
  if (error || !datos) return <ErrorCarga mensaje={error ?? "Sin datos"} onReintentar={recargar} />;
  return (
    <div className="space-y-6">
      <KpiCards resumen={datos} />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <RepartoZonas zonas={datos.ocupacionPorZona} />
        <AlertasResumen alertas={datos.alertas} />
      </div>
    </div>
  );
}
