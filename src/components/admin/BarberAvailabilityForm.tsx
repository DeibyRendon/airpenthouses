"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBarberAvailabilityAction } from "@/app/actions/barbershop";
import { Loader2, Save, Clock, Plus, X, Copy, CheckCircle2, AlertCircle } from "lucide-react";

export default function BarberAvailabilityForm({ 
  initialData, 
  barberId 
}: { 
  readonly initialData: Record<number, string[]>; 
  readonly barberId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<Record<number, string[]>>(initialData);
  const [newTimes, setNewTimes] = useState<Record<number, string>>({
    0: "09:00", 1: "09:00", 2: "09:00", 3: "09:00", 4: "09:00", 5: "09:00", 6: "09:00"
  });
  const [error, setError] = useState<string | null>(null);

  const daysLabels = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  const handleAddTime = (day: number) => {
    const timeToAdd = newTimes[day];
    const currentTimes = availability[day] || [];

    // Validar regla de 2 horas (120 minutos)
    const timeToMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const newMinutes = timeToMinutes(timeToAdd);
    const hasConflict = currentTimes.some(t => {
      const diff = Math.abs(newMinutes - timeToMinutes(t));
      return diff < 120;
    });

    if (hasConflict) {
      setError(`Conflicto en ${daysLabels[day]}: Debe haber al menos 2 horas entre turnos.`);
      setTimeout(() => setError(null), 4000);
      return;
    }

    if (currentTimes.includes(timeToAdd)) return;

    const updated = [...currentTimes, timeToAdd].sort();
    setAvailability({ ...availability, [day]: updated });
  };

  const handleRemoveTime = (day: number, time: string) => {
    const updated = availability[day].filter(t => t !== time);
    setAvailability({ ...availability, [day]: updated });
  };

  const handleCopyMonday = () => {
    const mondaySlots = availability[1] || [];
    const newAvailability = { ...availability };
    [0, 2, 3, 4, 5, 6].forEach(day => {
      newAvailability[day] = [...mondaySlots];
    });
    setAvailability(newAvailability);
  };

  async function handleSave() {
    setLoading(true);
    try {
      await updateBarberAvailabilityAction(barberId, availability);
      router.push("/admin/barbershop/barbers");
      router.refresh();
    } catch (error) {
      console.error("Error saving availability:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <AlertCircle className="w-6 h-6" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button 
          onClick={handleCopyMonday}
          className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm"
        >
          <Copy className="w-4 h-4" /> Copiar horarios del Lunes a todos los días
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {daysLabels.map((label, dayIndex) => (
          <div key={label} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${availability[dayIndex]?.length > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <h3 className="text-xl font-black text-slate-800">{label}</h3>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <input 
                  type="time" 
                  value={newTimes[dayIndex]}
                  onChange={(e) => setNewTimes({ ...newTimes, [dayIndex]: e.target.value })}
                  className="bg-transparent border-none outline-none font-bold text-slate-700 px-2"
                />
                <button 
                  onClick={() => handleAddTime(dayIndex)}
                  className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {availability[dayIndex]?.length > 0 ? (
                availability[dayIndex].map(time => (
                  <div key={time} className="group relative bg-indigo-50 text-indigo-700 px-4 py-3 rounded-2xl font-bold flex items-center gap-3 border border-indigo-100 transition-all hover:pr-10">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>{time}</span>
                    <button 
                      onClick={() => handleRemoveTime(dayIndex, time)}
                      className="absolute right-2 opacity-0 group-hover:opacity-100 bg-white text-red-500 p-1.5 rounded-lg shadow-sm hover:bg-red-50 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm italic py-2">Sin turnos asignados para este día.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-10 sticky bottom-8">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-6 rounded-[2.5rem] font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50 text-xl"
        >
          {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <><CheckCircle2 className="w-6 h-6" /> Guardar Turnos de la Semana</>}
        </button>
      </div>
    </div>
  );
}
