"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { loginAdminAction } from "@/app/actions/admin";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const response = await loginAdminAction(password);
    
    setLoading(false);

    if (response?.error) {
      setError(response.error);
    } else {
      router.push("/admin");
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al sitio público
      </Link>
      
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <ShieldCheck className="w-8 h-8 text-blue-900" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">Panel Administrativo</h1>
        <p className="text-slate-500 text-center mb-8 text-sm">Validación biométrica o contraseña maestra requerida para configuración militar de la plataforma.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña Maestra</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-4 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 outline-none transition-all font-mono"
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
          
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-slate-900 text-white p-4 rounded-xl font-semibold hover:bg-slate-800 transition-all flex justify-center items-center mt-4 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Desbloquear Sistema"}
          </button>
        </form>
      </div>
    </main>
  );
}
