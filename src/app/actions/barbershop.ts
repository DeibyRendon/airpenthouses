"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// --- SERVICIOS ---

export async function getBarberServicesAction() {
  const supabase = await createClient();
  return await supabase
    .from("barbershop_services")
    .select("*")
    .order("created_at", { ascending: true });
}

export async function createBarberServiceAction(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price_cop = Number.parseInt(formData.get("price_cop") as string);
  const duration_minutes = Number.parseInt(formData.get("duration_minutes") as string);

  const { error } = await supabase
    .from("barbershop_services")
    .insert({ name, description, price_cop, duration_minutes });

  if (error) throw new Error(error.message);
  
  revalidatePath("/admin");
  revalidatePath("/barbershop/services");
}

export async function updateBarberServiceAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price_cop = Number.parseInt(formData.get("price_cop") as string);
  const duration_minutes = Number.parseInt(formData.get("duration_minutes") as string);

  const { error } = await supabase
    .from("barbershop_services")
    .update({ name, description, price_cop, duration_minutes })
    .eq("id", id);

  if (error) throw new Error(error.message);
  
  revalidatePath("/admin");
  revalidatePath("/barbershop/services");
}

export async function deleteBarberServiceAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("barbershop_services")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  
  revalidatePath("/admin");
}

// --- DISPONIBILIDAD (TURNOS MANUALES) ---

export async function getBarberAvailabilityAction(barberId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from("barbershop_availability")
    .select("*");
  
  if (barberId) {
    query = query.eq("barber_id", barberId);
  }

  const { data } = await query.order("day_of_week", { ascending: true }).order("start_time", { ascending: true });

  // Agrupar por día de la semana para facilitar el uso en el frontend
  const grouped: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  data?.forEach(item => {
    grouped[item.day_of_week].push(item.start_time.substring(0, 5));
  });

  return grouped;
}

export async function updateBarberAvailabilityAction(barberId: string, availabilityGroups: Record<number, string[]>) {
  const supabase = await createClient();
  
  // 1. Limpiar turnos antiguos para este barbero
  await supabase
    .from("barbershop_availability")
    .delete()
    .eq("barber_id", barberId);
  
  // 2. Preparar nuevas filas (un registro por cada turno individual)
  const rows = [];
  for (const day in availabilityGroups) {
    const dayInt = Number.parseInt(day);
    for (const time of availabilityGroups[day]) {
      // Calcular fin del turno (2 horas después) para cumplir la regla de negocio
      // y evitar errores de restricción NOT NULL en la DB.
      const [h, m] = time.split(":").map(Number);
      const endH = (h + 2) % 24;
      const endTime = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

      rows.push({
        barber_id: barberId,
        day_of_week: dayInt,
        start_time: `${time}:00`,
        end_time: endTime,
        is_active: true
      });
    }
  }

  if (rows.length > 0) {
    const { error } = await supabase
      .from("barbershop_availability")
      .insert(rows);

    if (error) throw new Error(error.message);
  }
  
  revalidatePath("/admin");
  revalidatePath("/barbershop/calendar");
}

// --- BARBEROS (COLABORADORES) ---

export async function getBarbersAction() {
  const supabase = await createClient();
  return await supabase
    .from("barbershop_barbers")
    .select("*")
    .order("created_at", { ascending: true });
}

export async function createBarberAction(name: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("barbershop_barbers")
    .insert({ name });

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateBarberAction(id: string, name: string, is_active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("barbershop_barbers")
    .update({ name, is_active })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteBarberAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("barbershop_barbers")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

// --- RESERVAS ---

export async function getAllBarberAppointmentsAction() {
  const supabase = await createClient();
  return await supabase
    .from("barbershop_appointments")
    .select(`
      *,
      reservations (guest_name),
      barbershop_services (name),
      barbershop_barbers (name)
    `)
    .order("appointment_date", { ascending: false });
}
