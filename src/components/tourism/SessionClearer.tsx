"use client";

import { useEffect } from "react";
import { clearReservationSession } from "@/app/actions/reservation";

/**
 * Componente utilitario que permite borrar la sesión de reserva
 * de forma segura desde el cliente una vez completado el flujo.
 * Esto evita el error de Next.js al intentar modificar cookies
 * durante el renderizado del servidor.
 */
export default function SessionClearer() {
  useEffect(() => {
    const clearSession = async () => {
      try {
        await clearReservationSession();
      } catch (err) {
        console.error("Error clearing session:", err);
      }
    };
    
    clearSession();
  }, []);

  return null;
}
