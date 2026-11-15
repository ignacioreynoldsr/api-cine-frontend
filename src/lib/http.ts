import axios from 'axios';
import { env } from '@/config/env';

// cliente http
export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 10000,
});

// Agregar JWT automáticamente a las peticiones
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Manejo de respuestas y errores
http.interceptors.response.use(
  // si sale bien
  (respuesta) => respuesta,

  // si sale mal
  (error) => {
    const mensaje =
      error.response?.data?.message ??
      'No se puede conectar con el servidor';

    return Promise.reject(new Error(mensaje));
  },
);