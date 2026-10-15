"use client";

import { CargandoPanel, ErrorCarga } from "@/components/panel/estado-carga";
import { PanelVista } from "@/components/panel/panel-vista";
import { usePanelCorredor } from "@/hooks/use-panel-corredor";
import { useResumen } from "@/hooks/use-resumen";

/** Panel de inicio: carga los datos y deja la composición a PanelVista. */
export function PanelResumen() {
  const { datos, loading, error, recargar } = useResumen();
  const corredor = usePanelCorredor();
  if (loading && !datos) return <CargandoPanel />;
  if (error || !datos) return <ErrorCarga mensaje={error ?? "Sin datos"} onReintentar={recargar} />;

  return (
    <PanelVista
      resumen={datos}
      corredor={corredor.datos}
      cargandoCorredor={corredor.loading && !corredor.datos}
      errorCorredor={corredor.error}
      onReintentarCorredor={corredor.recargar}
    />
  );
}
