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

export const businessService = {
    getBusiness: async (id) => {
        const response = await api.get(`/businesses/${id}`);
        return response.data;
    },
    getServices: async (businessId) => {
        const response = await api.get(`/businesses/${businessId}/services`);
        return response.data;
    },
    getStaff: async (businessId) => {
        const response = await api.get(`/businesses/${businessId}/staff`);
        return response.data;
    },
    getAvailableSlots: async (businessId, serviceId, date, staffId = null) => {
        const params = { serviceId, date };
        if (staffId) params.staffId = staffId;

        const response = await api.get(`/businesses/${businessId}/available-slots`, {
            params,
        });
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
};

export default api;
