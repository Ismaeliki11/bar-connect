"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, GripVertical, Plus, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import PageWrapper from "@/components/PageWrapper";
import { useUser } from "@/components/UserContext";
import CalendarModal from "@/components/CalendarModal";

interface Task {
  id: number;
  title: string;
  description: string;
  priority: "urgente" | "alta" | "media" | "baja" | null;
  completed: boolean;
}

const initialTasks: Task[] = [
  { id: 1, title: "Cortar verduras", description: "Cebolla, pimiento, tomate para sofrito base.", priority: "urgente", completed: false },
  { id: 2, title: "Preparar salsa brava", description: "Revisar stock de pimentón picante antes de empezar.", priority: null, completed: false },
  { id: 3, title: "Reponer postres", description: "Sacar tartas de la cámara, preparar raciones individuales.", priority: null, completed: false },
  { id: 4, title: "Encender freidoras", description: "Temperatura a 180°C.", priority: null, completed: false },
];

const SHIFT = "Turno Mañana";

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

export default function CocinaPage() {
  const { currentUser } = useUser();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const getDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const dateString = getDateString(selectedDate);
  const isToday = getDateString(new Date()) === dateString;

  // Load user-specific state for the selected date
  useEffect(() => {
    if (currentUser) {
      setIsLoaded(false);
      const savedTasks = localStorage.getItem(`tasks_cocina_${currentUser}_${dateString}`);
      setTimeout(() => {
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        } else {
          setTasks(initialTasks);
        }
        setIsLoaded(true);
      }, 0);
    }
  }, [currentUser, dateString]);

  // Save tasks on change
  useEffect(() => {
    if (isLoaded && currentUser) {
      localStorage.setItem(`tasks_cocina_${currentUser}_${dateString}`, JSON.stringify(tasks));
    }
  }, [tasks, currentUser, isLoaded, dateString]);

  const pending = tasks.filter((t) => !t.completed).length;

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), title: newTask.trim(), description: "", priority: null, completed: false },
    ]);
    setNewTask("");
  };

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const formattedDate = selectedDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: isToday ? undefined : "numeric",
  });

  return (
    <PageWrapper>
      <AppHeader title="Cocina" />

      <div className="px-4 md:px-8 pt-5 md:pt-10">
        {/* Header */}
        <div className="flex flex-col mb-5">
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

          <div className="flex items-start justify-between">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl font-semibold text-on-surface">Tareas de Cocina</h1>
              <p className="text-sm text-on-surface-variant mt-0.5">
                {SHIFT} &bull; {formattedDate}
              </p>
            </motion.div>
            <AnimatePresence>
              {pending > 0 && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mt-1 shrink-0 px-2.5 py-1 rounded-full bg-error-container text-on-error-container text-xs font-bold"
                >
                  {pending} Pendientes
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {!isToday && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-surface-container border border-secondary/20 flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <p className="text-xs font-medium text-on-surface-variant">
              Estás viendo el histórico del <span className="text-secondary font-bold">{formattedDate}</span>
            </p>
          </motion.div>
        )}

        {/* Pending tasks */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-2 mb-4"
        >
          {incompleteTasks.length === 0 && pending === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-on-surface-variant opacity-60 italic">No hay tareas pendientes para este día.</p>
            </div>
          )}
          {incompleteTasks.map((task) => (
            <motion.div key={task.id} variants={itemVariants} layout>
              <TaskItem task={task} onToggle={toggleTask} />
            </motion.div>
          ))}
        </motion.div>

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <div className="mb-8">
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2"
            >
              Completadas
            </motion.h3>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-2"
            >
              {completedTasks.map((task) => (
                <motion.div key={task.id} variants={itemVariants} layout>
                  <TaskItem task={task} onToggle={toggleTask} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Add extra task - Only show if it's today or allow editing historical (user choice) */}
        {isToday && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-2 rounded-xl border border-outline-variant bg-surface-low p-3 shadow-sm mb-6"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Añadir Tarea Extra
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Ej: Limpiar campana extractora..."
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-outline-variant bg-surface-white text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1 transition-all"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={addTask}
                className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm transition-all hover:bg-primary/90"
              >
                <Plus size={20} className="text-on-primary" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
    </PageWrapper>
  );
}

function priorityLabel(priority: Task["priority"]) {
  if (!priority) return null;
  return (
    <span
      className={`shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
        priority === "urgente"
          ? "bg-error-container text-on-error-container"
          : priority === "alta"
          ? "bg-error-container text-on-error-container"
          : "bg-surface-container text-on-surface-variant"
      }`}
    >
      {priority === "urgente" ? "Urgente" : priority === "alta" ? "Alta" : priority}
    </span>
  );
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: (id: number) => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onToggle(task.id)}
      className="flex items-start gap-3 p-3 rounded-xl border border-outline-variant bg-surface-white active:bg-surface-low transition-all text-left w-full shadow-sm hover:border-primary/20"
    >
      <div className="relative">
        <AnimatePresence mode="wait">
          {task.completed ? (
            <motion.div
              key="checked"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <CheckCircle2 size={20} className="text-secondary mt-0.5 shrink-0" />
            </motion.div>
          ) : (
            <motion.div
              key="unchecked"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Circle size={20} className="text-outline mt-0.5 shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium transition-all ${
            task.completed ? "line-through text-on-surface-variant opacity-60" : "text-on-surface"
          }`}
        >
          {task.title}
        </p>
        {task.description && (
          <p
            className={`text-xs mt-0.5 transition-all ${
              task.completed ? "line-through text-on-surface-variant/40" : "text-on-surface-variant"
            }`}
          >
            {task.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!task.completed && priorityLabel(task.priority)}
        <GripVertical size={16} className="text-outline-variant" />
      </div>
    </motion.button>
  );
}
