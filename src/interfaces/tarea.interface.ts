export interface Tarea {
  id: number;
  name: string; // Título o nombre de la tarea (viene de la API)
  done: boolean; // Estado de la tarea (viene de la API)
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RespuestaTareas {
  total: number;
  page: number;
  pages: number;
  data: Tarea[];
}