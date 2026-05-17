"use client";

import { useState, useEffect } from "react";
import { 
  Coins, 
  CreditCard, 
  Banknote, 
  Calendar, 
  Edit3, 
  CheckCircle2, 
  Info, 
  BarChart3,
  Sun,
  Moon,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import PageWrapper from "@/components/PageWrapper";
import { useUser } from "@/components/UserContext";
import CalendarModal from "@/components/CalendarModal";

interface ShiftClosure {
  id: string; // YYYY-MM-DD_manana or YYYY-MM-DD_tarde
  shiftType: "manana" | "tarde";
  cashAmount: number;
  cardAmount: number;
  totalAmount: number;
  submittedBy: "Clemen" | "Isabel";
  submittedAt: string;
  notes?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function DineroPage() {
  const { currentUser } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Morning shift states
  const [mananaCash, setMananaCash] = useState("");
  const [mananaCard, setMananaCard] = useState("");
  const [mananaNotes, setMananaNotes] = useState("");
  const [mananaIsEditing, setMananaIsEditing] = useState(false);
  const [mananaClosure, setMananaClosure] = useState<ShiftClosure | null>(null);

  // Afternoon shift states
  const [tardeCash, setTardeCash] = useState("");
  const [tardeCard, setTardeCard] = useState("");
  const [tardeNotes, setTardeNotes] = useState("");
  const [tardeIsEditing, setTardeIsEditing] = useState(false);
  const [tardeClosure, setTardeClosure] = useState<ShiftClosure | null>(null);
  
  // General closures list for stats
  const [allClosures, setAllClosures] = useState<ShiftClosure[]>([]);

  const getDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const dateString = getDateString(selectedDate);
  const isToday = getDateString(new Date()) === dateString;

  const loadClosuresData = () => {
    if (!currentUser) return;
    
    // 1. Load Morning Shift
    const savedManana = localStorage.getItem(`caja_closure_${dateString}_manana`);
    if (savedManana) {
      const parsed = JSON.parse(savedManana) as ShiftClosure;
      setMananaClosure(parsed);
      setMananaCash(parsed.cashAmount.toString());
      setMananaCard(parsed.cardAmount.toString());
      setMananaNotes(parsed.notes || "");
      setMananaIsEditing(false);
    } else {
      setMananaClosure(null);
      setMananaCash("");
      setMananaCard("");
      setMananaNotes("");
      setMananaIsEditing(true);
    }

    // 2. Load Afternoon Shift
    const savedTarde = localStorage.getItem(`caja_closure_${dateString}_tarde`);
    if (savedTarde) {
      const parsed = JSON.parse(savedTarde) as ShiftClosure;
      setTardeClosure(parsed);
      setTardeCash(parsed.cashAmount.toString());
      setTardeCard(parsed.cardAmount.toString());
      setTardeNotes(parsed.notes || "");
      setTardeIsEditing(false);
    } else {
      setTardeClosure(null);
      setTardeCash("");
      setTardeCard("");
      setTardeNotes("");
      setTardeIsEditing(true);
    }

    // 3. Load all closures from localStorage to build historical statistics
    const closures: ShiftClosure[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("caja_closure_")) {
        try {
          const val = localStorage.getItem(key);
          if (val) {
            closures.push(JSON.parse(val) as ShiftClosure);
          }
        } catch (e) {
          console.error("Error parsing closure:", e);
        }
      }
    }
    setAllClosures(closures);
    setIsLoaded(true);
  };

  // Clean up old mock closure keys from localStorage once on mount to start pristine
  useEffect(() => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("caja_closure_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    loadClosuresData();
  }, []);

  useEffect(() => {
    setIsLoaded(false);
    const timer = setTimeout(() => {
      loadClosuresData();
    }, 150);
    return () => clearTimeout(timer);
  }, [currentUser, dateString]);

  // Submit Box for Morning shift
  const handleSaveManana = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isToday) return;

    const cashVal = parseFloat(mananaCash) || 0;
    const cardVal = parseFloat(mananaCard) || 0;
    const totalVal = cashVal + cardVal;

    const closure: ShiftClosure = {
      id: `${dateString}_manana`,
      shiftType: "manana",
      cashAmount: cashVal,
      cardAmount: cardVal,
      totalAmount: totalVal,
      submittedBy: currentUser as "Clemen" | "Isabel",
      submittedAt: new Date().toISOString(),
      notes: mananaNotes.trim() || undefined,
    };

    localStorage.setItem(`caja_closure_${dateString}_manana`, JSON.stringify(closure));
    loadClosuresData();
  };

  // Submit Box for Afternoon shift
  const handleSaveTarde = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isToday) return;

    const cashVal = parseFloat(tardeCash) || 0;
    const cardVal = parseFloat(tardeCard) || 0;
    const totalVal = cashVal + cardVal;

    const closure: ShiftClosure = {
      id: `${dateString}_tarde`,
      shiftType: "tarde",
      cashAmount: cashVal,
      cardAmount: cardVal,
      totalAmount: totalVal,
      submittedBy: currentUser as "Clemen" | "Isabel",
      submittedAt: new Date().toISOString(),
      notes: tardeNotes.trim() || undefined,
    };

    localStorage.setItem(`caja_closure_${dateString}_tarde`, JSON.stringify(closure));
    loadClosuresData();
  };

  // Helper formats
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(val);
  };

  const formattedDate = selectedDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: isToday ? undefined : "numeric",
  });

  // Stats Calculations
  const totalRevenue = allClosures.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalCash = allClosures.reduce((acc, curr) => acc + curr.cashAmount, 0);
  const totalCard = allClosures.reduce((acc, curr) => acc + curr.cardAmount, 0);
  
  // Calculate average daily revenue (summing all shifts, dividing by unique closed dates)
  const uniqueDatesCount = new Set(allClosures.map(c => c.id.substring(0, 10))).size;
  const avgDaily = uniqueDatesCount > 0 ? totalRevenue / uniqueDatesCount : 0;
  
  const grandTotal = totalCash + totalCard;
  const cashPct = grandTotal > 0 ? (totalCash / grandTotal) * 100 : 50;
  const cardPct = grandTotal > 0 ? (totalCard / grandTotal) * 100 : 50;

  // Helper function to render a read-only historical empty closure block
  const renderEmptyPastClosure = (shiftName: string) => (
    <div className="bg-surface-white border border-outline-variant/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[350px]">
      <div className="w-12 h-12 rounded-full bg-outline-variant/30 flex items-center justify-center text-on-surface-variant/40 mb-3">
        <AlertTriangle size={24} />
      </div>
      <h3 className="text-sm font-bold text-on-surface-variant">Caja no registrada</h3>
      <p className="text-xs text-on-surface-variant/70 mt-1 max-w-[200px] leading-relaxed">
        No se registró la caja del {shiftName} para esta fecha histórica.
      </p>
    </div>
  );

  return (
    <PageWrapper>
      <AppHeader title="Dinero" />

      <div className="px-4 md:px-8 pt-5 md:pt-10 pb-12 max-w-7xl mx-auto w-full">
        
        {/* Page Title & Calendar Toggle */}
        <div className="flex flex-col mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 flex justify-center"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsCalendarOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary/10 text-secondary text-[11px] font-bold uppercase tracking-wider hover:bg-secondary/20 transition-all shadow-sm border border-secondary/10"
            >
              <Calendar size={14} className="opacity-80" />
              Ver calendario
            </motion.button>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl font-semibold text-on-surface">Control de Caja</h1>
              <p className="text-sm text-on-surface-variant mt-0.5 capitalize font-medium">
                {formattedDate} {isToday && <span className="text-xs text-secondary font-bold ml-1 lowercase">(hoy)</span>}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Banner if viewing historical date */}
        {!isToday && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-xl bg-surface-container border border-secondary/20 flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <p className="text-xs font-semibold text-on-surface-variant">
              Estás viendo el histórico del <span className="text-secondary font-bold capitalize">{formattedDate}</span>. <span className="underline decoration-dotted">Los cierres pasados no son modificables.</span>
            </p>
          </motion.div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          
          {/* Shift Closures Section (Takes 2/3 of space on desktop) */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ----------------- MORNING SHIFT BLOCK ----------------- */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Sun size={20} className="text-warning" />
                <h2 className="text-base font-bold text-on-surface">Turno de Mañana</h2>
              </div>

              <AnimatePresence mode="wait">
                {!isLoaded ? (
                  <div className="bg-surface-white border border-outline-variant rounded-2xl p-10 flex flex-col items-center justify-center min-h-[350px] shadow-sm">
                    <div className="w-8 h-8 border-3 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                  </div>
                ) : mananaClosure && !mananaIsEditing ? (
                  
                  /* Morning Closure Display Card */
                  <motion.div
                    key="manana-display"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-surface-white border border-outline-variant rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[350px]"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-warning to-success" />
                    
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60 block">
                            Caja Registrada
                          </span>
                          <span className="text-xs text-on-surface-variant font-medium block mt-0.5">
                            Turno de Mañana
                          </span>
                        </div>

                        {/* Modify button only active on today */}
                        {isToday && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setMananaIsEditing(true)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-outline-variant hover:border-secondary/30 text-on-surface-variant hover:text-secondary text-[10px] font-bold transition-all bg-surface-low shadow-sm"
                          >
                            <Edit3 size={12} />
                            Modificar
                          </motion.button>
                        )}
                      </div>

                      {/* Cash Sum */}
                      <div className="bg-surface-low border border-outline-variant/40 rounded-xl p-4 text-center mb-4">
                        <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">
                          Total Turno
                        </span>
                        <h3 className="text-3xl font-extrabold text-on-surface tracking-tight mt-0.5 tabular-nums">
                          {formatCurrency(mananaClosure.totalAmount)}
                        </h3>
                      </div>

                      {/* Detail splits */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs py-1.5 border-b border-outline-variant/40">
                          <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
                            <Banknote size={14} className="text-success opacity-85" />
                            Efectivo (Caja)
                          </span>
                          <span className="font-bold text-on-surface tabular-nums">
                            {formatCurrency(mananaClosure.cashAmount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-1.5 border-b border-outline-variant/40">
                          <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
                            <CreditCard size={14} className="text-secondary opacity-85" />
                            Tarjeta (Datáfono)
                          </span>
                          <span className="font-bold text-on-surface tabular-nums">
                            {formatCurrency(mananaClosure.cardAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar Proportion */}
                      <div className="mb-4">
                        <div className="h-1.5 w-full rounded-full bg-surface-container overflow-hidden flex">
                          {mananaClosure.totalAmount > 0 ? (
                            <>
                              <div style={{ width: `${(mananaClosure.cashAmount / mananaClosure.totalAmount) * 100}%` }} className="h-full bg-success" />
                              <div style={{ width: `${(mananaClosure.cardAmount / mananaClosure.totalAmount) * 100}%` }} className="h-full bg-secondary" />
                            </>
                          ) : (
                            <div className="h-full w-full bg-outline-variant" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadata bottom */}
                    <div>
                      {mananaClosure.notes && (
                        <p className="mb-4 p-2.5 rounded-lg bg-surface-low border border-outline-variant/60 text-[10px] text-on-surface-variant/90 italic leading-relaxed">
                          "{mananaClosure.notes}"
                        </p>
                      )}

                      <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-[10px]">
                            {mananaClosure.submittedBy.substring(0, 2)}
                          </div>
                          <div>
                            <span className="text-[9px] text-on-surface-variant/60 block leading-none">
                              Por {mananaClosure.submittedBy}
                            </span>
                            <span className="text-[10px] font-bold text-on-surface mt-0.5 block leading-none">
                              {new Date(mananaClosure.submittedAt).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}h
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : isToday ? (
                  
                  /* Morning Closure Input Form (Only for TODAY) */
                  <motion.div
                    key="manana-form"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-surface-white border border-outline-variant rounded-2xl p-5 shadow-sm min-h-[350px] flex flex-col justify-between"
                  >
                    <form onSubmit={handleSaveManana} className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                              Efectivo (€)
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={mananaCash}
                              onChange={(e) => setMananaCash(e.target.value)}
                              placeholder="0.00"
                              className="w-full text-sm px-3 py-2 rounded-lg border border-outline-variant bg-surface-white text-on-surface focus:outline-none focus:ring-1.5 focus:ring-secondary focus:border-transparent transition-all font-semibold tabular-nums"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                              Tarjeta (€)
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={mananaCard}
                              onChange={(e) => setMananaCard(e.target.value)}
                              placeholder="0.00"
                              className="w-full text-sm px-3 py-2 rounded-lg border border-outline-variant bg-surface-white text-on-surface focus:outline-none focus:ring-1.5 focus:ring-secondary focus:border-transparent transition-all font-semibold tabular-nums"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            Notas Turno de Mañana
                          </label>
                          <textarea
                            rows={2}
                            value={mananaNotes}
                            onChange={(e) => setMananaNotes(e.target.value)}
                            placeholder="Desayunos, incidencias..."
                            className="w-full text-xs p-3 rounded-lg border border-outline-variant bg-surface-white text-on-surface focus:outline-none focus:ring-1.5 focus:ring-secondary focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Mini calculation indicator */}
                        <div className="p-2.5 rounded-lg bg-surface-low border border-outline-variant/60 flex items-center justify-between text-xs">
                          <span className="text-on-surface-variant font-medium">Suma Estimada:</span>
                          <span className="font-extrabold text-on-surface tabular-nums">
                            {formatCurrency((parseFloat(mananaCash) || 0) + (parseFloat(mananaCard) || 0))}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 mt-auto">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          type="submit"
                          className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-bold text-xs uppercase tracking-wider shadow hover:bg-primary/95 transition-all"
                        >
                          Guardar Cierre Mañana
                        </motion.button>
                        
                        {mananaClosure && (
                          <button
                            type="button"
                            onClick={() => {
                              setMananaCash(mananaClosure.cashAmount.toString());
                              setMananaCard(mananaClosure.cardAmount.toString());
                              setMananaNotes(mananaClosure.notes || "");
                              setMananaIsEditing(false);
                            }}
                            className="px-3 py-2.5 rounded-lg border border-outline-variant hover:bg-surface-low text-on-surface-variant font-bold text-xs transition-all"
                          >
                            X
                          </button>
                        )}
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  /* Read-Only historical empty block (For PAST DAYS only) */
                  renderEmptyPastClosure("Turno de Mañana")
                )}
              </AnimatePresence>
            </div>

            {/* ----------------- AFTERNOON SHIFT BLOCK ----------------- */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Moon size={20} className="text-secondary" />
                <h2 className="text-base font-bold text-on-surface">Turno de Tarde</h2>
              </div>

              <AnimatePresence mode="wait">
                {!isLoaded ? (
                  <div className="bg-surface-white border border-outline-variant rounded-2xl p-10 flex flex-col items-center justify-center min-h-[350px] shadow-sm">
                    <div className="w-8 h-8 border-3 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                  </div>
                ) : tardeClosure && !tardeIsEditing ? (
                  
                  /* Afternoon Closure Display Card */
                  <motion.div
                    key="tarde-display"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-surface-white border border-outline-variant rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[350px]"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-success" />
                    
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60 block">
                            Caja Registrada
                          </span>
                          <span className="text-xs text-on-surface-variant font-medium block mt-0.5">
                            Turno de Tarde
                          </span>
                        </div>

                        {/* Modify button only active on today */}
                        {isToday && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setTardeIsEditing(true)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-outline-variant hover:border-secondary/30 text-on-surface-variant hover:text-secondary text-[10px] font-bold transition-all bg-surface-low shadow-sm"
                          >
                            <Edit3 size={12} />
                            Modificar
                          </motion.button>
                        )}
                      </div>

                      {/* Cash Sum */}
                      <div className="bg-surface-low border border-outline-variant/40 rounded-xl p-4 text-center mb-4">
                        <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">
                          Total Turno
                        </span>
                        <h3 className="text-3xl font-extrabold text-on-surface tracking-tight mt-0.5 tabular-nums">
                          {formatCurrency(tardeClosure.totalAmount)}
                        </h3>
                      </div>

                      {/* Detail splits */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs py-1.5 border-b border-outline-variant/40">
                          <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
                            <Banknote size={14} className="text-success opacity-85" />
                            Efectivo (Caja)
                          </span>
                          <span className="font-bold text-on-surface tabular-nums">
                            {formatCurrency(tardeClosure.cashAmount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-1.5 border-b border-outline-variant/40">
                          <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
                            <CreditCard size={14} className="text-secondary opacity-85" />
                            Tarjeta (Datáfono)
                          </span>
                          <span className="font-bold text-on-surface tabular-nums">
                            {formatCurrency(tardeClosure.cardAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar Proportion */}
                      <div className="mb-4">
                        <div className="h-1.5 w-full rounded-full bg-surface-container overflow-hidden flex">
                          {tardeClosure.totalAmount > 0 ? (
                            <>
                              <div style={{ width: `${(tardeClosure.cashAmount / tardeClosure.totalAmount) * 100}%` }} className="h-full bg-success" />
                              <div style={{ width: `${(tardeClosure.cardAmount / tardeClosure.totalAmount) * 100}%` }} className="h-full bg-secondary" />
                            </>
                          ) : (
                            <div className="h-full w-full bg-outline-variant" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadata bottom */}
                    <div>
                      {tardeClosure.notes && (
                        <p className="mb-4 p-2.5 rounded-lg bg-surface-low border border-outline-variant/60 text-[10px] text-on-surface-variant/90 italic leading-relaxed">
                          "{tardeClosure.notes}"
                        </p>
                      )}

                      <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-[10px]">
                            {tardeClosure.submittedBy.substring(0, 2)}
                          </div>
                          <div>
                            <span className="text-[9px] text-on-surface-variant/60 block leading-none">
                              Por {tardeClosure.submittedBy}
                            </span>
                            <span className="text-[10px] font-bold text-on-surface mt-0.5 block leading-none">
                              {new Date(tardeClosure.submittedAt).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}h
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : isToday ? (
                  
                  /* Afternoon Closure Input Form (Only for TODAY) */
                  <motion.div
                    key="tarde-form"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-surface-white border border-outline-variant rounded-2xl p-5 shadow-sm min-h-[350px] flex flex-col justify-between"
                  >
                    <form onSubmit={handleSaveTarde} className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                              Efectivo (€)
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={tardeCash}
                              onChange={(e) => setTardeCash(e.target.value)}
                              placeholder="0.00"
                              className="w-full text-sm px-3 py-2 rounded-lg border border-outline-variant bg-surface-white text-on-surface focus:outline-none focus:ring-1.5 focus:ring-secondary focus:border-transparent transition-all font-semibold tabular-nums"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                              Tarjeta (€)
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={tardeCard}
                              onChange={(e) => setTardeCard(e.target.value)}
                              placeholder="0.00"
                              className="w-full text-sm px-3 py-2 rounded-lg border border-outline-variant bg-surface-white text-on-surface focus:outline-none focus:ring-1.5 focus:ring-secondary focus:border-transparent transition-all font-semibold tabular-nums"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            Notas Turno de Tarde
                          </label>
                          <textarea
                            rows={2}
                            value={tardeNotes}
                            onChange={(e) => setTardeNotes(e.target.value)}
                            placeholder="Cierre de caja, propinas, arqueo..."
                            className="w-full text-xs p-3 rounded-lg border border-outline-variant bg-surface-white text-on-surface focus:outline-none focus:ring-1.5 focus:ring-secondary focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Mini calculation indicator */}
                        <div className="p-2.5 rounded-lg bg-surface-low border border-outline-variant/60 flex items-center justify-between text-xs">
                          <span className="text-on-surface-variant font-medium">Suma Estimada:</span>
                          <span className="font-extrabold text-on-surface tabular-nums">
                            {formatCurrency((parseFloat(tardeCash) || 0) + (parseFloat(tardeCard) || 0))}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 mt-auto">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          type="submit"
                          className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-bold text-xs uppercase tracking-wider shadow hover:bg-primary/95 transition-all"
                        >
                          Guardar Cierre Tarde
                        </motion.button>
                        
                        {tardeClosure && (
                          <button
                            type="button"
                            onClick={() => {
                              setTardeCash(tardeClosure.cashAmount.toString());
                              setTardeCard(tardeClosure.cardAmount.toString());
                              setTardeNotes(tardeClosure.notes || "");
                              setTardeIsEditing(false);
                            }}
                            className="px-3 py-2.5 rounded-lg border border-outline-variant hover:bg-surface-low text-on-surface-variant font-bold text-xs transition-all"
                          >
                            X
                          </button>
                        )}
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  /* Read-Only historical empty block (For PAST DAYS only) */
                  renderEmptyPastClosure("Turno de Tarde")
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Right column: general statistics (Takes 1/3 of space on desktop) */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface-white border border-outline-variant rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-container to-secondary" />

              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-secondary" />
                <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider">Estadísticas de Caja</h3>
              </div>

              <div className="space-y-4">
                {/* Total accumulated */}
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase">
                    Recaudación Total (Histórica)
                  </span>
                  <p className="text-2xl font-extrabold text-on-surface mt-0.5 tabular-nums">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>

                {/* Average Daily */}
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase">
                    Media por Día Cerrado
                  </span>
                  <p className="text-base font-bold text-on-surface mt-0.5 tabular-nums">
                    {formatCurrency(avgDaily)}
                  </p>
                </div>

                {/* Cash vs Card proportions across all closures */}
                <div className="pt-2 border-t border-outline-variant/60">
                  <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase block mb-2">
                    Proporción Histórica
                  </span>
                  
                  <div className="flex justify-between text-[10px] font-bold text-on-surface-variant mb-1">
                    <span className="text-success">EFECTIVO: {Math.round(cashPct)}%</span>
                    <span className="text-secondary">TARJETA: {Math.round(cardPct)}%</span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-surface-container overflow-hidden flex">
                    <div style={{ width: `${cashPct}%` }} className="h-full bg-success" />
                    <div style={{ width: `${cardPct}%` }} className="h-full bg-secondary" />
                  </div>

                  <p className="text-[9px] text-on-surface-variant opacity-60 mt-1.5 italic">
                    Calculado en base a {allClosures.length} cierres de turno y {uniqueDatesCount} días distintos.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

      </div>

      {/* Calendar selection modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
    </PageWrapper>
  );
}
