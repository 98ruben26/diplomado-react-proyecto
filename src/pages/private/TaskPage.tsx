import { useEffect, useState, useCallback, type FormEvent } from 'react';
import {
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  List, 
  ListItem,
  ListItemText, 
  IconButton, 
  Checkbox, 
  Pagination, 
  CircularProgress,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Chip, 
} 



from '@mui/material';
import { Delete, Edit, AddCircleOutlined } from '@mui/icons-material';
import { useTareas } from '../../hooks/useTareas';
import { schemaTask } from '../../models'; // Integración con tu esquema de Zod
import type { Tarea } from '../../interfaces/tarea.interface';
import { AccessTime as TimeIcon } from '@mui/icons-material'; // Importar icono de reloj
//import { CheckCircleOutline as DoneIcon } from '@mui/icons-material';



export const TaskPage = () => {
  const {
    tareas, cargando, paginaActual, totalPaginas,
    obtenerTareas, crearTarea, editarTarea, cambiarEstadoTarea, eliminarTarea
  } = useTareas();

  const [nuevaTarea, setNuevaTarea] = useState('');
  const [tareaEditando, setTareaEditando] = useState<Tarea | null>(null);
  const [textoEdicion, setTextoEdicion] = useState('');
  const [errorEdicion, setErrorEdicion] = useState('');

  useEffect(() => {
    obtenerTareas(1);
  }, [obtenerTareas]);

  // Manejo de creación con validación centralizada[cite: 4, 5]
  /*
  const handleCrear = (e: FormEvent) => {
    e.preventDefault();
    const validation = schemaTask.safeParse({ name: nuevaTarea });
    
    if (!validation.success) return; // Se podría mostrar un alert aquí[cite: 4]
    
    crearTarea(nuevaTarea);
    setNuevaTarea('');
  }; 
  */

  const handleCrear = (e: FormEvent) => {
    e.preventDefault();
    const validation = schemaTask.safeParse({ name: nuevaTarea });
  
    if (validation.success) {
    // Generamos la fecha en formato ISO para que sea compatible con bases de datos
      //const fechaCreacion = new Date().toISOString(); 
    
    // Si tu hook crearTarea acepta un objeto, pásalo así:
    //crearTarea({ name: nuevaTarea, createdAt: fechaCreacion });
    
    // Si solo acepta el nombre, asegúrate de actualizar el hook useTareas
      crearTarea(nuevaTarea); 
      setNuevaTarea('');
     }
  };

  const handleAbrirEdicion = useCallback((tarea: Tarea) => {
    setTareaEditando(tarea);
    setTextoEdicion(tarea.name);
    setErrorEdicion('');
  }, []);

  const handleCerrarEdicion = () => {
    setTareaEditando(null);
    setTextoEdicion('');
    setErrorEdicion('');
  };

  const handleGuardarEdicion = () => {
    // Validación usando el modelo de datos[cite: 4]
    const validation = schemaTask.safeParse({ name: textoEdicion });
    
    if (!validation.success) {
      setErrorEdicion(validation.error?.issues[0]?.message || "Error de validación");
      return;
    }

    if (tareaEditando) {
      editarTarea(tareaEditando.id, textoEdicion);
      handleCerrarEdicion();
    }
  };

  const handlePageChange = (_: unknown, value: number) => {
    obtenerTareas(value);
  };

  return (
    <Box sx={{ p: 4, maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4, textAlign: 'center' }}>
        Gestión de Tareas
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleCrear} sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Nueva Tarea"
            value={nuevaTarea}
            onChange={(e) => setNuevaTarea(e.target.value)}
            placeholder="¿Qué necesitas hacer hoy?"
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddCircleOutlined />}
            disabled={nuevaTarea.trim().length < 3 || cargando} // Coherente con schemaTask[cite: 4]
            sx={{ px: 4, borderRadius: 2 }}
          >
            Añadir
          </Button>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 2, borderRadius: 2, minHeight: '300px', position: 'relative' }}>
        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : tareas.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <Typography color="text.secondary">No hay tareas disponibles.</Typography>
          </Box>
        ) : (
          <List>
            {tareas.map((tarea) => (
              <TaskListItem 
                key={tarea.id} 
                tarea={tarea} 
                onEdit={handleAbrirEdicion} 
                onDelete={eliminarTarea} 
                onToggle={cambiarEstadoTarea} 
              />
            ))}
          </List>
        )}
      </Paper>

      {totalPaginas > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={totalPaginas} page={paginaActual} onChange={handlePageChange} color="primary" />
        </Box>
      )}

      <Dialog open={!!tareaEditando} onClose={handleCerrarEdicion} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Editar Tarea</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la tarea"
            fullWidth
            value={textoEdicion}
            onChange={(e) => { setTextoEdicion(e.target.value); setErrorEdicion(''); }}
            error={!!errorEdicion}
            helperText={errorEdicion}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCerrarEdicion}>Cancelar</Button>
          <Button onClick={handleGuardarEdicion} variant="contained" disabled={textoEdicion === tareaEditando?.name}>
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

import { memo } from 'react';


const TaskListItem = memo(({ tarea, onEdit, onDelete, onToggle }: any) => {
  
  // Función para dar formato a la fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
 

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        mb: 2, 
        transition: '0.2s',
        '&:hover': { boxShadow: 2, borderColor: 'primary.main' },
        bgcolor: tarea.done ? 'action.hover' : 'background.paper',
        borderRadius: 2
      }}
    >
      <ListItem
        secondaryAction={
          <Box>
            <IconButton onClick={() => onEdit(tarea)} color="primary" size="small"><Edit /></IconButton>
            <IconButton onClick={() => onDelete(tarea.id)} color="error" size="small"><Delete /></IconButton>
          </Box>
        }
      >
        <Checkbox
          checked={tarea.done}
          onChange={(e) => onToggle(tarea.id, e.target.checked)}
          color="success"
        />
        <ListItemText
          primary={
            <Typography variant="h6" sx={{ 
              textDecoration: tarea.done ? 'line-through' : 'none', 
              color: tarea.done ? 'text.secondary' : 'text.primary',
              fontSize: '1.1rem',
              fontWeight: 500
            }}>
              {tarea.name}
            </Typography>
          }
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Chip 
                label={tarea.done ? 'Finalizada' : 'Pendiente'} 
                color={tarea.done ? 'success' : 'warning'} 
                size="small" 
                sx={{ fontWeight: 'bold', height: 20 }} 
              />
              {/* Nueva sección para la fecha */}
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.disabled', gap: 0.5 }}>
                <TimeIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {formatDate(tarea.createdAt)}
                </Typography>
              </Box>
            </Box>
          }
        />
      </ListItem>
    </Paper>
  );
});