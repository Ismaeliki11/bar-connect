"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  User, 
  Info, 
  ArrowLeft,
  CalendarDays,
  CalendarRange,
  Sparkles,
  Lock,
  Sun,
  Moon,
  Clock,
  LayoutGrid,
  Trash2,
  Plus,
  RefreshCw,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import PageWrapper from "@/components/PageWrapper";
import { useUser } from "@/components/UserContext";

type MobileViewMode = "dia" | "semana" | "mes" | "excepciones";
type DesktopViewMode = "semanal" | "mensual" | "excepciones";
type WorkerFilter = "todos" | "Clemen" | "Isabel" | "Ismael";
type ExceptionType = "swap_single" | "custom" | "swap_permanent";

interface ShiftException {
  id: string;
  date: string; // YYYY-MM-DD
  type: ExceptionType;
  description: string;
  createdBy?: string; // "Clemen" | "Isabel"
  override?: {
    manana?: string[];
    tarde?: string[];
  };
}

interface ShiftDetail {
  manana: string[];
  tarde: string[];
}

export default function HorarioPage() {
  const router = useRouter();
  const { currentUser, login } = useUser();
  
  // View states
  const [mobileView, setMobileView] = useState<MobileViewMode>("dia");
  const [desktopView, setDesktopView] = useState<DesktopViewMode>("semanal");
  const [selectedWorker, setSelectedWorker] = useState<WorkerFilter>("todos");
  
  // Navigation dates
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateMobile, setSelectedDateMobile] = useState<Date>(new Date());
  const [selectedDayDetail, setSelectedDayDetail] = useState<Date | null>(null);
  
  // Slide-up drawer states
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [mobileDrawerDate, setMobileDrawerDate] = useState<Date | null>(null);

  // Exceptions list
  const [exceptions, setExceptions] = useState<ShiftException[]>([]);

  // History view states
  const [historyCalendarDate, setHistoryCalendarDate] = useState<Date>(new Date());
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<Date | null>(null);
  const [isHistoryCalendarCollapsed, setIsHistoryCalendarCollapsed] = useState<boolean>(false);

  // Create exception form states
  const [formDate, setFormDate] = useState("");
  const [formAffectsRotation, setFormAffectsRotation] = useState<boolean>(false);
  const [formDescription, setFormDescription] = useState("");
  const [formManana, setFormManana] = useState<string[]>([]);
  const [formTarde, setFormTarde] = useState<string[]>([]);
  const [isAddingExceptionMobile, setIsAddingExceptionMobile] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);

  const getLocalDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const renderHistoryMonthDays = () => {
    const year = historyCalendarDate.getFullYear();
    const month = historyCalendarDate.getMonth();
    
    const totalDays = daysInMonth(year, month);
    const startDayOffset = firstDayOfMonth(year, month);
    const prevMonthDaysCount = daysInMonth(year, month - 1);
    const cells = [];

    for (let i = startDayOffset - 1; i >= 0; i--) {
      const dayNum = prevMonthDaysCount - i;
      const prevDate = new Date(year, month - 1, dayNum);
      cells.push({ date: prevDate, isCurrentMonth: false, dayNum });
    }

    for (let i = 1; i <= totalDays; i++) {
      const currDate = new Date(year, month, i);
      cells.push({ date: currDate, isCurrentMonth: true, dayNum: i });
    }

    const remainingCells = 42 - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      cells.push({ date: nextDate, isCurrentMonth: false, dayNum: i });
    }

    return cells;
  };

  const renderExceptionCardComparison = (exc: ShiftException) => {
    const excDate = new Date(exc.date + "T00:00:00");
    const baseShifts = getBaseShiftsForDate(excDate);
    
    // For single swaps
    if (exc.type === "swap_single") {
      return (
        <div className="mt-3.5 border-t border-outline-variant/40 pt-3">
          <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider block mb-2">
            Comparativa de Turnos:
          </span>
          <div className="grid grid-cols-2 gap-3 bg-surface-low/50 p-2.5 rounded-xl border border-outline-variant/30">
            {/* Original */}
            <div className="space-y-1.5">
              <span className="text-[8px] font-bold text-on-surface-variant/80 uppercase tracking-widest block">Original:</span>
              <div className="text-[11px] space-y-1">
                <div className="flex items-center gap-1"><Sun size={10} className="text-warning opacity-70" /> <span className="font-semibold text-on-surface-variant">{baseShifts.manana.join(", ")}</span></div>
                <div className="flex items-center gap-1"><Moon size={10} className="text-secondary opacity-70" /> <span className="font-semibold text-on-surface-variant">{baseShifts.tarde.join(", ")}</span></div>
              </div>
            </div>
            {/* Nuevo */}
            <div className="space-y-1.5 border-l border-outline-variant/40 pl-3">
              <span className="text-[8px] font-bold text-secondary uppercase tracking-widest block">Modificado (Intercambiado):</span>
              <div className="text-[11px] space-y-1">
                <div className="flex items-center gap-1"><Sun size={10} className="text-warning font-bold" /> <span className="font-bold text-secondary">{baseShifts.tarde.join(", ")}</span></div>
                <div className="flex items-center gap-1"><Moon size={10} className="text-secondary font-bold" /> <span className="font-bold text-secondary">{baseShifts.manana.join(", ")}</span></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // For custom overrides
    if (exc.type === "custom" && exc.override) {
      return (
        <div className="mt-3.5 border-t border-outline-variant/40 pt-3">
          <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider block mb-2">
            Comparativa de Turnos:
          </span>
          <div className="grid grid-cols-2 gap-3 bg-surface-low/50 p-2.5 rounded-xl border border-outline-variant/30">
            {/* Original */}
            <div className="space-y-1.5">
              <span className="text-[8px] font-bold text-on-surface-variant/80 uppercase tracking-widest block">Original:</span>
              <div className="text-[11px] space-y-1">
                <div className="flex items-center gap-1"><Sun size={10} className="text-warning opacity-70" /> <span className="font-semibold text-on-surface-variant">{baseShifts.manana.join(", ")}</span></div>
                <div className="flex items-center gap-1"><Moon size={10} className="text-secondary opacity-70" /> <span className="font-semibold text-on-surface-variant">{baseShifts.tarde.join(", ")}</span></div>
              </div>
            </div>
            {/* Nuevo */}
            <div className="space-y-1.5 border-l border-outline-variant/40 pl-3">
              <span className="text-[8px] font-bold text-secondary uppercase tracking-widest block">Modificado:</span>
              <div className="text-[11px] space-y-1">
                <div className="flex items-center gap-1">
                  <Sun size={10} className="text-warning font-bold" /> 
                  <span className={`font-bold ${JSON.stringify(baseShifts.manana) !== JSON.stringify(exc.override.manana) ? "text-[#d97706]" : "text-on-surface-variant"}`}>
                    {exc.override.manana?.join(", ") || "Cerrado"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Moon size={10} className="text-secondary font-bold" /> 
                  <span className={`font-bold ${JSON.stringify(baseShifts.tarde) !== JSON.stringify(exc.override.tarde) ? "text-secondary" : "text-on-surface-variant"}`}>
                    {exc.override.tarde?.join(", ") || "Cerrado"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // For permanent rotation swaps
    if (exc.type === "swap_permanent") {
      return (
        <div className="mt-3.5 border-t border-outline-variant/40 pt-3">
          <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider block mb-2">
            Inversión de Rotación Permanente:
          </span>
          <div className="grid grid-cols-2 gap-3 bg-surface-low/50 p-2.5 rounded-xl border border-outline-variant/30">
            {/* Original */}
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-on-surface-variant/80 uppercase tracking-widest block">Estado Previo:</span>
              <span className="text-[11px] font-semibold text-on-surface-variant">Rotación A/B estándar</span>
            </div>
            {/* Nuevo */}
            <div className="space-y-1 border-l border-outline-variant/40 pl-3">
              <span className="text-[8px] font-bold text-purple-700 uppercase tracking-widest block">Nuevo Estado:</span>
              <span className="text-[11px] font-bold text-purple-700">Rotación invertida permanentemente</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Clean dates to avoid timezone discrepancies
  const getCleanDate = (d: Date) => {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  // Load and save exceptions
  useEffect(() => {
    const stored = localStorage.getItem("schedule_exceptions");
    if (stored) {
      try {
        setExceptions(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading exceptions", e);
      }
    } else {
      // Mock exception based on the user's example (Taekwondo swap on Sunday, May 24, 2026)
      const mockException: ShiftException = {
        id: "mock-taekwondo-swap",
        date: "2026-05-24", // Next Sunday from May 17, 2026
        type: "custom",
        description: "Clemen va al taekwondo de su hijo. Isabel le hace la mañana e Ismael apoya; Clemen cubre la tarde.",
        override: {
          manana: ["Isabel", "Ismael"],
          tarde: ["Clemen"]
        }
      };
      setExceptions([mockException]);
      localStorage.setItem("schedule_exceptions", JSON.stringify([mockException]));
    }
  }, []);

  const saveExceptions = (newExceptions: ShiftException[]) => {
    setExceptions(newExceptions);
    localStorage.setItem("schedule_exceptions", JSON.stringify(newExceptions));
  };

  // Count how many permanent swaps exist before targetDate
  // If count is odd, rotation A/B swaps permanently from that day forward
  const isRotationInverted = (date: Date): boolean => {
    const targetTime = getCleanDate(date).getTime();
    const count = exceptions.filter(e => {
      if (e.type !== "swap_permanent") return false;
      const exceptionTime = new Date(e.date + "T00:00:00").getTime();
      return exceptionTime <= targetTime;
    }).length;
    return count % 2 !== 0;
  };

  // Determine week type: A or B
  const getWeekType = (date: Date): "A" | "B" => {
    const epoch = new Date(2026, 0, 5); // Monday, Jan 5, 2026 (Rot A)
    const d1 = getCleanDate(date);
    const d2 = getCleanDate(epoch);
    
    const diffTime = d1.getTime() - d2.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const elapsedWeeks = Math.floor(diffDays / 7);
    
    let type: "A" | "B" = Math.abs(elapsedWeeks) % 2 === 0 ? "A" : "B";
    
    // Invert if there is an odd number of permanent inversions before this date
    if (isRotationInverted(date)) {
      type = type === "A" ? "B" : "A";
    }
    
    return type;
  };

  // Get base schedule without overrides (handles permanent inversions dynamically)
  const getBaseShiftsForDate = (date: Date): ShiftDetail => {
    const day = date.getDay(); // 0 is Sunday, 1 is Monday...
    const weekType = getWeekType(date);
    
    if (weekType === "A") {
      switch (day) {
        case 1: // Lunes
          return { manana: ["Isabel"], tarde: ["Clemen"] };
        case 2: // Martes
          return { manana: ["Clemen"], tarde: ["Isabel"] };
        case 3: // Miercoles
          return { manana: ["Isabel"], tarde: ["Cerrado"] };
        case 4: // Jueves
          return { manana: ["Clemen"], tarde: ["Isabel"] };
        case 5: // Viernes
          return { manana: ["Isabel"], tarde: ["Clemen"] };
        case 6: // Sabado
          return { manana: ["Clemen"], tarde: ["Ismael"] };
        case 0: // Domingo
          return { manana: ["Clemen", "Ismael"], tarde: ["Cerrado"] };
        default:
          return { manana: [], tarde: [] };
      }
    } else {
      // Week B
      switch (day) {
        case 1: // Lunes
          return { manana: ["Clemen"], tarde: ["Isabel"] };
        case 2: // Martes
          return { manana: ["Isabel"], tarde: ["Clemen"] };
        case 3: // Miercoles
          return { manana: ["Clemen"], tarde: ["Cerrado"] };
        case 4: // Jueves
          return { manana: ["Isabel"], tarde: ["Clemen"] };
        case 5: // Viernes
          return { manana: ["Clemen"], tarde: ["Isabel"] };
        case 6: // Sabado
          return { manana: ["Isabel"], tarde: ["Ismael"] };
        case 0: // Domingo
          return { manana: ["Isabel", "Ismael"], tarde: ["Cerrado"] };
        default:
          return { manana: [], tarde: [] };
      }
    }
  };

  // Get shifts applying all exceptions and swaps
  const getShiftsForDate = (date: Date): ShiftDetail => {
    const dayStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const exception = exceptions.find(e => e.date === dayStr);
    
    if (exception) {
      if (exception.type === "swap_single") {
        // Swap morning and afternoon shifts of the base schedule
        const baseShifts = getBaseShiftsForDate(date);
        return {
          manana: baseShifts.tarde,
          tarde: baseShifts.manana
        };
      } else if (exception.type === "custom" && exception.override) {
        // Return manual overrides
        return {
          manana: exception.override.manana || [],
          tarde: exception.override.tarde || []
        };
      }
    }
    
    return getBaseShiftsForDate(date);
  };

  // Pre-fill shifts when date changes
  useEffect(() => {
    if (formDate) {
      const dateObj = new Date(formDate + "T00:00:00");
      const base = getBaseShiftsForDate(dateObj);
      setFormManana(base.manana);
      setFormTarde(base.tarde);
    } else {
      setFormManana([]);
      setFormTarde([]);
    }
  }, [formDate, exceptions]);

  // Pre-fill form date when a day is selected in the history calendar
  useEffect(() => {
    if (selectedHistoryDate) {
      setFormDate(getLocalDateString(selectedHistoryDate));
    }
  }, [selectedHistoryDate]);

  // Helper: check if a worker is active under current filter
  const isWorkerHighlighted = (workerName: string): boolean => {
    if (selectedWorker === "todos") return true;
    return workerName === selectedWorker;
  };

  // Helper: check if a shift block contains any worker matching the active filter
  const isShiftHighlighted = (workers: string[]): boolean => {
    if (selectedWorker === "todos") return true;
    return workers.some(w => w === selectedWorker);
  };

  // WEEKLY UTILITIES
  const getMondayOfDate = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const startOfWeek = getMondayOfDate(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const endOfWeek = new Date(weekDays[6]);

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
    
    const newMobileDate = new Date(selectedDateMobile);
    newMobileDate.setDate(selectedDateMobile.getDate() - 7);
    setSelectedDateMobile(newMobileDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
    
    const newMobileDate = new Date(selectedDateMobile);
    newMobileDate.setDate(selectedDateMobile.getDate() + 7);
    setSelectedDateMobile(newMobileDate);
  };

  const handleResetToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateMobile(today);
    setHistoryCalendarDate(today);
    setSelectedHistoryDate(today);
  };

  // MONTHLY GRID UTILITIES
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const totalDays = daysInMonth(year, month);
    const startDayOffset = firstDayOfMonth(year, month);
    const prevMonthDaysCount = daysInMonth(year, month - 1);
    const cells = [];

    for (let i = startDayOffset - 1; i >= 0; i--) {
      const dayNum = prevMonthDaysCount - i;
      const prevDate = new Date(year, month - 1, dayNum);
      cells.push({ date: prevDate, isCurrentMonth: false, dayNum, shifts: getShiftsForDate(prevDate) });
    }

    for (let i = 1; i <= totalDays; i++) {
      const currDate = new Date(year, month, i);
      cells.push({ date: currDate, isCurrentMonth: true, dayNum: i, shifts: getShiftsForDate(currDate) });
    }

    const remainingCells = 42 - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      cells.push({ date: nextDate, isCurrentMonth: false, dayNum: i, shifts: getShiftsForDate(nextDate) });
    }

    return cells;
  };

  const monthName = currentDate.toLocaleString("es-ES", { month: "long" });
  const monthYearStr = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${currentDate.getFullYear()}`;

  const formatWeekRange = () => {
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    const startStr = startOfWeek.toLocaleDateString("es-ES", options);
    const endStr = endOfWeek.toLocaleDateString("es-ES", { ...options, year: "numeric" });
    return `Del ${startStr} al ${endStr}`;
  };

  // Color configurations for workers
  const workerStyles: Record<string, { bg: string; border: string; text: string; accent: string; role: string }> = {
    Clemen: {
      bg: "bg-[#eff4ff] border-[#bec6e0]/60",
      border: "border-secondary/20",
      text: "text-[#0058be] font-bold",
      accent: "bg-secondary",
      role: "Gestión de Cocina"
    },
    Isabel: {
      bg: "bg-[#eefcf7] border-[#bfeade]/60",
      border: "border-success/20",
      text: "text-[#009668] font-bold",
      accent: "bg-success",
      role: "Servicio y Limpieza"
    },
    Ismael: {
      bg: "bg-[#fffbeb] border-[#fde68a]/60",
      border: "border-warning/20",
      text: "text-[#d97706] font-bold",
      accent: "bg-warning",
      role: "Soporte Fin de Semana"
    },
    Cerrado: {
      bg: "bg-error/5 border-error/10",
      border: "border-error/15",
      text: "text-error font-semibold opacity-80",
      accent: "bg-error/30",
      role: "Establecimiento Cerrado"
    }
  };

  const getWeekBadgeDetails = (date: Date) => {
    const type = getWeekType(date);
    return type === "A" ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider shadow-sm">
        Rotación A: Isabel Mañanas
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider shadow-sm">
        Rotación B: Clemen Mañanas
      </span>
    );
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  // Sync selected date in mobile daily view when currentDate shifts
  useEffect(() => {
    const startMilli = startOfWeek.getTime();
    const endMilli = endOfWeek.getTime() + 86400000;
    const currentSelectedMilli = selectedDateMobile.getTime();

    if (currentSelectedMilli < startMilli || currentSelectedMilli > endMilli) {
      setSelectedDateMobile(new Date(startOfWeek));
    }
  }, [currentDate]);

  // Handle open drawer for monthly cell details on mobile
  const openMobileDrawer = (date: Date) => {
    setMobileDrawerDate(date);
    setIsMobileDrawerOpen(true);
  };

  // FORM SUBMISSION HANDLERS
  const toggleFormWorker = (worker: string, shift: "manana" | "tarde") => {
    if (worker === "Cerrado") {
      if (shift === "manana") {
        setFormManana(prev => prev.includes("Cerrado") ? [] : ["Cerrado"]);
      } else {
        setFormTarde(prev => prev.includes("Cerrado") ? [] : ["Cerrado"]);
      }
      return;
    }

    if (shift === "manana") {
      setFormManana(prev => {
        const filtered = prev.filter(w => w !== "Cerrado");
        return filtered.includes(worker) 
          ? filtered.filter(w => w !== worker) 
          : [...filtered, worker];
      });
    } else {
      setFormTarde(prev => {
        const filtered = prev.filter(w => w !== "Cerrado");
        return filtered.includes(worker) 
          ? filtered.filter(w => w !== worker) 
          : [...filtered, worker];
      });
    }
  };

  const handleAddExceptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || !formDescription) return;

    const newExceptions = [...exceptions];
    const dateObj = new Date(formDate + "T00:00:00");
    const base = getBaseShiftsForDate(dateObj);
    
    const isMorningDifferent = JSON.stringify(base.manana) !== JSON.stringify(formManana);
    const isAfternoonDifferent = JSON.stringify(base.tarde) !== JSON.stringify(formTarde);
    
    // Solo añadimos el override personalizado si realmente hubo un cambio para este día,
    // O si es solo un cambio puntual y no afecta a la rotación (para que conste en el historial).
    if (isMorningDifferent || isAfternoonDifferent || !formAffectsRotation) {
      newExceptions.push({
        id: "exception_" + Date.now(),
        date: formDate,
        type: "custom",
        description: formDescription,
        createdBy: currentUser || undefined,
        override: {
          manana: formManana.length > 0 ? formManana : ["Cerrado"],
          tarde: formTarde.length > 0 ? formTarde : ["Cerrado"]
        }
      });
    }

    // Si el usuario indicó que este cambio afecta a la rotación de forma permanente
    if (formAffectsRotation) {
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split("T")[0];

      newExceptions.push({
        id: "exception_perm_" + Date.now(),
        date: nextDayStr,
        type: "swap_permanent",
        description: `Cambio de rotación derivado de: ${formDescription}`,
        createdBy: currentUser || undefined,
      });
    }

    saveExceptions(newExceptions);

    // Reset form states
    setFormDate("");
    setFormDescription("");
    setFormManana([]);
    setFormTarde([]);
    setFormAffectsRotation(false);
    setIsAddingExceptionMobile(false);
  };

  const handleDeleteException = (id: string) => {
    const updated = exceptions.filter(e => e.id !== id);
    saveExceptions(updated);
  };

  return (
    <PageWrapper noPadding>
      <div className="min-h-screen bg-surface w-full flex flex-col pb-20 md:pb-6">
        
        {/* ========================================================
            DESKTOP HEADER & VIEW CONTROLS (hidden on Mobile)
            ======================================================== */}
        <div className="hidden md:flex px-8 pt-6 pb-4 border-b border-outline-variant bg-surface-white items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(currentUser ? `/${currentUser.toLowerCase()}` : "/")}
              className="p-2.5 rounded-xl border border-outline-variant hover:border-secondary/30 text-on-surface-variant hover:text-secondary transition-all bg-surface-low hover:bg-surface-white cursor-pointer shadow-sm"
              aria-label="Volver"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-on-surface tracking-tight">Horario del Personal</h1>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {currentUser ? `Registrado como ${currentUser}` : "Vista de consulta pública"} &bull; Turnos rotativos y excepciones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetToToday}
              className="px-4 py-2 rounded-xl border border-secondary/20 text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/5 hover:bg-secondary/10 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              Hoy
            </button>

            <div className="flex items-center bg-surface-container/60 p-1.5 rounded-xl border border-outline-variant shadow-inner">
              <button
                onClick={() => setDesktopView("semanal")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  desktopView === "semanal"
                    ? "bg-surface-white text-secondary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <CalendarRange size={14} />
                Semanal
              </button>
              <button
                onClick={() => setDesktopView("mensual")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  desktopView === "mensual"
                    ? "bg-surface-white text-secondary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <CalendarIcon size={14} />
                Mensual
              </button>
              <button
                onClick={() => setDesktopView("excepciones")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  desktopView === "excepciones"
                    ? "bg-surface-white text-secondary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <RefreshCw size={14} className={desktopView === "excepciones" ? "animate-spin-slow" : ""} />
                Historial de Cambios ({exceptions.length})
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            MOBILE STICKY HEADER (hidden on Desktop)
            ======================================================== */}
        <div className="md:hidden sticky top-0 bg-surface-white/95 backdrop-blur border-b border-outline-variant/80 px-4 py-3.5 z-40 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(currentUser ? `/${currentUser.toLowerCase()}` : "/")}
              className="p-2 rounded-xl border border-outline-variant bg-surface-low text-on-surface-variant hover:text-secondary active:scale-95 transition-all"
              aria-label="Volver"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-base font-bold text-on-surface leading-tight">Horario</h1>
              <p className="text-[10px] text-on-surface-variant leading-none mt-0.5">Turnos, Cambios y Rotaciones</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileView("excepciones")}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all ${
                mobileView === "excepciones"
                  ? "bg-secondary text-white border-secondary"
                  : "bg-surface-low border-outline-variant text-on-surface-variant hover:text-secondary"
              }`}
            >
              <RefreshCw size={11} className={mobileView === "excepciones" ? "animate-spin-slow" : ""} />
              Cambios
            </button>
            <button
              onClick={handleResetToToday}
              className="px-3 py-1.5 rounded-lg border border-secondary/20 text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/5 active:scale-95 transition-all"
            >
              Hoy
            </button>
          </div>
        </div>

        {/* ========================================================
            MOBILE VIEW SELECTOR TAB BAR (hidden on Desktop)
            ======================================================== */}
        <div className="md:hidden px-4 pt-3 pb-2 bg-surface-white flex border-b border-outline-variant/60 justify-between items-center gap-2">
          <div className="flex items-center bg-surface-container/60 p-1 rounded-xl border border-outline-variant/70 w-full shadow-inner">
            {["dia", "semana", "mes"].map((mode) => (
              <button
                key={mode}
                onClick={() => setMobileView(mode as MobileViewMode)}
                className={`flex-1 py-2 text-center rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all capitalize ${
                  mobileView === mode ? "bg-surface-white text-secondary shadow-sm" : "text-on-surface-variant"
                }`}
              >
                {mode === "dia" ? "Día" : mode === "semana" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================
            DESKTOP FILTERS BLOCK (hidden on Mobile, active for Weekly/Monthly)
            ======================================================== */}
        {desktopView !== "excepciones" && (
          <div className="hidden md:flex px-8 py-5 bg-surface-white border-b border-outline-variant/60 flex-col gap-2">
            <span className="text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-widest block">
              Destacar turnos de:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedWorker("todos")}
                className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  selectedWorker === "todos"
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-low border-outline-variant text-on-surface-variant hover:bg-surface-white"
                }`}
              >
                Ver Todo
              </button>
              {["Clemen", "Isabel", "Ismael"].map(worker => (
                <button
                  key={worker}
                  onClick={() => setSelectedWorker(worker as WorkerFilter)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                    selectedWorker === worker
                      ? "bg-secondary text-white border-secondary"
                      : "bg-surface-low border-outline-variant text-on-surface-variant hover:bg-secondary-container/10"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${selectedWorker === worker ? "bg-white" : workerStyles[worker].accent}`} />
                  {worker}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            MAIN LAYOUT CONTAINER
            ======================================================== */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 md:p-8">

          {/* ========================================================
              MOBILE VIEWS (block on Mobile, hidden on Desktop)
              ======================================================== */}
          <div className="block md:hidden">
            <AnimatePresence mode="wait">
              {/* --- VIEW 1: MOBILE DAILY CAROUSEL HUB --- */}
              {mobileView === "dia" && (
                <motion.div
                  key="mobile-view-dia"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  {/* Rotational Info Header */}
                  <div className="p-3.5 bg-surface-white border border-outline-variant/80 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Rotación Semanal:</span>
                    {getWeekBadgeDetails(selectedDateMobile)}
                  </div>

                  {/* Carousel Selection */}
                  <div className="flex items-center justify-between gap-2 p-2 bg-surface-white border border-outline-variant/60 rounded-xl shadow-inner">
                    <button
                      onClick={handlePrevWeek}
                      className="p-2 bg-surface-low rounded-lg border border-outline-variant text-on-surface active:scale-90 transition-all shrink-0"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div 
                      ref={carouselRef}
                      className="flex-1 flex justify-around overflow-x-auto no-scrollbar gap-1 py-1"
                    >
                      {weekDays.map((day, idx) => {
                        const isDaySelected = selectedDateMobile.getDate() === day.getDate() && selectedDateMobile.getMonth() === day.getMonth();
                        const isDayToday = isToday(day);
                        const weekdayStr = day.toLocaleDateString("es-ES", { weekday: "short" }).substring(0, 3);
                        const capitalizeWeekday = weekdayStr.charAt(0).toUpperCase() + weekdayStr.slice(1);
                        
                        // Check if this specific day has an active custom swap/override
                        const hasExc = exceptions.some(e => e.date === day.toISOString().split("T")[0]);

                        return (
                          <motion.button
                            key={idx}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedDateMobile(day)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl min-w-[42px] relative transition-all cursor-pointer ${
                              isDaySelected 
                                ? "bg-secondary text-white shadow-md shadow-secondary/15 font-bold" 
                                : isDayToday 
                                  ? "bg-secondary-container/30 text-secondary border border-secondary/20 font-bold" 
                                  : "text-on-surface-variant hover:bg-surface-low"
                            }`}
                          >
                            <span className="text-[8px] uppercase tracking-wider mb-1 leading-none">{capitalizeWeekday}</span>
                            <span className="text-xs leading-none">{day.getDate()}</span>
                            {isDayToday && !isDaySelected && (
                              <span className="w-1 h-1 bg-secondary rounded-full mt-1" />
                            )}
                            {hasExc && (
                              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-warning rounded-full border border-surface-white" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleNextWeek}
                      className="p-2 bg-surface-low rounded-lg border border-outline-variant text-on-surface active:scale-90 transition-all shrink-0"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Focused Day Title */}
                  <div className="text-center py-2.5 bg-surface-white border border-outline-variant/40 rounded-xl relative">
                    <h2 className="text-base font-bold capitalize text-on-surface tracking-tight">
                      {selectedDateMobile.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                    </h2>
                    
                    {/* Status badges */}
                    <div className="flex gap-1.5 justify-center mt-1">
                      {isToday(selectedDateMobile) && (
                        <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[8px] font-bold uppercase tracking-widest leading-none">
                          Hoy
                        </span>
                      )}
                      {exceptions.some(e => e.date === selectedDateMobile.toISOString().split("T")[0]) && (
                        <span className="px-2 py-0.5 rounded-full bg-warning/15 text-[#d97706] text-[8px] font-bold uppercase tracking-widest leading-none flex items-center gap-0.5">
                          <Sparkles size={8} /> Modificado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Shifts displays as large, thumb-friendly detailed cards */}
                  <div className="space-y-4">
                    {(() => {
                      const shifts = getShiftsForDate(selectedDateMobile);
                      
                      return (
                        <>
                          {/* Turno de Mañana */}
                          <div className="bg-surface-white border border-outline-variant/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-warning" />
                            <div className="flex items-center justify-between mb-3.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-warning/10 text-[#d97706] text-[10px] font-extrabold uppercase tracking-wider">
                                <Sun size={12} />
                                Turno de Mañana
                              </span>
                              <span className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1">
                                <Clock size={11} />
                                09:00h - 16:00h
                              </span>
                            </div>

                            <div className="space-y-2">
                              {shifts.manana.map(worker => {
                                const style = workerStyles[worker] || { bg: "bg-surface-low border-outline-variant/30", text: "text-on-surface", role: "", accent: "bg-outline" };
                                const isDim = !isWorkerHighlighted(worker);
                                
                                return (
                                  <div 
                                    key={worker}
                                    className={`flex items-center gap-3.5 p-3 rounded-xl border ${style.bg} ${style.border} transition-all duration-300 ${isDim ? "opacity-20 grayscale-30" : "opacity-100"}`}
                                  >
                                    <div className="w-10 h-10 rounded-lg bg-surface-white border border-outline-variant/30 flex items-center justify-center shrink-0">
                                      {worker === "Cerrado" ? <Lock size={16} className="text-error" /> : <User size={18} className={style.text} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className={`text-sm font-bold block ${style.text}`}>{worker}</span>
                                      <span className="text-[10px] text-on-surface-variant leading-none block mt-0.5">{style.role}</span>
                                    </div>
                                    <span className={`w-2 h-2 rounded-full ${style.accent}`} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Turno de Tarde */}
                          <div className="bg-surface-white border border-outline-variant/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-secondary" />
                            <div className="flex items-center justify-between mb-3.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/10 text-secondary text-[10px] font-extrabold uppercase tracking-wider">
                                <Moon size={12} />
                                Turno de Tarde
                              </span>
                              <span className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1">
                                <Clock size={11} />
                                16:00h - Cierre
                              </span>
                            </div>

                            <div className="space-y-2">
                              {shifts.tarde.map(worker => {
                                const style = workerStyles[worker] || { bg: "bg-surface-low border-outline-variant/30 border-outline-variant/20", text: "text-on-surface", role: "", accent: "bg-outline" };
                                const isClosed = worker === "Cerrado";
                                const isDim = !isWorkerHighlighted(worker);
                                
                                return (
                                  <div 
                                    key={worker}
                                    className={`flex items-center gap-3.5 p-3 rounded-xl border ${style.bg} ${style.border} transition-all duration-300 ${isDim ? "opacity-20 grayscale-30" : "opacity-100"}`}
                                  >
                                    <div className="w-10 h-10 rounded-lg bg-surface-white border border-outline-variant/30 flex items-center justify-center shrink-0">
                                      {isClosed ? <Lock size={16} className="text-error" /> : <User size={18} className={style.text} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className={`text-sm font-bold block ${style.text}`}>{worker}</span>
                                      <span className="text-[10px] text-on-surface-variant leading-none block mt-0.5">{style.role}</span>
                                    </div>
                                    <span className={`w-2 h-2 rounded-full ${style.accent}`} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </motion.div>
              )}

              {/* --- VIEW 2: MOBILE WEEKLY VERTICAL TIMELINE --- */}
              {mobileView === "semana" && (
                <motion.div
                  key="mobile-view-semana"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between p-3 bg-surface-white border border-outline-variant rounded-xl shadow-sm">
                    <button onClick={handlePrevWeek} className="p-1.5 border border-outline-variant rounded-lg bg-surface-low text-on-surface"><ChevronLeft size={14} /></button>
                    <span className="text-xs font-bold text-on-surface">{formatWeekRange()}</span>
                    <button onClick={handleNextWeek} className="p-1.5 border border-outline-variant rounded-lg bg-surface-low text-on-surface"><ChevronRight size={14} /></button>
                  </div>

                  <div className="space-y-3">
                    {weekDays.map((day, idx) => {
                      const shifts = getShiftsForDate(day);
                      const isDayToday = isToday(day);
                      const weekdayStr = day.toLocaleDateString("es-ES", { weekday: "long" });
                      const capitalizedWeekday = weekdayStr.charAt(0).toUpperCase() + weekdayStr.slice(1);
                      const dateStr = day.toLocaleDateString("es-ES", { day: "numeric", month: "short" });

                      const isMananaHighlight = isShiftHighlighted(shifts.manana);
                      const isTardeHighlight = isShiftHighlighted(shifts.tarde);
                      const hasExc = exceptions.some(e => e.date === day.toISOString().split("T")[0]);

                      return (
                        <div 
                          key={idx}
                          className={`bg-surface-white border rounded-xl p-3.5 flex flex-col gap-3 shadow-sm transition-all ${
                            isDayToday ? "ring-1.5 ring-secondary border-secondary/50" : "border-outline-variant/60"
                          }`}
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                            <div className="flex items-center gap-2">
                              <h3 className={`text-sm font-bold ${isDayToday ? "text-secondary" : "text-on-surface"}`}>{capitalizedWeekday}</h3>
                              <span className="text-[10px] text-on-surface-variant font-medium">{dateStr}</span>
                              {hasExc && (
                                <span className="w-1.5 h-1.5 rounded-full bg-warning" title="Modificado" />
                              )}
                            </div>
                            {isDayToday ? (
                              <span className="px-2 py-0.5 rounded bg-secondary text-white text-[8px] font-bold uppercase tracking-wider">Hoy</span>
                            ) : (
                              <span className="text-[8px] font-bold text-on-surface-variant/60 uppercase">Rot. {getWeekType(day)}</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Morning */}
                            <div className={`p-2 bg-surface-low/70 border border-outline-variant/30 rounded-lg flex flex-col justify-between transition-opacity ${isMananaHighlight ? "opacity-100" : "opacity-30"}`}>
                              <span className="text-[8px] font-extrabold uppercase text-[#d97706] tracking-wider flex items-center gap-1"><Sun size={10} /> Mañana</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {shifts.manana.map(w => {
                                  const style = workerStyles[w] || { text: "text-on-surface" };
                                  return (
                                    <span key={w} className={`text-[10px] font-bold ${style.text}`}>{w}</span>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Afternoon */}
                            <div className={`p-2 bg-surface-low/70 border border-outline-variant/30 rounded-lg flex flex-col justify-between transition-opacity ${isTardeHighlight ? "opacity-100" : "opacity-30"}`}>
                              <span className="text-[8px] font-extrabold uppercase text-secondary tracking-wider flex items-center gap-1"><Moon size={10} /> Tarde</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {shifts.tarde.map(w => {
                                  const style = workerStyles[w] || { text: "text-on-surface" };
                                  return (
                                    <span key={w} className={`text-[10px] font-bold ${style.text}`}>{w}</span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* --- VIEW 3: MOBILE COMPACT MONTH VIEW --- */}
              {mobileView === "mes" && (
                <motion.div
                  key="mobile-view-mes"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between p-3 bg-surface-white border border-outline-variant rounded-xl shadow-sm">
                    <button onClick={handlePrevMonth} className="p-1.5 border border-outline-variant rounded-lg bg-surface-low text-on-surface"><ChevronLeft size={14} /></button>
                    <span className="text-xs font-bold text-on-surface uppercase tracking-wider">{monthYearStr}</span>
                    <button onClick={handleNextMonth} className="p-1.5 border border-outline-variant rounded-lg bg-surface-low text-on-surface"><ChevronRight size={14} /></button>
                  </div>

                  <div className="bg-surface-white border border-outline-variant/80 rounded-xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-low/80 py-2">
                      {["L", "M", "X", "J", "V", "S", "D"].map(d => (
                        <div key={d} className="text-center text-[9px] font-extrabold text-on-surface-variant/60">{d}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 auto-rows-[65px]">
                      {renderMonthDays().map((cell, idx) => {
                        const isCellToday = isToday(cell.date);
                        const hasExc = exceptions.some(e => e.date === cell.date.toISOString().split("T")[0]);
                        
                        const works = [...cell.shifts.manana, ...cell.shifts.tarde].filter(w => w !== "Cerrado");
                        const uniqueWorkers = Array.from(new Set(works));

                        return (
                          <div
                            key={idx}
                            onClick={() => openMobileDrawer(cell.date)}
                            className={`p-1.5 border-r border-b border-outline-variant/30 last:border-r-0 flex flex-col items-center justify-between cursor-pointer relative transition-all ${
                              !cell.isCurrentMonth ? "bg-surface-container/20 text-on-surface-variant/35" : "bg-surface-white text-on-surface"
                            } ${isCellToday ? "bg-secondary-container/10 font-extrabold" : ""}`}
                          >
                            <span className={`text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                              isCellToday ? "bg-secondary text-white shadow-sm" : ""
                            }`}>
                              {cell.dayNum}
                            </span>

                            {/* Tiny colored dots representing workers */}
                            <div className="flex gap-0.5 justify-center py-1">
                              {uniqueWorkers.map(w => {
                                const accent = workerStyles[w]?.accent || "bg-outline";
                                return (
                                  <span key={w} className={`w-1.5 h-1.5 rounded-full ${accent}`} />
                                );
                              })}
                              {uniqueWorkers.length === 0 && (
                                <span className="w-1 h-1 rounded-full bg-error/45" />
                              )}
                            </div>

                            {/* Mod indicator */}
                            {hasExc && (
                              <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-warning" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-center text-[10px] text-on-surface-variant/80 italic">
                    * Pulsa sobre cualquier día del mes para ver quién trabaja en un menú deslizante.
                  </p>
                </motion.div>
              )}

              {/* --- VIEW 4: MOBILE EXCEPTIONS HUB --- */}
              {mobileView === "excepciones" && (
                !currentUser ? (
                  <motion.div
                    key="mobile-view-excepciones-locked"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center justify-center py-10 px-4 text-center max-w-sm mx-auto min-h-[50vh] bg-surface-white border border-outline-variant rounded-2xl shadow-sm w-full"
                  >
                    <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4 shadow-sm">
                      <Lock size={24} />
                    </div>
                    <h2 className="text-lg font-bold text-on-surface tracking-tight">Acceso Restringido</h2>
                    <p className="text-xs text-on-surface-variant mt-2 leading-relaxed max-w-xs">
                      Para registrar modificaciones o visualizar el historial detallado de cambios, debes identificarte con tu cuenta de empleado.
                    </p>
                    
                    <div className="w-full border-t border-outline-variant/60 my-5" />
                    
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/80 mb-3">¿Quién eres?</p>
                    
                    <div className="flex flex-col gap-2.5 w-full">
                      <button
                        onClick={() => {
                          login("Clemen", false);
                          router.replace("/clemen/horario");
                        }}
                        className="group flex items-center gap-3.5 p-3.5 bg-[#eff4ff] border border-[#bec6e0]/60 rounded-xl transition-all duration-300 hover:border-secondary hover:bg-surface-white shadow-sm active:scale-98 text-left cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-surface-white border border-outline-variant flex items-center justify-center text-[#0058be] font-bold shadow-sm">
                          C
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-[#0058be] block">Clemen</span>
                          <span className="text-[9px] text-on-surface-variant block leading-none mt-0.5">Gestión de Cocina</span>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          login("Isabel", false);
                          router.replace("/isabel/horario");
                        }}
                        className="group flex items-center gap-3.5 p-3.5 bg-[#eefcf7] border border-[#bfeade]/60 rounded-xl transition-all duration-300 hover:border-success hover:bg-surface-white shadow-sm active:scale-98 text-left cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-surface-white border border-outline-variant flex items-center justify-center text-[#009668] font-bold shadow-sm">
                          I
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-[#009668] block">Isabel</span>
                          <span className="text-[9px] text-on-surface-variant block leading-none mt-0.5">Servicio y Limpieza</span>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="mobile-view-excepciones"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                      <RefreshCw size={16} className="text-warning animate-spin-slow" />
                      Historial de Cambios
                    </h2>
                    <button
                      onClick={() => setIsAddingExceptionMobile(true)}
                      className="px-3 py-1.5 bg-secondary text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                    >
                      <Plus size={12} /> Registrar Cambio
                    </button>
                  </div>

                  {/* Compact Mobile History Calendar */}
                  <div className="bg-surface-white border border-outline-variant/80 rounded-2xl p-3 shadow-sm">
                    <div 
                      onClick={() => setIsHistoryCalendarCollapsed(!isHistoryCalendarCollapsed)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-secondary" />
                        Calendario de Cambios
                      </span>
                      <span className="text-[9px] font-bold text-secondary uppercase hover:underline">
                        {isHistoryCalendarCollapsed ? "Ver" : "Ocultar"}
                      </span>
                    </div>

                    {!isHistoryCalendarCollapsed && (
                      <div className="mt-3 pt-3 border-t border-outline-variant/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setHistoryCalendarDate(new Date(historyCalendarDate.getFullYear(), historyCalendarDate.getMonth() - 1, 1))}
                            className="p-1 border border-outline-variant rounded-lg bg-surface-low text-on-surface active:scale-95"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <span className="text-[10px] font-extrabold text-on-surface uppercase tracking-wider">
                            {historyCalendarDate.toLocaleString("es-ES", { month: "long", year: "numeric" })}
                          </span>
                          <button
                            type="button"
                            onClick={() => setHistoryCalendarDate(new Date(historyCalendarDate.getFullYear(), historyCalendarDate.getMonth() + 1, 1))}
                            className="p-1 border border-outline-variant rounded-lg bg-surface-low text-on-surface active:scale-95"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 border-b border-outline-variant/30 pb-1 text-center">
                          {["L", "M", "X", "J", "V", "S", "D"].map(d => (
                            <div key={d} className="text-center text-[8px] font-extrabold text-on-surface-variant/50">{d}</div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 auto-rows-[36px]">
                          {renderHistoryMonthDays().map((cell, idx) => {
                            const dateStr = getLocalDateString(cell.date);
                            const hasExc = exceptions.some(e => e.date === dateStr);
                            const isSelected = selectedHistoryDate && getLocalDateString(selectedHistoryDate) === dateStr;
                            const isCellToday = isToday(cell.date);

                            return (
                              <div
                                key={idx}
                                onClick={() => setSelectedHistoryDate(isSelected ? null : cell.date)}
                                className={`flex flex-col items-center justify-center cursor-pointer relative rounded-lg m-0.5 border transition-all ${
                                  !cell.isCurrentMonth 
                                    ? "text-on-surface-variant/20 border-transparent" 
                                    : isSelected
                                      ? "bg-secondary text-white border-secondary shadow-sm font-bold scale-105"
                                      : isCellToday
                                        ? "bg-secondary-container/20 text-secondary border-secondary/30 font-bold"
                                        : hasExc
                                          ? "bg-amber-500/10 border-amber-500/30 text-amber-800"
                                          : "bg-surface-low/30 border-transparent text-on-surface hover:bg-surface-low"
                                }`}
                              >
                                <span className="text-[10px] font-bold">{cell.date.getDate()}</span>
                                {hasExc && !isSelected && (
                                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-amber-500" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Filter Indicator */}
                  {selectedHistoryDate && (
                    <div className="flex items-center justify-between px-3 py-2 bg-secondary-container/10 border border-secondary/20 rounded-xl">
                      <span className="text-[10px] font-bold text-secondary">
                        Mostrando cambios para el {selectedHistoryDate.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
                      </span>
                      <button
                        onClick={() => setSelectedHistoryDate(null)}
                        className="text-[9px] font-bold uppercase tracking-wider text-secondary flex items-center gap-0.5 hover:underline"
                      >
                        Ver todos
                      </button>
                    </div>
                  )}

                  {/* List of active exceptions */}
                  <div className="space-y-3">
                    {(() => {
                      const filteredExceptions = exceptions.filter(exc => {
                        if (!selectedHistoryDate) return true;
                        return exc.date === getLocalDateString(selectedHistoryDate);
                      });
                      const sortedExceptions = [...filteredExceptions].sort((a, b) => {
                        return new Date(b.date + "T00:00:00").getTime() - new Date(a.date + "T00:00:00").getTime();
                      });

                      if (sortedExceptions.length === 0) {
                        return (
                          <div className="text-center py-12 bg-surface-white border border-outline-variant/60 rounded-2xl">
                            <CalendarDays size={32} className="text-on-surface-variant/30 mx-auto mb-2" />
                            <span className="text-xs text-on-surface-variant font-bold block">No hay excepciones registradas</span>
                            <p className="text-[10px] text-on-surface-variant/60 max-w-[200px] mx-auto mt-1 leading-normal">
                              {selectedHistoryDate 
                                ? "No hay modificaciones en la fecha seleccionada."
                                : "Todos los turnos siguen la rotación estándar A/B."
                              }
                            </p>
                          </div>
                        );
                      }

                      return sortedExceptions.map((exc) => {
                        const excDate = new Date(exc.date + "T00:00:00");
                        
                        return (
                          <div 
                            key={exc.id}
                            className="bg-surface-white border border-outline-variant/80 rounded-2xl p-4 shadow-sm relative overflow-hidden"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="text-xs font-bold text-on-surface leading-tight block capitalize">
                                  {excDate.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "long" })}
                                </span>
                                
                                <div className="mt-1 flex gap-1.5 flex-wrap">
                                  {exc.type === "swap_single" && (
                                    <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-[#0058be] text-[8px] font-extrabold uppercase tracking-wider">
                                      Intercambio
                                    </span>
                                  )}
                                  {exc.type === "custom" && (
                                    <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-100 text-[#d97706] text-[8px] font-extrabold uppercase tracking-wider">
                                      Modificación Puntual
                                    </span>
                                  )}
                                  {exc.type === "swap_permanent" && (
                                    <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-100 text-purple-700 text-[8px] font-extrabold uppercase tracking-wider">
                                      Cambio Rotación
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => handleDeleteException(exc.id)}
                                className="p-2 border border-error/15 text-error bg-error/5 rounded-lg active:scale-90 transition-all shrink-0"
                                title="Eliminar excepción"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed italic bg-surface-low/60 p-2.5 rounded-lg border border-outline-variant/30">
                              &ldquo;{exc.description}&rdquo;
                            </p>

                            {exc.createdBy && (
                              <div className="mt-2.5 flex items-center gap-1.5 text-[9px] font-bold text-on-surface-variant/80">
                                <span className={`w-1.5 h-1.5 rounded-full ${exc.createdBy === "Isabel" ? "bg-success" : "bg-secondary"}`} />
                                <span>Registrado por: <strong className={exc.createdBy === "Isabel" ? "text-[#009668]" : "text-[#0058be]"}>{exc.createdBy}</strong></span>
                              </div>
                            )}

                            {/* COMPARATIVE OF SHIFTS */}
                            {renderExceptionCardComparison(exc)}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ========================================================
              DESKTOP VIEWS (block on Desktop, hidden on Mobile)
              ======================================================== */}
          <div className="hidden md:block">
            <AnimatePresence mode="wait">
              {desktopView === "semanal" && (
                /* --- DESKTOP VIEW 1: WEEKLY PLANNER GRID --- */
                <motion.div
                  key="desktop-view-semanal"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between p-5 bg-surface-white border border-outline-variant rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
                        <CalendarRange size={20} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-on-surface leading-snug">{formatWeekRange()}</h2>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          {getWeekBadgeDetails(currentDate)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={handlePrevWeek} className="p-2 rounded-xl border border-outline-variant hover:border-secondary/20 hover:bg-surface-low text-on-surface transition-all cursor-pointer"><ChevronLeft size={18} /></button>
                      <button onClick={handleResetToToday} className="px-3.5 py-2 rounded-xl border border-outline-variant hover:border-secondary/20 text-xs font-semibold text-on-surface hover:bg-surface-low transition-all cursor-pointer">Esta Semana</button>
                      <button onClick={handleNextWeek} className="p-2 rounded-xl border border-outline-variant hover:border-secondary/20 hover:bg-surface-low text-on-surface transition-all cursor-pointer"><ChevronRight size={18} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-4">
                    {weekDays.map((day, idx) => {
                      const shifts = getShiftsForDate(day);
                      const isDayToday = isToday(day);
                      const formattedDayName = day.toLocaleDateString("es-ES", { weekday: "long" });
                      const capitalizedDayName = formattedDayName.charAt(0).toUpperCase() + formattedDayName.slice(1);
                      const formattedDateStr = day.toLocaleDateString("es-ES", { day: "numeric", month: "short" });

                      const isMananaHighlight = isShiftHighlighted(shifts.manana);
                      const isTardeHighlight = isShiftHighlighted(shifts.tarde);
                      const hasExc = exceptions.some(e => e.date === day.toISOString().split("T")[0]);

                      return (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -3 }}
                          className={`bg-surface-white border rounded-2xl p-5 flex flex-col justify-between shadow-sm min-h-[360px] relative transition-all duration-300 ${
                            isDayToday 
                              ? "ring-2 ring-secondary/50 border-secondary bg-secondary-container/5" 
                              : "border-outline-variant"
                          }`}
                        >
                          <div className="mb-4 flex items-start justify-between">
                            <div>
                              <h3 className={`text-base font-bold tracking-tight ${isDayToday ? "text-secondary" : "text-on-surface"}`}>
                                {capitalizedDayName}
                              </h3>
                              <span className="text-xs text-on-surface-variant font-medium block mt-0.5">
                                {formattedDateStr}
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              {isDayToday && (
                                <span className="px-2 py-0.5 rounded-full bg-secondary text-white text-[9px] font-bold uppercase tracking-wider animate-pulse">Hoy</span>
                              )}
                              {hasExc && (
                                <span className="px-2 py-0.5 rounded-full bg-warning/15 text-[#d97706] text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5"><Sparkles size={8} /> Mod</span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4 flex-1 flex flex-col justify-end">
                            <div className={`p-3.5 rounded-xl border border-outline-variant/40 bg-surface-low/80 transition-all duration-300 ${isMananaHighlight ? "opacity-100" : "opacity-30"}`}>
                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-on-surface-variant flex items-center gap-1 mb-2">
                                <Sun size={12} className="text-warning shrink-0" />
                                Mañana (09h - 16h)
                              </span>
                              <div className="flex flex-col gap-1.5">
                                {shifts.manana.map(worker => {
                                  const style = workerStyles[worker] || { text: "text-on-surface" };
                                  return (
                                    <span key={worker} className={`text-xs font-bold ${style.text}`}>{worker}</span>
                                  );
                                })}
                              </div>
                            </div>

                            <div className={`p-3.5 rounded-xl border border-outline-variant/40 bg-surface-low/80 transition-all duration-300 ${isTardeHighlight ? "opacity-100" : "opacity-30"}`}>
                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-on-surface-variant flex items-center gap-1 mb-2">
                                <Moon size={12} className="text-secondary shrink-0" />
                                Tarde (16h - Cierre)
                              </span>
                              <div className="flex flex-col gap-1.5">
                                {shifts.tarde.map(worker => {
                                  const style = workerStyles[worker] || { text: "text-on-surface" };
                                  return (
                                    <span key={worker} className={`text-xs font-bold ${style.text}`}>{worker}</span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {desktopView === "mensual" && (
                /* --- DESKTOP VIEW 2: MONTHLY GRID --- */
                <motion.div
                  key="desktop-view-mensual"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between p-5 bg-surface-white border border-outline-variant rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
                        <CalendarIcon size={20} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-on-surface leading-snug">{monthYearStr}</h2>
                        <p className="text-xs text-on-surface-variant mt-0.5">Vista global de planificación</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={handlePrevMonth} className="p-2 rounded-xl border border-outline-variant hover:border-secondary/20 hover:bg-surface-low text-on-surface transition-all cursor-pointer"><ChevronLeft size={18} /></button>
                      <button onClick={handleResetToToday} className="px-3.5 py-2 rounded-xl border border-outline-variant hover:border-secondary/20 text-xs font-semibold text-on-surface hover:bg-surface-low transition-all cursor-pointer">Mes Actual</button>
                      <button onClick={handleNextMonth} className="p-2 rounded-xl border border-outline-variant hover:border-secondary/20 hover:bg-surface-low text-on-surface transition-all cursor-pointer"><ChevronRight size={18} /></button>
                    </div>
                  </div>

                  <div className="bg-surface-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-low/80">
                      {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(d => (
                        <div key={d} className="py-3 text-center text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant opacity-85">{d}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 auto-rows-[135px]">
                      {renderMonthDays().map((cell, idx) => {
                        const isCellToday = isToday(cell.date);
                        const type = getWeekType(cell.date);
                        const hasExc = exceptions.some(e => e.date === cell.date.toISOString().split("T")[0]);
                        
                        const isMananaMatch = isShiftHighlighted(cell.shifts.manana);
                        const isTardeMatch = isShiftHighlighted(cell.shifts.tarde);

                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedDayDetail(cell.date)}
                            className={`p-3 border-r border-b border-outline-variant/40 last:border-r-0 hover:bg-surface-low/30 transition-colors flex flex-col justify-between cursor-pointer relative group ${
                              !cell.isCurrentMonth ? "bg-surface-container/20 text-on-surface-variant/35" : "bg-surface-white text-on-surface"
                            } ${isCellToday ? "ring-2 ring-secondary/55 ring-inset bg-secondary-container/5 z-10" : ""}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                                isCellToday ? "bg-secondary text-white shadow-sm" : cell.isCurrentMonth ? "text-on-surface" : "text-on-surface-variant/40"
                              }`}>
                                {cell.dayNum}
                              </span>
                              
                              <div className="flex items-center gap-1.5">
                                {hasExc && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-warning" title="Horario Modificado" />
                                )}
                                {cell.isCurrentMonth && (
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                    type === "A" ? "bg-secondary/5 text-secondary/60" : "bg-success/5 text-success/60"
                                  }`}>
                                    Rot. {type}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1.5 mt-2">
                              <div className={`flex items-center gap-1 overflow-hidden transition-opacity duration-300 ${isMananaMatch ? "opacity-100" : "opacity-20"}`}>
                                <span className="text-[8px] font-bold text-on-surface-variant shrink-0">M:</span>
                                <div className="flex gap-0.5 truncate">
                                  {cell.shifts.manana.map((w, wIdx) => {
                                    const accent = workerStyles[w]?.accent || "bg-outline";
                                    return (
                                      <span key={wIdx} className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white shrink-0 ${accent}`}>
                                        {w.charAt(0)}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className={`flex items-center gap-1 overflow-hidden transition-opacity duration-300 ${isTardeMatch ? "opacity-100" : "opacity-20"}`}>
                                <span className="text-[8px] font-bold text-on-surface-variant shrink-0">T:</span>
                                <div className="flex gap-0.5 truncate">
                                  {cell.shifts.tarde.map((w, wIdx) => {
                                    const accent = workerStyles[w]?.accent || "bg-outline";
                                    return (
                                      <span key={wIdx} className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white shrink-0 ${accent}`}>
                                        {w.charAt(0)}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {desktopView === "excepciones" && (
                !currentUser ? (
                  <motion.div
                    key="desktop-view-excepciones-locked"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="col-span-12 py-16 text-center max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh] bg-surface-white border border-outline-variant rounded-2xl p-8 shadow-sm space-y-6 w-full"
                  >
                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                      <Lock size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-on-surface tracking-tight">Acceso Restringido</h2>
                      <p className="text-sm text-on-surface-variant mt-2.5 leading-relaxed max-w-sm mx-auto">
                        Para registrar modificaciones en los turnos o visualizar el historial detallado de cambios, es necesario identificarse con tu cuenta de empleado.
                      </p>
                    </div>
                    
                    <div className="w-full border-t border-outline-variant/60 my-2" />
                    
                    <div className="w-full space-y-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/80">¿Quién eres?</p>
                      
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <button
                          onClick={() => {
                            login("Clemen", false);
                            router.replace("/clemen/horario");
                          }}
                          className="group flex flex-col items-center gap-3 p-5 bg-[#eff4ff] border border-[#bec6e0]/60 rounded-xl transition-all duration-300 hover:border-secondary hover:bg-surface-white shadow-sm hover:shadow-md active:scale-98 cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-xl bg-surface-white border border-outline-variant flex items-center justify-center text-[#0058be] font-bold text-lg shadow-sm transition-all group-hover:bg-secondary/5">
                            C
                          </div>
                          <div className="text-center">
                            <span className="text-sm font-bold text-[#0058be] block">Clemen</span>
                            <span className="text-[10px] text-on-surface-variant block mt-0.5 leading-none">Gestión Cocina</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => {
                            login("Isabel", false);
                            router.replace("/isabel/horario");
                          }}
                          className="group flex flex-col items-center gap-3 p-5 bg-[#eefcf7] border border-[#bfeade]/60 rounded-xl transition-all duration-300 hover:border-success hover:bg-surface-white shadow-sm hover:shadow-md active:scale-98 cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-xl bg-surface-white border border-outline-variant flex items-center justify-center text-[#009668] font-bold text-lg shadow-sm transition-all group-hover:bg-success/5">
                            I
                          </div>
                          <div className="text-center">
                            <span className="text-sm font-bold text-[#009668] block">Isabel</span>
                            <span className="text-[10px] text-on-surface-variant block mt-0.5 leading-none">Servicio y Limpieza</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* --- DESKTOP VIEW 3: FULL DASHBOARD FOR EXCEPTIONS MANAGEMENT --- */
                  <motion.div
                    key="desktop-view-excepciones"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-12 gap-6"
                  >
                  {/* Column 1: Changes Calendar (col-span-4) */}
                  <div className="col-span-4 space-y-4">
                    <h2 className="text-base font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <CalendarIcon size={18} className="text-secondary" />
                      Calendario de Cambios
                    </h2>

                    <div className="bg-surface-white border border-outline-variant rounded-2xl p-5 shadow-sm space-y-4">
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Pulsa sobre un día para filtrar y visualizar los cambios de esa fecha o para pre-seleccionar el día en el formulario.
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setHistoryCalendarDate(new Date(historyCalendarDate.getFullYear(), historyCalendarDate.getMonth() - 1, 1))}
                          className="p-1.5 border border-outline-variant rounded-lg bg-surface-low text-on-surface hover:bg-surface-white cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-bold text-on-surface uppercase tracking-wider">
                          {historyCalendarDate.toLocaleString("es-ES", { month: "long", year: "numeric" })}
                        </span>
                        <button
                          type="button"
                          onClick={() => setHistoryCalendarDate(new Date(historyCalendarDate.getFullYear(), historyCalendarDate.getMonth() + 1, 1))}
                          className="p-1.5 border border-outline-variant rounded-lg bg-surface-low text-on-surface hover:bg-surface-white cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 border-b border-outline-variant pb-2 bg-surface-low/30 py-1.5 rounded-lg text-center">
                        {["Lunes", "Martes", "Miérc", "Juev", "Viern", "Sáb", "Dom"].map(d => (
                          <div key={d} className="text-[10px] font-extrabold uppercase text-on-surface-variant/75">{d.substring(0, 3)}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 auto-rows-[44px]">
                        {renderHistoryMonthDays().map((cell, idx) => {
                          const dateStr = getLocalDateString(cell.date);
                          const dayExceptions = exceptions.filter(e => e.date === dateStr);
                          const hasExc = dayExceptions.length > 0;
                          const isSelected = selectedHistoryDate && getLocalDateString(selectedHistoryDate) === dateStr;
                          const isCellToday = isToday(cell.date);

                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedHistoryDate(isSelected ? null : cell.date)}
                              className={`flex flex-col items-center justify-center cursor-pointer relative rounded-xl m-1 border transition-all duration-200 ${
                                !cell.isCurrentMonth 
                                  ? "text-on-surface-variant/20 border-transparent hover:bg-surface-low/20" 
                                  : isSelected
                                    ? "bg-secondary text-white border-secondary shadow-md font-bold scale-105"
                                    : isCellToday
                                      ? "bg-secondary-container/20 text-secondary border-secondary/30 font-bold"
                                      : hasExc
                                        ? "bg-amber-500/10 border-amber-500/30 text-amber-800 font-semibold"
                                        : "bg-surface-low/30 border-transparent text-on-surface hover:bg-surface-low"
                              }`}
                            >
                              <span className="text-xs font-bold">{cell.date.getDate()}</span>
                              {hasExc && !isSelected && (
                                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {selectedHistoryDate && (
                        <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between">
                          <span className="text-[10px] text-on-surface-variant font-medium">
                            Filtro activo: <strong className="text-secondary">{selectedHistoryDate.toLocaleDateString("es-ES")}</strong>
                          </span>
                          <button
                            onClick={() => setSelectedHistoryDate(null)}
                            className="text-[10px] font-bold text-secondary uppercase hover:underline cursor-pointer"
                          >
                            Limpiar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Changes List (col-span-4) */}
                  <div className="col-span-4 space-y-4">
                    <h2 className="text-base font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <RefreshCw size={18} className="text-warning animate-spin-slow" />
                      Historial de Cambios ({
                        (() => {
                          const filtered = exceptions.filter(exc => {
                            if (!selectedHistoryDate) return true;
                            return exc.date === getLocalDateString(selectedHistoryDate);
                          });
                          return filtered.length;
                        })()
                      })
                    </h2>

                    <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2 no-scrollbar">
                      {(() => {
                        const filteredExceptions = exceptions.filter(exc => {
                          if (!selectedHistoryDate) return true;
                          return exc.date === getLocalDateString(selectedHistoryDate);
                        });
                        const sortedExceptions = [...filteredExceptions].sort((a, b) => {
                          return new Date(b.date + "T00:00:00").getTime() - new Date(a.date + "T00:00:00").getTime();
                        });

                        if (sortedExceptions.length === 0) {
                          return (
                            <div className="text-center py-16 bg-surface-white border border-outline-variant rounded-2xl shadow-sm">
                              <CalendarDays size={42} className="text-on-surface-variant/30 mx-auto mb-3" />
                              <h3 className="text-sm font-bold text-on-surface">No hay cambios registrados</h3>
                              <p className="text-xs text-on-surface-variant mt-1.5 max-w-sm mx-auto">
                                {selectedHistoryDate 
                                  ? "No se han registrado modificaciones para la fecha seleccionada."
                                  : "Todos los turnos actuales están siguiendo las rotaciones dinámicas de la Semana A y B."
                                }
                              </p>
                              {selectedHistoryDate && (
                                <button
                                  onClick={() => setSelectedHistoryDate(null)}
                                  className="mt-4 px-4 py-2 border border-secondary text-secondary rounded-xl text-xs font-bold hover:bg-secondary/5 transition-all cursor-pointer shadow-sm"
                                >
                                  Ver todos los cambios
                                </button>
                              )}
                            </div>
                          );
                        }

                        return sortedExceptions.map((exc) => {
                          const excDate = new Date(exc.date + "T00:00:00");
                          return (
                            <motion.div 
                              key={exc.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-surface-white border border-outline-variant rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-sm font-bold text-on-surface capitalize">
                                    {excDate.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                                  </h3>
                                  
                                  <div className="mt-1 flex gap-2 flex-wrap">
                                    {exc.type === "swap_single" && (
                                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[#0058be] text-[8px] font-extrabold uppercase tracking-wider">
                                        Intercambio
                                      </span>
                                    )}
                                    {exc.type === "custom" && (
                                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-[#d97706] text-[8px] font-extrabold uppercase tracking-wider">
                                        Mod. Puntual
                                      </span>
                                    )}
                                    {exc.type === "swap_permanent" && (
                                      <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-[8px] font-extrabold uppercase tracking-wider">
                                        Rotación General
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleDeleteException(exc.id)}
                                  className="p-2 border border-error/10 text-error hover:bg-error/5 bg-surface-low rounded-xl transition-all cursor-pointer shadow-sm shrink-0"
                                  title="Eliminar excepción"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              <p className="text-xs text-on-surface-variant mt-3 leading-relaxed italic bg-surface-low/80 p-3 rounded-xl border border-outline-variant/30">
                                &ldquo;{exc.description}&rdquo;
                              </p>

                              {exc.createdBy && (
                                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant/80">
                                  <span className={`w-1.5 h-1.5 rounded-full ${exc.createdBy === "Isabel" ? "bg-success" : "bg-secondary"}`} />
                                  <span>Registrado por: <strong className={exc.createdBy === "Isabel" ? "text-[#009668]" : "text-[#0058be]"}>{exc.createdBy}</strong></span>
                                </div>
                              )}

                              {/* COMPARATIVE OF SHIFTS */}
                              {renderExceptionCardComparison(exc)}
                            </motion.div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Column 3: Form to add exception (col-span-4) */}
                  <div className="col-span-4">
                    <div className="bg-surface-white border border-outline-variant rounded-2xl p-5 shadow-sm sticky top-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Plus size={18} className="text-secondary" />
                        <h3 className="font-bold text-on-surface">Registrar Nuevo Cambio</h3>
                      </div>

                      <form onSubmit={handleAddExceptionSubmit} className="space-y-4">
                        {/* Date field */}
                        <div>
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1.5">Fecha del Cambio</label>
                          <input 
                            type="date" 
                            required
                            value={formDate}
                            onChange={(e) => setFormDate(e.target.value)}
                            className="w-full bg-surface-low border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium focus:border-secondary focus:outline-none"
                          />
                        </div>

                        {/* 1. Selección de Turnos */}
                        {formDate ? (
                          <div className="space-y-4">
                            <div className="p-4 border border-outline-variant/60 rounded-xl bg-surface-low/30 space-y-4">
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">1. ¿Quién trabaja este día?</p>
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#d97706] block mb-2">Turno Mañana:</span>
                                <div className="flex flex-wrap gap-2">
                                  {["Clemen", "Isabel", "Ismael", "Cerrado"].map(worker => {
                                    const isSelected = formManana.includes(worker);
                                    return (
                                      <button
                                        key={worker}
                                        type="button"
                                        onClick={() => toggleFormWorker(worker, "manana")}
                                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                                          isSelected 
                                            ? "bg-primary border-primary text-on-primary shadow-sm" 
                                            : "bg-surface-white border-outline-variant text-on-surface-variant hover:bg-surface-low"
                                        }`}
                                      >
                                        {worker}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-secondary block mb-2">Turno Tarde:</span>
                                <div className="flex flex-wrap gap-2">
                                  {["Clemen", "Isabel", "Ismael", "Cerrado"].map(worker => {
                                    const isSelected = formTarde.includes(worker);
                                    return (
                                      <button
                                        key={worker}
                                        type="button"
                                        onClick={() => toggleFormWorker(worker, "tarde")}
                                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                                          isSelected 
                                            ? "bg-primary border-primary text-on-primary shadow-sm" 
                                            : "bg-surface-white border-outline-variant text-on-surface-variant hover:bg-surface-low"
                                        }`}
                                      >
                                        {worker}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* 2. Impacto en la rotación */}
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">2. ¿Impacto en días posteriores?</p>
                              <div className="grid grid-cols-1 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setFormAffectsRotation(false)}
                                  className={`p-3 rounded-xl border text-left flex flex-col justify-center cursor-pointer transition-all ${
                                    !formAffectsRotation 
                                      ? "bg-secondary-container/20 border-secondary text-secondary font-bold" 
                                      : "bg-surface-low border-outline-variant text-on-surface-variant hover:bg-surface-white"
                                  }`}
                                >
                                  <span className="text-xs">Es un cambio puntual</span>
                                  <span className="text-[9px] font-normal leading-normal mt-0.5 opacity-80">El horario vuelve a la normalidad al día siguiente.</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setFormAffectsRotation(true)}
                                  className={`p-3 rounded-xl border text-left flex flex-col justify-center cursor-pointer transition-all ${
                                    formAffectsRotation 
                                      ? "bg-secondary-container/20 border-secondary text-secondary font-bold" 
                                      : "bg-surface-low border-outline-variant text-on-surface-variant hover:bg-surface-white"
                                  }`}
                                >
                                  <span className="text-xs">Cambia toda la rotación</span>
                                  <span className="text-[9px] font-normal leading-normal mt-0.5 opacity-80">A partir del día siguiente, se invierten las Semanas A y B de forma permanente.</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 border border-outline-variant border-dashed rounded-xl text-center bg-surface-low/30">
                            <span className="text-xs text-on-surface-variant font-medium block">Selecciona una fecha primero para ver y modificar los turnos.</span>
                          </div>
                        )}

                        {/* Description field */}
                        <div>
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1.5">Motivo / Descripción</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Ej. Clemen va a taekwondo de su hijo, Isabel le cubre..."
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            className="w-full bg-surface-low border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium focus:border-secondary focus:outline-none resize-none"
                          />
                        </div>

                        {/* Submit button */}
                        <button
                          type="submit"
                          className="w-full py-3 bg-secondary text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-secondary/90 transition-all cursor-pointer"
                        >
                          Registrar Cambio de Horario
                        </button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>

        {/* ========================================================
            MOBILE STICKY FILTER BAR (Sticky bottom for thumb access, hides on exceptions tab)
            ======================================================== */}
        {mobileView !== "excepciones" && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-white/95 backdrop-blur border-t border-outline-variant/80 px-4 py-2.5 z-40 shadow-lg flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-on-surface-variant">Destacar empleado:</span>
              {selectedWorker !== "todos" && (
                <button 
                  onClick={() => setSelectedWorker("todos")} 
                  className="text-[8px] font-extrabold text-secondary uppercase hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>
            <div className="flex gap-2 justify-between">
              <button
                onClick={() => setSelectedWorker("todos")}
                className={`flex-1 py-2 rounded-lg border text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm ${
                  selectedWorker === "todos" ? "bg-primary text-on-primary border-primary" : "bg-surface-low border-outline-variant text-on-surface-variant"
                }`}
              >
                Todos
              </button>
              {["Clemen", "Isabel", "Ismael"].map(worker => (
                <button
                  key={worker}
                  onClick={() => setSelectedWorker(worker as WorkerFilter)}
                  className={`flex-1 py-2 rounded-lg border text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm flex items-center justify-center gap-1 ${
                    selectedWorker === worker ? "bg-secondary text-white border-secondary" : "bg-surface-low border-outline-variant text-on-surface-variant"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedWorker === worker ? "bg-white" : workerStyles[worker].accent}`} />
                  {worker}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            DESKTOP ONLY DETAILED DAY MODAL
            ======================================================== */}
        <AnimatePresence>
          {selectedDayDetail && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedDayDetail(null)}
                className="fixed inset-0 bg-black/40 backdrop-blur-[1.5px] z-[60] cursor-pointer hidden md:block"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-surface-white rounded-2xl shadow-2xl z-[70] overflow-hidden border border-outline-variant hidden md:block"
              >
                <div className="p-5 border-b border-outline-variant bg-surface-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={18} className="text-secondary" />
                    <h3 className="font-bold text-on-surface">Detalle de Turnos</h3>
                  </div>
                  <button
                    onClick={() => setSelectedDayDetail(null)}
                    className="px-2.5 py-1.5 rounded-lg border border-outline-variant text-[10px] font-bold text-on-surface-variant hover:text-secondary hover:bg-surface-low transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="text-center py-2.5 rounded-xl bg-surface-low border border-outline-variant/40">
                    <h4 className="text-base font-bold capitalize text-on-surface">
                      {selectedDayDetail.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                    </h4>
                    <div className="mt-1.5 flex justify-center">
                      {getWeekBadgeDetails(selectedDayDetail)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Morning */}
                    <div className="p-3 bg-surface-low border border-outline-variant/40 rounded-xl">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
                        Turno de Mañana (09:00h - 16:00h)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {getShiftsForDate(selectedDayDetail).manana.map(w => {
                          const style = workerStyles[w] || { bg: "bg-surface-low", text: "text-on-surface", border: "border-outline-variant/30", accent: "bg-outline" };
                          return (
                            <span key={w} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${style.bg} ${style.text} ${style.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.accent}`} />
                              {w}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Afternoon */}
                    <div className="p-3 bg-surface-low border border-outline-variant/40 rounded-xl">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
                        Turno de Tarde (16:00h - Cierre)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {getShiftsForDate(selectedDayDetail).tarde.map(w => {
                          const style = workerStyles[w] || { bg: "bg-surface-low", text: "text-on-surface", border: "border-outline-variant/30", accent: "bg-outline" };
                          return (
                            <span key={w} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${style.bg} ${style.text} ${style.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.accent}`} />
                              {w}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ========================================================
            MOBILE COMPACT MONTH SHEET / DRAWER (Bottom Sheet)
            ======================================================== */}
        <AnimatePresence>
          {isMobileDrawerOpen && mobileDrawerDate && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileDrawerOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-[1px] z-[60] md:hidden cursor-pointer"
              />

              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="fixed bottom-0 left-0 right-0 bg-surface-white rounded-t-2xl z-[70] md:hidden border-t border-outline-variant/80 shadow-2xl flex flex-col max-h-[75vh]"
              >
                <div className="py-2.5 flex justify-center shrink-0">
                  <div className="w-10 h-1.5 bg-outline-variant rounded-full" />
                </div>

                <div className="px-4 pb-3 border-b border-outline-variant/40 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-sm font-bold text-on-surface capitalize">
                      {mobileDrawerDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant leading-none mt-0.5">Rotación semanal de plantilla</p>
                  </div>
                  <button
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="p-1.5 rounded-lg border border-outline-variant bg-surface-low text-xs font-bold text-on-surface-variant"
                  >
                    Cerrar
                  </button>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto pb-8">
                  <div className="flex justify-center p-2.5 bg-surface-low/80 border border-outline-variant/30 rounded-xl">
                    {getWeekBadgeDetails(mobileDrawerDate)}
                  </div>

                  {(() => {
                    const shifts = getShiftsForDate(mobileDrawerDate);
                    return (
                      <div className="space-y-3">
                        <div className="p-3 border border-outline-variant/60 rounded-xl relative overflow-hidden bg-surface-low/30">
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-warning" />
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-extrabold uppercase text-[#d97706] tracking-wider flex items-center gap-1.5"><Sun size={12} /> Mañana</span>
                            <span className="text-[9px] font-bold text-on-surface-variant">09:00h - 16:00h</span>
                          </div>
                          <div className="space-y-2">
                            {shifts.manana.map(w => {
                              const style = workerStyles[w] || { bg: "bg-surface-white", border: "border-outline-variant/20", text: "text-on-surface", role: "", accent: "bg-outline" };
                              return (
                                <div key={w} className={`flex items-center gap-3 p-2 rounded-lg border bg-surface-white ${style.border}`}>
                                  <div className="w-8 h-8 rounded-lg bg-surface-low flex items-center justify-center shrink-0">
                                    {w === "Cerrado" ? <Lock size={12} className="text-error" /> : <User size={14} className={style.text} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className={`text-xs font-bold block ${style.text}`}>{w}</span>
                                    <span className="text-[8px] text-on-surface-variant block mt-0.5 leading-none">{style.role}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="p-3 border border-outline-variant/60 rounded-xl relative overflow-hidden bg-surface-low/30">
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-secondary" />
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-extrabold uppercase text-secondary tracking-wider flex items-center gap-1.5"><Moon size={12} /> Tarde</span>
                            <span className="text-[9px] font-bold text-on-surface-variant">16:00h - Cierre</span>
                          </div>
                          <div className="space-y-2">
                            {shifts.tarde.map(w => {
                              const style = workerStyles[w] || { bg: "bg-surface-white border-outline-variant/20", text: "text-on-surface", role: "", accent: "bg-outline" };
                              const isClosed = w === "Cerrado";
                              return (
                                <div key={w} className={`flex items-center gap-3 p-2 rounded-lg border bg-surface-white ${style.border}`}>
                                  <div className="w-8 h-8 rounded-lg bg-surface-low flex items-center justify-center shrink-0">
                                    {isClosed ? <Lock size={12} className="text-error" /> : <User size={14} className={style.text} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className={`text-xs font-bold block ${style.text}`}>{w}</span>
                                    <span className="text-[8px] text-on-surface-variant block mt-0.5 leading-none">{style.role}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ========================================================
            MOBILE ONLY ADD EXCEPTION SHEET (Bottom Sheet Drawer)
            ======================================================== */}
        <AnimatePresence>
          {isAddingExceptionMobile && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddingExceptionMobile(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-[60] md:hidden cursor-pointer"
              />

              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="fixed bottom-0 left-0 right-0 bg-surface-white rounded-t-2xl z-[70] md:hidden border-t border-outline-variant shadow-2xl flex flex-col max-h-[90vh]"
              >
                <div className="py-2.5 flex justify-center shrink-0">
                  <div className="w-10 h-1.5 bg-outline-variant rounded-full" />
                </div>

                <div className="px-4 pb-3 border-b border-outline-variant/40 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Plus size={16} className="text-secondary" />
                    <h3 className="text-sm font-bold text-on-surface">Registrar Cambio de Turno</h3>
                  </div>
                  <button
                    onClick={() => setIsAddingExceptionMobile(false)}
                    className="p-1.5 bg-surface-low border border-outline-variant text-xs font-bold text-on-surface-variant rounded-lg"
                  >
                    Cerrar
                  </button>
                </div>

                {/* Mobile form container scroll */}
                <div className="p-4 space-y-4 overflow-y-auto pb-10">
                  <form onSubmit={handleAddExceptionSubmit} className="space-y-4">
                    {/* Date */}
                    <div>
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Fecha</label>
                      <input 
                        type="date" 
                        required
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full bg-surface-low border border-outline-variant rounded-xl px-3 py-2.5 text-xs text-on-surface font-semibold focus:outline-none"
                      />
                    </div>

                    {/* 1. Selección de Turnos */}
                    {formDate ? (
                      <div className="space-y-4">
                        <div className="p-3 border border-outline-variant/60 rounded-xl bg-surface-low/30 space-y-4">
                          <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block">1. ¿Quién trabaja este día?</p>
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#d97706] block mb-2">Turno Mañana:</span>
                            <div className="flex flex-wrap gap-2">
                              {["Clemen", "Isabel", "Ismael", "Cerrado"].map(worker => {
                                const isSelected = formManana.includes(worker);
                                return (
                                  <button
                                    key={worker}
                                    type="button"
                                    onClick={() => toggleFormWorker(worker, "manana")}
                                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                                      isSelected 
                                        ? "bg-primary border-primary text-on-primary shadow-sm" 
                                        : "bg-surface-white border-outline-variant text-on-surface-variant hover:bg-surface-low"
                                    }`}
                                  >
                                    {worker}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-secondary block mb-2">Turno Tarde:</span>
                            <div className="flex flex-wrap gap-2">
                              {["Clemen", "Isabel", "Ismael", "Cerrado"].map(worker => {
                                const isSelected = formTarde.includes(worker);
                                return (
                                  <button
                                    key={worker}
                                    type="button"
                                    onClick={() => toggleFormWorker(worker, "tarde")}
                                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                                      isSelected 
                                        ? "bg-primary border-primary text-on-primary shadow-sm" 
                                        : "bg-surface-white border-outline-variant text-on-surface-variant hover:bg-surface-low"
                                    }`}
                                  >
                                    {worker}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* 2. Impacto en la rotación */}
                        <div className="space-y-2">
                          <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">2. ¿Impacto en días posteriores?</p>
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              type="button"
                              onClick={() => setFormAffectsRotation(false)}
                              className={`p-3 rounded-xl border text-left flex flex-col justify-center cursor-pointer transition-all ${
                                !formAffectsRotation 
                                  ? "bg-secondary-container/20 border-secondary text-secondary font-bold" 
                                  : "bg-surface-low border-outline-variant text-on-surface-variant hover:bg-surface-white"
                              }`}
                            >
                              <span className="text-[11px] font-bold">Es un cambio puntual</span>
                              <span className="text-[9px] font-normal leading-tight mt-0.5 opacity-80">El horario vuelve a la normalidad al día siguiente.</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setFormAffectsRotation(true)}
                              className={`p-3 rounded-xl border text-left flex flex-col justify-center cursor-pointer transition-all ${
                                formAffectsRotation 
                                  ? "bg-secondary-container/20 border-secondary text-secondary font-bold" 
                                  : "bg-surface-low border-outline-variant text-on-surface-variant hover:bg-surface-white"
                              }`}
                            >
                              <span className="text-[11px] font-bold">Cambia toda la rotación</span>
                              <span className="text-[9px] font-normal leading-tight mt-0.5 opacity-80">A partir del día siguiente, se invierten las Semanas A y B de forma permanente.</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border border-outline-variant border-dashed rounded-xl text-center bg-surface-low/30">
                        <span className="text-xs text-on-surface-variant font-medium block">Selecciona una fecha para modificar los turnos.</span>
                      </div>
                    )}

                    {/* Reason */}
                    <div>
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Motivo / Descripción</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Ej. Clemen va a taekwondo de su hijo..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full bg-surface-low border border-outline-variant rounded-xl px-3 py-2 text-xs text-on-surface font-medium focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-secondary text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 transition-all"
                    >
                      Registrar Cambio
                    </button>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </PageWrapper>
  );
}
