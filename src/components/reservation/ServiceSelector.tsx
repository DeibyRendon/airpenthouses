"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, CheckCircle, ChevronRight, Loader2 } from "lucide-react";
import styles from "./ServiceSelector.module.css";
import { setServiceCookie } from "@/app/actions/reservation";

export default function ServiceSelector({ guestName }: { guestName: string }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelectService = async (serviceId: string, serviceName: string) => {
    setLoadingId(serviceId);
    
    // Save to secure cookie
    await setServiceCookie(serviceId, serviceName);
    
    // Clean redirect!
    router.push(`/calendar`);
  };

  const services = [
    { id: 'corte', name: 'Corte Premium', time: '45 min', price: '$25' },
    { id: 'barba', name: 'Arreglo de Barba', time: '30 min', price: '$15' },
    { id: 'combo', name: 'Combo Completo (Corte + Barba)', time: '75 min', price: '$35' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.guestBadge}>
        <div className={styles.guestIconWrapper}>
          <CheckCircle className={styles.guestIcon} />
        </div>
        <div>
          <p className={styles.guestLabel}>Huésped Confirmado</p>
          <p className={styles.guestName}>{guestName || 'Reserva Validada'}</p>
        </div>
      </div>

      <h3 className={styles.title}>¿Qué servicio necesitas hoy?</h3>
      
      <div className={styles.serviceList}>
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => handleSelectService(service.id, service.name)}
            disabled={loadingId !== null}
            className={`${styles.serviceButton} ${loadingId !== null ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <div className={styles.serviceButtonContent}>
              <div className={styles.serviceIconWrapper}>
                {loadingId === service.id ? <Loader2 className="animate-spin w-6 h-6" /> : <Scissors className={styles.serviceIcon} />}
              </div>
              <div>
                <p className={styles.serviceName}>{service.name}</p>
                <p className={styles.serviceDetails}>{service.time} • {service.price}</p>
              </div>
            </div>
            {loadingId !== service.id && <ChevronRight className={styles.chevronIcon} />}
          </button>
        ))}
      </div>
    </div>
  );
}
