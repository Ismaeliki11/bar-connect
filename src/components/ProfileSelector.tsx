"use client";

import { useUser } from "./UserContext";
import { UserRound, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function ProfileSelector() {
  const { login } = useUser();

  const profiles = [
    {
      name: "Clemen" as const,
      role: "Gestión de Cocina",
    },
    {
      name: "Isabel" as const,
      role: "Servicio y Limpieza",
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-16"
      >
        <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
          BarConnect Pro
        </span>
        <h1 className="text-4xl font-semibold text-on-surface tracking-tight mb-3">
          Bienvenida
        </h1>
        <p className="text-on-surface-variant text-lg">
          Seleccione su perfil de acceso
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 w-full max-w-sm"
      >
        {profiles.map((profile) => (
          <motion.button
            key={profile.name}
            variants={itemVariants}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => login(profile.name)}
            className="group relative flex items-center gap-5 p-5 bg-surface-container border border-outline-variant rounded-xl transition-all duration-300 hover:border-secondary/50 hover:bg-surface-high shadow-sm hover:shadow-md"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-surface-white border border-outline-variant flex items-center justify-center transition-colors group-hover:bg-secondary/5 group-hover:border-secondary/20">
              <UserRound className="text-on-surface-variant group-hover:text-secondary transition-colors" size={24} />
            </div>
            
            <div className="flex-1 text-left">
              <h2 className="text-xl font-semibold text-on-surface leading-tight">
                {profile.name}
              </h2>
              <p className="text-sm text-on-surface-variant mt-0.5">
                {profile.role}
              </p>
            </div>

            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
              <ChevronRight className="text-secondary" size={20} />
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute bottom-12 flex flex-col items-center gap-2"
      >
        <div className="w-1 h-12 bg-gradient-to-b from-secondary/50 to-transparent rounded-full" />
        <p className="text-[10px] text-on-surface-variant font-bold tracking-[0.3em] uppercase">
          Ecosistema Premium
        </p>
      </motion.div>
    </div>
  );
}
