import Link from "next/link";
import Image from "next/image";
import { MapPin, ChefHat, Scissors, ArrowRight } from "lucide-react";

export default function AirPenthousesPortal() {
  return (
    <main className="min-h-screen bg-slate-50 selection:bg-blue-900 selection:text-white">
      {/* Hero Header */}
      <header className="w-full bg-white relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-blue-900/5 z-0"></div>
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative z-10 flex flex-col items-center text-center">
          <p className="text-blue-900 font-semibold tracking-widest uppercase text-sm mb-4">
            Bienvenido a tu estadía de lujo
          </p>
          <h1 className="text-5xl md:text-7xl font-light text-slate-800 tracking-tight mb-6">
            <strong className="font-extrabold text-slate-900">AIR</strong>PENTHOUSES
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Redefinimos la hospitalidad combinando exclusividad con comodidad absoluta. 
            Accede de inmediato a nuestra gama de servicios premium diseñados a medida para ti.
          </p>
        </div>
      </header>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-slate-800 mb-12 text-center">Explora nuestros Módulos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Módulo 1: Barbershop (Activo) */}
          <Link href="/barbershop" className="group rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col hover:-translate-y-2 transition-transform duration-500">
            <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
              <Image 
                src="/barbershop_cover.png"
                alt="Servicio de Barbero en AirPenthouses"
                fill
                className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Barbería</h3>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between">
              <p className="text-slate-500 leading-relaxed mb-6">
                Tu barbero personal a un clic de distancia. Cortes premium y arreglos de barba sin salir del penthouse.
              </p>
              <div className="flex items-center text-blue-900 font-semibold group-hover:gap-2 transition-all">
                Ingresar al módulo <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
              </div>
            </div>
          </Link>

          {/* Módulo 2: Tourism (Próximamente) */}
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col opacity-75">
            <div className="relative h-64 w-full bg-slate-100 flex items-center justify-center border-b border-slate-200">
              <MapPin className="w-16 h-16 text-slate-300" />
              <div className="absolute top-4 right-4 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Próximamente
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Turismo VIP</h3>
              <p className="text-slate-500 leading-relaxed">
                Descubre los secretos de la ciudad con guías exclusivos y rutas privadas diseñadas para huéspedes.
              </p>
            </div>
          </div>

          {/* Módulo 3: Chef (Próximamente) */}
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col opacity-75">
            <div className="relative h-64 w-full bg-slate-100 flex items-center justify-center border-b border-slate-200">
              <ChefHat className="w-16 h-16 text-slate-300" />
              <div className="absolute top-4 right-4 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Próximamente
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Chef Privado</h3>
              <p className="text-slate-500 leading-relaxed">
                Experiencias gastronómicas de alto nivel preparadas directamente en la cocina de tu alojamiento.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-slate-900 py-12 text-center">
        <p className="text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} AirPenthouses. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}
