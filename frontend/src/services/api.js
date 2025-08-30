import axios from 'axios';

const API = axios.create({
  baseURL: 'https://college-grievance-portal3-0-frontend1.onrender.com/api',
  timeout: 10000,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Request to ${config.url}: Token attached`);
    } else {
      console.warn(`Request to ${config.url}: No token available`);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}: Success`);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      console.error(`Response error from ${error.config?.url}:`, {
        status: error.response.status,
        data: error.response.data
      });
      
      if (error.response.status === 401) {
        console.warn('Unauthorized access detected - logging out');
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Use window.location.href for immediate redirect
        window.location.href = '/';
      }
    } else if (error.request) {
      console.error('Request was made but no response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default API;
