"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Clock, ChefHat, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/fichaje", label: "Fichaje", icon: Clock },
  { href: "/cocina", label: "Cocina", icon: ChefHat },
  { href: "/limpieza", label: "Limpieza", icon: Sparkles },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface-white border-t border-outline-variant z-50">
      <div className="flex items-center justify-around h-16 px-2">
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
                    layoutId="activeTab"
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
                  layoutId="activeDot"
                  className="absolute -bottom-1 w-1 h-1 bg-secondary rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
