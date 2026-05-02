import axios from 'axios';

// Base API instance — proxy in vite.config.js forwards /api to backend
const api = axios.create({ baseURL: '/api' });

export default api;
