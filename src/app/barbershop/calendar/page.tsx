import AppointmentCalendar from "@/components/reservation/AppointmentCalendar";
import { getReservationSession, getServiceCookie, getBarberServicesAction } from "@/app/actions/reservation";
import { redirect, notFound } from "next/navigation";

export default async function CalendarPage() {
  const session = await getReservationSession();
  const serviceCookie = await getServiceCookie();

  if (!session || !serviceCookie.id) {
    redirect("/");
  }

  // Obtener los detalles completos del servicio desde la base de datos (Admin)
  const allServices = await getBarberServicesAction();
  const selectedService = allServices.find(s => s.id === serviceCookie.id);

  if (!selectedService) {
    // Si el servicio ya no existe o fue desactivado, redirigir al catálogo
    redirect("/barbershop/services");
  }

  return (
    <main className="min-h-screen pt-32 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center">
      <div className="w-full max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <AppointmentCalendar 
          reservationId={session.id} 
          guestName={session.guest_name} 
          service={selectedService}
        />
      </div>
    </main>
  );
}
