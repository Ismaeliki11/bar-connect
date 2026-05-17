"use client";

import { motion } from "framer-motion";
import BottomNav from "./BottomNav";
import { useUser } from "./UserContext";

interface PageWrapperProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export default function PageWrapper({ children, noPadding }: PageWrapperProps) {
  const { currentUser } = useUser();
  const hasUser = !!currentUser;

  return (
    <>
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`flex-1 overflow-y-auto ${noPadding ? "" : (hasUser ? "pb-20 md:pb-0 md:pl-64" : "pb-6")}`}
      >
        {children}
      </motion.main>
      {hasUser && <BottomNav />}
    </>
  );
}
