"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getSesion, logout } from "@/lib/api";

export function useSesion() {
  const router = useRouter();
  const [rol, setRol] = React.useState<"gestor" | "admin" | null>(null);

  React.useEffect(() => {
    let cancelado = false;
    getSesion()
      .then((s) => !cancelado && setRol(s.rol))
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

  return { rol, esAdmin: rol === "admin", salir };
}
