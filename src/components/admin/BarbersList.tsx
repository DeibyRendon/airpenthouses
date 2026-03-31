"use client";

import { useState } from "react";
import { createBarberAction, updateBarberAction, deleteBarberAction } from "@/app/actions/barbershop";
import { Loader2, UserPlus, Trash2, User, CheckCircle2, XCircle, Clock, Edit2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BarbersList({ initialBarbers }: { readonly initialBarbers: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // Estado para edición en línea
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setIsAdding(true);
    try {
      await createBarberAction(newName);
      setNewName("");
      router.refresh();
    } catch (error) {
      console.error("Error adding barber:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (barber: any) => {
    setEditingId(barber.id);
    setEditName(barber.name);
  };

  const handleSaveEdit = async (barber: any) => {
    if (!editName || editName === barber.name) {
        setEditingId(null);
        return;
    }
    setLoading(barber.id);
    try {
      await updateBarberAction(barber.id, editName, barber.is_active);
      setEditingId(null);
      router.refresh();
    } catch (error) {
      console.error("Error updating name:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleToggle = async (barber: any) => {
    setLoading(barber.id);
    try {
      await updateBarberAction(barber.id, barber.name, !barber.is_active);
      router.refresh();
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este barbero? Esto borrará también sus horarios y citas.")) return;
    setLoading(id);
    try {
      await deleteBarberAction(id);
      router.refresh();
    } catch (error) {
      console.error("Error deleting barber:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Formulario de Adición */}
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1 text-left block">Nombre del Profesional</label>
            <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: David"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
            </div>
        </div>
        <button 
          disabled={isAdding || !newName}
          type="submit"
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 h-[60px] min-w-[200px]"
        >
          {isAdding ? <Loader2 className="animate-spin w-5 h-5" /> : <><UserPlus className="w-5 h-5" /> Añadir Barbero</>}
        </button>
      </form>

      {/* Lista de Barberos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialBarbers.map((barber) => (
          <div key={barber.id} className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all flex flex-col justify-between ${!barber.is_active ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 border border-slate-200 font-black text-xl uppercase">
                {barber.name.substring(0, 2)}
              </div>
              <div className="flex flex-col items-end gap-2">
                <button 
                    onClick={() => handleToggle(barber)}
                    disabled={loading === barber.id}
                    className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full border transition-all ${
                    barber.is_active 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                >
                    {loading === barber.id && editingId !== barber.id ? <Loader2 className="animate-spin w-3 h-3" /> : (
                    barber.is_active ? <><CheckCircle2 className="w-3 h-3" /> ACTIVO</> : <><XCircle className="w-3 h-3" /> INACTIVO</>
                    )}
                </button>
                {editingId !== barber.id && (
                    <button 
                        onClick={() => handleStartEdit(barber)}
                        className="text-slate-400 hover:text-indigo-600 p-1 transition-colors"
                        title="Editar Nombre"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                )}
              </div>
            </div>

            <div className="mb-6 min-h-[64px]">
              {editingId === barber.id ? (
                <div className="flex gap-2">
                    <input 
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 p-2 bg-slate-50 border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    />
                    <button 
                        onClick={() => handleSaveEdit(barber)}
                        disabled={loading === barber.id}
                        className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 shadow-md transition-all"
                    >
                        {loading === barber.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button 
                        onClick={() => setEditingId(null)}
                        className="bg-slate-100 text-slate-500 p-2 rounded-xl hover:bg-slate-200 transition-all font-bold"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
              ) : (
                <>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{barber.name}</h3>
                    <p className="text-xs text-slate-400 font-medium tracking-wide">Colaborador Profesional</p>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-6 border-t border-slate-100">
                <Link 
                    href={`/admin/barbershop/availability?barberId=${barber.id}`}
                    className="flex-1 bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 text-sm font-bold shadow-md shadow-indigo-100"
                >
                    <Clock className="w-4 h-4" /> Gestionar Horario
                </Link>
                <button 
                    onClick={() => handleDelete(barber.id)}
                    disabled={loading === barber.id || editingId === barber.id}
                    className="flex-1 bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                >
                    <Trash2 className="w-4 h-4" /> Eliminar
                </button>
            </div>
          </div>
        ))}

        {initialBarbers.length === 0 && (
          <div className="col-span-full text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <User className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 italic">No hay barberos registrados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
