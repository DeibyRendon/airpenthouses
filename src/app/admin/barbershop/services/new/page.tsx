import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BarberServiceForm from "@/components/admin/BarberServiceForm";

export default function CreateBarberServicePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <nav className="w-full bg-slate-900 text-white p-4 shadow-md flex items-center gap-4">
        <Link href="/admin?tab=barberia" className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold font-sans tracking-tight">Nuevo Servicio de Barbería</h1>
      </nav>

      <div className="max-w-4xl mx-auto p-6 mt-12 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-slate-100 shadow-sm p-10">
        <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-slate-900">Configuración de Servicio VIP</h2>
            <p className="text-slate-500 mt-2">Complete los detalles para ofrecer una nueva experiencia de barbería a sus huéspedes.</p>
        </div>
        <BarberServiceForm />
      </div>
    </main>
  );
}
