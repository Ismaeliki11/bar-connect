"use client";

import { Bell, LogOut, User as UserIcon } from "lucide-react";
import { useUser } from "./UserContext";

interface AppHeaderProps {
  title?: string;
}

export default function AppHeader({ title = "BarConnect" }: AppHeaderProps) {
  const { currentUser, logout } = useUser();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-surface-white border-b border-outline-variant sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button 
          onClick={logout}
          className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden active:scale-95 transition-transform"
          title="Cerrar sesión"
        >
          <div className="text-[10px] font-bold text-on-primary uppercase">
            {currentUser?.substring(0, 2)}
          </div>
        </button>
        <span className="font-semibold text-base text-on-surface">{title}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <button className="relative p-2 rounded-full hover:bg-surface-low transition-colors">
          <Bell size={20} className="text-on-surface-variant" />
        </button>
        <button 
          onClick={logout}
          className="p-2 rounded-full hover:bg-error-container/10 text-on-surface-variant hover:text-error transition-colors"
          title="Salir"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
