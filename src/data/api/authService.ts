import apiClient, { setTokens, clearTokens } from './ApiClient';
import { endpoints } from './endpoints';

// Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface StudentRegisterRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    country_id: number;
    city_id: number;
}

export interface ParentRegisterRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface VerifyEmailRequest {
    email: string;
    otp: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    password: string;
    password_confirmation: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    data?: {
        student?: UserData;
        parent?: UserData;
        token?: string;
    };
}

export interface UserData {
    id: number;
    name: string;
    email: string;
    country_id?: number;
    city_id?: number;
    email_verified_at?: string | null;
    created_at?: string;
}

// Auth Service
export const authService = {
    // Student Authentication
    studentLogin: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post(endpoints.studentAuth.login, data);
        if (response.data.data?.token) {
            setTokens(response.data.data.token, '');
        }
        return response.data;
    },

    studentRegister: async (data: StudentRegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post(endpoints.studentAuth.register, data);
        return response.data;
    },

    studentVerifyEmail: async (data: VerifyEmailRequest): Promise<AuthResponse> => {
        const response = await apiClient.post(endpoints.studentAuth.verifyEmail, data);
        if (response.data.data?.token) {
            setTokens(response.data.data.token, '');
        }
        return response.data;
    },

    studentResendOtp: async (email: string): Promise<AuthResponse> => {
        const response = await apiClient.post(endpoints.studentAuth.resendOtp, { email });
        return response.data;
    },

    studentForgotPassword: async (email: string): Promise<AuthResponse> => {
        const response = await apiClient.post(endpoints.studentAuth.forgotPassword, { email });
        return response.data;
    },

    studentResetPassword: async (data: ResetPasswordRequest): Promise<AuthResponse> => {
        const response = await apiClient.post(endpoints.studentAuth.resetPassword, data);
        return response.data;
    },

    // Parent Authentication
    parentLogin: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post(endpoints.parentAuth.login, data);
        // Transform backend response { token, parent } to expected format
        const backendData = response.data;
        if (backendData.token) {
            setTokens(backendData.token, '');
        }
        return {
            success: true,
            message: 'Login successful',
            data: {
                parent: backendData.parent,
                token: backendData.token,
            },
        };
    },

    parentRegister: async (data: ParentRegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post(endpoints.parentAuth.register, data);
        // Transform backend response { message, parent } to expected format
        const backendData = response.data;
        return {
            success: true,
            message: backendData.message,
            data: {
                parent: backendData.parent,
            },
        };
    },

    parentVerifyEmail: async (data: VerifyEmailRequest): Promise<AuthResponse> => {
        const response = await apiClient.post(endpoints.parentAuth.verifyEmail, data);
        // Transform backend response { message } to expected format
        const backendData = response.data;
        if (backendData.token) {
            setTokens(backendData.token, '');
        }
        return {
            success: true,
            message: backendData.message,
            data: {
                parent: backendData.parent,
                token: backendData.token,
            },
        };
    },

    parentResendOtp: async (email: string): Promise<AuthResponse> => {
        const response = await apiClient.post(endpoints.parentAuth.resendOtp, { email });
        // Transform backend response { message } to expected format
        return {
            success: true,
            message: response.data.message,
        };
    },

    parentForgotPassword: async (email: string): Promise<AuthResponse> => {
        const response = await apiClient.post(endpoints.parentAuth.forgotPassword, { email });
        // Transform backend response { message } to expected format
        return {
            success: true,
            message: response.data.message,
        };
    },

    parentResetPassword: async (data: ResetPasswordRequest): Promise<AuthResponse> => {
        const response = await apiClient.post(endpoints.parentAuth.resetPassword, data);
        // Transform backend response { message } to expected format
        return {
            success: true,
            message: response.data.message,
        };
    },

    // Common
    logout: async (userType: 'student' | 'parent'): Promise<void> => {
        const endpoint = userType === 'student'
            ? endpoints.studentAuth.logout
            : endpoints.parentAuth.logout;
        await apiClient.post(endpoint);
        clearTokens();
    },

    getMe: async (userType: 'student' | 'parent'): Promise<AuthResponse> => {
        const endpoint = userType === 'student'
            ? endpoints.studentAuth.me
            : endpoints.parentAuth.me;
        const response = await apiClient.get(endpoint);
        // Transform parent response which returns user directly (not wrapped in data)
        if (userType === 'parent') {
            return {
                success: true,
                data: {
                    parent: response.data,
                },
            };
        }
        return response.data;
    },
};

export default authService;
