
/*
import axios from 'axios';
import { env } from '../config/env';

console.log("Conectando a la API en:", env.API_URL || 'https://taskdone-node.onrender.com/api');

export const axiosClient = axios.create({
  // import.meta.env.PROD es una variable de Vite que es true cuando ejecutas 'npm run build'
baseURL: env.API_URL || 'https://taskdone-node.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
*/


import axios from 'axios';
import { env } from '../config/env';

/**
 * Determinamos la URL base. 
 * Priorizamos la variable de entorno y usamos la de Render como respaldo.
 */
const BASE_URL = env.API_URL || 'https://taskdone-node.onrender.com/api';

// Log solo en modo desarrollo para evitar exponer infraestructura en producción
if (import.meta.env.DEV) {
  console.log(`[Axios] Configurado para: ${BASE_URL}`);
}

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 12000, // Incrementado ligeramente por el "cold start" de Render
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor opcional: útil si decides implementar 
 * autenticación (JWT) en tu proyecto FarmaGestión o TaskDone.
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

