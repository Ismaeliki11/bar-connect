"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, GripVertical, Plus } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageWrapper from "@/components/PageWrapper";
import { useUser } from "@/components/UserContext";

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
const DATE = "12 Oct";

export default function CocinaPage() {
  const { currentUser } = useUser();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user-specific state
  useEffect(() => {
    if (currentUser) {
      const savedTasks = localStorage.getItem(`tasks_cocina_${currentUser}`);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        setTasks(initialTasks);
      }
      setIsLoaded(true);
    }
  }, [currentUser]);

  // Save tasks on change
  useEffect(() => {
    if (isLoaded && currentUser) {
      localStorage.setItem(`tasks_cocina_${currentUser}`, JSON.stringify(tasks));
    }
  }, [tasks, currentUser, isLoaded]);

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

  return (
    <PageWrapper>
      <AppHeader title="Cocina" />

      <div className="px-4 pt-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-semibold text-on-surface">Tareas de Cocina</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {SHIFT} &bull; {DATE}
            </p>
          </div>
          {pending > 0 && (
            <span className="mt-1 shrink-0 px-2.5 py-1 rounded-full bg-error-container text-on-error-container text-xs font-bold">
              {pending} Pendientes
            </span>
          )}
        </div>

        {/* Pending tasks */}
        <div className="flex flex-col gap-2 mb-4">
          {incompleteTasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={toggleTask} />
          ))}
        </div>

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <div className="mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Completadas</h3>
            <div className="flex flex-col gap-2">
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </div>
          </div>
        )}

        {/* Add extra task */}
        <div className="mt-2 rounded-xl border border-outline-variant bg-surface-low p-3 shadow-sm">
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
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-outline-variant bg-surface-white text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1"
            />
            <button
              onClick={addTask}
              className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0 active:opacity-80 transition-opacity"
            >
              <Plus size={20} className="text-on-primary" />
            </button>
          </div>
        </div>
      </div>
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
    <button
      onClick={() => onToggle(task.id)}
      className="flex items-start gap-3 p-3 rounded-xl border border-outline-variant bg-surface-white active:bg-surface-low transition-colors text-left w-full shadow-sm"
    >
      {task.completed ? (
        <CheckCircle2 size={20} className="text-secondary mt-0.5 shrink-0" />
      ) : (
        <Circle size={20} className="text-outline mt-0.5 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            task.completed ? "line-through text-on-surface-variant" : "text-on-surface"
          }`}
        >
          {task.title}
        </p>
        {task.description && (
          <p
            className={`text-xs mt-0.5 ${
              task.completed ? "line-through text-on-surface-variant/60" : "text-on-surface-variant"
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
    </button>
  );
}
