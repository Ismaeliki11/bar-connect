export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          name: string;
          role: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          avatar_url?: string | null;
        };
      };
      clock_records: {
        Row: {
          id: string;
          employee_id: string;
          type: "entrada" | "salida";
          timestamp: string;
          photo_url: string | null;
          verified: boolean;
          shift: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          type: "entrada" | "salida";
          timestamp?: string;
          photo_url?: string | null;
          verified?: boolean;
          shift: string;
        };
        Update: {
          verified?: boolean;
          photo_url?: string | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: "cocina" | "limpieza" | "general";
          priority: "alta" | "media" | "baja";
          completed: boolean;
          shift: string;
          date: string;
          assigned_to: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category: "cocina" | "limpieza" | "general";
          priority?: "alta" | "media" | "baja";
          completed?: boolean;
          shift: string;
          date: string;
          assigned_to?: string | null;
          created_at?: string;
        };
        Update: {
          completed?: boolean;
          priority?: "alta" | "media" | "baja";
          assigned_to?: string | null;
        };
      };
    };
  };
}
