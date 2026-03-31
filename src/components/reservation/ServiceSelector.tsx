"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, CheckCircle, ArrowRight, ChevronRight, Loader2, Clock } from "lucide-react";
import styles from "./ServiceSelector.module.css";
import { setServiceCookie } from "@/app/actions/reservation";

export default function ServiceSelector({ 
  guestName, 
  services 
}: { 
  readonly guestName: string;
  readonly services: { 
    id: string; 
    name: string; 
    description: string;
    time: string; 
    price: string 
  }[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelectService = async (serviceId: string, serviceName: string) => {
    setLoadingId(serviceId);
    
    // Save to secure cookie
    await setServiceCookie(serviceId, serviceName);
    
    // Clean redirect!
    router.push(`/barbershop/calendar`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.push("/")}>
          <ChevronRight className="rotate-180 w-4 h-4 mr-1 inline" /> Portal Principal
        </button>
        
        <div className={styles.guestBadge}>
          <CheckCircle className="w-4 h-4" /> {guestName || 'Huésped'}
        </div>
      </div>

      <h3 className={styles.title}>¿Qué servicio necesitas hoy?</h3>
      
      <div className={styles.serviceList}>
        {services.map((service) => (
          <div key={service.id} className={styles.serviceCard}>
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <div className={styles.serviceIconWrapper}>
                  {loadingId === service.id ? <Loader2 className="animate-spin w-6 h-6" /> : <Scissors className="w-6 h-6" />}
                </div>
                <div className={styles.priceTag}>{service.price}</div>
              </div>
              
              <h3 className={styles.serviceName}>{service.name}</h3>
              <p className={styles.serviceDescription}>{service.description}</p>
              
              <div className={styles.metaInfo}>
                <Clock className="w-3 h-3" /> {service.time} • Atención VIP
              </div>
              
              <button
                onClick={() => handleSelectService(service.id, service.name)}
                disabled={loadingId !== null}
                className={styles.actionButton}
              >
                {loadingId === service.id ? "Procesando..." : "Reservar Servicio"} 
                {loadingId !== service.id && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
