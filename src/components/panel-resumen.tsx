"use client";

import { CargandoPanel, ErrorCarga } from "@/components/panel/estado-carga";
import { GraficaCobros } from "@/components/panel/grafica-cobros";
import { HoyCard } from "@/components/panel/hoy-card";
import { KpiCards } from "@/components/panel/kpi-cards";
import { PanelCabecera } from "@/components/panel/panel-cabecera";
import { usePanelCorredor } from "@/hooks/use-panel-corredor";
import { useResumen } from "@/hooks/use-resumen";
import { indicadoresPanel } from "@/lib/panel";

/** Panel de inicio: qué hacer hoy, cómo va la cartera y cómo se cobra. En escritorio cabe en una pantalla. */
export function PanelResumen() {
  const { datos, loading, error, recargar } = useResumen();
  const corredor = usePanelCorredor();
  if (loading && !datos) return <CargandoPanel />;
  if (error || !datos) return <ErrorCarga mensaje={error ?? "Sin datos"} onReintentar={recargar} />;

  const riesgo = corredor.datos?.riesgo ?? null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PanelCabecera />
      <KpiCards indicadores={indicadoresPanel(datos, riesgo)} />
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <HoyCard
          agenda={corredor.datos?.agenda ?? null}
          cargando={corredor.loading && !corredor.datos}
          error={corredor.error}
          onReintentar={corredor.recargar}
        />
        <GraficaCobros serie={datos.serieCobros} />
      </div>
    </div>
  );
}
