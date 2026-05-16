"use client";

import { Bell, LogOut } from "lucide-react";
import { useUser } from "./UserContext";
import { motion } from "framer-motion";

interface AppHeaderProps {
  title?: string;
}

export default function AppHeader({ title = "BarConnect" }: AppHeaderProps) {
  const { currentUser, logout } = useUser();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 py-3 bg-surface-white border-b border-outline-variant sticky top-0 z-40"
    >
      <div className="flex items-center gap-3">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={logout}
          className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden transition-transform"
          title="Cerrar sesión"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-[10px] font-bold text-on-primary uppercase"
          >
            {currentUser?.substring(0, 2)}
          </motion.div>
        </motion.button>
        <span className="font-semibold text-base text-on-surface">{title}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-full hover:bg-surface-low transition-colors"
        >
          <Bell size={20} className="text-on-surface-variant" />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={logout}
          className="p-2 rounded-full hover:bg-error-container/10 text-on-surface-variant hover:text-error transition-colors"
          title="Salir"
        >
          <LogOut size={20} />
        </motion.button>
      </div>
    </motion.header>
  );
}
