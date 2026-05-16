"use client";

import { useUser } from "./UserContext";
import ProfileSelector from "./ProfileSelector";
import { AnimatePresence, motion } from "framer-motion";

export default function AppGate({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoaded } = useUser();

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
      {!currentUser ? (
        <motion.div
          key="profile-selector"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100]"
        >
          <ProfileSelector />
        </motion.div>
      ) : (
        <motion.div
          key="app-content"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
