"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createTourAction, updateTourAction } from "@/app/actions/tourism";

interface TourFormProps {
  initialData?: {
    id?: string;
    tour_type: string;
    name: string;
    description: string;
    departure_time: string;
    arrival_time: string;
    max_capacity: number | string;
    price: number | string;
  };
  initialStops?: any[];
  isEdit?: boolean;
}

export default function TourForm({ initialData, initialStops, isEdit = false }: TourFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [tour, setTour] = useState({
    tour_type: initialData?.tour_type || "PRIVATE",
    name: initialData?.name || "",
    description: initialData?.description || "",
    departure_time: initialData?.departure_time?.substring(0, 5) || "09:00",
    arrival_time: initialData?.arrival_time?.substring(0, 5) || "14:00",
    max_capacity: initialData?.max_capacity?.toString() || "4",
    price: initialData?.price?.toString() || "150"
  });

  const [stops, setStops] = useState(initialStops || [{ place_name: "", is_rest_stop: false, estimated_duration_minutes: "15" }]);

  const handleAddStop = () => {
    setStops([...stops, { place_name: "", is_rest_stop: false, estimated_duration_minutes: "30" }]);
  };

  const handleRemoveStop = (index: number) => {
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
  };

  const updateStop = (index: number, field: string, value: any) => {
    const newStops = [...stops] as any;
    newStops[index][field] = value;
    setStops(newStops);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tour.name) return setError("El nombre del tour es obligatorio.");
    
    setLoading(true);
    setError("");

    // Verify stops validity
    const validStops = stops.filter(s => s.place_name.trim() !== "");

    let response;
    if (isEdit && initialData?.id) {
        response = await updateTourAction(initialData.id, tour, validStops);
    } else {
        response = await createTourAction(tour, validStops);
    }

    if (response.error) {
      setError(response.error);
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 font-medium">{error}</div>}
      
      {/* SECCIÓN 1: Datos Base */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">
            {isEdit ? "Editar Detalles del Recorrido" : "Detalles Técnicos del Recorrido"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Modalidad</label>
            <select 
              className="w-full p-4 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 outline-none transition-all"
              value={tour.tour_type} 
              onChange={e => setTour({...tour, tour_type: e.target.value})}
            >
              <option value="PRIVATE">Tour Privado y Personalizado (Transporte Exclusivo)</option>
              <option value="GROUP">Tour Grupal por Rutas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de la Ruta/Tour</label>
            <input 
              type="text" 
              required
              placeholder="Ej: Ruta Botero y Cultura"
              className="w-full p-4 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 outline-none transition-all"
              value={tour.name} 
              onChange={e => setTour({...tour, name: e.target.value})}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción General</label>
          <textarea 
             rows={3}
             className="w-full p-4 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 outline-none transition-all"
             value={tour.description} 
             onChange={e => setTour({...tour, description: e.target.value})}
          ></textarea>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Hora Salida</label>
            <input type="time" required className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white outline-none" value={tour.departure_time} onChange={e => setTour({...tour, departure_time: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Hora Llegada</label>
            <input type="time" required className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white outline-none" value={tour.arrival_time} onChange={e => setTour({...tour, arrival_time: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Max. Personas</label>
            <input type="number" required min="1" className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white outline-none" value={tour.max_capacity} onChange={e => setTour({...tour, max_capacity: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Precio (COP)</label>
            <input type="number" required min="0" step="0.01" className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white outline-none" value={tour.price} onChange={e => setTour({...tour, price: e.target.value})} />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Puntos de Interés / Paradas */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800">Lugares de Interés (Ruta)</h2>
          <button type="button" onClick={handleAddStop} className="text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg font-semibold flex gap-2 items-center text-sm transition-colors">
            <Plus className="w-4 h-4" /> Añadir Lugar
          </button>
        </div>

        <div className="space-y-4">
          {stops.map((stop, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                {index + 1}
              </div>
              
              <div className="flex-1 w-full">
                <input 
                  type="text" 
                  placeholder="Nombre del Lugar (Ej: Museo Antioquia)" 
                  className="w-full p-3 border border-slate-300 rounded-xl"
                  value={stop.place_name}
                  onChange={e => updateStop(index, 'place_name', e.target.value)}
                  required
                />
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                <input 
                  type="checkbox" 
                  id={`rest_${index}`}
                  className="w-5 h-5 rounded text-blue-900 focus:ring-blue-900 cursor-pointer"
                  checked={stop.is_rest_stop}
                  onChange={e => {
                    const isChecked = e.target.checked;
                    updateStop(index, 'is_rest_stop', isChecked);
                    // Si se desmarca, podemos resetear o limpiar el valor si lo prefieres,
                    // pero por ahora solo lo ocultamos visualmente como pediste.
                  }}
                />
                <label htmlFor={`rest_${index}`} className="text-sm font-semibold text-slate-600 whitespace-nowrap mr-2 cursor-pointer select-none">Parada de Descanso</label>
              </div>

              {stop.is_rest_stop && (
                <div className="w-full md:w-32 animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="30" 
                      title="Minutos de estancia"
                      className="w-full p-3 border border-slate-300 rounded-xl text-center bg-white font-bold text-blue-900"
                      value={stop.estimated_duration_minutes}
                      onChange={e => updateStop(index, 'estimated_duration_minutes', e.target.value)}
                    />
                    <span className="absolute -top-5 left-0 w-full text-[10px] font-bold text-slate-400 uppercase text-center">Minutos</span>
                  </div>
                </div>
              )}

              {stops.length > 1 && (
                <button type="button" onClick={() => handleRemoveStop(index)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {stops.length === 0 && <p className="text-slate-500 italic">No hay paradas configuradas. Este tour será un recorrido panorámico sin detenciones.</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-900 text-white p-5 rounded-2xl font-bold text-lg hover:bg-blue-800 transition-all flex justify-center items-center shadow-xl shadow-blue-900/20 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (isEdit ? "Guardar Cambios" : "Guardar e Inyectar en Servidor")}
      </button>

    </form>
  );
}
