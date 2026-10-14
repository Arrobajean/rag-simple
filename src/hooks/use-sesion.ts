"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getSesion, logout } from "@/lib/api";

type Rol = "gestor" | "admin" | "visitante" | null;

interface Sesion {
  rol: Rol;
  abierto: boolean;
  esAdmin: boolean;
  /** Nombre y foto del usuario que ha iniciado sesión (solo LinkedIn los aporta). */
  nombre: string | null;
  conFoto: boolean;
  salir: () => Promise<void>;
}

const SesionContext = React.createContext<Sesion | null>(null);

/** Consulta /api/auth/me una sola vez para todo el panel (antes cada componente hacía su propia petición). */
export function useSesionProvider(): Sesion {
  const router = useRouter();
  const [estado, setEstado] = React.useState<{ rol: Rol; abierto: boolean; nombre: string | null; conFoto: boolean }>({ rol: null, abierto: true, nombre: null, conFoto: false });

  React.useEffect(() => {
    let cancelado = false;
    getSesion()
      .then((s) => {
        if (!cancelado) setEstado({ rol: s.rol, abierto: s.abierto, nombre: s.nombre, conFoto: s.conFoto });
      })
      .catch(() => undefined);
    return () => {
      cancelado = true;
    };
  }, []);

  const salir = React.useCallback(async () => {
    await logout().catch(() => undefined);
    router.push("/login");
    router.refresh();
  }, [router]);

  return React.useMemo(() => ({ ...estado, esAdmin: estado.rol === "admin", salir }), [estado, salir]);
}

export const SesionProviderContext = SesionContext;

export function useSesion(): Sesion {
  const s = React.useContext(SesionContext);
  if (!s) throw new Error("useSesion debe usarse dentro de SesionProvider");
  return s;
}
