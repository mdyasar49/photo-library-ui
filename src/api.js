import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export default api;
export const BASE_URL = 'http://localhost:5000';
