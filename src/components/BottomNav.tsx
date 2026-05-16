"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Clock, ChefHat, Sparkles, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "./UserContext";

const tabs = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/fichaje", label: "Fichaje", icon: Clock },
  { href: "/cocina", label: "Cocina", icon: ChefHat },
  { href: "/limpieza", label: "Limpieza", icon: Sparkles },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { logout, currentUser } = useUser();

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface-white border-t border-outline-variant z-50 md:hidden">
        <div className="flex items-center justify-around h-16 px-2 max-w-[430px] mx-auto">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg relative"
              >
                <div className="flex items-center justify-center w-12 h-6 relative">
                  {active && (
                    <motion.div
                      layoutId="activeTabMobile"
                      className="absolute inset-0 bg-secondary-container rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <motion.div
                    animate={{ scale: active ? 1.1 : 1 }}
                    className="relative z-10"
                  >
                    <Icon
                      size={20}
                      className={active ? "text-secondary" : "text-on-surface-variant"}
                      strokeWidth={active ? 2.5 : 1.8}
                    />
                  </motion.div>
                </div>
                <motion.span
                  animate={{ 
                    scale: active ? 1.05 : 1,
                    color: active ? "var(--color-secondary)" : "var(--color-on-surface-variant)" 
                  }}
                  className={`text-[10px] font-medium leading-none relative z-10 ${
                    active ? "text-secondary" : "text-on-surface-variant"
                  }`}
                >
                  {label}
                </motion.span>
                {active && (
                  <motion.div 
                    layoutId="activeDotMobile"
                    className="absolute -bottom-1 w-1 h-1 bg-secondary rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="fixed left-0 top-0 bottom-0 w-64 bg-surface-white border-r border-outline-variant z-50 hidden md:flex flex-col py-8 shadow-sm">
        <div className="px-8 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/20">
              <div className="w-5 h-5 bg-white rounded-sm rotate-45" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-on-surface">BarConnect</span>
          </div>
        </div>

        <div className="flex-1 px-4 space-y-2">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 relative group ${
                  active ? "text-secondary" : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeTabDesktop"
                    className="absolute inset-0 bg-secondary-container/40 rounded-2xl border border-secondary/10"
                    transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                  />
                )}
                <Icon
                  size={22}
                  className={`relative z-10 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className="font-semibold relative z-10 tracking-wide">{label}</span>
                {active && (
                  <motion.div 
                    layoutId="activeIndicatorDesktop"
                    className="absolute left-0 w-1.5 h-8 bg-secondary rounded-r-full"
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="px-6 mt-auto">
          <div className="p-5 bg-surface-low rounded-3xl border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-secondary font-bold text-lg uppercase shadow-inner">
                {currentUser?.substring(0, 2)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-bold text-on-surface truncate">
                  {currentUser}
                </span>
                <span className="text-[11px] font-medium text-on-surface-variant/70 uppercase tracking-wider">Profesional</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-surface-white border border-outline-variant text-on-surface-variant hover:text-error hover:border-error/30 hover:bg-error/5 transition-all duration-300 text-sm font-semibold shadow-sm"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

