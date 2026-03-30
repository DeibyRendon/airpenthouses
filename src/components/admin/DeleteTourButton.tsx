"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteTourAction } from "@/app/actions/tourism";

export default function DeleteTourButton({ tourId }: { tourId: string }) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    if (!confirm) {
      setConfirm(true);
      setTimeout(() => setConfirm(false), 3000); // Revert after 3 seconds
      return;
    }

    setLoading(true);
    const res = await deleteTourAction(tourId);
    if (res.error) {
      alert(res.error);
      setLoading(false);
      setConfirm(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`p-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-sm ${
        confirm 
          ? "bg-red-600 text-white shadow-lg shadow-red-200" 
          : "bg-red-50 text-red-600 hover:bg-red-100"
      }`}
    >
      {loading ? (
        <Loader2 className="animate-spin w-4 h-4" />
      ) : (
        <>
          <Trash2 className="w-4 h-4" />
          {confirm ? "¿Confirmar?" : "Eliminar"}
        </>
      )}
    </button>
  );
}
