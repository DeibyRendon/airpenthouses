import AppointmentCalendar from "@/components/reservation/AppointmentCalendar";
import { getReservationSession, getServiceCookie } from "@/app/actions/reservation";
import { redirect } from "next/navigation";

export default async function CalendarPage() {
  const session = await getReservationSession();
  const service = await getServiceCookie();

  if (!session || !service.id || !service.name) {
    redirect("/");
  }

  return (
    <main className="min-h-screen pt-32 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center">
      <div className="w-full max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <AppointmentCalendar 
          reservationId={session.id} 
          guestName={session.guest_name} 
          serviceId={service.id} 
          serviceName={service.name} 
        />
      </div>
    </main>
  );
}
