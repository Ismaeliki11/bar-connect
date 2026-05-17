"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, GripVertical, Plus, Calendar, Settings, User, Clock, RefreshCw } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import PageWrapper from "@/components/PageWrapper";
import { useUser } from "@/components/UserContext";
import CalendarModal from "@/components/CalendarModal";
import TaskManagerModal from "@/components/TaskManagerModal";
import {
  TaskWithCompletion,
  getTasksForDateAndShift,
  toggleTaskCompletion,
  addMasterTask,
  SHIFT_NAMES,
  PRIORITY_COLORS,
  formatDateKey,
} from "@/lib/tasks";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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

export default function LimpiezaPage() {
  const { currentUser } = useUser();
  const [tasks, setTasks] = useState<TaskWithCompletion[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState<"mañana" | "tarde" | "cierre" | "todos">("cierre");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTaskManagerOpen, setIsTaskManagerOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const dateString = formatDateKey(selectedDate);
  const isToday = formatDateKey(new Date()) === dateString;

  // Load tasks based on filters and state
  const loadTasks = () => {
    if (currentUser) {
      setIsLoaded(false);
      // Retrieve filtered tasks from database / local storage manager
      const activeTasks = getTasksForDateAndShift("limpieza", selectedDate, selectedShift);
      
      // Simulate slight load delay for smooth animations
      setTimeout(() => {
        setTasks(activeTasks);
        setIsLoaded(true);
      }, 50);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [currentUser, selectedDate, selectedShift, refreshTrigger]);

  const pending = tasks.filter((t) => !t.completed).length;
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleToggleTask = (taskId: string, currentStatus: boolean) => {
    toggleTaskCompletion("limpieza", taskId, selectedDate, !currentStatus);
    // Reload local list
    loadTasks();
  };

  const handleAddExtraTask = () => {
    if (!newTaskTitle.trim()) return;

    // Create a one-off (unica) task for this specific date and current shift
    addMasterTask({
      title: newTaskTitle.trim(),
      description: "Tarea extra de limpieza añadida sobre la marcha.",
      category: "limpieza",
      priority: null,
      shift: selectedShift === "todos" ? "cierre" : selectedShift,
      frequency: "unica",
      specificDate: dateString,
      createdBy: (currentUser as any) || "General",
    });

    setNewTaskTitle("");
    setRefreshTrigger((prev) => prev + 1);
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
      <AppHeader title="Limpieza" />

      <div className="px-4 md:px-8 pt-5 md:pt-8 pb-20">
        {/* Actions bar */}
        <div className="flex justify-between items-center gap-2 mb-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsCalendarOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/10 text-secondary text-[11px] font-bold uppercase tracking-wider hover:bg-secondary/20 transition-all border border-secondary/10 shadow-sm"
          >
            <Calendar size={13} className="opacity-80" />
            {formattedDate}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsTaskManagerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-surface-low text-on-surface-variant hover:text-on-surface text-[11px] font-bold uppercase tracking-wider transition-all border border-outline-variant/80 shadow-sm ml-auto"
          >
            <Settings size={13} className="opacity-80" />
            Plantilla
          </motion.button>
        </div>

        {/* Header Title */}
        <div className="flex flex-col mb-4">
          <div className="flex items-start justify-between">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl font-semibold text-on-surface">Tareas de Limpieza</h1>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Organiza el mantenimiento e higiene del local
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

        {/* Shift Selector */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <div className="grid grid-cols-4 gap-1 p-1 bg-surface-low border border-outline-variant/60 rounded-xl">
            {(["mañana", "tarde", "cierre", "todos"] as const).map((sh) => (
              <button
                key={sh}
                type="button"
                onClick={() => setSelectedShift(sh)}
                className={`py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                  selectedShift === sh
                    ? "bg-secondary text-white shadow-sm"
                    : "text-on-surface-variant/80 hover:bg-surface-container"
                }`}
              >
                {sh === "todos" ? "Todos" : sh}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Historic view notice */}
        {!isToday && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-surface-container border border-secondary/20 flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <p className="text-xs font-medium text-on-surface-variant">
              Histórico del <span className="text-secondary font-bold">{formattedDate}</span> (Turno: {SHIFT_NAMES[selectedShift]})
            </p>
          </motion.div>
        )}

        {/* Progress Bar */}
        {total > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-5 p-3.5 rounded-xl border border-outline-variant/50 bg-surface-white shadow-sm"
          >
            <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-1.5">
              <span>Progreso de Limpieza</span>
              <span className="text-secondary">{completed}/{total} ({progress}%)</span>
            </div>
            <div className="h-2 rounded-full bg-surface-container overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-secondary"
              />
            </div>
          </motion.div>
        )}

        {/* Tasks Lists Container */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-2.5"
            >
              {incompleteTasks.length === 0 && (
                <div className="py-10 text-center bg-surface-white border border-outline-variant/50 rounded-xl p-4">
                  <p className="text-sm font-medium text-on-surface-variant/80">
                    {total === 0
                      ? "No hay tareas programadas para este turno/día."
                      : "¡Buen trabajo! Todo limpio y desinfectado."}
                  </p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">
                    {total === 0
                      ? "Gestiona la plantilla de tareas de limpieza arriba o añade una tarea extra abajo."
                      : "Puedes revisar las tareas completadas abajo."}
                  </p>
                </div>
              )}
              {incompleteTasks.map((task) => (
                <motion.div key={task.id} variants={itemVariants} layoutId={`task-${task.id}`}>
                  <TaskItem task={task} onToggle={handleToggleTask} showShiftBadge={selectedShift === "todos"} />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 px-1"
              >
                Completadas
              </motion.h3>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-2.5"
              >
                {completedTasks.map((task) => (
                  <motion.div key={task.id} variants={itemVariants} layoutId={`task-${task.id}`}>
                    <TaskItem task={task} onToggle={handleToggleTask} showShiftBadge={selectedShift === "todos"} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>

        {/* Add extra task */}
        {isToday && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 rounded-xl border border-outline-variant bg-surface-low p-3.5 shadow-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Añadir Tarea Extra del Día
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddExtraTask()}
                placeholder="Ej: Limpiar cristales de fachada, espejos..."
                className="flex-1 text-sm px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-white text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-0 transition-all shadow-inner"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddExtraTask}
                className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm transition-all hover:bg-primary/90"
              >
                <Plus size={20} className="text-on-primary" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <TaskManagerModal
        isOpen={isTaskManagerOpen}
        onClose={() => setIsTaskManagerOpen(false)}
        category="limpieza"
        currentUser={currentUser}
        onTasksChanged={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </PageWrapper>
  );
}

function TaskItem({
  task,
  onToggle,
  showShiftBadge,
}: {
  task: TaskWithCompletion;
  onToggle: (id: string, completed: boolean) => void;
  showShiftBadge: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onToggle(task.id, task.completed)}
      className="flex items-start gap-3.5 p-4 rounded-xl border border-outline-variant bg-surface-white active:bg-surface-low transition-all text-left w-full shadow-sm hover:border-primary/20 group"
    >
      {/* Circle checkbox */}
      <div className="mt-0.5 shrink-0">
        <div className="relative">
          <AnimatePresence mode="wait">
            {task.completed ? (
              <motion.div
                key="checked"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-secondary"
              >
                <CheckCircle2 size={21} />
              </motion.div>
            ) : (
              <motion.div
                key="unchecked"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-outline group-hover:text-secondary/70 transition-colors"
              >
                <Circle size={21} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold transition-all ${
            task.completed ? "line-through text-on-surface-variant/50" : "text-on-surface"
          }`}
        >
          {task.title}
        </p>
        
        {task.description && (
          <p
            className={`text-xs mt-1 leading-relaxed transition-all ${
              task.completed ? "line-through text-on-surface-variant/30" : "text-on-surface-variant/80"
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-outline-variant/20">
          {/* Priority */}
          {!task.completed && task.priority && (
            <span
              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                PRIORITY_COLORS[task.priority].bg
              }`}
            >
              {PRIORITY_COLORS[task.priority].label}
            </span>
          )}

          {/* Shift badge */}
          {showShiftBadge && (
            <span className="text-[9px] font-medium text-on-surface-variant bg-surface-low border border-outline-variant/30 px-1 py-0.2 rounded flex items-center gap-0.5 capitalize">
              <Clock size={8} />
              {task.shift}
            </span>
          )}

          {/* Created by */}
          <span className="text-[9px] font-medium text-on-surface-variant/60 flex items-center gap-0.5">
            <User size={9} />
            Añadida por: <span className="font-bold text-on-surface-variant/80">{task.createdBy}</span>
          </span>
          
          {/* Recurrence badge if it's a one-off (so they know why it is there) */}
          {task.frequency === "unica" && (
            <span className="text-[9px] font-bold text-secondary bg-secondary/5 px-1 py-0.2 rounded border border-secondary/10 ml-auto shrink-0 uppercase tracking-wide">
              Extra
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center mt-1">
        <GripVertical size={16} className="text-outline-variant opacity-60 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.button>
  );
}
