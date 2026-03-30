import { verifyAdmin, logoutAdminAction } from "@/app/actions/admin";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { LogOut, Plus, Map, Info } from "lucide-react";
import Link from "next/link";
import DeleteTourButton from "@/components/admin/DeleteTourButton";
import BookingsList from "@/components/admin/BookingsList";

export default async function AdminDashboard() {
  const isAuth = await verifyAdmin();
  if (!isAuth) {
    redirect("/admin/login"); // Route guarding
  }

  const supabase = await createClient();
  
  // Since we might not have the table yet in reality if you haven't run the SQL,
  // we attempt to fetch, and if it fails, we show a helpful empty state.
  const { data: tours, error } = await supabase
    .from("tours")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <nav className="w-full bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Map className="w-5 h-5" /> AirPenthouses <span className="text-slate-400 font-light">| Admins</span>
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

      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Módulo de Turismo</h2>
            <p className="text-slate-500 mt-1">Gestiona los tours, rutas y paradas ofrecidas a los huéspedes.</p>
          </div>
          <Link href="/admin/tours/new" className="bg-blue-900 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-800 shadow-md transition-all">
            <Plus className="w-5 h-5" /> Crear Nuevo Tour
          </Link>
        </div>

        {error ? (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl shadow-sm mb-8 flex gap-4">
            <Info className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="text-amber-800 font-bold mb-1">Base de datos no detectada</h3>
              <p className="text-amber-700 text-sm">
                Aún no has corrido el script SQL provisto. Por favor copia el contenido del archivo `database_tourism.sql` generado en la raíz del proyecto y ejecútalo en la vista **SQL Editor** de tu consola de Supabase.
              </p>
              <p className="text-amber-700 text-sm mt-2 font-mono text-xs bg-amber-100 p-2 rounded">
                Detalle técnico: {error.message}
              </p>
            </div>
          </div>
        ) : tours && tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {tours.map(tour => (
                <div key={tour.id} className="bg-white border text-left border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide ${tour.tour_type === 'PRIVATE' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                      {tour.tour_type}
                    </span>
                    <span className="text-lg font-bold text-green-700">
                      {new Intl.NumberFormat('es-CO', { 
                          style: 'currency', 
                          currency: 'COP', 
                          maximumFractionDigits: 0 
                      }).format(tour.price)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{tour.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">{tour.description}</p>
                  
                  <div className="flex gap-4 text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-lg mb-6">
                    <div>
                      <span className="text-slate-400 block text-xs">Salida</span>
                      {tour.departure_time.substring(0, 5)}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Llegada</span>
                      {tour.arrival_time.substring(0, 5)}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Capacidad</span>
                      {tour.max_capacity} pax
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <Link 
                      href={`/admin/tours/${tour.id}/edit`} 
                      className="flex-1 bg-slate-900 text-white p-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Editar
                    </Link>
                    <DeleteTourButton tourId={tour.id} />
                  </div>
                </div>
             ))}
          </div>
        ) : (
          <div className="text-center bg-white border border-slate-200 rounded-3xl p-16 shadow-sm">
            <Map className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No hay tours configurados</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">La base de datos está conectada correctamente, pero aún no has añadido recorridos por la ciudad.</p>
          </div>
        )}

        {/* SECCIÓN DE RESERVAS */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-900 rounded-xl flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Reservas Recientes de Tours</h2>
          </div>
          <BookingsList />
        </div>
      </div>
    </main>
  );
}
