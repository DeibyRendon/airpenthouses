import ServiceSelector from "@/components/reservation/ServiceSelector";
import { getReservationSession, getActiveBookingsAction, getBarberServicesAction } from "@/app/actions/reservation";
import { redirect } from "next/navigation";
import ActiveBookingCard from "@/components/reservation/ActiveBookingCard";
import { CalendarCheck, PlusCircle } from "lucide-react";

export default async function ServicesPage() {
  const session = await getReservationSession();

  if (!session) {
    redirect("/"); // If there's no secure cookie, boot back to home instantly
  }

  const activeBookings = await getActiveBookingsAction();
  const services = await getBarberServicesAction();
  const hasActive = activeBookings && (activeBookings.barber.length > 0 || activeBookings.tours.length > 0);

  return (
    <main className="min-h-screen pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col gap-12">
      {/* HEADER DE SECCIÓN */}
      <div className="flex flex-col gap-2 border-l-4 border-indigo-600 pl-6 py-2">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Servicios de Barbería</h1>
        <p className="text-lg text-slate-500 max-w-2xl">
          Personaliza tu estilo con nuestros expertos. Revisa tus citas actuales o agenda un nuevo servicio premium.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {/* SECCIÓN PRINCIPAL: NUEVO SERVICIO */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <PlusCircle className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Solicitar Nuevo Servicio</h2>
          </div>
          <div className="w-full bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <ServiceSelector guestName={session.guest_name} services={services} />
          </div>
        </div>

        {/* SECCIÓN INFERIOR: TU AGENDA */}
        {hasActive && (
          <div className="flex flex-col gap-6 pt-12 border-t border-slate-100">
            <div className="flex items-center gap-3 px-2">
              <CalendarCheck className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Tu Agenda de Barbería</h2>
            </div>
            <ActiveBookingCard data={activeBookings} module="barber" />
          </div>
        )}
      </div>
    </main>
  );
}
