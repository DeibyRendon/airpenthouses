import { MapPin, CalendarCheck } from "lucide-react";
import Link from "next/link";
import SessionClearer from "@/components/tourism/SessionClearer";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TourismSuccessPage({ searchParams }: { readonly searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // Clear the session so the flow is highly secure 
  // Wait Next15 searchParams resolution
  const resolvedParams = await searchParams;
  const tourName = resolvedParams.tour as string || "tu recorrido";
  const date = resolvedParams.date as string || "el día seleccionado";
  const pax = resolvedParams.pax as string || "1";

  // Nota: La sesión se limpia de forma segura mediante el componente <SessionClearer />
  // en lugar de llamar directamente a clearReservationSession() en el servidor para evitar errores.

  return (
    <main className="min-h-screen pt-32 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center selection:bg-blue-900 selection:text-white">
      <SessionClearer />
      <div className="w-full max-w-xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-900 via-blue-600 to-slate-900"></div>

        <div className="w-full text-center py-6">
          <div className="mx-auto bg-green-50 text-green-600 w-24 h-24 flex items-center justify-center rounded-full mb-8 ring-8 ring-green-50/50 shadow-inner">
            <CalendarCheck className="w-12 h-12" />
          </div>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">¡Equipaje Listo!</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed text-lg">
            Tu reserva para <strong className="text-slate-900">{tourName}</strong> ha sido confirmada con éxito.
          </p>

          <div className="flex flex-col gap-3 bg-slate-50 p-6 rounded-2xl mb-10 text-left border border-slate-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Fecha Asignada</span>
              <span className="text-slate-900 font-bold">{date}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Turistas Cubiertos</span>
              <span className="text-slate-900 font-bold">{pax} personas</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Recogida</span>
              <span className="text-slate-900 font-bold flex items-center gap-1"><MapPin className="w-3 h-3"/> Lobby del Penthouse</span>
            </div>
          </div>

          <Link 
            href="/"
            className="text-white bg-slate-900 font-bold hover:bg-slate-800 transition-colors px-8 py-4 rounded-xl inline-block shadow-lg w-full"
          >
            Finalizar Operación
          </Link>
        </div>
      </div>
    </main>
  );
}
