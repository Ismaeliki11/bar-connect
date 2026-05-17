export interface Task {
  id: string;
  title: string;
  description: string;
  category: "cocina" | "limpieza";
  priority: "urgente" | "alta" | "media" | "baja" | null;
  shift: "mañana" | "tarde" | "cierre" | "todos";
  frequency: "diaria" | "seleccionados" | "unica";
  selectedDays?: number[]; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  specificDate?: string; // YYYY-MM-DD
  createdBy: "Clemen" | "Isabel" | "General";
  createdAt: string;
}

export interface TaskWithCompletion extends Task {
  completed: boolean;
}

export const SHIFT_NAMES = {
  mañana: "Turno Mañana",
  tarde: "Turno Tarde",
  cierre: "Turno de Cierre",
  todos: "Todos los Turnos",
};

export const FREQUENCY_NAMES = {
  diaria: "Todos los días",
  seleccionados: "Días seleccionados",
  unica: "Única del día",
};

export const PRIORITY_COLORS = {
  urgente: { bg: "bg-error-container text-on-error-container border-error/20", label: "Urgente" },
  alta: { bg: "bg-amber-100 text-amber-800 border-amber-200/50", label: "Alta" },
  media: { bg: "bg-blue-50 text-blue-800 border-blue-100", label: "Media" },
  baja: { bg: "bg-slate-100 text-slate-700 border-slate-200", label: "Baja" },
};

const defaultTasks: Task[] = [
  // Kitchen default tasks
  {
    id: "default_kitchen_1",
    title: "Cortar verduras",
    description: "Cebolla, pimiento, tomate para sofrito base.",
    category: "cocina",
    priority: "urgente",
    shift: "mañana",
    frequency: "diaria",
    createdBy: "Clemen",
    createdAt: new Date().toISOString(),
  },
  {
    id: "default_kitchen_2",
    title: "Preparar salsa brava",
    description: "Revisar stock de pimentón picante antes de empezar.",
    category: "cocina",
    priority: null,
    shift: "mañana",
    frequency: "diaria",
    createdBy: "Isabel",
    createdAt: new Date().toISOString(),
  },
  {
    id: "default_kitchen_3",
    title: "Reponer postres",
    description: "Sacar tartas de la cámara, preparar raciones individuales.",
    category: "cocina",
    priority: "media",
    shift: "mañana",
    frequency: "diaria",
    createdBy: "Clemen",
    createdAt: new Date().toISOString(),
  },
  {
    id: "default_kitchen_4",
    title: "Encender freidoras",
    description: "Temperatura a 180°C.",
    category: "cocina",
    priority: null,
    shift: "mañana",
    frequency: "diaria",
    createdBy: "Isabel",
    createdAt: new Date().toISOString(),
  },
  {
    id: "default_kitchen_5",
    title: "Limpieza de fuegos",
    description: "Revisar quemadores y limpiar rejillas.",
    category: "cocina",
    priority: "alta",
    shift: "cierre",
    frequency: "diaria",
    createdBy: "Clemen",
    createdAt: new Date().toISOString(),
  },
  // Cleaning default tasks
  {
    id: "default_cleaning_1",
    title: "Limpiar cafetera y vaporizadores",
    description: "Desmontar filtros, limpiar con producto específico y purgar vaporizadores.",
    category: "limpieza",
    priority: "alta",
    shift: "cierre",
    frequency: "diaria",
    createdBy: "Isabel",
    createdAt: new Date().toISOString(),
  },
  {
    id: "default_cleaning_2",
    title: "Fregar suelos terraza",
    description: "Recoger sillas, barrer a fondo y fregar con desengrasante.",
    category: "limpieza",
    priority: "media",
    shift: "cierre",
    frequency: "diaria",
    createdBy: "Clemen",
    createdAt: new Date().toISOString(),
  },
  {
    id: "default_cleaning_3",
    title: "Reponer jabón y papel en baños",
    description: "Revisar dispensadores en ambos baños.",
    category: "limpieza",
    priority: "baja",
    shift: "cierre",
    frequency: "diaria",
    createdBy: "Isabel",
    createdAt: new Date().toISOString(),
  },
  {
    id: "default_cleaning_4",
    title: "Limpieza de barra principal",
    description: "Desinfectar barra, repasar taburetes y vaciar ceniceros exteriores.",
    category: "limpieza",
    priority: "media",
    shift: "tarde",
    frequency: "diaria",
    createdBy: "Clemen",
    createdAt: new Date().toISOString(),
  },
];

const MASTER_TASKS_KEY = "barconnect_tasks_master";

// Helper to get formatted date string
export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Get all master tasks from localStorage (initializes defaults if empty)
export function getMasterTasks(): Task[] {
  if (typeof window === "undefined") return defaultTasks;
  const saved = localStorage.getItem(MASTER_TASKS_KEY);
  if (!saved) {
    localStorage.setItem(MASTER_TASKS_KEY, JSON.stringify(defaultTasks));
    return defaultTasks;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return defaultTasks;
  }
}

// Save master tasks back to localStorage
export function saveMasterTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MASTER_TASKS_KEY, JSON.stringify(tasks));
}

// Get filtered tasks with their completion state for a given category, date, and shift
export function getTasksForDateAndShift(
  category: "cocina" | "limpieza",
  date: Date,
  selectedShift: "mañana" | "tarde" | "cierre" | "todos"
): TaskWithCompletion[] {
  const master = getMasterTasks();
  const dateKey = formatDateKey(date);
  const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, etc.

  // 1. Filter tasks by category & schedule
  const filtered = master.filter((task) => {
    // Verify category matches
    if (task.category !== category) return false;

    // Verify shift matches
    if (selectedShift !== "todos" && task.shift !== "todos" && task.shift !== selectedShift) {
      return false;
    }

    // Verify frequency schedule matches the selected date
    if (task.frequency === "diaria") {
      return true;
    } else if (task.frequency === "seleccionados") {
      return task.selectedDays?.includes(dayOfWeek) ?? false;
    } else if (task.frequency === "unica") {
      return task.specificDate === dateKey;
    }

    return false;
  });

  // 2. Fetch completions for this date & category
  const completionsKey = `barconnect_completions_${category}_${dateKey}`;
  let completions: Record<string, boolean> = {};
  
  if (typeof window !== "undefined") {
    const savedCompletions = localStorage.getItem(completionsKey);
    if (savedCompletions) {
      try {
        completions = JSON.parse(savedCompletions);
      } catch (e) {}
    }
  }

  // 3. Map completion status
  return filtered.map((task) => ({
    ...task,
    completed: completions[task.id] || false,
  }));
}

// Toggle a task's completion status for a given date
export function toggleTaskCompletion(
  category: "cocina" | "limpieza",
  taskId: string,
  date: Date,
  completed: boolean
): void {
  if (typeof window === "undefined") return;
  const dateKey = formatDateKey(date);
  const completionsKey = `barconnect_completions_${category}_${dateKey}`;

  let completions: Record<string, boolean> = {};
  const savedCompletions = localStorage.getItem(completionsKey);
  
  if (savedCompletions) {
    try {
      completions = JSON.parse(savedCompletions);
    } catch (e) {}
  }

  completions[taskId] = completed;
  localStorage.setItem(completionsKey, JSON.stringify(completions));
}

// Add a new task to master templates
export function addMasterTask(taskData: Omit<Task, "id" | "createdAt">): Task {
  const master = getMasterTasks();
  const newTask: Task = {
    ...taskData,
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString(),
  };
  
  master.push(newTask);
  saveMasterTasks(master);
  return newTask;
}

// Update a master task template
export function updateMasterTask(taskId: string, updatedFields: Partial<Omit<Task, "id" | "category" | "createdAt">>): Task | null {
  const master = getMasterTasks();
  const index = master.findIndex((t) => t.id === taskId);
  
  if (index === -1) return null;
  
  const updatedTask = {
    ...master[index],
    ...updatedFields,
  } as Task;

  master[index] = updatedTask;
  saveMasterTasks(master);
  return updatedTask;
}

// Delete a master task template
export function deleteMasterTask(taskId: string): void {
  const master = getMasterTasks();
  const updated = master.filter((t) => t.id !== taskId);
  saveMasterTasks(updated);
}
