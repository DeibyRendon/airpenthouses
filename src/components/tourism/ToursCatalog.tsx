"use client";

import { useState } from "react";
import { Map, Clock, Users, ArrowRight, CheckCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";
import { Tour } from "@/types/tourism";
import styles from "./ToursCatalog.module.css";

export default function ToursCatalog({ tours, guestName }: { readonly tours: Tour[], readonly guestName: string }) {
  const [activeTab, setActiveTab] = useState<"GROUP" | "PRIVATE">("GROUP");

  const filteredTours = tours.filter(t => t.tour_type === activeTab);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <ChevronRight className="w-4 h-4 rotate-180" /> Portal Principal
        </Link>
        <div className={styles.guestBadge}>
          <CheckCircle className="w-4 h-4" /> {guestName}
        </div>
      </div>

      <div className={styles.titleSection}>
        <h2 className={styles.title}>
          Catálogo de Experiencias
        </h2>
        <p className={styles.subtitle}>
          Selecciona tu modalidad de viaje ideal. Cuidamos cada detalle logístico para garantizar tu confort.
        </p>
      </div>

      {/* Tabs / Pestañas */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabsWrapper}>
          <button 
            onClick={() => setActiveTab("GROUP")}
            className={`${styles.tabButton} ${activeTab === "GROUP" ? styles.tabGroupActive : styles.tabInactive}`}
          >
            Tours Grupales Premium
          </button>
          <button 
            onClick={() => setActiveTab("PRIVATE")}
            className={`${styles.tabButton} ${activeTab === "PRIVATE" ? styles.tabPrivateActive : styles.tabInactive}`}
          >
            Tours Privados Exclusivos
          </button>
        </div>
      </div>

      {/* Grid de Tours */}
      {filteredTours.length > 0 ? (
        <div className={styles.grid}>
          {filteredTours.map(tour => (
            <div key={tour.id} className={styles.card}>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div className={`${styles.iconWrapper} ${activeTab === "PRIVATE" ? styles.iconPrivate : styles.iconGroup}`}>
                    <Map className="w-6 h-6" />
                  </div>
                  <span className={styles.price}>
                    {formatCurrency(tour.price)}
                  </span>
                </div>
                
                <h3 className={styles.cardTitle}>{tour.name}</h3>
                <p className={styles.cardDescription}>
                  {tour.description}
                </p>

                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <Clock className={styles.infoIcon} />
                    {tour.departure_time.substring(0, 5)} - {tour.arrival_time.substring(0, 5)}
                  </div>
                  <div className={styles.infoItem}>
                    <Users className={styles.infoIcon} />
                    Hasta {tour.max_capacity} Pasajeros
                  </div>
                </div>

                <Link href={`/tourism/tours/${tour.id}`} className={`${styles.actionButton} group`}>
                  Ver Itinerario Completo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Map className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Catálogo Vacío</h3>
          <p className={styles.emptyMessage}>Aún no hay rutas publicadas en esta modalidad.</p>
        </div>
      )}
    </div>
  );
}
