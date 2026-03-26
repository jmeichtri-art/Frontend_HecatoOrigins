import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const TOKEN = process.env.NEXT_PUBLIC_TOKEN;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('hecato_user');
    if (user) {
      const token = TOKEN;
      if (token) {
        // Enviar el token como Bearer o como esté configurado
        config.headers['Authorization'] = token.startsWith('Bearer') ? token : `Bearer ${token}`;
      }
    }
  }
  return config;
});

// Manejo centralizado de respuestas y errores
api.interceptors.response.use(
  (response) => {
    // Aquí recibimos la estructura estandarizada: { success, data, message, error }
    return response;
  },
  (error) => {
    // Si el backend envió un mensaje de error personalizado en su ApiResponse, 
    // lo inyectamos directamente en error.message para que el frontend lo lea fácil.
    const backendError = error.response?.data?.error;
    if (backendError) {
      error.message = backendError;
    }

    // Manejo global de expiración de sesión
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hecato_user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
