"use client";

import { useState, useEffect } from "react";
import { ChefHat, Sparkles, AlarmClock, CheckCircle2, Circle, Coins, Calendar, GripVertical, User } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import PageWrapper from "@/components/PageWrapper";
import { useUser } from "@/components/UserContext";
import {
  getTasksForDateAndShift,
  toggleTaskCompletion,
  TaskWithCompletion,
  PRIORITY_COLORS,
  formatDateKey,
} from "@/lib/tasks";

interface DashboardTask extends TaskWithCompletion {
  area: "Cocina" | "Limpieza";
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Dashboard() {
  const { currentUser } = useUser();
  const router = useRouter();
  const [clockedIn, setClockedIn] = useState(false);
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Real-time quick counters
  const [pendingCocina, setPendingCocina] = useState(0);
  const [pendingLimpieza, setPendingLimpieza] = useState(0);

  const today = new Date();
  
  const formattedLongDate = today.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  
  const capitalizeFirst = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Load user-specific state and synchronize tasks
  const refreshDashboardData = () => {
    if (currentUser) {
      // 1. Clock state
      const savedClockStatus = localStorage.getItem(`clockedIn_${currentUser}`);
      if (savedClockStatus) {
        setClockedIn(JSON.parse(savedClockStatus));
      }

      // 2. Load today's tasks dynamically from central manager
      const cocina = getTasksForDateAndShift("cocina", today, "todos");
      const limpieza = getTasksForDateAndShift("limpieza", today, "todos");

      // Set individual counters
      const pendingC = cocina.filter((t) => !t.completed).length;
      const pendingL = limpieza.filter((t) => !t.completed).length;
      setPendingCocina(pendingC);
      setPendingLimpieza(pendingL);

      // Combine both lists for the dashboard summary
      const combinedTasks: DashboardTask[] = [
        ...cocina.map((t) => ({ ...t, area: "Cocina" as const })),
        ...limpieza.map((t) => ({ ...t, area: "Limpieza" as const })),
      ];

      // Sort: incomplete first, then by priority (urgente > alta > media > baja > null)
      const priorityWeight = { urgente: 4, alta: 3, media: 2, baja: 1, null: 0 };
      
      combinedTasks.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        const weightA = priorityWeight[a.priority ?? "null"] || 0;
        const weightB = priorityWeight[b.priority ?? "null"] || 0;
        return weightB - weightA;
      });

      setTasks(combinedTasks);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    refreshDashboardData();
    
    // Add page focus event listener to refresh stats when returning to the dashboard
    window.addEventListener("focus", refreshDashboardData);
    return () => {
      window.removeEventListener("focus", refreshDashboardData);
    };
  }, [currentUser]);

  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleToggleTask = (taskId: string, category: "cocina" | "limpieza", currentStatus: boolean) => {
    toggleTaskCompletion(category, taskId, today, !currentStatus);
    refreshDashboardData();
  };

  const workerPrefix = currentUser ? `/${currentUser.toLowerCase()}` : "";

  return (
    <PageWrapper>
      <AppHeader />

      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-3 md:px-8 pt-5 md:pt-8 pb-2"
      >
        <h1 className="text-2xl font-semibold text-on-surface">
          Hola, {currentUser}
        </h1>
        <p className="text-xs text-on-surface-variant mt-0.5 capitalize">
          {capitalizeFirst(formattedLongDate)} &bull; Turno en curso
        </p>
      </motion.div>

      {/* Shift status card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-3 md:mx-8 mt-3 md:mt-6 rounded-xl md:rounded-2xl bg-primary-container p-4 md:p-8 shadow-sm"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-primary-container mb-1">
          Estado Actual
        </p>
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={clockedIn ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 1.5, repeat: clockedIn ? Infinity : 0, repeatDelay: 1 }}
          >
            <AlarmClock
              size={20}
              className={clockedIn ? "text-[#4edea3]" : "text-on-primary-container"}
            />
          </motion.div>
          <p className="text-lg font-semibold text-on-primary">
            {clockedIn ? "Turno activo" : "Sin fichar"}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(`${workerPrefix}/fichaje`)}
          className="w-full py-3 rounded-lg bg-on-primary text-primary font-semibold text-xs uppercase tracking-wider transition-colors hover:bg-on-primary/95"
        >
          {clockedIn ? "Finalizar Turno" : "Iniciar Turno"}
        </motion.button>
      </motion.div>

      {/* Quick access cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-3 md:mx-8 mt-4 md:mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6"
      >
        <motion.div variants={itemVariants}>
          <Link
            href={`${workerPrefix}/cocina`}
            className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border border-outline-variant bg-surface-white active:bg-surface-low transition-all hover:border-secondary/20 shadow-sm h-full"
          >
            <ChefHat size={22} className="text-on-surface-variant" />
            <span className="text-sm font-semibold text-on-surface">Cocina</span>
            <span className={`text-[10px] font-bold ${pendingCocina > 0 ? "text-secondary" : "text-[#009668]/80"}`}>
              {pendingCocina === 0 ? "Completado" : `${pendingCocina} Pendiente${pendingCocina > 1 ? "s" : ""}`}
            </span>
          </Link>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Link
            href={`${workerPrefix}/limpieza`}
            className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border border-outline-variant bg-surface-white active:bg-surface-low transition-all hover:border-secondary/20 shadow-sm h-full"
          >
            <Sparkles size={22} className="text-on-surface-variant" />
            <span className="text-sm font-semibold text-on-surface">Limpieza</span>
            <span className={`text-[10px] font-bold ${pendingLimpieza > 0 ? "text-error" : "text-[#009668]/80"}`}>
              {pendingLimpieza === 0 ? "Completado" : `${pendingLimpieza} Pendiente${pendingLimpieza > 1 ? "s" : ""}`}
            </span>
          </Link>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Link
            href={`${workerPrefix}/dinero`}
            className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border border-outline-variant bg-surface-white active:bg-surface-low transition-all hover:border-secondary/20 shadow-sm h-full"
          >
            <Coins size={22} className="text-on-surface-variant" />
            <span className="text-sm font-semibold text-on-surface">Dinero</span>
            <span className="text-[10px] text-[#009668]/80 font-bold">Caja Diaria</span>
          </Link>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Link
            href={`${workerPrefix}/horario`}
            className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border border-outline-variant bg-surface-white active:bg-surface-low transition-all hover:border-secondary/20 shadow-sm h-full"
          >
            <Calendar size={22} className="text-on-surface-variant" />
            <span className="text-sm font-semibold text-on-surface">Horario</span>
            <span className="text-[10px] text-secondary font-bold">Calendario</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Task progress */}
      <div className="mx-3 md:mx-8 mt-5 md:mt-8 pb-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-2 px-0.5"
        >
          <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Progreso de Tareas</h2>
          <span className="text-xs font-bold text-secondary">
            {completed}/{total} Completadas
          </span>
        </motion.div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-surface-container mb-4 overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-secondary"
          />
        </div>

        {/* Task list */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-2.5"
        >
          {total === 0 ? (
            <div className="py-10 text-center bg-surface-white border border-outline-variant/50 rounded-xl p-4">
              <p className="text-sm font-medium text-on-surface-variant">No hay tareas programadas para hoy.</p>
              <p className="text-xs text-on-surface-variant/70 mt-1">Configura las plantillas en las páginas de cocina o limpieza.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <motion.button
                key={`${task.area}-${task.id}`}
                variants={itemVariants}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToggleTask(task.id, task.category, task.completed)}
                layout
                className="flex items-start gap-3.5 p-4 rounded-xl border border-outline-variant bg-surface-white active:bg-surface-low transition-all hover:border-primary/20 text-left w-full shadow-sm group"
              >
                {/* Circle Checkbox */}
                <div className="mt-0.5 shrink-0">
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {task.completed ? (
                        <motion.div
                          key="completed"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="text-secondary"
                        >
                          <CheckCircle2 size={21} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="pending"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="text-outline group-hover:text-secondary/70 transition-colors"
                        >
                          <Circle size={21} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold transition-all ${
                      task.completed ? "line-through text-on-surface-variant/50" : "text-on-surface"
                    }`}
                  >
                    {task.title}
                  </p>
                  
                  {/* Task details */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1.5 border-t border-outline-variant/10">
                    {/* Area tag (Cocina or Limpieza) */}
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                      task.area === "Cocina"
                        ? "bg-amber-50 text-amber-800 border-amber-200/50"
                        : "bg-teal-50 text-teal-800 border-teal-200/50"
                    }`}>
                      {task.area}
                    </span>

                    {/* Priority badge */}
                    {!task.completed && task.priority && (
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                        PRIORITY_COLORS[task.priority].bg
                      }`}>
                        {PRIORITY_COLORS[task.priority].label}
                      </span>
                    )}

                    {/* Created by */}
                    <span className="text-[9px] font-medium text-on-surface-variant/50 flex items-center gap-0.5 ml-auto">
                      <User size={9} />
                      {task.createdBy}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center mt-1">
                  <GripVertical size={16} className="text-outline-variant opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            ))
          )}
        </motion.div>
      </div>
    </PageWrapper>
  );
}
