"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Calendar, Clock, ArrowLeft, Info, BadgeDollarSign, Timer } from "lucide-react";
import { clearReservationSession, bookAutoAssignedBarberAction, getBarberAvailabilityAction } from "@/app/actions/reservation";
import styles from "./AppointmentCalendar.module.css";

interface BarberService {
  id: string;
  name: string;
  description: string;
  price: string;
  time: string;
}

export default function AppointmentCalendar({
  reservationId,
  service,
}: {
  readonly reservationId: string;
  readonly service: BarberService;
}) {
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");

  // Fetch slots whenever the date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate) return;
      setLoadingSlots(true);
      setSelectedTime(null);
      const slots = await getBarberAvailabilityAction(selectedDate);
      setAvailableSlots(slots);
      setLoadingSlots(false);
    }
    fetchSlots();
  }, [selectedDate]);

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) return;
    
    setLoading(true);
    setError("");
    
    const appointmentTimestamp = `${selectedDate}T${selectedTime}:00`;

    const result = await bookAutoAssignedBarberAction(service.id, appointmentTimestamp);

    if (result.error) {
      setLoading(false);
      setError(result.error);
      return;
    }

    await clearReservationSession();
    setLoading(false);
    router.push(`/barbershop/success?date=${selectedDate}&time=${selectedTime}`);
  };

  // Generate the next 7 days starting from tomorrow
  const upcomingDays = useMemo(() => {
    const days = [];
    const start = new Date();
    start.setDate(start.getDate() + 1);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        dayName: d.toLocaleDateString('es-ES', { weekday: 'short' }),
        dateStr: d.toISOString().split('T')[0],
        dayNumber: d.getDate()
      });
    }
    return days;
  }, []);

  return (
    <div className={styles.container}>
      <button 
        className={`${styles.homeLink} group`} 
        onClick={() => router.push("/barbershop/services")}
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Regresar al Catálogo
      </button>

      {/* FICHA DINÁMICA DEL SERVICIO (DE ADMIN) */}
      <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-4">
        <div className="flex justify-between items-start">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{service.name}</h3>
            <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl font-bold text-sm shadow-md shadow-indigo-100">
                {service.price}
            </span>
        </div>
        
        {service.description && (
            <p className="text-slate-500 text-sm italic leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                {service.description}
            </p>
        )}

        <div className="flex items-center gap-6 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Timer className="w-4 h-4" /> Duración: {service.time}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <BadgeDollarSign className="w-4 h-4" /> Pago en Penthouse
            </div>
        </div>
      </div>

      <h3 className={styles.title}>Selecciona tu momento</h3>
      <p className={styles.subtitle}>Elige la fecha y hora de tu preferencia según la disponibilidad.</p>
      
      <div className={styles.calendarBox}>
        <label className={styles.sectionLabel}>
          <Calendar className={styles.sectionIcon} /> Calendario de Citas
        </label>
        <div className={styles.daysGrid}>
          {upcomingDays.map((day) => (
            <button
              key={day.dateStr}
              onClick={() => setSelectedDate(day.dateStr)}
              className={`${styles.dayBtnBase} ${selectedDate === day.dateStr ? styles.dayBtnActive : styles.dayBtnInactive}`}
            >
              <div className={styles.dayName}>{day.dayName}</div>
              <div className={styles.dayNumber}>{day.dayNumber}</div>
            </button>
          ))}
        </div>

        <label className={styles.sectionLabel}>
          <Clock className={styles.sectionIcon} /> Turnos Programados
        </label>
        
        {loadingSlots ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
          </div>
        ) : (
          <div className={styles.hoursGrid}>
            {selectedDate && availableSlots.length > 0 ? (
              availableSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`${styles.hourBtnBase} ${selectedTime === time ? styles.hourBtnActive : styles.hourBtnInactive}`}
                >
                  {time}
                </button>
              ))
            ) : (
              <div className="col-span-full text-center py-12 px-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium italic">
                  {selectedDate 
                    ? "Lo sentimos, no hay turnos disponibles para este día." 
                    : "Selecciona una fecha arriba para ver los turnos."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            {error}
        </div>
      )}

      <button
        onClick={handleBookAppointment}
        disabled={!selectedDate || !selectedTime || loading}
        className={styles.submitBtn}
      >
        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Confirmar Cita VIP"}
      </button>
    </div>
  );
}

function XCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
    );
}
