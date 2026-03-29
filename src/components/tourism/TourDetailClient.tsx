"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Users, ArrowLeft, Loader2, MapPin, Coffee, ArrowRight } from "lucide-react";
import Link from "next/link";
import { bookTourAction } from "@/app/actions/tourism";

export default function TourDetailClient({ tour, stops }: { tour: any, stops: any[] }) {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [dateStr, setDateStr] = useState("");

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr) return setError("Por favor, selecciona una fecha para tu viaje.");
    
    setLoading(true);
    setError("");

    const response = await bookTourAction(tour.id, dateStr, passengers);

    setLoading(false);

    if (response.error) {
      setError(response.error);
    } else {
      router.push(`/tourism/success?tour=${encodeURIComponent(tour.name)}&date=${dateStr}&pax=${passengers}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Columna Izquierda: Itinerario */}
      <div className="flex-1 space-y-6">
        <Link href="/tourism/tours" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-900 font-semibold transition-colors bg-white px-5 py-2.5 rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5" /> Regresar al Catálogo
        </Link>
        
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${tour.tour_type === 'PRIVATE' ? 'bg-slate-900 text-white' : 'bg-blue-100 text-blue-900'}`}>
              Tour {tour.tour_type === 'PRIVATE' ? 'Privado' : 'Grupal'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight line-clamp-2">
            {tour.name}
          </h1>
          <p className="text-lg text-slate-500 mb-10 leading-relaxed">
            {tour.description}
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <MapPin className="text-blue-900 w-6 h-6" /> Itinerario de Paradas
          </h3>
          
          <div className="relative border-l-2 border-slate-200 ml-5 space-y-10 pl-8 pb-4">
            {/* Parada de Salida Fija */}
            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-5 h-5 bg-blue-900 rounded-full ring-4 ring-white" />
              <h4 className="text-lg font-bold text-slate-900">Punto de Recogida (Penthouse)</h4>
              <p className="text-sm font-semibold text-blue-600 mt-1 flex items-center gap-2"><Clock className="w-4 h-4"/> Salida: {tour.departure_time.substring(0, 5)}</p>
            </div>

            {/* Paradas Dinámicas */}
            {stops.map((stop, i) => (
              <div key={stop.id} className="relative">
                <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full ring-4 ring-white border-[3px] ${stop.is_rest_stop ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-300'}`} />
                <h4 className="text-lg font-bold text-slate-800">{stop.place_name}</h4>
                {stop.is_rest_stop && (
                  <p className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 mt-2 px-3 py-1 rounded-full border border-amber-200">
                    <Coffee className="w-3.5 h-3.5" /> Parada de Descanso / Esparcimiento ({stop.estimated_duration_minutes || '?'} min)
                  </p>
                )}
              </div>
            ))}

            {/* Llegada Fija */}
            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-5 h-5 bg-slate-900 rounded-full ring-4 ring-white" />
              <h4 className="text-lg font-bold text-slate-900">Retorno Asegurado (Penthouse)</h4>
              <p className="text-sm font-semibold text-slate-600 mt-1 flex items-center gap-2"><Clock className="w-4 h-4"/> Llegada Aproximada: {tour.arrival_time.substring(0, 5)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Reserva */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sticky top-24 shadow-2xl shadow-blue-900/10">
          <div className="mb-8">
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2">Inversión Final</h3>
            <div className="text-5xl font-extrabold flex items-baseline gap-2">
              ${tour.price} <span className="text-xl font-medium text-slate-500">USD</span>
            </div>
            {tour.tour_type === 'PRIVATE' && <p className="text-xs text-blue-400 mt-2">Precio global por la van/vehículo privado.</p>}
          </div>

          <form onSubmit={handleBooking} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Fecha del Recorrido</label>
              <input 
                type="date" 
                required
                min={new Date().toISOString().split("T")[0]}
                value={dateStr}
                onChange={e => setDateStr(e.target.value)}
                className="w-full p-4 bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white color-scheme-dark"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Número de Turistas</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <select 
                  value={passengers}
                  onChange={e => setPassengers(Number(e.target.value))}
                  className="w-full p-4 pl-12 bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white appearance-none"
                >
                  {Array.from({ length: tour.max_capacity }).map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} Pasajero{i > 0 && 's'}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs font-semibold">
                  (Máx. {tour.max_capacity})
                </div>
              </div>
            </div>

            {error && <div className="bg-red-900/50 text-red-200 text-sm font-medium p-3 rounded-xl border border-red-800">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-slate-900 p-5 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all flex justify-center items-center shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin text-blue-900 w-6 h-6" /> : "Confirmar Experiencia"}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
              Pago anticipado cargado al balance de su habitación tras validación ocular de identidades.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
