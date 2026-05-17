"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Sun,
  CloudSun,
  Moon,
  Filter
} from "lucide-react";
import {
  Task,
  getMasterTasks,
  addMasterTask,
  updateMasterTask,
  deleteMasterTask,
  SHIFT_NAMES,
  PRIORITY_COLORS,
} from "@/lib/tasks";
import ConfirmModal from "@/components/ConfirmModal";

interface TaskManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: "cocina" | "limpieza";
  currentUser: string | null;
  onTasksChanged?: () => void;
}

const WEEK_DAYS = [
  { id: 1, label: "L", fullName: "Lunes" },
  { id: 2, label: "M", fullName: "Martes" },
  { id: 3, label: "X", fullName: "Miércoles" },
  { id: 4, label: "J", fullName: "Jueves" },
  { id: 5, label: "V", fullName: "Viernes" },
  { id: 6, label: "S", fullName: "Sábado" },
  { id: 0, label: "D", fullName: "Domingo" },
];

export default function TaskManagerModal({
  isOpen,
  onClose,
  category,
  currentUser,
  onTasksChanged,
}: TaskManagerModalProps) {
  const [view, setView] = useState<"list" | "form">("list");
  const [masterTasks, setMasterTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<"all" | "mañana" | "tarde" | "cierre" | "todos">("all");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    diaria: true,
    seleccionados: true,
    unica: true,
  });

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>(null);
  const [shift, setShift] = useState<Task["shift"]>("todos");
  const [frequency, setFrequency] = useState<Task["frequency"]>("diaria");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [specificDate, setSpecificDate] = useState("");
  const [createdBy, setCreatedBy] = useState<Task["createdBy"]>("General");

  // Load master tasks
  const refreshTasksList = useCallback(() => {
    const all = getMasterTasks();
    const filtered = all.filter((t) => t.category === category);
    setMasterTasks(filtered);
  }, [category]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        refreshTasksList();
        setView("list");
        setEditingTask(null);
        setSearchQuery("");
        setSelectedShiftFilter("all");
        setExpandedSections({ diaria: true, seleccionados: true, unica: true });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, category, refreshTasksList]);

  // Set default values for new task
  const initNewTaskForm = () => {
    setTitle("");
    setDescription("");
    setPriority(null);
    setShift(category === "cocina" ? "mañana" : "cierre");
    setFrequency("diaria");
    setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
    
    // Set specific date default to today in YYYY-MM-DD
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setSpecificDate(dateStr);
    
    // Default createdBy based on currentUser
    if (currentUser === "Clemen" || currentUser === "Isabel") {
      setCreatedBy(currentUser as Task["createdBy"]);
    } else {
      setCreatedBy("General");
    }
    
    setEditingTask(null);
    setView("form");
  };

  // Populate form with task to edit
  const startEditTask = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setShift(task.shift);
    setFrequency(task.frequency);
    setSelectedDays(task.selectedDays || [1, 2, 3, 4, 5, 6, 0]);
    setSpecificDate(task.specificDate || "");
    setCreatedBy(task.createdBy);
    setView("form");
  };

  const handleToggleDay = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      shift,
      frequency,
      selectedDays: frequency === "seleccionados" ? selectedDays : undefined,
      specificDate: frequency === "unica" ? specificDate : undefined,
      createdBy,
    };

    if (editingTask) {
      // Update
      updateMasterTask(editingTask.id, taskPayload);
    } else {
      // Create
      addMasterTask(taskPayload);
    }

    refreshTasksList();
    if (onTasksChanged) onTasksChanged();
    setView("list");
    setEditingTask(null);
  };

  const handleDelete = (taskId: string) => {
    setTaskToDeleteId(taskId);
  };

  const handleConfirmDelete = () => {
    if (taskToDeleteId) {
      deleteMasterTask(taskToDeleteId);
      refreshTasksList();
      if (onTasksChanged) onTasksChanged();
      setView("list");
      setEditingTask(null);
      setTaskToDeleteId(null);
    }
  };

  // Get localized frequency text
  const getFrequencyText = (task: Task) => {
    if (task.frequency === "diaria") return "Diaria";
    if (task.frequency === "unica") {
      if (!task.specificDate) return "Única";
      const [y, m, d] = task.specificDate.split("-");
      const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      return `Única (${date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })})`;
    }
    if (task.frequency === "seleccionados") {
      if (!task.selectedDays || task.selectedDays.length === 0) return "Ningún día";
      if (task.selectedDays.length === 7) return "Diaria";
      if (
        task.selectedDays.length === 5 &&
        !task.selectedDays.includes(6) &&
        !task.selectedDays.includes(0)
      ) {
        return "Lunes a Viernes";
      }
      if (
        task.selectedDays.length === 2 &&
        task.selectedDays.includes(6) &&
        task.selectedDays.includes(0)
      ) {
        return "Fines de Semana";
      }

      // Sort and list day abbreviations
      // Keep week starting Monday: 1,2,3,4,5,6,0
      const daysSorted = [...task.selectedDays].sort((a, b) => {
        const orderA = a === 0 ? 7 : a;
        const orderB = b === 0 ? 7 : b;
        return orderA - orderB;
      });
      const dayNames = daysSorted.map((d) => WEEK_DAYS.find((wd) => wd.id === d)?.label || "");
      return dayNames.join("-");
    }
    return "Desconocida";
  };

  // Filter tasks based on search query and shift tab
  const filteredTasks = masterTasks.filter((task) => {
    // 1. Search Query filter
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;

    // 2. Shift Filter
    if (selectedShiftFilter !== "all" && task.shift !== selectedShiftFilter) {
      return false;
    }

    return true;
  });

  // Group by frequency
  const dailyTasks = filteredTasks.filter((t) => t.frequency === "diaria");
  const weeklyTasks = filteredTasks.filter((t) => t.frequency === "seleccionados");
  const uniqueTasks = filteredTasks.filter((t) => t.frequency === "unica");

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderSectionHeader = (
    id: "diaria" | "seleccionados" | "unica",
    title: string,
    count: number,
    icon: React.ReactNode
  ) => {
    const isExpanded = expandedSections[id];
    return (
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between py-2 px-1 text-on-surface hover:text-secondary transition-all font-bold text-[10px] uppercase tracking-wider mb-2.5 mt-5 border-b border-outline-variant/30"
      >
        <div className="flex items-center gap-1.5">
          {icon}
          <span>{title}</span>
          <span className="ml-1.5 px-2 py-0.2 bg-secondary/15 text-secondary text-[9px] font-bold rounded-full">
            {count}
          </span>
        </div>
        <div className="text-on-surface-variant/45">
          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </div>
      </button>
    );
  };

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
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            className="fixed bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-md h-[92vh] md:h-[80vh] bg-surface-white rounded-t-2xl md:rounded-2xl shadow-2xl z-[70] flex flex-col overflow-hidden border border-outline-variant"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-white shrink-0">
              <div className="flex items-center gap-2.5">
                {view === "form" && (
                  <button
                    onClick={() => setView("list")}
                    className="p-1 rounded-full hover:bg-surface-low text-on-surface-variant transition-colors -ml-1"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div>
                  <h3 className="font-semibold text-base text-on-surface">
                    {view === "list"
                      ? `Plantilla de ${category === "cocina" ? "Cocina" : "Limpieza"}`
                      : editingTask
                      ? "Editar Tarea"
                      : "Nueva Tarea"}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    {view === "list"
                      ? "Gestionar tareas recurrentes del equipo"
                      : "Define los parámetros de la tarea"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-surface-low text-on-surface-variant transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sticky Search and Filters */}
            {view === "list" && (
              <div className="px-5 py-3 bg-surface-white border-b border-outline-variant/60 flex flex-col gap-3 shrink-0">
                {/* Search Input */}
                <div className="relative flex items-center">
                  <Search size={15} className="absolute left-3.5 text-on-surface-variant/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por título o descripción..."
                    className="w-full pl-9 pr-9 py-2 bg-surface-low border border-outline-variant/60 rounded-xl text-xs placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-white transition-all text-on-surface shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 p-0.5 rounded-full hover:bg-surface-container text-on-surface-variant/60 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Shift Tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none -mx-1 px-1 z-0">
                  {([
                    { id: "all", label: "Todas", icon: <Filter size={11} /> },
                    { id: "mañana", label: "Mañana", icon: <Sun size={11} /> },
                    { id: "tarde", label: "Tarde", icon: <CloudSun size={11} /> },
                    { id: "cierre", label: "Cierre", icon: <Moon size={11} /> },
                    { id: "todos", label: "General", icon: <Clock size={11} /> },
                  ] as const).map((tab) => {
                    const isActive = selectedShiftFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedShiftFilter(tab.id)}
                        className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors border ${
                          isActive
                            ? "text-white border-secondary shadow-sm"
                            : "bg-surface-low border-outline-variant/40 text-on-surface-variant/80 hover:bg-surface-container hover:text-on-surface"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeShiftTabBg"
                            className="absolute inset-0 bg-secondary rounded-[7px] -z-10 shadow-sm"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1">
                          {tab.icon}
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto bg-surface-container/30">
              <AnimatePresence mode="wait">
                {view === "list" ? (
                  // VIEW: LIST
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="p-4 space-y-4"
                  >
                    {filteredTasks.length === 0 ? (
                      <div className="py-16 text-center px-4 bg-surface-white border border-outline-variant/50 rounded-2xl shadow-sm">
                        <AlertCircle size={36} className="text-outline-variant mx-auto mb-3 opacity-65" />
                        <p className="text-sm font-semibold text-on-surface">No se encontraron tareas</p>
                        <p className="text-xs text-on-surface-variant/70 mt-1 max-w-[240px] mx-auto">
                          {searchQuery || selectedShiftFilter !== "all"
                            ? "Prueba a cambiar los filtros o a realizar otra búsqueda."
                            : "Crea una nueva tarea de plantilla para que empiece a aparecer en los turnos."}
                        </p>
                        {(searchQuery || selectedShiftFilter !== "all") && (
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setSelectedShiftFilter("all");
                            }}
                            className="mt-4 px-3.5 py-1.5 bg-secondary/10 hover:bg-secondary/15 text-secondary rounded-lg font-bold text-xs transition-colors border border-secondary/10"
                          >
                            Limpiar Filtros
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Section 1: Diarias */}
                        {dailyTasks.length > 0 && (
                          <motion.div layout className="space-y-1">
                            {renderSectionHeader("diaria", "Tareas Diarias", dailyTasks.length, <Clock size={14} className="text-secondary" />)}
                            <AnimatePresence mode="popLayout">
                              {expandedSections.diaria && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                  className="space-y-2.5 overflow-hidden"
                                >
                                  {dailyTasks.map((task) => (
                                    <motion.div
                                      key={task.id}
                                      layout
                                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -15 }}
                                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                      onClick={() => startEditTask(task)}
                                      className="p-4 rounded-xl border border-outline-variant bg-surface-white hover:bg-surface-low/30 hover:border-secondary/30 active:scale-[0.99] transition-all cursor-pointer flex flex-col gap-3 group relative shadow-sm"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                          <h4 className="font-bold text-sm text-on-surface leading-tight break-words group-hover:text-secondary transition-colors">
                                            {task.title}
                                          </h4>
                                          {task.description && (
                                            <p className="text-xs text-on-surface-variant/80 mt-1.5 leading-relaxed break-words">
                                              {task.description}
                                            </p>
                                          )}
                                        </div>
                                        
                                        {/* Quick Action Buttons */}
                                        <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              startEditTask(task);
                                            }}
                                            className="p-1.5 rounded-lg text-secondary hover:bg-secondary/5 transition-colors border border-outline-variant/30 bg-surface-white shadow-sm"
                                            title="Editar tarea"
                                          >
                                            <Edit2 size={13} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDelete(task.id);
                                            }}
                                            className="p-1.5 rounded-lg text-error hover:bg-error/5 transition-colors border border-outline-variant/30 bg-surface-white shadow-sm"
                                            title="Eliminar tarea"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Badges row */}
                                      <div className="flex flex-wrap gap-1.5 items-center pt-2.5 border-t border-outline-variant/30 text-[10px] font-semibold">
                                        {/* Priority */}
                                        {task.priority && (
                                          <span
                                            className={`uppercase px-2 py-0.5 rounded-md border ${
                                              PRIORITY_COLORS[task.priority].bg
                                            }`}
                                          >
                                            {PRIORITY_COLORS[task.priority].label}
                                          </span>
                                        )}

                                        {/* Shift */}
                                        <span className="text-on-surface-variant/80 bg-surface-low border border-outline-variant/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                                          <Clock size={10} className="text-on-surface-variant/60" />
                                          {SHIFT_NAMES[task.shift]}
                                        </span>

                                        {/* Frequency */}
                                        <span className="text-on-surface-variant/80 bg-surface-low border border-outline-variant/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                                          <Calendar size={10} className="text-on-surface-variant/60" />
                                          {getFrequencyText(task)}
                                        </span>

                                        {/* Creator initials */}
                                        <span className="text-[9px] font-medium text-on-surface-variant/50 ml-auto flex items-center gap-1.5 bg-surface-low/50 px-2 py-0.5 rounded-full border border-outline-variant/20">
                                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white uppercase ${
                                            task.createdBy === "Clemen" ? "bg-amber-600" : task.createdBy === "Isabel" ? "bg-purple-600" : "bg-slate-600"
                                          }`}>
                                            {task.createdBy[0]}
                                          </div>
                                          <span className="text-on-surface-variant/70">
                                            Por <span className="font-semibold">{task.createdBy}</span>
                                          </span>
                                        </span>
                                      </div>
                                    </motion.div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}

                        {/* Section 2: Días Seleccionados */}
                        {weeklyTasks.length > 0 && (
                          <motion.div layout className="space-y-1">
                            {renderSectionHeader("seleccionados", "Días Específicos", weeklyTasks.length, <Calendar size={14} className="text-secondary" />)}
                            <AnimatePresence mode="popLayout">
                              {expandedSections.seleccionados && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                  className="space-y-2.5 overflow-hidden"
                                >
                                  {weeklyTasks.map((task) => (
                                    <motion.div
                                      key={task.id}
                                      layout
                                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -15 }}
                                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                      onClick={() => startEditTask(task)}
                                      className="p-4 rounded-xl border border-outline-variant bg-surface-white hover:bg-surface-low/30 hover:border-secondary/30 active:scale-[0.99] transition-all cursor-pointer flex flex-col gap-3 group relative shadow-sm"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                          <h4 className="font-bold text-sm text-on-surface leading-tight break-words group-hover:text-secondary transition-colors">
                                            {task.title}
                                          </h4>
                                          {task.description && (
                                            <p className="text-xs text-on-surface-variant/80 mt-1.5 leading-relaxed break-words">
                                              {task.description}
                                            </p>
                                          )}
                                        </div>
                                        
                                        {/* Quick Action Buttons */}
                                        <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              startEditTask(task);
                                            }}
                                            className="p-1.5 rounded-lg text-secondary hover:bg-secondary/5 transition-colors border border-outline-variant/30 bg-surface-white shadow-sm"
                                            title="Editar tarea"
                                          >
                                            <Edit2 size={13} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDelete(task.id);
                                            }}
                                            className="p-1.5 rounded-lg text-error hover:bg-error/5 transition-colors border border-outline-variant/30 bg-surface-white shadow-sm"
                                            title="Eliminar tarea"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Badges row */}
                                      <div className="flex flex-wrap gap-1.5 items-center pt-2.5 border-t border-outline-variant/30 text-[10px] font-semibold">
                                        {/* Priority */}
                                        {task.priority && (
                                          <span
                                            className={`uppercase px-2 py-0.5 rounded-md border ${
                                              PRIORITY_COLORS[task.priority].bg
                                            }`}
                                          >
                                            {PRIORITY_COLORS[task.priority].label}
                                          </span>
                                        )}

                                        {/* Shift */}
                                        <span className="text-on-surface-variant/80 bg-surface-low border border-outline-variant/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                                          <Clock size={10} className="text-on-surface-variant/60" />
                                          {SHIFT_NAMES[task.shift]}
                                        </span>

                                        {/* Frequency */}
                                        <span className="text-on-surface-variant/80 bg-surface-low border border-outline-variant/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                                          <Calendar size={10} className="text-on-surface-variant/60" />
                                          {getFrequencyText(task)}
                                        </span>

                                        {/* Creator initials */}
                                        <span className="text-[9px] font-medium text-on-surface-variant/50 ml-auto flex items-center gap-1.5 bg-surface-low/50 px-2 py-0.5 rounded-full border border-outline-variant/20">
                                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white uppercase ${
                                            task.createdBy === "Clemen" ? "bg-amber-600" : task.createdBy === "Isabel" ? "bg-purple-600" : "bg-slate-600"
                                          }`}>
                                            {task.createdBy[0]}
                                          </div>
                                          <span className="text-on-surface-variant/70">
                                            Por <span className="font-semibold">{task.createdBy}</span>
                                          </span>
                                        </span>
                                      </div>
                                    </motion.div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}

                        {/* Section 3: Únicas */}
                        {uniqueTasks.length > 0 && (
                          <motion.div layout className="space-y-1">
                            {renderSectionHeader("unica", "Tareas de un Solo Día", uniqueTasks.length, <Calendar size={14} className="text-secondary" />)}
                            <AnimatePresence mode="popLayout">
                              {expandedSections.unica && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                  className="space-y-2.5 overflow-hidden"
                                >
                                  {uniqueTasks.map((task) => (
                                    <motion.div
                                      key={task.id}
                                      layout
                                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -15 }}
                                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                      onClick={() => startEditTask(task)}
                                      className="p-4 rounded-xl border border-outline-variant bg-surface-white hover:bg-surface-low/30 hover:border-secondary/30 active:scale-[0.99] transition-all cursor-pointer flex flex-col gap-3 group relative shadow-sm"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                          <h4 className="font-bold text-sm text-on-surface leading-tight break-words group-hover:text-secondary transition-colors">
                                            {task.title}
                                          </h4>
                                          {task.description && (
                                            <p className="text-xs text-on-surface-variant/80 mt-1.5 leading-relaxed break-words">
                                              {task.description}
                                            </p>
                                          )}
                                        </div>
                                        
                                        {/* Quick Action Buttons */}
                                        <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              startEditTask(task);
                                            }}
                                            className="p-1.5 rounded-lg text-secondary hover:bg-secondary/5 transition-colors border border-outline-variant/30 bg-surface-white shadow-sm"
                                            title="Editar tarea"
                                          >
                                            <Edit2 size={13} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDelete(task.id);
                                            }}
                                            className="p-1.5 rounded-lg text-error hover:bg-error/5 transition-colors border border-outline-variant/30 bg-surface-white shadow-sm"
                                            title="Eliminar tarea"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Badges row */}
                                      <div className="flex flex-wrap gap-1.5 items-center pt-2.5 border-t border-outline-variant/30 text-[10px] font-semibold">
                                        {/* Priority */}
                                        {task.priority && (
                                          <span
                                            className={`uppercase px-2 py-0.5 rounded-md border ${
                                              PRIORITY_COLORS[task.priority].bg
                                            }`}
                                          >
                                            {PRIORITY_COLORS[task.priority].label}
                                          </span>
                                        )}

                                        {/* Shift */}
                                        <span className="text-on-surface-variant/80 bg-surface-low border border-outline-variant/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                                          <Clock size={10} className="text-on-surface-variant/60" />
                                          {SHIFT_NAMES[task.shift]}
                                        </span>

                                        {/* Frequency */}
                                        <span className="text-on-surface-variant/80 bg-surface-low border border-outline-variant/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                                          <Calendar size={10} className="text-on-surface-variant/60" />
                                          {getFrequencyText(task)}
                                        </span>

                                        {/* Creator initials */}
                                        <span className="text-[9px] font-medium text-on-surface-variant/50 ml-auto flex items-center gap-1.5 bg-surface-low/50 px-2 py-0.5 rounded-full border border-outline-variant/20">
                                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white uppercase ${
                                            task.createdBy === "Clemen" ? "bg-amber-600" : task.createdBy === "Isabel" ? "bg-purple-600" : "bg-slate-600"
                                          }`}>
                                            {task.createdBy[0]}
                                          </div>
                                          <span className="text-on-surface-variant/70">
                                            Por <span className="font-semibold">{task.createdBy}</span>
                                          </span>
                                        </span>
                                      </div>
                                    </motion.div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </>
                    )}
                    <div className="h-16" /> {/* Spacer for floating button */}
                  </motion.div>
                ) : (
                  // VIEW: FORM (ADD / EDIT)
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onSubmit={handleSave}
                    className="p-4 space-y-4"
                  >
                    {/* Title */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                        Título de la Tarea *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej: Fregar plancha de cocina..."
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-white text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-0 transition-all shadow-sm"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                        Descripción / Instrucciones
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detalles sobre productos, medidas de seguridad o pasos a seguir..."
                        rows={2}
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-white text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-0 transition-all shadow-sm resize-none"
                      />
                    </div>

                    {/* Shift Segmented Control */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                        Asignar al Turno
                      </label>
                      <div className="relative grid grid-cols-4 gap-1 p-1 bg-surface-low border border-outline-variant/60 rounded-xl z-0">
                        {(["mañana", "tarde", "cierre", "todos"] as Task["shift"][]).map((sh) => {
                          const isActive = shift === sh;
                          return (
                            <button
                              key={sh}
                              type="button"
                              onClick={() => setShift(sh)}
                              className={`relative py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize z-10 ${
                                isActive
                                  ? "text-white"
                                  : "text-on-surface-variant/80 hover:bg-surface-container"
                              }`}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="activeFormShiftBg"
                                  className="absolute inset-0 bg-secondary rounded-[7px] -z-10 shadow-sm"
                                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                              )}
                              <span className="relative z-10">
                                {sh === "todos" ? "Todos" : sh}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Priority Selector */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                        Prioridad
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {([null, "baja", "media", "alta", "urgente"] as Task["priority"][]).map((pr) => {
                          const isSelected = priority === pr;
                          let btnStyle = "bg-surface-low border-outline-variant text-on-surface-variant hover:bg-surface-container";
                          
                          if (isSelected) {
                            if (pr === "urgente") btnStyle = "bg-error text-white border-error shadow-sm";
                            else if (pr === "alta") btnStyle = "bg-amber-500 text-white border-amber-500 shadow-sm";
                            else if (pr === "media") btnStyle = "bg-blue-600 text-white border-blue-600 shadow-sm";
                            else if (pr === "baja") btnStyle = "bg-slate-700 text-white border-slate-700 shadow-sm";
                            else btnStyle = "bg-secondary text-white border-secondary shadow-sm";
                          }

                          return (
                            <button
                              key={pr === null ? "ninguna" : pr}
                              type="button"
                              onClick={() => setPriority(pr)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${btnStyle}`}
                            >
                              {pr === null ? "Ninguna" : pr.toUpperCase()}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Frequency Segmented Control */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                        Frecuencia de la Tarea
                      </label>
                      <div className="relative grid grid-cols-3 gap-1 p-1 bg-surface-low border border-outline-variant/60 rounded-xl z-0">
                        {(["diaria", "seleccionados", "unica"] as Task["frequency"][]).map((fr) => {
                          const isActive = frequency === fr;
                          return (
                            <button
                              key={fr}
                              type="button"
                              onClick={() => setFrequency(fr)}
                              className={`relative py-1.5 text-xs font-semibold rounded-lg transition-colors z-10 ${
                                isActive
                                  ? "text-white"
                                  : "text-on-surface-variant/80 hover:bg-surface-container"
                              }`}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="activeFormFreqBg"
                                  className="absolute inset-0 bg-secondary rounded-[7px] -z-10 shadow-sm"
                                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                              )}
                              <span className="relative z-10">
                                {fr === "diaria" ? "Diaria" : fr === "seleccionados" ? "Días" : "Única"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Conditional scheduling settings */}
                    <AnimatePresence mode="wait">
                      {frequency === "seleccionados" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                            Días de la semana
                          </label>
                          <div className="flex justify-between items-center bg-surface-low border border-outline-variant/40 p-3 rounded-xl">
                            {WEEK_DAYS.map((wd) => {
                              const active = selectedDays.includes(wd.id);
                              return (
                                <button
                                  key={wd.id}
                                  type="button"
                                  onClick={() => handleToggleDay(wd.id)}
                                  className={`w-9 h-9 rounded-full text-xs font-bold transition-all border flex items-center justify-center ${
                                    active
                                      ? "bg-secondary text-white border-secondary shadow-sm scale-105"
                                      : "bg-surface-white border-outline-variant text-on-surface-variant/80 hover:bg-surface-container"
                                  }`}
                                >
                                  {wd.label}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}

                      {frequency === "unica" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                            Fecha de realización
                          </label>
                          <input
                            type="date"
                            required
                            value={specificDate}
                            onChange={(e) => setSpecificDate(e.target.value)}
                            className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-0 transition-all shadow-sm"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>


                    {/* Form Footer Buttons */}
                    <div className="pt-4 border-t border-outline-variant/40 flex gap-2">
                      {editingTask && (
                        <button
                          type="button"
                          onClick={() => handleDelete(editingTask.id)}
                          className="px-4 py-2.5 bg-error/10 hover:bg-error/15 text-error rounded-xl font-bold text-xs uppercase tracking-wide transition-all border border-error/10"
                        >
                          Eliminar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setView("list")}
                        className="flex-1 py-2.5 bg-surface-low border border-outline-variant hover:bg-surface-container text-on-surface-variant rounded-xl font-bold text-xs uppercase tracking-wide transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-secondary hover:bg-secondary/90 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-sm"
                      >
                        {editingTask ? "Guardar Cambios" : "Crear Tarea"}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Footer containing "+ Add Task" button in List View */}
            {view === "list" && (
              <div className="px-4 py-3 bg-surface-low border-t border-outline-variant flex shrink-0">
                <button
                  onClick={initNewTaskForm}
                  className="w-full py-3 bg-secondary hover:bg-secondary/90 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
                >
                  <Plus size={16} />
                  Añadir Tarea a la Plantilla
                </button>
              </div>
            )}
          </motion.div>

          <ConfirmModal
            isOpen={taskToDeleteId !== null}
            onClose={() => setTaskToDeleteId(null)}
            onConfirm={handleConfirmDelete}
            title="¿Eliminar de la plantilla?"
            message="¿Seguro que deseas eliminar esta tarea de la plantilla? Esto la quitará de los turnos correspondientes."
            confirmText="Eliminar"
            cancelText="Cancelar"
            type="danger"
          />
        </>
      )}
    </AnimatePresence>
  );
}
