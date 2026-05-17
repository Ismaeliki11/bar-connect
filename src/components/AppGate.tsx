"use client";

import { useUser } from "./UserContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function AppGate({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = pathname === "/horario" || pathname === "/";
  const parts = pathname.split("/");
  const firstSegment = parts[1]?.toLowerCase();
  const isValidWorker = firstSegment === "clemen" || firstSegment === "isabel";

  useEffect(() => {
    if (isLoaded && !isPublicRoute && !isValidWorker) {
      router.replace("/");
    }
  }, [isLoaded, isPublicRoute, isValidWorker, router]);

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-surface-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

