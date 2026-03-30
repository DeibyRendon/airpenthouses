import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { verifyAdmin } from "@/app/actions/admin";
import TourForm from "@/components/admin/TourForm";

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditTourPage({ params }: Props) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) redirect("/admin/login");

  const resolvedParams = await params;
  const tourId = resolvedParams.id;
  const supabase = await createClient();

  // Fetch tour and stops
  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select("*")
    .eq("id", tourId)
    .single();

  if (tourError || !tour) {
    return notFound();
  }

  const { data: stops } = await supabase
    .from("tour_stops")
    .select("*")
    .eq("tour_id", tourId)
    .order("stop_order", { ascending: true });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <nav className="w-full bg-slate-900 text-white p-4 shadow-md flex items-center gap-4">
        <Link href="/admin" className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Editar Tour: {tour.name}</h1>
      </nav>

      <div className="max-w-4xl mx-auto p-6 mt-6">
        <TourForm initialData={tour} initialStops={stops || []} isEdit={true} />
      </div>
    </main>
  );
}
