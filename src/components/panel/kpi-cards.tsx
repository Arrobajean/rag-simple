import { AlertTriangleIcon, BanknoteIcon, Building2Icon, CalendarClockIcon, KeyRoundIcon, PercentIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { eur, num, pct } from "@/lib/format";
import type { Resumen } from "@/lib/types";

interface Kpi {
  titulo: string;
  valor: string;
  detalle: string;
  icono: React.ComponentType<{ className?: string }>;
  aviso?: boolean;
}

function kpis(r: Resumen): Kpi[] {
  const i = r.indicadores;
  return [
    { titulo: "Propiedades", valor: num(i.unidades_total), detalle: `${num(i.en_venta)} en venta · ${num(i.disponibles_alquiler)} libres para alquilar`, icono: Building2Icon },
    { titulo: "Ocupación", valor: pct(i.ocupacion_pct), detalle: `${num(i.alquiladas)} alquiladas · ${num(i.en_reforma)} en reforma`, icono: KeyRoundIcon },
    { titulo: "Renta media", valor: eur(i.renta_media), detalle: `${eur(i.facturado_12m)} facturados en 12 meses`, icono: BanknoteIcon },
    { titulo: "Morosidad", valor: pct(i.morosidad_pct), detalle: `${eur(i.impagado)} sin cobrar`, icono: PercentIcon, aviso: (i.morosidad_pct ?? 0) > 3 },
    { titulo: "Vencen en 90 días", valor: num(i.contratos_vencen_90d), detalle: `${num(i.contratos_vencen_30d)} en los próximos 30 días`, icono: CalendarClockIcon },
    { titulo: "Alertas activas", valor: num(r.alertas.total), detalle: `${num(r.documentos)} documentos indexados`, icono: AlertTriangleIcon, aviso: r.alertas.total > 0 },
  ];
}

export function KpiCards({ resumen }: { resumen: Resumen }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {kpis(resumen).map((k) => (
        <Card key={k.titulo} className="shadow-xs">
          <CardContent className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{k.titulo}</p>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">{k.valor}</p>
              <p className="truncate text-xs text-muted-foreground">{k.detalle}</p>
            </div>
            <div className={`rounded-lg p-2 ${k.aviso ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"}`}>
              <k.icono className="size-4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
