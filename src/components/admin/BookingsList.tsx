"use client";

import { useEffect, useState } from "react";
import { getAllBookingsAction } from "@/app/actions/tourism";
import { Loader2, User, Calendar, MapPin, Users } from "lucide-react";

export default function BookingsList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      const res = await getAllBookingsAction();
      if (res.data) setBookings(res.data);
      setLoading(false);
    }
    fetchBookings();
  }, []);

  if (loading) return (
    <div className="flex justify-center p-12">
        <Loader2 className="animate-spin w-8 h-8 text-blue-900" />
    </div>
  );

  if (bookings.length === 0) return (
    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
        <p className="text-slate-400 italic">No hay reservas de tours registradas aún.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Huésped</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tour / Ruta</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Fecha</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Pax</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-900">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-700">{booking.reservations?.guest_name || 'Desconocido'}</span>
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{booking.tours?.name || 'Tour Eliminado'}</span>
                  </div>
                </td>
                <td className="p-5 text-center">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                     <Calendar className="w-3 h-3" />
                     {booking.booking_date}
                   </div>
                </td>
                <td className="p-5 text-center">
                  <div className="flex items-center justify-center gap-1 font-bold text-blue-900">
                    <Users className="w-4 h-4" />
                    {booking.passenger_count}
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
