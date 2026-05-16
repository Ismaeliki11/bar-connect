"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "info";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "info",
}: ConfirmModalProps) {
  const isDanger = type === "danger";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-surface-white rounded-2xl shadow-2xl overflow-hidden border border-outline-variant pointer-events-auto"
            >
              {/* Header with Icon */}
              <div className="px-6 pt-6 pb-2 flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  isDanger ? "bg-error-container text-error" : "bg-secondary-container text-secondary"
                }`}>
                  {isDanger ? <AlertTriangle size={24} /> : <Info size={24} />}
                </div>
                <h3 className="text-lg font-bold text-on-surface">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="p-6 flex flex-col gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    isDanger 
                      ? "bg-error text-on-error hover:bg-error/90 shadow-lg shadow-error/20" 
                      : "bg-primary text-on-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  }`}
                >
                  {confirmText}
                </motion.button>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-low transition-all"
                >
                  {cancelText}
                </button>
              </div>

              {/* Close Button (Top Right) */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-surface-low text-on-surface-variant transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
