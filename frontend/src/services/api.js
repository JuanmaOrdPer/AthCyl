import axios from 'axios';

const api = axios.create({
  baseURL: 'https://127.0.0.1:8000', // URL para desarrollo web local con HTTPS
  // Para emuladores o dispositivos físicos, usa una de estas opciones:
  // baseURL: 'https://10.0.2.2:8000', // URL para Android Emulator apuntando a localhost con HTTPS
  // baseURL: 'https://192.168.1.X:8000', // Reemplaza X con tu IP local
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Aceptar certificados SSL autofirmados (solo para desarrollo)
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Acepta cualquier respuesta entre 200-499
  }
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores de autenticación (401)
    if (error.response && error.response.status === 401) {
      // Aquí podrías redirigir al login o mostrar un mensaje
      console.error('Sesión expirada o no autenticado');
    }
    return Promise.reject(error);
  }
);

export default api;
