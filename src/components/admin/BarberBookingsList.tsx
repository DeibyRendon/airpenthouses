"use client";

import { useEffect, useState } from "react";
import { getAllBarberAppointmentsAction } from "@/app/actions/barbershop";
import { Loader2, User, Calendar, Clock, Scissors } from "lucide-react";
import { formatCurrency } from "@/utils/format";

export default function BarberBookingsList() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      const res = await getAllBarberAppointmentsAction();
      if (res.data) setAppointments(res.data);
      setLoading(false);
    }
    fetchAppointments();
  }, []);

  if (loading) return (
    <div className="flex justify-center p-12">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
    </div>
  );

  if (appointments.length === 0) return (
    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
        <p className="text-slate-400 italic">No hay citas de barbería registradas aún.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Huésped</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Servicio</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Fecha</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-700">{apt.reservations?.guest_name || 'Desconocido'}</span>
                  </div>
                </td>
                <td className="p-5 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full text-xs font-bold text-indigo-700 border border-indigo-100">
                    <Scissors className="w-3 h-3" />
                    {apt.service_type || apt.barbershop_services?.name || 'Corte'}
                  </div>
                </td>
                <td className="p-5 text-center font-bold text-slate-600">
                   <div className="inline-flex items-center gap-2 border border-slate-200 px-3 py-1 rounded-lg">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(apt.appointment_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                   </div>
                </td>
                <td className="p-5 text-center font-bold text-indigo-600">
                  <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    {new Date(apt.appointment_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
