import { createClient } from "@/utils/supabase/server";
import { getReservationSession, getActiveBookingsAction } from "@/app/actions/reservation";
import { redirect } from "next/navigation";
import ToursCatalog from "@/components/tourism/ToursCatalog";
import ActiveBookingCard from "@/components/reservation/ActiveBookingCard";
import { CalendarCheck, Map } from "lucide-react";

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

  const activeBookings = await getActiveBookingsAction();
  const hasActive = activeBookings && (activeBookings.barber.length > 0 || activeBookings.tours.length > 0);

  return (
    <main className="min-h-screen pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col gap-12">
      {/* HEADER DE SECCIÓN */}
      <div className="flex flex-col gap-2 border-l-4 border-emerald-600 pl-6 py-2">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Experiencias y Tours</h1>
        <p className="text-lg text-slate-500 max-w-2xl">
          Explora lo mejor de la ciudad con nuestros recorridos exclusivos. Gestiona tus tours activos o reserva una nueva aventura.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {/* SECCIÓN PRINCIPAL: CATÁLOGO */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <Map className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Explorar Catálogo de Experiencias</h2>
          </div>
          <ToursCatalog tours={tours} guestName={session.guest_name} />
        </div>

        {/* SECCIÓN INFERIOR: TU AGENDA */}
        {hasActive && (
          <div className="flex flex-col gap-6 pt-12 border-t border-slate-100">
            <div className="flex items-center gap-3 px-2">
              <CalendarCheck className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Tus Recorridos Programados</h2>
            </div>
            <ActiveBookingCard data={activeBookings} module="tourism" />
          </div>
        )}
      </div>
    </main>
  );
}
