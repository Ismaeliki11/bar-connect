"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function CalendarModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}: CalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelectDate(newDate);
    onClose();
  };

  const monthName = currentMonth.toLocaleString("es-ES", { month: "long" });
  const year = currentMonth.getFullYear();

  const days = [];
  const totalDays = daysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const startDay = firstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  // Padding for the first week (adjusting for Monday start)
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

  for (let i = 0; i < adjustedStartDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />);
  }

  for (let i = 1; i <= totalDays; i++) {
    const isSelected =
      selectedDate.getDate() === i &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear();
    
    const isToday = 
      new Date().getDate() === i &&
      new Date().getMonth() === currentMonth.getMonth() &&
      new Date().getFullYear() === currentMonth.getFullYear();

    days.push(
      <motion.button
        key={i}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleDateClick(i)}
        className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium transition-all
          ${isSelected 
            ? "bg-secondary text-white shadow-md" 
            : isToday 
              ? "bg-surface-container text-secondary border border-secondary/30" 
              : "text-on-surface hover:bg-surface-low"
          }`}
      >
        {i}
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-surface-white rounded-2xl shadow-2xl z-[70] overflow-hidden border border-outline-variant"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-white">
              <div className="flex items-center gap-2">
                <CalendarIcon size={18} className="text-secondary" />
                <h3 className="font-semibold text-on-surface">Seleccionar Fecha</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-surface-low text-on-surface-variant transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Calendar Controls */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">
                  {monthName} {year}
                </h4>
                <div className="flex gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg hover:bg-surface-low text-on-surface transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg hover:bg-surface-low text-on-surface transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                  <div key={day} className="h-8 flex items-center justify-center text-[10px] font-bold text-on-surface-variant opacity-60">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-surface-low border-t border-outline-variant flex justify-end gap-2">
              <button
                onClick={() => {
                  onSelectDate(new Date());
                  onClose();
                }}
                className="text-xs font-semibold text-secondary hover:underline px-2 py-1"
              >
                Hoy
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
