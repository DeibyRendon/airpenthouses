"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import styles from "./ReservationGate.module.css";
import { validateReservationAction } from "@/app/actions/reservation";

export default function ReservationGate() {
  const router = useRouter();
  const [reservationInput, setReservationInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleValidateReservation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reservationInput.trim()) return;

    setLoading(true);
    setError("");

    const response = await validateReservationAction(reservationInput.trim());

    setLoading(false);

    if (response?.error) {
      setError(response.error);
      return;
    }

    router.push(`/services`);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Ingresa a tu Reserva</h3>
      <p className={styles.subtitle}>
        Ingresa tu número de reserva (ej. <span className={styles.highlight}>1001</span>) para acceder a los servicios de barbería exclusivos para ti.
      </p>

      <form onSubmit={handleValidateReservation} className={styles.form}>
        <div>
          <label htmlFor="reservationInput" className={styles.fieldLabel}>
            Número de Reserva
          </label>
          <input
            id="reservationInput"
            type="text"
            value={reservationInput}
            onChange={(e) => setReservationInput(e.target.value)}
            placeholder="ID de tu reserva..."
            className={styles.inputField}
            required
          />
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <button
          type="submit"
          disabled={loading || !reservationInput.trim()}
          className={styles.submitBtn}
        >
          {loading ? <Loader2 className={styles.spinner} /> : "Validar Acceso"}
        </button>
      </form>
    </div>
  );
}
