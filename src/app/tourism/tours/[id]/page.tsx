import { createClient } from "@/utils/supabase/server";
import { getReservationSession } from "@/app/actions/reservation";
import { redirect } from "next/navigation";
import TourDetailClient from "@/components/tourism/TourDetailClient";

export default async function TourDetailPage({ params }: { readonly params: Promise<{ id: string }> }) {
  const session = await getReservationSession();

  if (!session) {
    redirect("/tourism");
  }

  const resolvedParams = await params;
  const tourId = resolvedParams.id;

  const supabase = await createClient();
  
  // Extraer el Tour con sus fechas disponibles
  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select(`
      *,
      available_dates:tour_available_dates(*)
    `)
    .eq("id", tourId)
    .single();

  if (tourError || !tour) {
    return <div className="p-20 text-center text-red-500">Recorrido no encontrado.</div>;
  }

  // Extraer las Paradas
  const { data: stops } = await supabase
    .from("tour_stops")
    .select("*")
    .eq("tour_id", tourId)
    .order("stop_order", { ascending: true });

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
      <TourDetailClient tour={tour} stops={stops || []} />
    </main>
  );
}
