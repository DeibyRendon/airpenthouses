"use server";
import { createClient } from "@/utils/supabase/server";
import { verifyAdmin } from "@/app/actions/admin";
import { revalidatePath } from "next/cache";
import { Tour, TourStop } from "@/types/tourism";

export async function createTourAction(tourData: Partial<Tour>, stopsData: Partial<TourStop>[], datesData: string[]) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { error: "Operación rechazada. No tienes permisos de Administrador." };

  const supabase = await createClient();

  // 1. Crear el Tour en la tabla principal
  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .insert([{
      tour_type: tourData.tour_type,
      name: tourData.name,
      description: tourData.description,
      departure_time: tourData.departure_time,
      arrival_time: tourData.arrival_time,
      max_capacity: Number.parseInt(tourData.max_capacity as any),
      price: Number.parseFloat(tourData.price as any)
    }])
    .select()
    .single();

  if (tourError || !tour) {
    return { error: `Falló la creación del tour: ${tourError?.message}` };
  }

  // 2. Insertar toda la matriz de paradas si existen
  if (stopsData && stopsData.length > 0) {
    const stopsToInsert = stopsData.map((stop, index) => ({
      tour_id: tour.id,
      stop_order: index + 1,
      place_name: stop.place_name,
      is_rest_stop: stop.is_rest_stop,
      estimated_duration_minutes: stop.estimated_duration_minutes ? Number.parseInt(stop.estimated_duration_minutes as any) : null
    }));

    const { error: stopsError } = await supabase
      .from("tour_stops")
      .insert(stopsToInsert);

    if (stopsError) {
      return { error: `El Tour se creó, pero las paradas fallaron: ${stopsError.message}` };
    }
  }

  // 3. Insertar Fechas Disponibles
  if (datesData && datesData.length > 0) {
    const datesToInsert = datesData.map(date => ({
      tour_id: tour.id,
      available_date: date
    }));

    const { error: datesError } = await supabase.from("tour_available_dates").insert(datesToInsert);
    if (datesError) return { error: `Tour creado pero falló el registro de fechas: ${datesError.message}` };
  }

  // Refrescar el caché duro de Next.js para que el dashboard muestre el nuevo Tour inmediatamente
  revalidatePath("/admin");
  
  return { success: true, tourId: tour.id };
}

export async function updateTourAction(tourId: string, tourData: Partial<Tour>, stopsData: Partial<TourStop>[], datesData: string[]) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { error: "Operación rechazada." };

  const supabase = await createClient();

  // 1. Actualizar datos base
  const { error: tourError, count } = await supabase
    .from("tours")
    .update({
      tour_type: tourData.tour_type,
      name: tourData.name,
      description: tourData.description,
      departure_time: tourData.departure_time,
      arrival_time: tourData.arrival_time,
      max_capacity: Number.parseInt(tourData.max_capacity as any),
      price: Number.parseFloat(tourData.price as any)
    }, { count: 'exact' })
    .eq("id", tourId);

  if (tourError) return { error: `Error actualizando tour: ${tourError.message}` };
  if (count === 0) return { error: "No se encontró el tour o no tienes permisos." };

  // 2. Limpiar y refrescar paradas (Enfoque simple y seguro para el orden)
  await supabase.from("tour_stops").delete().eq("tour_id", tourId);

  if (stopsData && stopsData.length > 0) {
    const stopsToInsert = stopsData.map((stop, index) => ({
      tour_id: tourId,
      stop_order: index + 1,
      place_name: stop.place_name,
      is_rest_stop: stop.is_rest_stop,
      estimated_duration_minutes: stop.estimated_duration_minutes ? Number.parseInt(stop.estimated_duration_minutes as any) : null
    }));

    const { error: stopsError } = await supabase.from("tour_stops").insert(stopsToInsert);
    if (stopsError) return { error: `Tour actualizado pero fallaron las paradas: ${stopsError.message}` };
  }

  // 3. Limpiar y refrescar fechas
  await supabase.from("tour_available_dates").delete().eq("tour_id", tourId);

  if (datesData && datesData.length > 0) {
    const datesToInsert = datesData.map(date => ({
      tour_id: tourId,
      available_date: date
    }));

    const { error: datesError } = await supabase.from("tour_available_dates").insert(datesToInsert);
    if (datesError) return { error: `Tour actualizado pero fallaron las fechas: ${datesError.message}` };
  }

  revalidatePath("/admin");
  revalidatePath(`/tourism/tours/${tourId}`);
  return { success: true };
}

export async function deleteTourAction(tourId: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { error: "Operación rechazada." };

  const supabase = await createClient();

  // Las paradas se borran automáticamente si hay ON DELETE CASCADE, 
  // pero lo hacemos manual por seguridad si no sabemos la config exacta de la DB.
  await supabase.from("tour_stops").delete().eq("tour_id", tourId);
  const { error, count } = await supabase.from("tours").delete({ count: 'exact' }).eq("id", tourId);

  if (error) return { error: `Error eliminando tour: ${error.message}` };
  if (count === 0) return { error: "No se pudo eliminar: El tour no existe o no tienes permisos." };

  revalidatePath("/admin");
  return { success: true };
}

import { getReservationSession } from "./reservation";

export async function bookTourAction(tourId: string, bookingDate: string, passengers: number) {
  const session = await getReservationSession();
  if (!session) return { error: "Sesión expiada. Vuelve al inicio para validar tu reserva." };

  const supabase = await createClient();

  // VALIDACIÓN DE CAPACIDAD
  // 1. Obtener capacidad máxima del tour
  const { data: tour } = await supabase.from("tours").select("max_capacity").eq("id", tourId).single();
  if (!tour) return { error: "Tour no encontrado." };

  // 2. Sumar pasajeros ya reservados para esa fecha
  const { data: booked } = await supabase
    .from("tourism_bookings")
    .select("passenger_count")
    .eq("tour_id", tourId)
    .eq("booking_date", bookingDate);

  const totalBooked = (booked || []).reduce((sum, b) => sum + b.passenger_count, 0);

  // 3. Validar que la fecha elegida sea una de las permitidas por el Administrador
  const { data: isAvailableDate } = await supabase
    .from("tour_available_dates")
    .select("id")
    .eq("tour_id", tourId)
    .eq("available_date", bookingDate)
    .single();

  if (!isAvailableDate) {
    return { error: "Este tour no está programado para la fecha seleccionada." };
  }

  if (totalBooked + passengers > tour.max_capacity) {
    const available = tour.max_capacity - totalBooked;
    return { 
      error: `Lo sentimos, no hay cupos suficientes para esta fecha. Cupos disponibles: ${available > 0 ? available : 'AGOTADO'}` 
    };
  }

  const { error } = await supabase.from("tourism_bookings").insert([{
    reservation_id: session.id,
    tour_id: tourId,
    booking_date: bookingDate,
    passenger_count: passengers
  }]);

  if (error) {
    return { error: `No se pudo confirmar tu asistencia: ${error.message}` };
  }

  return { success: true };
}

export async function getTourAvailabilityAction(tourId: string, bookingDate: string) {
  const supabase = await createClient();

  const { data: tour } = await supabase.from("tours").select("max_capacity").eq("id", tourId).single();
  if (!tour) return { totalBooked: 0, maxCapacity: 0, isFull: false, remaining: 0 };

  const { data: booked } = await supabase
    .from("tourism_bookings")
    .select("passenger_count")
    .eq("tour_id", tourId)
    .eq("booking_date", bookingDate);

  const totalBooked = (booked || []).reduce((sum, b) => sum + b.passenger_count, 0);

  return {
    totalBooked,
    maxCapacity: tour.max_capacity,
    isFull: totalBooked >= tour.max_capacity,
    remaining: tour.max_capacity - totalBooked
  };
}

export async function getAllBookingsAction() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { error: "No autorizado" };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tourism_bookings")
    .select(`
      id,
      booking_date,
      passenger_count,
      tours ( name ),
      reservations ( guest_name )
    `)
    .order("booking_date", { ascending: false });

  if (error) return { error: error.message };
  return { data };
}
