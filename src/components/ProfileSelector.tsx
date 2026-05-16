"use client";

import { useUser } from "./UserContext";
import { UserCircle2, Sparkles, Heart } from "lucide-react";

export default function ProfileSelector() {
  const { login } = useUser();

  const profiles = [
    {
      name: "Clemen" as const,
      color: "from-blue-500 to-indigo-600",
      icon: <Sparkles className="text-white" size={32} />,
      greeting: "¡Hola, Clemen!",
    },
    {
      name: "Isabel" as const,
      color: "from-rose-500 to-pink-600",
      icon: <Heart className="text-white" size={32} />,
      greeting: "¡Hola, Isabel!",
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-surface-white flex flex-col items-center justify-center px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-on-surface mb-2">Bienvenida</h1>
        <p className="text-on-surface-variant">¿Quién eres hoy?</p>
      </div>

      <div className="grid grid-cols-1 gap-6 w-full max-w-sm">
        {profiles.map((profile) => (
          <button
            key={profile.name}
            onClick={() => login(profile.name)}
            className="relative group overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-outline-variant to-transparent hover:from-primary/20 transition-all duration-500 active:scale-95"
          >
            <div className="bg-surface-white rounded-[22px] p-6 flex items-center gap-4 border border-outline-variant/30">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${profile.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                {profile.icon}
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-on-surface">
                  {profile.name}
                </h2>
                <p className="text-sm text-on-surface-variant">
                  {profile.greeting}
                </p>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <UserCircle2 className="text-primary" size={24} />
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-16 text-xs text-on-surface-variant font-medium tracking-widest uppercase">
        BarConnect • Gestión Premium
      </p>
    </div>
  );
}
