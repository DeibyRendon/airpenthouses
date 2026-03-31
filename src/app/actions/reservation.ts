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

  const cookieStore = await cookies();
  cookieStore.set("reservation_session", data.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
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

export async function getActiveBookingsAction() {
  const session = await getReservationSession();
  if (!session) return null;

  const supabase = await createClient();

  // 1. Citas de Barbería (Join con servicios y barberos)
  const { data: barberBookings } = await supabase
    .from("barbershop_appointments")
    .select(`
      *,
      barbershop_services ( name ),
      barbershop_barbers ( name )
    `)
    .eq("reservation_id", session.id)
    .order("appointment_date", { ascending: true });

  // 2. Reservas de Tours
  const { data: tourBookings } = await supabase
    .from("tourism_bookings")
    .select(`
      *,
      tours ( name )
    `)
    .eq("reservation_id", session.id)
    .order("booking_date", { ascending: true });

  return {
    guestName: session.guest_name,
    barber: (barberBookings || []).map(b => ({
       ...b,
       service_type: b.barbershop_services?.name || b.service_type,
       barber_name: b.barbershop_barbers?.name || 'Por asignar'
    })),
    tours: tourBookings || []
  };
}

export async function getBarberServicesAction() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("barbershop_services")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  
  return (data || []).map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    time: `${s.duration_minutes} min`,
    price: new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        maximumFractionDigits: 0 
    }).format(s.price_cop)
  }));
}

export async function getBarberAvailabilityAction(dateStr: string) {
  const supabase = await createClient();
  const date = new Date(dateStr + "T00:00:00");
  const dayOfWeek = date.getDay();

  // 1. Regla de 24h
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  if (date < tomorrow) return [];

  // 2. Obtener barberos activos
  const { data: activeBarbers } = await supabase
    .from("barbershop_barbers")
    .select("id")
    .eq("is_active", true);

  if (!activeBarbers || activeBarbers.length === 0) return [];

  // 3. Obtener turnos manuales
  const { data: manualSlots } = await supabase
    .from("barbershop_availability")
    .select("start_time, barber_id")
    .eq("day_of_week", dayOfWeek)
    .in("barber_id", activeBarbers.map(b => b.id));

  if (!manualSlots || manualSlots.length === 0) return [];

  // 4. Obtener todas las citas
  const { data: allAppointments } = await supabase
    .from("barbershop_appointments")
    .select("appointment_date, barber_id")
    .filter('appointment_date', 'gte', `${dateStr}T00:00:00`)
    .filter('appointment_date', 'lte', `${dateStr}T23:59:59`);

  // Organizar citas por profesional
  const bookedByBarber: Record<string, number[]> = {};
  allAppointments?.forEach(apt => {
    const [h, m] = apt.appointment_date.split("T")[1].substring(0, 5).split(":").map(Number);
    const minutes = h * 60 + m;
    if (!bookedByBarber[apt.barber_id]) bookedByBarber[apt.barber_id] = [];
    bookedByBarber[apt.barber_id].push(minutes);
  });

  // 5. Filtrar disponibilidad con bloqueo de 2 horas
  const availableSet = new Set<string>();

  manualSlots.forEach(slot => {
    const time = slot.start_time.substring(0, 5);
    const [h, m] = time.split(":").map(Number);
    const slotMins = h * 60 + m;
    const barberBookings = bookedByBarber[slot.barber_id] || [];

    const isBlocked = barberBookings.some(bookedMins => {
        const diff = slotMins - bookedMins;
        return diff >= 0 && diff < 120;
    });

    if (!isBlocked) {
        availableSet.add(time);
    }
  });

  return Array.from(availableSet).sort((a, b) => a.localeCompare(b));
}

export async function bookAutoAssignedBarberAction(serviceId: string, appointmentDate: string) {
  const supabase = await createClient();
  const session = await getReservationSession();
  if (!session) return { error: "Sesión no válida." };

  // Obtener el nombre del servicio para satisfacer la restricción NOT NULL de service_type
  const { data: service } = await supabase
    .from("barbershop_services")
    .select("name")
    .eq("id", serviceId)
    .single();

  const serviceName = service?.name || "Servicio General";

  const [dateStr, timeStr] = appointmentDate.split("T");
  const timeOnly = timeStr.substring(0, 5);
  const dayOfWeek = new Date(dateStr + "T00:00:00").getDay();

  // 1. Quién tiene este turno manual hoy
  const { data: configs } = await supabase
    .from("barbershop_availability")
    .select("barber_id")
    .eq("day_of_week", dayOfWeek)
    .eq("start_time", `${timeOnly}:00`);

  if (!configs || configs.length === 0) return { error: "Horario no configurado." };

  // 2. Revisar disponibilidad con bloqueo de 2 horas
  for (const config of configs) {
    const { data: exists } = await supabase
      .from("barbershop_appointments")
      .select("appointment_date")
      .eq("barber_id", config.barber_id)
      .filter('appointment_date', 'gte', `${dateStr}T00:00:00`)
      .filter('appointment_date', 'lte', `${dateStr}T23:59:59`);

    const isReserved = exists?.some(apt => {
        const [h, m] = apt.appointment_date.split("T")[1].substring(0, 5).split(":").map(Number);
        const bookedMins = h * 60 + m;
        const [sh, sm] = timeOnly.split(":").map(Number);
        const slotMins = sh * 60 + sm;
        const diff = slotMins - bookedMins;
        return diff >= 0 && diff < 120;
    });

    if (isReserved) continue;

    // Insertar con service_id y service_type para máxima compatibilidad
    const { error: insertError } = await supabase
      .from("barbershop_appointments")
      .insert({
        reservation_id: session.id,
        service_id: serviceId,
        service_type: serviceName, // Satisfacemos la restricción actual
        barber_id: config.barber_id,
        appointment_date: appointmentDate
      });

    if (insertError) return { error: insertError.message };
    return { success: true, barberId: config.barber_id };
  }

  return { error: "Este turno ya no está disponible." };
}
