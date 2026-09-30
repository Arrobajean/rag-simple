import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectNativoProps extends Omit<React.ComponentProps<"select">, "onChange"> {
  opciones: readonly (readonly [string, string])[];
  placeholder?: string;
  onChange: (valor: string) => void;
}

/** Select nativo con el estilo de los inputs: accesible, ligero y sin dependencias. */
export function SelectNativo({ opciones, placeholder, onChange, className, value, ...props }: SelectNativoProps) {
  return (
    <select
      {...props}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:[&>option]:bg-popover",
        className
      )}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {opciones.map(([v, etiqueta]) => (
        <option key={v} value={v}>
          {etiqueta}
        </option>
      ))}
    </select>
  );
}
