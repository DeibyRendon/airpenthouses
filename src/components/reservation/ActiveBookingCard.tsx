import { ChevronRight, Calendar, Clock } from "lucide-react";
import styles from "./ActiveBookingCard.module.css";

interface BookingData {
  guestName: string;
  barber: any[];
  tours: any[];
}

export default function ActiveBookingCard({ 
  data, 
  module 
}: { 
  readonly data: BookingData;
  readonly module: "barber" | "tourism";
}) {
  if (!data) return null;

  const showBarber = module === "barber";
  const showTours = module === "tourism";
  
  const hasBookings = (showBarber && data.barber.length > 0) || (showTours && data.tours.length > 0);

  return (
    <div className={styles.cardContainer}>
      <div className={styles.bookingList}>
        {!hasBookings && (
          <p className={styles.emptyState}>No tienes servicios agendados en este módulo aún.</p>
        )}

        {/* Citas de Barbería */}
        {showBarber && data.barber.map((appointment) => (
          <div key={appointment.id} className={styles.bookingItem}>
            <div className={styles.serviceInfo}>
              <span className={styles.serviceType}>Barbería</span>
              <span className={styles.serviceName}>{appointment.service_type}</span>
              
              <div className={styles.metaRow}>
                <div className={styles.metaItem}>
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  <span className={styles.metaText}>
                    {new Date(appointment.appointment_date).toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span className={styles.metaText}>
                    {new Date(appointment.appointment_date).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </div>
        ))}

        {/* Reservas de Tours */}
        {showTours && data.tours.map((tour) => (
          <div key={tour.id} className={styles.bookingItem}>
            <div className={styles.serviceInfo}>
              <span className={styles.serviceType} style={{ color: '#10b981', borderLeftColor: '#10b981' }}>Turismo</span>
              <span className={styles.serviceName}>{tour.tours?.name || "Tour"}</span>
              
              <div className={styles.metaRow}>
                <div className={styles.metaItem}>
                  <Calendar className="w-3 h-3 text-emerald-500" />
                  <span className={styles.metaText}>
                    {new Date(tour.booking_date + "T00:00:00").toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <Clock className="w-3 h-3 text-emerald-500" />
                  <span className={styles.metaText}>TODO EL DÍA</span>
                </div>
              </div>
              
              {tour.passenger_count > 1 && (
                <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100 pt-1">
                  {tour.passenger_count} Pasajeros
                </div>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
