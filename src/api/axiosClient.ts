import axios from 'axios';

// Requests go to /api which is proxied server-side (vite preview proxy in prod, vite dev proxy locally).
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default axiosClient;
