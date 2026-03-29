"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Map, Clock, Users, ArrowRight, CheckCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ToursCatalog({ tours, guestName }: { tours: any[], guestName: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"GROUP" | "PRIVATE">("GROUP");

  const filteredTours = tours.filter(t => t.tour_type === activeTab);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-slate-500 font-medium hover:text-slate-800 flex items-center gap-1 transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" /> Portal Principal
        </Link>
        <div className="bg-green-50 text-green-800 text-sm font-semibold px-4 py-1.5 rounded-full flex items-center gap-2 border border-green-200 shadow-sm">
          <CheckCircle className="w-4 h-4" /> {guestName}
        </div>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Catálogo de Experiencias
        </h2>
        <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
          Selecciona tu modalidad de viaje ideal. Cuidamos cada detalle logístico para garantizar tu confort.
        </p>
      </div>

      {/* Tabs / Pestañas */}
      <div className="flex justify-center mb-12">
        <div className="bg-slate-200/50 p-1.5 rounded-2xl flex gap-2">
          <button 
            onClick={() => setActiveTab("GROUP")}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === "GROUP" ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tours Grupales Premium
          </button>
          <button 
            onClick={() => setActiveTab("PRIVATE")}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === "PRIVATE" ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tours Privados Exclusivos
          </button>
        </div>
      </div>

      {/* Grid de Tours */}
      {filteredTours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map(tour => (
            <div key={tour.id} className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeTab === "PRIVATE" ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-900'}`}>
                    <Map className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-bold text-slate-900">${tour.price} <span className="text-xs text-slate-400 font-medium">USD</span></span>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{tour.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                  {tour.description}
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-slate-600 font-medium bg-slate-50 p-3 rounded-xl">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {tour.departure_time.substring(0, 5)} - {tour.arrival_time.substring(0, 5)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 font-medium bg-slate-50 p-3 rounded-xl">
                    <Users className="w-4 h-4 text-slate-400" />
                    Hasta {tour.max_capacity} Pasajeros
                  </div>
                </div>

                <Link href={`/tourism/tours/${tour.id}`} className="w-full bg-slate-50 text-blue-900 font-bold py-4 rounded-2xl hover:bg-blue-900 hover:text-white transition-colors flex items-center justify-center gap-2 group">
                  Ver Itinerario Completo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <Map className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Catálogo Vacío</h3>
          <p className="text-slate-500">Aún no hay rutas publicadas en esta modalidad.</p>
        </div>
      )}
    </div>
  );
}
