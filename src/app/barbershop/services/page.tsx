import ServiceSelector from "@/components/reservation/ServiceSelector";
import { getReservationSession } from "@/app/actions/reservation";
import { redirect } from "next/navigation";

export default async function ServicesPage() {
  const session = await getReservationSession();

  if (!session) {
    redirect("/"); // If there's no secure cookie, boot back to home instantly
  }

  return (
    <main className="min-h-screen pt-32 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center">
      <div className="w-full max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <ServiceSelector guestName={session.guest_name} />
      </div>
    </main>
  );
}
