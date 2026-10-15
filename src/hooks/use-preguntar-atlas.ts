"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useChatAcciones } from "@/components/chat-provider";

/** Envía una pregunta al asistente y abre el chat para verla. La conversación vive en el layout, así que sobrevive al cambio de pantalla. */
export function usePreguntarAtlas() {
  const { send } = useChatAcciones();
  const router = useRouter();
  return React.useCallback(
    (pregunta: string) => {
      send(pregunta);
      router.push("/dashboard/chat");
    },
    [send, router]
  );
}
