export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'donor' | 'hospital' | 'pharmacy' | 'admin';
    organization_name?: string;
    full_name?: string;
    // Add other user fields as needed
}

export interface Request {
    _id: string;
    requester: string | User; // Can be ID or populated User object
    type: 'blood' | 'medicine';
    item_name: string;
    quantity: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'fulfilled' | 'cancelled';
    location?: string;
    notes?: string;
    approvedBy?: User | string;
    createdAt: string;
    updatedAt: string;
}

export interface Notification {
    _id: string;
    recipient: string;
    sender?: User;
    type: 'new_request' | 'request_update' | 'request_fulfilled' | 'request_rejected' |
    'new_alert' | 'alert_approved' | 'alert_rejected' |
    'donation_received' | 'camp_registered' | 'system';
    message: string;
    relatedId?: string;
    relatedModel?: 'Request' | 'Alert' | 'Donation' | 'Camp';
    actionUrl?: string;
    metadata?: any;
    read: boolean;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    createdAt: string;
    updatedAt: string;
}

export interface AlertResponse {
    respondent: string | User;
    action: 'approved' | 'rejected';
    message?: string;
    respondedAt: string;
}

export interface Alert {
    _id: string;
    bloodBank: string | User;
    bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    medicineName?: string;
    batchNumber?: string;
    quantity: number;
    expiryDate: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    location?: string;
    status: 'pending' | 'approved' | 'rejected' | 'acknowledged';
    responses: AlertResponse[];
    acknowledgedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
}
