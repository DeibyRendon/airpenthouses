"use client";

import { deleteBarberServiceAction } from "@/app/actions/barbershop";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function DeleteBarberServiceButton({ serviceId }: { serviceId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este servicio? Esto no afectará las citas ya agendadas.")) return;
    
    setIsDeleting(true);
    try {
      await deleteBarberServiceAction(serviceId);
    } catch (error) {
      alert("Error eliminando servicio");
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-red-50 text-red-600 p-2.5 rounded-xl hover:bg-red-100 transition-colors shadow-sm disabled:opacity-50"
      title="Eliminar Servicio"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
