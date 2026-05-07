import { useState, useCallback } from 'react';
import { useAxios } from './useAxios';
import { useAlert } from './useAlert';
import type { Tarea, RespuestaTareas } from '../interfaces/tarea.interface';

export const useTareas = () => {
  const axiosClient = useAxios();
  const alert = useAlert();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas] = useState(1);


  /*
  const obtenerTareas = useCallback(async (page: number = 1) => {
    setCargando(true);
    try {
      const response = await axiosClient.get<RespuestaTareas>('/tasks', {
        params: { page, limit: 10, orderby: 'createdAt', orderDir: 'DESC' }
      });
      setTareas(response.data.data);
      setPaginaActual(response.data.page);
      setTotalPaginas(response.data.pages);
    } catch (error) {
      console.error(error);
      alert.showAlert('Error al obtener las tareas', 'error');
    } finally {
      setCargando(false);
    }
  }, [axiosClient, alert]);

  */


  const obtenerTareas = useCallback(async (page: number = 1) => {
  setCargando(true);
  try {
    const response = await axiosClient.get<RespuestaTareas>('/tasks', { params: { page } });
    const tareasBackend = response.data.data;
    
    // Recuperamos las fechas del almacenamiento local
    const fechasLocales = JSON.parse(localStorage.getItem('tareas_fechas') || '{}');

    // Unimos los datos del backend con las fechas del frontend[cite: 6]
    const tareasConFechas = tareasBackend.map((t: Tarea) => ({
      ...t,
      createdAt: fechasLocales[t.id]?.createdAt || t.createdAt, // Prioriza local si el back no tiene[cite: 4]
      completedAt: fechasLocales[t.id]?.completedAt
    }));

    setTareas(tareasConFechas);
  } catch (error) {
    alert.showAlert('Error al sincronizar fechas', 'error');
  } finally {
    setCargando(false);
  }
}, [axiosClient, alert]);
 
  /*
  const crearTarea = async (name: string, createdAt?: string) => {
    try {
      await axiosClient.post('/tasks', { name });
      alert.showAlert('Tarea creada exitosamente', 'success');
      obtenerTareas(1); // recargar a la primera página para ver la más reciente
    } catch (error) {
      console.error(error);
      alert.showAlert('Error al crear la tarea', 'error');
    }
  };

  */

const crearTarea = async (name: string) => {
  try {
    // 1. El backend crea la tarea y nos devuelve el objeto con su ID
    const response = await axiosClient.post('/tasks', { name });
    const nuevaTarea = response.data; // Supongamos que devuelve { id, name, done }[cite: 4]

    // 2. Guardamos la fecha en LocalStorage asociada a ese ID
    const fechas = JSON.parse(localStorage.getItem('tareas_fechas') || '{}');
    fechas[nuevaTarea.id] = {
      createdAt: new Date().toISOString(),
      completedAt: null
    };
      localStorage.setItem('tareas_fechas', JSON.stringify(fechas));

      alert.showAlert('Tarea creada con fecha local', 'success');
      obtenerTareas(1);
    } catch (error) {
      alert.showAlert('Error al crear la tarea', 'error');
    }
  };




  const editarTarea = async (id: number, name: string) => {
    try {
      await axiosClient.put(`/tasks/${id}`, { name });
      alert.showAlert('Tarea actualizada exitosamente', 'success');
      obtenerTareas(paginaActual);
    } catch (error) {
      console.error(error);
      alert.showAlert('Error al actualizar la tarea', 'error');
    }
  };

  /*
  const cambiarEstadoTarea = async (id: number, done: boolean) => {
    try {
      await axiosClient.patch(`/tasks/${id}`, { done });
      alert.showAlert(`Tarea marcada como ${done ? 'Finalizada' : 'Pendiente'}`, 'success');
      obtenerTareas(paginaActual);
    } catch (error) {
      console.error(error);
      alert.showAlert('Error al cambiar el estado de la tarea', 'error');
    }
  };
  */

  
const cambiarEstadoTarea = async (id: number, done: boolean) => {
  try {
    await axiosClient.patch(`/tasks/${id}`, { done });
    // Gestión de fecha de finalización local
    const fechasLocales = JSON.parse(localStorage.getItem('tareas_fechas') || '{}');
    
      if (done) {
        // Si se marca como finalizada, guardamos la fecha de ahora
        fechasLocales[id] = {
          ...fechasLocales[id],
          completedAt: new Date().toISOString()
        };
      } else {
        // Si se desmarca, eliminamos la fecha de finalización
        fechasLocales[id] = {
          ...fechasLocales[id],
          completedAt: null
        };
      }
    
      localStorage.setItem('tareas_fechas', JSON.stringify(fechasLocales));
    
      alert.showAlert(`Tarea marcada como ${done ? 'Finalizada' : 'Pendiente'}`, 'success');
      obtenerTareas(paginaActual);
    } catch (error) {
      console.error(error);
      alert.showAlert('Error al cambiar el estado', 'error');
    }
  };

  const eliminarTarea = async (id: number) => {
    try {
      await axiosClient.delete(`/tasks/${id}`);
      alert.showAlert('Tarea eliminada', 'success');
      obtenerTareas(paginaActual);
    } catch (error) {
      console.error(error);
      alert.showAlert('Error al eliminar la tarea', 'error');
    }
  };

  return {
    tareas,
    cargando,
    paginaActual,
    totalPaginas,
    obtenerTareas,
    crearTarea,
    editarTarea,
    cambiarEstadoTarea,
    eliminarTarea,
    setPaginaActual
  };
};