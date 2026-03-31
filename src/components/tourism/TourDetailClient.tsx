"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Clock, Users, ArrowLeft, Loader2, MapPin, Coffee } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";
import { Tour, TourStop } from "@/types/tourism";
import { bookTourAction, getTourAvailabilityAction } from "@/app/actions/tourism";
import styles from "./TourDetailClient.module.css";

export default function TourDetailClient({ tour, stops }: { readonly tour: Tour, readonly stops: TourStop[] }) {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [dateStr, setDateStr] = useState("");
  const [availability, setAvailability] = useState<{ totalBooked: number, maxCapacity: number, isFull: boolean, remaining: number } | null>(null);

  // Efecto para verificar disponibilidad cuando cambie la fecha
  const checkAvailability = async (date: string) => {
    if (!date) return;
    const res = await getTourAvailabilityAction(tour.id, date);
    setAvailability(res);
  };

  const handleBooking = async (e: FormEvent) => {
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
    <div className={styles.container}>
      {/* Columna Izquierda: Itinerario */}
      <div className={styles.leftColumn}>
        <Link href="/tourism/tours" className={styles.backLink}>
          <ArrowLeft className="w-5 h-5" /> Regresar al Catálogo
        </Link>
        
        <div className={styles.itineraryCard}>
          <div className={styles.tourBadgeWrapper}>
            <span className={`${styles.tourBadge} ${tour.tour_type === 'PRIVATE' ? styles.tourBadgePrivate : styles.tourBadgeGroup}`}>
              Tour {tour.tour_type === 'PRIVATE' ? 'Privado' : 'Grupal'}
            </span>
          </div>
          
          <h1 className={styles.tourTitle}>
            {tour.name}
          </h1>
          <p className={styles.tourDescription}>
            {tour.description}
          </p>

          <h3 className={styles.itineraryTitle}>
            <MapPin className="text-blue-900 w-6 h-6" /> Itinerario de Paradas
          </h3>
          
          <div className={styles.itineraryTimeline}>
            {/* Parada de Salida Fija */}
            <div className="relative">
              <div className={`${styles.timelineDot} ${styles.timelineDotPrimary}`} />
              <h4 className={styles.stopTitle}>Punto de Recogida (Penthouse)</h4>
              <p className={`${styles.stopInfo} ${styles.stopInfoPrimary}`}><Clock className="w-4 h-4"/> Salida: {tour.departure_time.substring(0, 5)}</p>
            </div>

            {/* Paradas Dinámicas */}
            {stops.map((stop, i) => (
              <div key={stop.id} className="relative">
                <div className={`${styles.stopDot} ${stop.is_rest_stop ? styles.stopDotRest : styles.stopDotNormal}`} />
                <h4 className={styles.stopTitle}>{stop.place_name}</h4>
                {stop.is_rest_stop && (
                  <p className={styles.restStopBadge}>
                    <Coffee className="w-3.5 h-3.5" /> Parada de Descanso / Esparcimiento ({stop.estimated_duration_minutes || '?'} min)
                  </p>
                )}
              </div>
            ))}

            {/* Llegada Fija */}
            <div className="relative">
              <div className={`${styles.timelineDot} ${styles.timelineDotSecondary}`} />
              <h4 className={styles.stopTitle}>Retorno Asegurado (Penthouse)</h4>
              <p className={`${styles.stopInfo} ${styles.stopInfoSecondary}`}><Clock className="w-4 h-4"/> Llegada Aproximada: {tour.arrival_time.substring(0, 5)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Reserva */}
      <div className={styles.rightColumn}>
        <div className={styles.bookingCard}>
          <div className={styles.priceSection}>
            <h3 className={styles.priceLabel}>Inversión Final</h3>
            <div className={styles.priceValue}>
              {formatCurrency(tour.price)}
            </div>
            {tour.tour_type === 'PRIVATE' && <p className={styles.priceNote}>Precio global por la van/vehículo privado.</p>}
          </div>

          <form onSubmit={handleBooking} className={styles.bookingForm}>
            <div className={styles.fieldGroup}>
              <label htmlFor="booking-date" className={styles.fieldLabel}>Fecha del Recorrido</label>
              {tour.available_dates && tour.available_dates.length > 0 ? (
                <div className={styles.selectWrapper}>
                  <Clock className={styles.selectIcon} />
                  <select 
                    id="booking-date"
                    required
                    value={dateStr}
                    onChange={e => {
                        setDateStr(e.target.value);
                        checkAvailability(e.target.value);
                    }}
                    className={styles.selectField}
                  >
                    <option value="">Selecciona un día programado...</option>
                    {[...tour.available_dates]
                      .sort((a, b) => a.available_date.localeCompare(b.available_date))
                      .map(d => (
                        <option key={d.id} value={d.available_date}>
                          {new Date(d.available_date + "T00:00:00").toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long',
                            year: 'numeric'
                          })}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm border border-amber-200">
                  No hay fechas programadas para este tour en este momento.
                </div>
              )}
            </div>

            {availability && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 border ${
                    availability.isFull 
                        ? "bg-red-50 text-red-600 border-red-100" 
                        : "bg-green-50 text-green-700 border-green-100"
                }`}>
                    <Users className="w-4 h-4" />
                    {availability.isFull 
                        ? "ESTADO: AGOTADO PARA ESTA FECHA" 
                        : `ESTADO: DISPONIBLE (${availability.remaining} cupos libres)`}
                </div>
            )}

            <div className={styles.fieldGroup}>
              <label htmlFor="pax-select" className={styles.fieldLabel}>Número de Turistas</label>
              <div className={styles.selectWrapper}>
                <Users className={styles.selectIcon} />
                <select 
                  id="pax-select"
                  value={passengers}
                  onChange={e => setPassengers(Number(e.target.value))}
                  className={styles.selectField}
                >
                  {Array.from({ length: tour.max_capacity }).map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} Pasajero{i > 0 && 's'}</option>
                  ))}
                </select>
                <div className={styles.selectBadge}>
                  (Máx. {tour.max_capacity})
                </div>
              </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button 
              type="submit" 
              disabled={loading || availability?.isFull}
              className={`${styles.submitButton} ${(availability?.isFull) ? 'opacity-50 grayscale cursor-not-allowed text-slate-400' : ''}`}
            >
              {loading ? (
                <Loader2 className="animate-spin text-blue-900 w-6 h-6" />
              ) : availability?.isFull ? (
                "Sin Cupos Disponibles"
              ) : (
                "Confirmar Experiencia"
              )}
            </button>
            <p className={styles.formFooter}>
              Pago anticipado cargado al balance de su habitación tras validación ocular de identidades.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
