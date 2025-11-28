import { API_ENDPOINTS } from '../config/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const { token } = JSON.parse(user);
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    }
    return {
        'Content-Type': 'application/json',
    };
};

// Generic API call function
async function apiCall<T>(
    url: string,
    options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.message || 'An error occurred' };
        }

        return { data };
    } catch (error: any) {
        return { error: error.message || 'Network error' };
    }
}

// Auth API
export const authAPI = {
    register: (userData: any) =>
        apiCall(API_ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    login: (credentials: any) =>
        apiCall(API_ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),

    getMe: () => apiCall(API_ENDPOINTS.AUTH.ME),
};

// Camp API
export const campAPI = {
    getAll: (filters?: { status?: string; startDate?: string; endDate?: string }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const url = filters ? `${API_ENDPOINTS.CAMPS.BASE}?${params}` : API_ENDPOINTS.CAMPS.BASE;
        return apiCall(url);
    },

    getById: (id: string) => apiCall(API_ENDPOINTS.CAMPS.BY_ID(id)),

    create: (campData: any) =>
        apiCall(API_ENDPOINTS.CAMPS.BASE, {
            method: 'POST',
            body: JSON.stringify(campData),
        }),

    update: (id: string, campData: any) =>
        apiCall(API_ENDPOINTS.CAMPS.BY_ID(id), {
            method: 'PUT',
            body: JSON.stringify(campData),
        }),

    delete: (id: string) =>
        apiCall(API_ENDPOINTS.CAMPS.BY_ID(id), {
            method: 'DELETE',
        }),
};

// Donation API
export const donationAPI = {
    getMy: () => apiCall(API_ENDPOINTS.DONATIONS.BASE),

    getAll: (filters?: { blood_type?: string; status?: string; startDate?: string; endDate?: string }) => {
        const params = new URLSearchParams();
        if (filters?.blood_type) params.append('blood_type', filters.blood_type);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const url = filters ? `${API_ENDPOINTS.DONATIONS.ALL}?${params}` : API_ENDPOINTS.DONATIONS.ALL;
        return apiCall(url);
    },

    getStats: () => apiCall(API_ENDPOINTS.DONATIONS.STATS),

    create: (donationData: any) =>
        apiCall(API_ENDPOINTS.DONATIONS.BASE, {
            method: 'POST',
            body: JSON.stringify(donationData),
        }),

    update: (id: string, donationData: any) =>
        apiCall(API_ENDPOINTS.DONATIONS.BY_ID(id), {
            method: 'PUT',
            body: JSON.stringify(donationData),
        }),

    delete: (id: string) =>
        apiCall(API_ENDPOINTS.DONATIONS.BY_ID(id), {
            method: 'DELETE',
        }),
};

// Request API
export const requestAPI = {
    getAll: (filters?: { type?: string; urgency?: string; status?: string; startDate?: string; endDate?: string }) => {
        const params = new URLSearchParams();
        if (filters?.type) params.append('type', filters.type);
        if (filters?.urgency) params.append('urgency', filters.urgency);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const url = filters ? `${API_ENDPOINTS.REQUESTS.BASE}?${params}` : API_ENDPOINTS.REQUESTS.BASE;
        return apiCall<import('../types').Request[]>(url);
    },

    getById: (id: string) => apiCall(API_ENDPOINTS.REQUESTS.BY_ID(id)),

    create: (requestData: any) =>
        apiCall(API_ENDPOINTS.REQUESTS.BASE, {
            method: 'POST',
            body: JSON.stringify(requestData),
        }),

    update: (id: string, requestData: any) =>
        apiCall(API_ENDPOINTS.REQUESTS.BY_ID(id), {
            method: 'PUT',
            body: JSON.stringify(requestData),
        }),

    delete: (id: string) =>
        apiCall(API_ENDPOINTS.REQUESTS.BY_ID(id), {
            method: 'DELETE',
        }),
};

// Notification API
export const notificationAPI = {
    getAll: () => apiCall<import('../types').Notification[]>(API_ENDPOINTS.NOTIFICATIONS.BASE),

    markAsRead: (id: string) =>
        apiCall(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {
            method: 'PUT',
        }),

    markAllAsRead: () =>
        apiCall(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {
            method: 'PUT',
        }),
};

// Alert API
export const alertAPI = {
    getAll: (filters?: { status?: string; urgency?: string }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.urgency) params.append('urgency', filters.urgency);

        const url = filters ? `${API_ENDPOINTS.ALERTS.BASE}?${params}` : API_ENDPOINTS.ALERTS.BASE;
        return apiCall<import('../types').Alert[]>(url);
    },

    getById: (id: string) => apiCall<import('../types').Alert>(API_ENDPOINTS.ALERTS.BY_ID(id)),

    create: (alertData: any) =>
        apiCall(API_ENDPOINTS.ALERTS.BASE, {
            method: 'POST',
            body: JSON.stringify(alertData),
        }),

    respond: (id: string, action: 'approved' | 'rejected', message?: string) =>
        apiCall(API_ENDPOINTS.ALERTS.RESPOND(id), {
            method: 'PUT',
            body: JSON.stringify({ action, message }),
        }),

    acknowledge: (id: string) =>
        apiCall(API_ENDPOINTS.ALERTS.ACKNOWLEDGE(id), {
            method: 'PUT',
        }),
};

export const medicineAPI = {
    add: (data: any) => apiCall(API_ENDPOINTS.MEDICINE.BASE, { method: "POST", body: JSON.stringify(data) }),
    getAll: () => apiCall(API_ENDPOINTS.MEDICINE.BASE),
    update: (id: string, data: any) => apiCall(API_ENDPOINTS.MEDICINE.BY_ID(id), { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => apiCall(API_ENDPOINTS.MEDICINE.BY_ID(id), { method: "DELETE" }),
};
