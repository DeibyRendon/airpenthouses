import { Star } from "lucide-react";
import { clearReservationSession } from "@/app/actions/reservation";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SuccessPage({ searchParams }: Props) {
  // Securely clear the browser session so the reservation cannot be accessed by going back
  await clearReservationSession();

  const resolvedParams = await searchParams;
  const date = resolvedParams.date as string | undefined;
  const time = resolvedParams.time as string | undefined;

  return (
    <main className="min-h-screen pt-32 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center">
      <div className="w-full max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="w-full text-center py-10">
          <div className="mx-auto bg-green-100 text-green-600 w-20 h-20 flex items-center justify-center rounded-full mb-6 ring-8 ring-green-50">
            <Star className="w-10 h-10 fill-current" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-3">¡Cita Confirmada!</h3>
          <p className="text-slate-600 mb-8 max-w-sm mx-auto leading-relaxed">
            Tu barbero estará listo el <strong className="text-slate-900">{date || 'día agendado'}</strong> a las <strong className="text-slate-900">{time || 'la hora acordada'}</strong>. 
            Te esperamos en el área designada de la residencia.
          </p>
          <Link 
            href="/"
            className="text-blue-900 font-semibold hover:underline bg-blue-50 px-6 py-2.5 rounded-full inline-block"
          >
            Finalizar
          </Link>
        </div>
      </div>
    </main>
  );
}
