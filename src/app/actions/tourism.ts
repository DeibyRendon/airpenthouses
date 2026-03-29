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
      max_capacity: parseInt(tourData.max_capacity),
      price: parseFloat(tourData.price)
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
      estimated_duration_minutes: stop.estimated_duration_minutes ? parseInt(stop.estimated_duration_minutes) : null
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

import { getReservationSession } from "./reservation";

export async function bookTourAction(tourId: string, bookingDate: string, passengers: number) {
  const session = await getReservationSession();
  if (!session) return { error: "Sesión expiada. Vuelve al inicio para validar tu reserva." };

  const supabase = await createClient();

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
