import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7245/api';
if (!import.meta.env.VITE_API_URL) {
    // eslint-disable-next-line no-console
    console.warn('VITE_API_URL tanımlı değil. Varsayılan https://localhost:7245/api kullanılacak.');
}

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/admin/login') {
                window.location.replace('/admin/login');
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    registerAdmin: async (data) => {
        const response = await api.post('/auth/register-admin', data);
        return response.data;
    },
};

export const businessService = {
    getBusiness: async (id) => {
        const response = await api.get(`/businesses/${id}`);
        return response.data;
    },
    getServices: async (businessId) => {
        const response = await api.get(`/businesses/${businessId}/services`);
        return response.data;
    },
    getAvailableSlots: async (businessId, serviceId, date, staffId) => {
        const response = await api.get(`/businesses/${businessId}/available-slots`, {
            params: { serviceId, date, staffId },
        });
        return response.data;
    },
    getStaff: async (businessId) => {
        const response = await api.get(`/businesses/${businessId}/staff`);
        return response.data;
    },
};

export const adminServicesService = {
    create: async (data) => {
        const response = await api.post(`/admin/services`, data);
        return response.data;
    },
    update: async (serviceId, data) => {
        const response = await api.put(`/admin/services`, { ...data, id: serviceId });
        return response.data;
    },
    delete: async (serviceId) => {
        const response = await api.delete(`/admin/services/${serviceId}`);
        return response.data;
    },
};

export const reservationService = {
    create: async (data) => {
        const response = await api.post('/reservations', data);
        return response.data;
    },
    verify: async (data) => {
        const response = await api.post('/reservations/verify', data);
        return response.data;
    },
    // Admin endpoints
    getForDay: async (date) => {
        const response = await api.get('/admin/reservations', {
            params: { date },
        });
        return response.data;
    },
    updateStatus: async (data) => {
        const response = await api.patch('/admin/reservations/status', data);
        return response.data;
    },
};

export const adminStaffService = {
    getAll: async () => {
        const response = await api.get('/admin/staff');
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/admin/staff', data);
        return response.data;
    },
    updateStatus: async (data) => {
        const response = await api.patch('/admin/staff/status', data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/admin/staff/${id}`);
        return response.data;
    }
};

export const adminBusinessService = {
    get: async () => {
        const response = await api.get('/admin/business');
        return response.data;
    },
    update: async (data) => {
        const response = await api.patch('/admin/business', data);
        return response.data;
    }
};

export default api;
