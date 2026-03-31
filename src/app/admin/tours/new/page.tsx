import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import TourForm from "@/components/admin/TourForm";

export default function CreateTourPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <nav className="w-full bg-slate-900 text-white p-4 shadow-md flex items-center gap-4">
        <Link href="/admin" className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Crear Nuevo Tour</h1>
      </nav>

      <div className="max-w-4xl mx-auto p-6 mt-6">
        <TourForm />
      </div>
    </main>
  );
}
