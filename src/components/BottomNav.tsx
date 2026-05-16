"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Clock, ChefHat, Sparkles } from "lucide-react";

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
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors"
            >
              <div
                className={`flex items-center justify-center w-12 h-6 rounded-full transition-colors ${
                  active ? "bg-secondary-container" : ""
                }`}
              >
                <Icon
                  size={20}
                  className={active ? "text-secondary" : "text-on-surface-variant"}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </div>
              <span
                className={`text-[10px] font-medium leading-none ${
                  active ? "text-secondary" : "text-on-surface-variant"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
