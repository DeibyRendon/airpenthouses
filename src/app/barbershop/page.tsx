import ReservationGate from "@/components/reservation/ReservationGate";
import Link from "next/link";
import { ArrowLeft, Scissors } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-900 selection:text-white">
      {/* Header Premium (Alineado con Portal Principal) */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h1 className="text-2xl tracking-tight text-slate-800 font-light">
              <strong className="font-extrabold text-slate-900">AIR</strong>PENTHOUSES <span className="text-slate-300 font-light mx-2">|</span> <span className="text-blue-900 font-medium">Barber</span>
            </h1>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-900 transition-colors bg-slate-100 hover:bg-blue-50 px-4 py-2 rounded-full">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-slate-200">
          <Scissors className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight max-w-2xl">
          El mejor Grooming,<br/>en tu Penthouse.
        </h2>
        <p className="text-lg text-slate-500 mb-12 max-w-xl leading-relaxed">
          Nuestros barberos premium están a tu disposición. Ingresa tu número de reserva para acceder al calendario privado.
        </p>

        {/* Flujo Dinámico de Agendamiento */}
        <div className="w-full max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <ReservationGate />
        </div>
      </section>

      {/* Footer minimalista */}
      <footer className="w-full bg-slate-900 py-12 text-center mt-12">
        <p className="text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} AirPenthouses. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}
