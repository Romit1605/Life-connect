// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        ME: `${API_BASE_URL}/api/auth/me`,
    },

    // Camp endpoints
    CAMPS: {
        BASE: `${API_BASE_URL}/api/camps`,
        BY_ID: (id: string) => `${API_BASE_URL}/api/camps/${id}`,
    },

    // Donation endpoints
    DONATIONS: {
        BASE: `${API_BASE_URL}/api/donations`,
        ALL: `${API_BASE_URL}/api/donations/all`,
        STATS: `${API_BASE_URL}/api/donations/stats`,
        BY_ID: (id: string) => `${API_BASE_URL}/api/donations/${id}`,
    },

    // Request endpoints
    REQUESTS: {
        BASE: `${API_BASE_URL}/api/requests`,
        BY_ID: (id: string) => `${API_BASE_URL}/api/requests/${id}`,
    },

    // Notification endpoints
    NOTIFICATIONS: {
        BASE: `${API_BASE_URL}/api/notifications`,
        MARK_READ: (id: string) => `${API_BASE_URL}/api/notifications/${id}/read`,
        MARK_ALL_READ: `${API_BASE_URL}/api/notifications/read-all`,
    },

    // Alert endpoints
    ALERTS: {
        BASE: `${API_BASE_URL}/api/alerts`,
        BY_ID: (id: string) => `${API_BASE_URL}/api/alerts/${id}`,
        RESPOND: (id: string) => `${API_BASE_URL}/api/alerts/${id}/respond`,
        ACKNOWLEDGE: (id: string) => `${API_BASE_URL}/api/alerts/${id}/acknowledge`,
    },

    // Medicine endpoints
    MEDICINE: {
        BASE: `${API_BASE_URL}/api/medicine`,
        BY_ID: (id: string) => `${API_BASE_URL}/api/medicine/${id}`,
    },

    // Report endpoints
    REPORTS: {
        COMPREHENSIVE: `${API_BASE_URL}/api/reports/comprehensive`,
    },

    // Policy endpoints
    POLICIES: {
        BASE: `${API_BASE_URL}/api/policies`,
        BY_ROLE: (role: string) => `${API_BASE_URL}/api/policies/${role}`,
        BY_ID: (id: string) => `${API_BASE_URL}/api/policies/${id}`,
    },
};

export default API_BASE_URL;
