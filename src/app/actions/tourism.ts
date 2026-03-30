"use server";
import { createClient } from "@/utils/supabase/server";
import { verifyAdmin } from "@/app/actions/admin";
import { revalidatePath } from "next/cache";

export async function createTourAction(tourData: any, stopsData: any[]) {
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
      max_capacity: Number.parseInt(tourData.max_capacity),
      price: Number.parseFloat(tourData.price)
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
      estimated_duration_minutes: stop.estimated_duration_minutes ? Number.parseInt(stop.estimated_duration_minutes) : null
    }));

    const { error: stopsError } = await supabase
      .from("tour_stops")
      .insert(stopsToInsert);

    if (stopsError) {
      return { error: `El Tour se creó, pero las paradas fallaron: ${stopsError.message}` };
    }
  }

  // Refrescar el caché duro de Next.js para que el dashboard muestre el nuevo Tour inmediatamente
  revalidatePath("/admin");
  
  return { success: true, tourId: tour.id };
}

export async function updateTourAction(tourId: string, tourData: any, stopsData: any[]) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { error: "Operación rechazada." };

  const supabase = await createClient();

  // 1. Actualizar datos base
  console.log("SERVER: Actualizando tour ID:", tourId);
  const { error: tourError, count } = await supabase
    .from("tours")
    .update({
      tour_type: tourData.tour_type,
      name: tourData.name,
      description: tourData.description,
      departure_time: tourData.departure_time,
      arrival_time: tourData.arrival_time,
      max_capacity: Number.parseInt(tourData.max_capacity),
      price: Number.parseFloat(tourData.price)
    }, { count: 'exact' })
    .eq("id", tourId);

  console.log("SERVER: Resultado Update Tour:", { tourError, count });

  if (tourError) return { error: `Error actualizando tour: ${tourError.message}` };
  if (count === 0) return { error: "No se encontró el tour para actualizar o no tienes permisos (RLS)." };

  // 2. Limpiar y refrescar paradas (Enfoque simple y seguro para el orden)
  await supabase.from("tour_stops").delete().eq("tour_id", tourId);

  if (stopsData && stopsData.length > 0) {
    const stopsToInsert = stopsData.map((stop, index) => ({
      tour_id: tourId,
      stop_order: index + 1,
      place_name: stop.place_name,
      is_rest_stop: stop.is_rest_stop,
      estimated_duration_minutes: stop.estimated_duration_minutes ? Number.parseInt(stop.estimated_duration_minutes) : null
    }));

    const { error: stopsError } = await supabase.from("tour_stops").insert(stopsToInsert);
    if (stopsError) return { error: `Tour actualizado pero fallaron las paradas: ${stopsError.message}` };
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
  console.log("SERVER: Eliminando tour ID:", tourId);
  await supabase.from("tour_stops").delete().eq("tour_id", tourId);
  const { error, count } = await supabase.from("tours").delete({ count: 'exact' }).eq("id", tourId);

  console.log("SERVER: Resultado Delete Tour:", { error, count });

  if (error) return { error: `Error eliminando tour: ${error.message}` };
  if (count === 0) return { error: "No se pudo eliminar: El tour no existe o no tienes permisos (RLS)." };

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
