import apiClient from './ApiClient';
import { endpoints } from './endpoints';
import { setTokens, clearTokens } from './ApiClient';

export interface InfluencerLoginRequest {
    email: string;
    password: string;
}

export interface InfluencerData {
    id: number;
    name: string;
    email: string;
    balance?: number;
    total_withdrawn?: number;
    is_active: boolean;
    fixed_commission_amount: number;
    affiliate_code?: {
        code: string;
        discount_percentage: number;
    };
    created_at?: string;
    updated_at?: string;
}

export interface InfluencerAuthResponse {
    token: string;
    data: InfluencerData;
}

export interface InfluencerUsageData {
    id: number;
    discount_amount: number;
    commission_earned: number;
    usable_type: string;
    student: {
        id: number;
        name: string;
        email: string;
    };
    code: {
        id: number;
        code: string;
        discount_percentage: number;
    };
    usable: {
        id: number;
        package_name?: string;
        course_name?: string;
        status: string;
        price: number;
    };
    created_at: string;
}

export interface InfluencerDashboardData {
    current_balance: number;
    total_withdrawn: number;
    pending_withdrawals: number;
    total_usages: number;
    top_codes: {
        code: string;
        usage_count: number;
        total_commission: number;
    }[];
    withdrawal_requests: {
        data: unknown[];
        meta: unknown;
    };
    codes: {
        id: number;
        code: string;
        discount_percentage: number;
        is_active: boolean;
    }[];
}

export const influencerService = {
    login: async (data: InfluencerLoginRequest): Promise<InfluencerAuthResponse> => {
        const response = await apiClient.post('/api/v1/affiliate/login', data);
        const { access_token, influencer } = response.data;

        if (access_token) {
            setTokens(access_token, '');
        }

        return {
            token: access_token,
            data: influencer
        };
    },

    logout: async () => {
        try {
            await apiClient.post('/api/v1/affiliate/logout');
        } finally {
            clearTokens();
        }
    },

    getDashboard: async (): Promise<InfluencerDashboardData> => {
        const response = await apiClient.get('/api/v1/affiliate/dashboard');
        return response.data;
    },

    getUsages: async (page: number = 1): Promise<{ data: InfluencerUsageData[], meta: unknown }> => {
        const response = await apiClient.get(`/api/v1/affiliate/usages?page=${page}`);
        return response.data;
    },

    createWithdrawal: async (amount: number, payment_method: string, payment_details: string): Promise<unknown> => {
        const response = await apiClient.post('/api/v1/affiliate/withdrawals', {
            amount,
            payment_method,
            payment_details
        });
        return response.data;
    },

    getWithdrawals: async (page: number = 1): Promise<unknown> => {
        const response = await apiClient.get(`/api/v1/affiliate/withdrawals?page=${page}`);
        return response.data;
    },

    getProfile: async (): Promise<{ data: InfluencerData }> => {
        const response = await apiClient.get('/api/v1/affiliate/profile');
        return response.data; // Note: response.data is { data: {...} } from InfluencerResource
    },

    updateProfile: async (data: { name?: string; mobile?: string; password?: string }): Promise<{ message: string, data: InfluencerData }> => {
        const response = await apiClient.put('/api/v1/affiliate/profile', data);
        return { message: response.data.message, data: response.data.data.data ? response.data.data.data : response.data.data };
    }
};
