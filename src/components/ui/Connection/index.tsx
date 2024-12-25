"use client";

import { Wifi, WifiOff, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useConnectionStatus } from "./useConnectionStatus";

export function ConnectionBadge() {
  const status = useConnectionStatus();

  // Configuración de estilos y contenido según el estado de conexión
  const badgeProps = (() => {
    switch (status) {
      case "offline":
        return {
          innerClass: "bg-red-500 text-white",
          content: (
            <>
              <WifiOff className="h-4 w-4 " />
              Sin conexión
            </>
          ),
        };
      case "poor":
        return {
          innerClass: "bg-yellow-500 text-white",
          content: (
            <>
              <AlertCircle className="h-4 w-4 " />
              Conexión lenta
            </>
          ),
        };
      case "acceptable":
        return {
          innerClass: "bg-blue-500 text-white",
          content: (
            <>
              <Wifi className="h-4 w-4 " />
              Conexión estable
            </>
          ),
        };
      case "good":
        return {
          innerClass: "bg-emerald-500 text-white",
          content: (
            <>
              <Wifi className="h-4 w-4" />
              Conexión buena
            </>
          ),
        };
      default:
        return {
          innerClass: "bg-gray-500 text-white",
          content: "Desconocido",
        };
    }
  })();

  return (
    <Badge
      className={"fixed bottom-4 px-2 py-1 left-7 gap-2 flex justify-center items-center rounded-lg " + badgeProps.innerClass}
    >
      {badgeProps.content}
    </Badge>
  );
}
