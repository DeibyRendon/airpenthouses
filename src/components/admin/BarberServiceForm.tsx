"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBarberServiceAction, updateBarberServiceAction } from "@/app/actions/barbershop";
import { Loader2, Save, Scissors, DollarSign, Clock } from "lucide-react";

export default function BarberServiceForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      if (isEditing) {
        await updateBarberServiceAction(initialData.id, formData);
      } else {
        await createBarberServiceAction(formData);
      }
      router.push("/admin");
      router.refresh();
    } catch (error) {
      alert("Error guardando servicio");
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Scissors className="w-4 h-4 text-indigo-500" /> Nombre del Servicio
          </label>
          <input
            name="name"
            defaultValue={initialData?.name}
            required
            placeholder="Ej: Corte Premium + Barba"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-indigo-500" /> Precio (COP)
          </label>
          <input
            name="price_cop"
            type="number"
            defaultValue={initialData?.price_cop}
            required
            placeholder="Ej: 100000"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            Descripción del Servicio
          </label>
          <textarea
            name="description"
            defaultValue={initialData?.description}
            required
            placeholder="Describe lo que incluye este servicio para el huésped..."
            rows={4}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" /> Duración Estimada (Minutos)
          </label>
          <select 
            name="duration_minutes" 
            defaultValue={initialData?.duration_minutes || 45}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            {[15, 30, 45, 60, 75, 90, 120].map(m => (
              <option key={m} value={m}>{m} minutos</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isEditing ? "Actualizar Servicio" : "Guardar Servicio"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
