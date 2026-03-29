import { createClient } from "@/utils/supabase/server";
import { getReservationSession } from "@/app/actions/reservation";
import { redirect } from "next/navigation";
import ToursCatalog from "@/components/tourism/ToursCatalog";

export default async function ToursPage() {
  const session = await getReservationSession();

  if (!session) {
    redirect("/tourism"); // Si no hay cookie segura, botarlo al login de turismo
  }

  const supabase = await createClient();
  const { data: tours, error } = await supabase
    .from("tours")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !tours) {
    return <div className="p-20 text-center text-red-500">Error cargando el catálogo de rutas.</div>;
  }

  return (
    <main className="min-h-screen pt-32 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center">
      <ToursCatalog tours={tours} guestName={session.guest_name} />
    </main>
  );
}
