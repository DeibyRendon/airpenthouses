"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Calendar, Clock } from "lucide-react";
import { clearReservationSession } from "@/app/actions/reservation";
import styles from "./AppointmentCalendar.module.css";

export default function AppointmentCalendar({
  reservationId,
  guestName,
  serviceId,
  serviceName,
}: {
  reservationId: string;
  guestName: string;
  serviceId: string;
  serviceName: string;
}) {
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) return;
    
    setLoading(true);
    
    const appointmentTimestamp = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();

    const { error: insertError } = await supabase
      .from("barbershop_appointments")
      .insert({
        reservation_id: reservationId,
        service_type: serviceName || serviceId,
        appointment_date: appointmentTimestamp,
      });

    if (insertError) {
      setLoading(false);
      setError("Hubo un problema guardando la cita. Intenta de nuevo.");
      return;
    }

    // Securely clear the session via Server Action before redirecting
    await clearReservationSession();

    setLoading(false);
    router.push(`/barbershop/success?date=${selectedDate}&time=${selectedTime}`);
  };

  const upcomingDays = useMemo(() => {
    const days = [];
    for (let i = 1; i <= 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        dayName: d.toLocaleDateString('es-ES', { weekday: 'short' }),
        dateStr: d.toISOString().split('T')[0],
        dayNumber: d.getDate()
      });
    }
    return days;
  }, []);

  const timeSlots = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

  return (
    <div className={styles.container}>
      <button className={styles.homeLink} onClick={() => router.push("/barbershop")}>Volver al inicio</button>

      <h3 className={styles.title}>Elige fecha y hora</h3>
      <p className={styles.subtitle}>Has seleccionado <span className={styles.selectedService}>{serviceName}</span></p>
      
      <div className={styles.calendarBox}>
        <label className={styles.sectionLabel}>
          <Calendar className={styles.sectionIcon} /> Días Disponibles
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
          <Clock className={styles.sectionIcon} /> Horas Disponibles
        </label>
        <div className={styles.hoursGrid}>
          {timeSlots.map((time) => {
            const isActive = selectedTime === time;
            const isDisabled = !selectedDate;
            let stateClass = styles.hourBtnInactive;
            if (isDisabled) {
              stateClass = styles.hourBtnDisabled;
            } else if (isActive) {
              stateClass = styles.hourBtnActive;
            }

            return (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                disabled={isDisabled}
                className={`${styles.hourBtnBase} ${stateClass}`}
              >
                {time}
              </button>
            )
          })}
        </div>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      <button
        onClick={handleBookAppointment}
        disabled={!selectedDate || !selectedTime || loading}
        className={styles.submitBtn}
      >
        {loading ? <Loader2 className={styles.spinner} /> : "Confirmar Cita"}
      </button>
    </div>
  );
}
