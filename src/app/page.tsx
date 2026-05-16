"use client";

import { useState, useEffect } from "react";
import { ChefHat, Sparkles, AlarmClock, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import PageWrapper from "@/components/PageWrapper";
import { useUser } from "@/components/UserContext";

const mockTasks = [
  { id: 1, title: "Revisar stock de barriles", area: "Barra Principal", priority: "alta", completed: false },
  { id: 2, title: "Limpieza de cafetera", area: "Cierre", priority: "media", completed: false },
  { id: 3, title: "Cortar verduras", area: "Cocina", priority: "urgente", completed: false },
  { id: 4, title: "Revisar cámara frigorífica", area: "Cocina", priority: "baja", completed: false },
];

const SHIFT_NAME = "Turno de Tarde";
const DATE_STR = "Viernes, 27 de Octubre";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
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
  const [tasks, setTasks] = useState(mockTasks);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user-specific state
  useEffect(() => {
    if (currentUser) {
      const savedTasks = localStorage.getItem(`tasks_${currentUser}`);
      const savedClockStatus = localStorage.getItem(`clockedIn_${currentUser}`);
      
      setTimeout(() => {
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        } else {
          setTasks(mockTasks);
        }
        if (savedClockStatus) {
          setClockedIn(JSON.parse(savedClockStatus));
        }
        setIsLoaded(true);
      }, 0);
    }
  }, [currentUser]);

  // Save tasks on change
  useEffect(() => {
    if (isLoaded && currentUser) {
      localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
    }
  }, [tasks, currentUser, isLoaded]);



  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const progress = Math.round((completed / total) * 100);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

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
        <p className="text-sm text-on-surface-variant mt-0.5">
          {DATE_STR} &bull; {SHIFT_NAME}
        </p>
      </motion.div>

      {/* Shift status card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-3 md:mx-8 mt-3 md:mt-6 rounded-xl md:rounded-2xl bg-primary-container p-4 md:p-8 shadow-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-on-primary-container mb-1">
          Estado Actual
        </p>
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={clockedIn ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: clockedIn ? Infinity : 0, repeatDelay: 2 }}
          >
            <AlarmClock
              size={20}
              className={clockedIn ? "text-[#4edea3]" : "text-on-primary-container"}
            />
          </motion.div>
          <p className="text-xl font-semibold text-on-primary">
            {clockedIn ? "Turno activo" : "Sin fichar"}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/fichaje")}
          className="w-full py-3 rounded-lg bg-on-primary text-primary font-semibold text-sm uppercase tracking-wide transition-colors hover:bg-on-primary/90"
        >
          {clockedIn ? "Finalizar Turno" : "Iniciar Turno"}
        </motion.button>
      </motion.div>

      {/* Quick access */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-3 md:mx-8 mt-4 md:mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6"
      >
        <motion.div variants={itemVariants}>
          <Link
            href="/cocina"
            className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-outline-variant bg-surface-white active:bg-surface-low transition-all hover:shadow-md h-full"
          >
            <ChefHat size={24} className="text-on-surface-variant" />
            <span className="text-sm font-medium text-on-surface">Cocina</span>
            <span className="text-xs text-secondary font-medium">3 Pedidos activos</span>
          </Link>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Link
            href="/limpieza"
            className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-outline-variant bg-surface-white active:bg-surface-low transition-all hover:shadow-md h-full"
          >
            <Sparkles size={24} className="text-on-surface-variant" />
            <span className="text-sm font-medium text-on-surface">Limpieza</span>
            <span className="text-xs text-error font-medium">1 Tarea urgente</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Task progress */}
      <div className="mx-3 md:mx-8 mt-5 md:mt-10 pb-4 md:pb-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-2"
        >
          <h2 className="text-base font-semibold text-on-surface">Progreso de Tareas</h2>
          <span className="text-xs font-semibold text-secondary">
            {completed}/{total} Completadas
          </span>
        </motion.div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-surface-container mb-4 overflow-hidden">
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
          className="flex flex-col gap-2"
        >
          {tasks.map((task) => (
            <motion.button
              key={task.id}
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleTask(task.id)}
              layout
              className="flex items-start gap-3 p-3 rounded-xl border border-outline-variant bg-surface-white active:bg-surface-low transition-all hover:border-primary/30 text-left w-full"
            >
              <div className="relative">
                <AnimatePresence mode="wait">
                  {task.completed ? (
                    <motion.div
                      key="completed"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                    >
                      <CheckCircle2 size={20} className="text-secondary mt-0.5 shrink-0" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pending"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                    >
                      <Circle size={20} className="text-outline mt-0.5 shrink-0" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex-1 min-w-0">
                <motion.p
                  animate={{ opacity: task.completed ? 0.6 : 1 }}
                  className={`text-sm font-medium ${
                    task.completed
                      ? "line-through text-on-surface-variant"
                      : "text-on-surface"
                  }`}
                >
                  {task.title}
                </motion.p>
                <p className="text-xs text-on-surface-variant mt-0.5">{task.area}</p>
              </div>
              {!task.completed && (task.priority === "alta" || task.priority === "urgente") && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-error-container text-on-error-container"
                >
                  {task.priority === "urgente" ? "Urgente" : "Alta"}
                </motion.span>
              )}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </PageWrapper>
  );
}
