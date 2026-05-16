"use client";

import { useState, useEffect } from "react";
import { ChefHat, Sparkles, AlarmClock, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
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

export default function Dashboard() {
  const { currentUser } = useUser();
  const [clockedIn, setClockedIn] = useState(false);
  const [tasks, setTasks] = useState(mockTasks);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user-specific state
  useEffect(() => {
    if (currentUser) {
      const savedTasks = localStorage.getItem(`tasks_${currentUser}`);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        setTasks(mockTasks);
      }

      const savedClockStatus = localStorage.getItem(`clockedIn_${currentUser}`);
      if (savedClockStatus) {
        setClockedIn(JSON.parse(savedClockStatus));
      }
      setIsLoaded(true);
    }
  }, [currentUser]);

  // Save tasks on change
  useEffect(() => {
    if (isLoaded && currentUser) {
      localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
    }
  }, [tasks, currentUser, isLoaded]);

  // Save clock status on change
  useEffect(() => {
    if (isLoaded && currentUser) {
      localStorage.setItem(`clockedIn_${currentUser}`, JSON.stringify(clockedIn));
    }
  }, [clockedIn, currentUser, isLoaded]);

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

      <div className="px-3 pt-5 pb-2">
        <h1 className="text-2xl font-semibold text-on-surface">
          Hola, {currentUser}
        </h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          {DATE_STR} &bull; {SHIFT_NAME}
        </p>
      </div>

      {/* Shift status card */}
      <div className="mx-3 mt-3 rounded-xl bg-primary-container p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-primary-container mb-1">
          Estado Actual
        </p>
        <p className="text-xl font-semibold text-on-primary mb-3 flex items-center gap-2">
          <AlarmClock
            size={20}
            className={clockedIn ? "text-[#4edea3]" : "text-on-primary-container"}
          />
          {clockedIn ? "Turno activo" : "Sin fichar"}
        </p>
        <button
          onClick={() => setClockedIn((v) => !v)}
          className="w-full py-3 rounded-lg bg-on-primary text-primary font-semibold text-sm uppercase tracking-wide transition-opacity active:opacity-80"
        >
          {clockedIn ? "Finalizar Turno" : "Iniciar Turno"}
        </button>
      </div>

      {/* Quick access */}
      <div className="mx-3 mt-4 grid grid-cols-2 gap-3">
        <Link
          href="/cocina"
          className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-outline-variant bg-surface-white active:bg-surface-low transition-colors"
        >
          <ChefHat size={24} className="text-on-surface-variant" />
          <span className="text-sm font-medium text-on-surface">Cocina</span>
          <span className="text-xs text-secondary font-medium">3 Pedidos activos</span>
        </Link>
        <Link
          href="/limpieza"
          className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-outline-variant bg-surface-white active:bg-surface-low transition-colors"
        >
          <Sparkles size={24} className="text-on-surface-variant" />
          <span className="text-sm font-medium text-on-surface">Limpieza</span>
          <span className="text-xs text-error font-medium">1 Tarea urgente</span>
        </Link>
      </div>

      {/* Task progress */}
      <div className="mx-3 mt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-on-surface">Progreso de Tareas</h2>
          <span className="text-xs font-semibold text-secondary">
            {completed}/{total} Completadas
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-surface-container mb-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-secondary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Task list */}
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="flex items-start gap-3 p-3 rounded-xl border border-outline-variant bg-surface-white active:bg-surface-low transition-colors text-left w-full"
            >
              {task.completed ? (
                <CheckCircle2 size={20} className="text-secondary mt-0.5 shrink-0" />
              ) : (
                <Circle size={20} className="text-outline mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    task.completed
                      ? "line-through text-on-surface-variant"
                      : "text-on-surface"
                  }`}
                >
                  {task.title}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">{task.area}</p>
              </div>
              {!task.completed && (task.priority === "alta" || task.priority === "urgente") && (
                <span className="shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-error-container text-on-error-container">
                  {task.priority === "urgente" ? "Urgente" : "Alta"}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
