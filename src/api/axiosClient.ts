import axios from 'axios';

// On GitHub Pages there is no dev server proxy, so make sure VITE_API_BASE_URL
// is provided at build time. We still fall back to '/api' for local dev.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_BASE_URL is missing; requests will go to the current host (likely broken).');
}

const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default axiosClient;
