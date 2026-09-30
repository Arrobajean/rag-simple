"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getSesion, logout } from "@/lib/api";

export function useSesion() {
  const router = useRouter();
  const [rol, setRol] = React.useState<"gestor" | "admin" | null>(null);
  const [abierto, setAbierto] = React.useState(true);

  React.useEffect(() => {
    let cancelado = false;
    getSesion()
      .then((s) => {
        if (cancelado) return;
        setRol(s.rol);
        setAbierto(s.abierto);
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

  return { rol, abierto, esAdmin: rol === "admin", salir };
}
