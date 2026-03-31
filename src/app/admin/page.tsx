import { verifyAdmin, logoutAdminAction } from "@/app/actions/admin";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { LogOut, Plus, Map, Info, Scissors, CalendarCheck, Clock } from "lucide-react";
import Link from "next/link";
import DeleteTourButton from "@/components/admin/DeleteTourButton";
import DeleteBarberServiceButton from "@/components/admin/DeleteBarberServiceButton";
import BookingsList from "@/components/admin/BookingsList";
import BarberBookingsList from "@/components/admin/BarberBookingsList";
import AdminTabs from "@/components/admin/AdminTabs";
import { formatCurrency } from "@/utils/format";
import { Tour } from "@/types/tourism";
import { getBarberServicesAction } from "@/app/actions/barbershop";

export default async function AdminDashboard({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string }> 
}) {
  const isAuth = await verifyAdmin();
  if (!isAuth) {
    redirect("/admin/login");
  }

  const { tab } = await searchParams;
  const activeTab = tab || "turismo";

  const supabase = await createClient();
  
  const { data: tours, error } = await supabase
    .from("tours")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: barberServices } = await getBarberServicesAction();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* NAVBAR PRINCIPAL */}
      <nav className="w-full bg-slate-900 text-white p-4 shadow-md flex justify-between items-center z-20 sticky top-0 md:relative">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Map className="w-5 h-5 text-indigo-400" /> AirPenthouses <span className="text-slate-400 font-light">| Admins</span>
        </h1>
        <form action={async () => {
          "use server";
          await logoutAdminAction();
          redirect("/admin/login");
        }}>
          <button type="submit" className="text-sm font-medium text-red-300 hover:text-white flex items-center gap-2 bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </form>
      </nav>

      {/* BANNER DE SELECCIÓN DE MÓDULO */}
      <AdminTabs />

      <div className="max-w-6xl mx-auto p-8 pt-10">
        
        {/* VISTA DE TURISMO */}
        {activeTab === "turismo" && (
          <div className="space-y-12">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Catálogo de Experiencias</h2>
                  <p className="text-slate-500 mt-1">Gestión dinámica de tours, rutas y paradas por la ciudad.</p>
                </div>
                <Link href="/admin/tours/new" className="bg-blue-900 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-800 shadow-lg shadow-blue-100 transition-all">
                  <Plus className="w-5 h-5" /> Crear Tour
                </Link>
            </div>

            {error && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl shadow-sm flex gap-4">
                <Info className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="text-amber-800 font-bold mb-1">Base de datos pendiente</h3>
                  <p className="text-amber-700 text-sm">Verifique su conexión con Supabase en la tabla 'tours'.</p>
                </div>
              </div>
            )}

            {!error && (tours as Tour[]) && (tours as Tour[]).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {(tours as Tour[]).map(tour => (
                    <div key={tour.id} className="bg-white border text-left border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-widest ${tour.tour_type === 'PRIVATE' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                          {tour.tour_type}
                        </span>
                        <span className="text-lg font-bold text-green-700">
                          {formatCurrency(tour.price)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{tour.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4">{tour.description}</p>
                      
                      <div className="flex gap-4 text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl mb-6">
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-tighter">Salida</span>{tour.departure_time.substring(0, 5)}</div>
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-tighter">Llegada</span>{tour.arrival_time.substring(0, 5)}</div>
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-tighter">Capacidad</span>{tour.max_capacity} pax</div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-slate-100">
                        <Link href={`/admin/tours/${tour.id}/edit`} className="flex-1 bg-slate-900 text-white p-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-sm">
                          Editar
                        </Link>
                        <DeleteTourButton tourId={tour.id} />
                      </div>
                    </div>
                 ))}
              </div>
            ) : (
                <div className="text-center bg-white border border-slate-100 rounded-[2.5rem] p-16 shadow-sm">
                  <Map className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold italic">No hay tours configurados aún.</p>
                </div>
            )}

            <div className="pt-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-900 rounded-2xl flex items-center justify-center">
                    <Map className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reservas Recientes de Tours</h2>
                </div>
                <BookingsList />
            </div>
          </div>
        )}

        {/* VISTA DE BARBERÍA */}
        {activeTab === "barberia" && (
          <div className="space-y-12">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestión Professional Barber</h2>
                <p className="text-slate-500 mt-1">Horarios dinámicos, servicios VIP y agenda centralizada.</p>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/barbershop/barbers" className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-all">
                  <CalendarCheck className="w-5 h-5 text-indigo-500" /> Gestionar Personal
                </Link>
                <Link href="/admin/barbershop/availability" className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-all">
                  <Clock className="w-5 h-5" /> Horarios
                </Link>
                <Link href="/admin/barbershop/services/new" className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                  <Plus className="w-5 h-5" /> Nuevo Servicio
                </Link>
              </div>
            </div>

            {barberServices && barberServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {barberServices.map(service => (
                  <div key={service.id} className="bg-white border text-left border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <Scissors className="w-4 h-4" />
                        </div>
                        <span className="text-xl font-black text-indigo-700">
                          {formatCurrency(service.price_cop)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{service.name}</h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{service.description}</p>
                      
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl w-fit">
                        <Clock className="w-3.5 h-3.5" /> {service.duration_minutes} Minutos (Bloque)
                      </div>
                    </div>

                    <div className="flex gap-2 pt-6 mt-6 border-t border-slate-100">
                      <Link 
                        href={`/admin/barbershop/services/${service.id}/edit`} 
                        className="flex-1 bg-slate-900 text-white p-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        Editar
                      </Link>
                      <DeleteBarberServiceButton serviceId={service.id} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="text-center bg-white border border-slate-100 rounded-[2.5rem] p-16 shadow-sm">
                  <Scissors className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold italic">No hay servicios de barbería aún.</p>
                </div>
            )}

            <div className="pt-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-900 rounded-2xl flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Citas Pendientes de Barbería</h2>
                </div>
                <BarberBookingsList />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
