"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Calendar, Scissors, CheckCircle, ChevronRight, Clock, Star } from "lucide-react";

export default function ReservationFlow() {
  const [step, setStep] = useState(1);
  const [reservationInput, setReservationInput] = useState("");
  const [reservation, setReservation] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleValidateReservation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reservationInput.trim()) return;

    setLoading(true);
    setError("");

    const { data, err } = await supabase
      .from("reservations")
      .select("*")
      .eq("reservation_number", reservationInput.trim())
      .single();

    setLoading(false);

    if (err || !data) {
      setError("Número de reserva no encontrado o inválido.");
      return;
    }

    setReservation(data);
    setStep(2);
  };

  const handleSelectService = (service: any) => {
    setSelectedService(service);
    setStep(3);
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) return;
    
    setLoading(true);
    
    // Convert to mock ISO string for the db
    const appointmentTimestamp = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();

    const { error: insertError } = await supabase
      .from("barbershop_appointments")
      .insert({
        reservation_id: reservation.id,
        service_type: selectedService.name,
        appointment_date: appointmentTimestamp,
      });

    setLoading(false);

    if (insertError) {
      setError("Hubo un problema guardando la cita. Intenta de nuevo.");
      return;
    }

    setStep(4);
  };

  // Generate some mock upcoming days
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

  // --- Step 1: Validate Reservation ---
  if (step === 1) {
    return (
      <div className="w-full text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Ingresa a tu Reserva</h3>
        <p className="text-sm text-slate-500 mb-6">
          Ingresa tu número de reserva (ej. <span className="font-semibold text-slate-700">1001</span>) para acceder a los servicios de barbería exclusivos para ti.
        </p>

        <form onSubmit={handleValidateReservation} className="space-y-5">
          <div>
            <label htmlFor="reservationInput" className="block text-sm font-semibold text-slate-700 mb-1">
              Número de Reserva
            </label>
            <input
              id="reservationInput"
              type="text"
              value={reservationInput}
              onChange={(e) => setReservationInput(e.target.value)}
              placeholder="ID de tu reserva..."
              className="w-full p-4 text-lg font-medium border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-900/10 focus:border-blue-900 outline-none transition-all placeholder:font-normal bg-white"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
          <button
            type="submit"
            disabled={loading || !reservationInput.trim()}
            className="w-full bg-blue-900 text-white p-4 rounded-xl font-semibold hover:bg-blue-800 hover:shadow-lg hover:-translate-y-0.5 transition-all flex justify-center items-center disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Validar Acceso"}
          </button>
        </form>
      </div>
    );
  }

  // --- Step 2: Select Service ---
  if (step === 2) {
    return (
      <div className="w-full text-left animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="bg-blue-100 text-blue-900 p-2.5 rounded-full ring-4 ring-white shadow-sm">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Huésped Confirmado</p>
            <p className="text-lg font-bold text-slate-800">{reservation.guest_name}</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-800 mb-6">¿Qué servicio necesitas hoy?</h3>
        
        <div className="space-y-4">
          {[
            { id: 'corte', name: 'Corte Premium', time: '45 min', price: '$25' },
            { id: 'barba', name: 'Arreglo de Barba', time: '30 min', price: '$15' },
            { id: 'combo', name: 'Combo Completo (Corte + Barba)', time: '75 min', price: '$35' },
          ].map((service) => (
            <button
              key={service.id}
              onClick={() => handleSelectService(service)}
              className="w-full flex items-center justify-between p-5 border-2 border-slate-100 bg-white rounded-2xl hover:border-blue-900 hover:bg-blue-50/30 transition-all text-left group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-5">
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-900 text-slate-500 transition-colors">
                  <Scissors className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg group-hover:text-blue-900 transition-colors">{service.name}</p>
                  <p className="font-medium text-slate-500 text-sm mt-0.5">{service.time} • {service.price}</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-900 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Step 3: Calendar & Finalize ---
  if (step === 3) {
    return (
      <div className="w-full text-left animate-in fade-in slide-in-from-right-4 duration-500">
        <button onClick={() => setStep(2)} className="text-sm text-slate-500 hover:text-blue-900 mb-4 font-medium flex items-center gap-1">
          <ChevronRight className="w-4 h-4 rotate-180" /> Volver a servicios
        </button>

        <h3 className="text-2xl font-bold text-slate-800 mb-1">Elige fecha y hora</h3>
        <p className="text-sm text-slate-500 mb-6">Has seleccionado <span className="font-semibold text-slate-700">{selectedService.name}</span></p>
        
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-900" /> Días Disponibles
          </label>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {upcomingDays.map((day) => (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                className={`p-3 rounded-xl border text-center transition-all ${selectedDate === day.dateStr ? 'bg-blue-900 border-blue-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'}`}
              >
                <div className="text-xs uppercase font-semibold opacity-70 mb-1">{day.dayName}</div>
                <div className="text-xl font-bold">{day.dayNumber}</div>
              </button>
            ))}
          </div>

          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-900" /> Horas Disponibles
          </label>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                disabled={!selectedDate}
                className={`p-2.5 rounded-xl border text-center font-semibold transition-all text-sm
                  ${!selectedDate ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400' : 
                   selectedTime === time ? 'bg-blue-900 border-blue-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'}`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={handleBookAppointment}
          disabled={!selectedDate || !selectedTime || loading}
          className="w-full bg-blue-900 text-white p-4 rounded-xl font-semibold hover:bg-blue-800 hover:shadow-lg transition-all flex justify-center items-center disabled:opacity-50 disabled:hover:shadow-none"
        >
          {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Confirmar Cita"}
        </button>
      </div>
    );
  }

  // --- Step 4: Success ---
  return (
    <div className="w-full text-center animate-in zoom-in-95 duration-500 py-10">
      <div className="mx-auto bg-green-100 text-green-600 w-20 h-20 flex items-center justify-center rounded-full mb-6 ring-8 ring-green-50">
        <Star className="w-10 h-10 fill-current" />
      </div>
      <h3 className="text-3xl font-bold text-slate-800 mb-3">¡Cita Confirmada!</h3>
      <p className="text-slate-600 mb-8 max-w-sm mx-auto leading-relaxed">
        Tu barbero estará listo el <strong className="text-slate-900">{selectedDate}</strong> a las <strong className="text-slate-900">{selectedTime}</strong>. 
        Te esperamos en el área designada de la residencia.
      </p>
      <button 
        onClick={() => {
          setStep(1);
          setReservationInput("");
          setReservation(null);
          setSelectedDate(null);
          setSelectedTime(null);
        }}
        className="text-blue-900 font-semibold hover:underline bg-blue-50 px-6 py-2.5 rounded-full"
      >
        Registrar otra cita
      </button>
    </div>
  );
}
