import axios from 'axios';

const ENV_URL = import.meta.env.VITE_API_URL || '';
// BASE_URL será el dominio sin el /api (para imágenes). Si no hay ENV_URL, asume localhost:3001
const BASE_URL = ENV_URL ? ENV_URL.replace(/\/api\/?$/, '') : 'http://localhost:3001';
// API_URL será el dominio con /api (para peticiones). Si no hay ENV_URL, usa /api (proxy de Vite)
const API_URL = ENV_URL.endsWith('/api') ? ENV_URL : (ENV_URL ? `${ENV_URL}/api` : '/api');

export { API_URL, BASE_URL };

console.log(`[Config] API_URL: ${API_URL}`);
console.log(`[Config] BASE_URL: ${BASE_URL}`);

export const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const displayMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Error desconocido';
    return Promise.reject({ ...error, displayMessage });
  }
);

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const imgUrl = (imagenNombre) => {
  if (!imagenNombre) return '/default.png';
  const safe = encodeURIComponent(imagenNombre.replace(/^.*[\\/]/, ''));
  return `${BASE_URL}/productos/img/${safe}`;
};

export default API;