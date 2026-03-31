import { getBarberAvailabilityAction, getBarbersAction } from "@/app/actions/barbershop";
import { ArrowLeft, Clock, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import BarberAvailabilityForm from "@/components/admin/BarberAvailabilityForm";

export default async function BarberAvailabilityPage({ 
  searchParams 
}: { 
  readonly searchParams: Promise<{ barberId?: string }> 
}) {
  const { barberId } = await searchParams;

  if (!barberId) {
    redirect("/admin/barbershop/barbers");
  }

  // Obtener el nombre del barbero para el encabezado
  const { data: barbers } = await getBarbersAction();
  const barber = barbers?.find(b => b.id === barberId);

  if (!barber) {
    redirect("/admin/barbershop/barbers");
  }

  const availability = await getBarberAvailabilityAction(barberId);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <nav className="w-full bg-slate-900 text-white p-4 shadow-md flex items-center gap-4">
        <Link href="/admin/barbershop/barbers" className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold font-sans tracking-tight">Horario de {barber.name}</h1>
      </nav>

      <div className="max-w-4xl mx-auto p-6 mt-12 mb-20 px-8 py-10 bg-white/40 backdrop-blur-md rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="mb-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 mb-4 border border-slate-200 shadow-sm">
                <User className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Agenda de {barber.name}</h2>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm">
                Configure los días y horas de trabajo específicos para este profesional. Los turnos del cliente se basarán en estos rangos.
            </p>
        </div>
        
        <BarberAvailabilityForm 
          initialData={availability || []} 
          barberId={barberId} 
        />
      </div>
    </main>
  );
}
