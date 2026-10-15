"use client";

import * as React from "react";
import { LifeBuoyIcon, Loader2Icon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEnviarSoporte } from "@/hooks/use-enviar-soporte";
import { useSesion } from "@/hooks/use-sesion";
import type { TipoSoporte } from "@/lib/types";

const TEXTOS = {
  soporte: {
    titulo: "Soporte",
    descripcion: "Cuéntanos qué no funciona o qué duda tienes. Te responderemos lo antes posible.",
    placeholder: "Describe el problema o tu duda…",
    boton: "Enviar a soporte",
    icono: LifeBuoyIcon,
  },
  feedback: {
    titulo: "Enviar feedback",
    descripcion: "¿Qué mejorarías de esta demo? Tu opinión nos ayuda a priorizar los siguientes pasos.",
    placeholder: "Escribe tu sugerencia…",
    boton: "Enviar sugerencia",
    icono: SendIcon,
  },
} as const;

interface Props {
  tipo: TipoSoporte;
  abierto: boolean;
  onCambiarAbierto: (abierto: boolean) => void;
}

/** Diálogo para dejar un mensaje de soporte o feedback. Guarda el mensaje y avisa a los administradores. */
export function SoporteDialog({ tipo, abierto, onCambiarAbierto }: Props) {
  const t = TEXTOS[tipo];
  const { enviando, enviar } = useEnviarSoporte();
  const { email: emailSesion } = useSesion();
  const [mensaje, setMensaje] = React.useState("");
  const [email, setEmail] = React.useState(emailSesion ?? "");
  const Icono = t.icono;

  const valido = mensaje.trim().length >= 5;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valido) return;
    const contacto = emailSesion ?? (email.trim() || undefined);
    if (await enviar(tipo, mensaje.trim(), contacto)) onCambiarAbierto(false);
  };

  return (
    <Dialog open={abierto} onOpenChange={onCambiarAbierto}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icono className="size-4" />
            </span>
            <DialogTitle>{t.titulo}</DialogTitle>
          </div>
          <DialogDescription className="text-xs">{t.descripcion}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="soporte-mensaje" className="text-xs">
              Mensaje
            </Label>
            <Textarea
              id="soporte-mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder={t.placeholder}
              maxLength={4000}
              rows={5}
              autoFocus
              disabled={enviando}
            />
          </div>

          {emailSesion ? (
            <p className="text-xs text-muted-foreground">
              Responderemos a <span className="font-medium text-foreground">{emailSesion}</span>.
            </p>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="soporte-email" className="text-xs">
                Email de contacto <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <Input id="soporte-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" maxLength={160} disabled={enviando} />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onCambiarAbierto(false)} disabled={enviando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!valido || enviando}>
              {enviando && <Loader2Icon className="mr-1.5 size-4 animate-spin" />}
              {t.boton}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
