"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, ListChecks } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageWrapper from "@/components/PageWrapper";
import { useUser } from "@/components/UserContext";

interface CleaningTask {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

const initialTasks: CleaningTask[] = [
  {
    id: 1,
    title: "Limpiar cafetera y vaporizadores",
    description: "Desmontar filtros, limpiar con producto específico y purgar vaporizadores.",
    completed: false,
  },
  {
    id: 2,
    title: "Fregar suelos terraza",
    description: "Recoger sillas, barrer a fondo y fregar con desengrasante.",
    completed: false,
  },
  {
    id: 3,
    title: "Reponer jabón y papel en baños",
    description: "Revisar dispensadores en ambos baños.",
    completed: false,
  },
];

const SHIFT = "Turno de Cierre";
const DATE = "Jueves, 24 Oct";

export default function LimpiezaPage() {
  const { currentUser } = useUser();
  const [tasks, setTasks] = useState<CleaningTask[]>(initialTasks);
  const [notes, setNotes] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user-specific state
  useEffect(() => {
    if (currentUser) {
      const savedTasks = localStorage.getItem(`tasks_limpieza_${currentUser}`);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        setTasks(initialTasks);
      }

      const savedNotes = localStorage.getItem(`notes_limpieza_${currentUser}`);
      if (savedNotes) {
        setNotes(savedNotes);
      }
      setIsLoaded(true);
    }
  }, [currentUser]);

  // Save tasks on change
  useEffect(() => {
    if (isLoaded && currentUser) {
      localStorage.setItem(`tasks_limpieza_${currentUser}`, JSON.stringify(tasks));
    }
  }, [tasks, currentUser, isLoaded]);

  // Save notes on change
  useEffect(() => {
    if (isLoaded && currentUser) {
      localStorage.setItem(`notes_limpieza_${currentUser}`, notes);
    }
  }, [notes, currentUser, isLoaded]);

  const pending = tasks.filter((t) => !t.completed).length;

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <PageWrapper>
      <AppHeader title="Limpieza" />

      <div className="px-4 pt-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-semibold text-on-surface">
              Tareas de Limpieza
            </h1>
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
        <div className="flex flex-col gap-3 mb-4">
          {incompleteTasks.map((task) => (
            <CleaningTaskItem key={task.id} task={task} onToggle={toggleTask} />
          ))}
        </div>

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <div className="mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 px-1">Completadas</h3>
            <div className="flex flex-col gap-3">
              {completedTasks.map((task) => (
                <CleaningTaskItem key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </div>
          </div>
        )}

        {/* Observations */}
        <div className="mt-2 rounded-xl border border-outline-variant bg-surface-white p-4 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ListChecks size={16} className="text-secondary" />
            <h3 className="text-sm font-semibold text-on-surface">Observaciones</h3>
          </div>
          <p className="text-xs text-on-surface-variant mb-2">
            Notas adicionales o incidencias de limpieza
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Ej: Falta lejía para el próximo turno..."
            className="w-full text-sm px-3 py-2 rounded-lg border border-outline-variant bg-surface-low text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1 resize-none"
          />
        </div>
      </div>
    </PageWrapper>
  );
}

function CleaningTaskItem({
  task,
  onToggle,
}: {
  task: CleaningTask;
  onToggle: (id: number) => void;
}) {
  return (
    <button
      onClick={() => onToggle(task.id)}
      className="flex items-start gap-3 p-4 rounded-xl border border-outline-variant bg-surface-white active:bg-surface-low transition-colors text-left w-full shadow-sm"
    >
      <div className="mt-0.5 shrink-0">
        {task.completed ? (
          <CheckCircle2 size={20} className="text-secondary" />
        ) : (
          <Circle size={20} className="text-outline" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold ${
            task.completed ? "line-through text-on-surface-variant" : "text-on-surface"
          }`}
        >
          {task.title}
        </p>
        <p
          className={`text-xs mt-1 leading-relaxed ${
            task.completed
              ? "line-through text-on-surface-variant/60"
              : "text-on-surface-variant"
          }`}
        >
          {task.description}
        </p>
      </div>
      {task.completed && (
        <CheckCircle2 size={16} className="text-secondary/60 shrink-0 mt-0.5" />
      )}
    </button>
  );
}
