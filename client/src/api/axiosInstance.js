import axios from 'axios';

const getApiBaseUrl = () => {
  // Vite exposes env vars prefixed with VITE_ via import.meta.env
  // Use VITE_API_URL for production; fallback to localhost for development
  if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'http://localhost:5000';
};

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;