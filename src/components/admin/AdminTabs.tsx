"use client";

import { Map, Scissors } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "turismo";

  const tabs = [
    { id: "turismo", label: "Módulo Turismo", icon: Map },
    { id: "barberia", label: "Módulo Barbería", icon: Scissors },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => router.push(`/admin?tab=${tab.id}`)}
                className={`flex items-center gap-2 py-5 px-1 border-b-2 transition-all font-bold text-sm uppercase tracking-widest ${
                  isActive 
                    ? "border-indigo-600 text-indigo-600" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-300'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
