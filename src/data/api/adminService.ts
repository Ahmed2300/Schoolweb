import apiClient, { setTokens, clearTokens } from './ApiClient';
import { endpoints } from './endpoints';

// Types
export interface AdminLoginRequest {
    email: string;
    password: string;
}

export interface AdminData {
    id: number;
    name: string;
    email: string;
    created_at?: string;
    updated_at?: string;
}

export interface AdminAuthResponse {
    token: string;
    data: AdminData;
}

// Admin Auth Service
export const adminService = {
    /**
     * Admin Login
     * Authenticates admin and stores token
     */
    login: async (data: AdminLoginRequest): Promise<AdminAuthResponse> => {
        const response = await apiClient.post(endpoints.adminAuth.login, data);

        // Store token on successful login
        if (response.data.token) {
            setTokens(response.data.token, '');
        }

        return response.data;
    },

    /**
     * Admin Logout
     * Clears stored tokens
     */
    logout: () => {
        clearTokens();
    },
};

export default adminService;
