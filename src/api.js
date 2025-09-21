import axios from 'axios';

const axiosInstance = axios.create({ baseURL: process.env.REACT_APP_API_URL, timeout: 30000 });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Server is currently unreachable or down.')
);

export default axiosInstance;