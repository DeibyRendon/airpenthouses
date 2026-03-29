"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function validateReservationAction(reservationNumber: string) {
  if (!reservationNumber) return { error: "Número requerido." };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservations")
    .select("id, guest_name")
    .eq("reservation_number", reservationNumber.trim())
    .single();

  if (error || !data) {
    return { error: "Número de reserva no encontrado o inválido." };
  }

  // Create a secure httpOnly cookie with the reservation ID
  const cookieStore = await cookies();
  cookieStore.set("reservation_session", data.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour session
  });

  return { success: true };
}

export async function getReservationSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("reservation_session")?.value;

  if (!sessionId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("reservations")
    .select("id, guest_name")
    .eq("id", sessionId)
    .single();

  return data;
}

export async function clearReservationSession() {
  const cookieStore = await cookies();
  cookieStore.delete("reservation_session");
  // Also delete service if it exists (for completion step)
  cookieStore.delete("selected_service_id");
  cookieStore.delete("selected_service_name");
}

export async function setServiceCookie(id: string, name: string) {
  const cookieStore = await cookies();
  cookieStore.set("selected_service_id", id, { httpOnly: true, path: "/" });
  cookieStore.set("selected_service_name", name, { httpOnly: true, path: "/" });
}

export async function getServiceCookie() {
  const cookieStore = await cookies();
  return {
    id: cookieStore.get("selected_service_id")?.value,
    name: cookieStore.get("selected_service_name")?.value,
  };
}
