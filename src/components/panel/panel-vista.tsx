import { ConsultasHoy } from "@/components/panel/consultas-hoy";
import { CruceKanban } from "@/components/panel/cruce-kanban";
import { GraficaCobros } from "@/components/panel/grafica-cobros";
import { HoyCard } from "@/components/panel/hoy-card";
import { KpiCards } from "@/components/panel/kpi-cards";
import { PanelCabecera } from "@/components/panel/panel-cabecera";
import { RiesgoKanban } from "@/components/panel/riesgo-kanban";
import { Skeleton } from "@/components/ui/skeleton";
import { indicadoresPanel, tramosRiesgo } from "@/lib/panel";
import type { PanelCorredor, Resumen } from "@/lib/types";

interface PanelVistaProps {
  resumen: Resumen;
  corredor: PanelCorredor | null;
  cargandoCorredor: boolean;
  errorCorredor: string | null;
  onReintentarCorredor: () => void;
}

/** Composición del panel de inicio: cifras y consultas arriba; debajo, lo que hay que hacer y el cruce de cartera. Ocupa la pantalla sin scroll. */
export function PanelVista({ resumen, corredor, cargandoCorredor, errorCorredor, onReintentarCorredor }: PanelVistaProps) {
  const riesgo = corredor?.riesgo ?? null;
  const oportunidades = corredor?.oportunidades ?? null;
  const serie = resumen.serieCobros && resumen.serieCobros.length > 1 ? resumen.serieCobros : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PanelCabecera />
      <KpiCards indicadores={indicadoresPanel(resumen, riesgo)} />
      <ConsultasHoy />
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <HoyCard agenda={corredor?.agenda ?? null} cargando={cargandoCorredor} error={errorCorredor} onReintentar={onReintentarCorredor} />
        <div className="flex min-h-0 flex-col gap-4">
          {riesgo && <RiesgoKanban tramos={tramosRiesgo(riesgo)} />}
          {serie && <GraficaCobros serie={serie} className="min-h-0 flex-1" />}
          {oportunidades && <CruceKanban datos={oportunidades} className="min-h-0 flex-1" />}
          {cargandoCorredor && !oportunidades && <Skeleton className="min-h-0 flex-1" />}
        </div>
      </div>
    </div>
  );
}
