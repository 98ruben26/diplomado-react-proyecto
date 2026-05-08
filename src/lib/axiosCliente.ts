

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


