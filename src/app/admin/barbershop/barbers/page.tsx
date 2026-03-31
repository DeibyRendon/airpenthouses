import { getBarbersAction } from "@/app/actions/barbershop";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import BarbersList from "@/components/admin/BarbersList";

export default async function BarbersManagementPage() {
  const { data: barbers } = await getBarbersAction();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <nav className="w-full bg-slate-900 text-white p-4 shadow-md flex items-center gap-4">
        <Link href="/admin?tab=barberia" className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold font-sans tracking-tight">Gestión de Personal (Barberos)</h1>
      </nav>

      <div className="max-w-6xl mx-auto p-6 mt-12 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-slate-100 shadow-sm p-10">
        <div className="mb-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-900 mb-4 border border-slate-200">
                <Users className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Equipo de Profesionales</h2>
            <p className="text-slate-500 mt-2 max-w-lg mx-auto text-lg">
              Registre a su equipo de barberos aquí para que sus espacios de trabajo se unan en una sola agenda dinámica para el huésped.
            </p>
        </div>
        
        <BarbersList initialBarbers={barbers || []} />
      </div>
    </main>
  );
}
