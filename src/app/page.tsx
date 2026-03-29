import ReservationGate from "@/components/reservation/ReservationGate";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-900 selection:text-white">
      {/* Header Premium */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-900 text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
              BP
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Barber <span className="text-blue-900">Penthouses</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
        <span className="px-3 py-1 text-sm font-semibold text-blue-900 bg-blue-100 rounded-full mb-6 inline-block">
          Servicio Exclusivo para Huéspedes
        </span>
        <h2 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight max-w-3xl">
          Experiencia de Barbería <br/> en tu Estancia
        </h2>
        <p className="text-lg text-slate-600 mb-12 max-w-2xl leading-relaxed">
          Disfruta de nuestros servicios premium de barbería y cuidado personal adaptados a tus horarios. 
          Ingresa tu número de reserva para comenzar el agendamiento.
        </p>

        {/* Flujo Dinámico de Agendamiento */}
        <div className="w-full max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <ReservationGate />
        </div>
      </section>

      {/* Footer minimalista */}
      <footer className="mt-20 py-8 border-t border-slate-200 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Barber Penthouses. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
