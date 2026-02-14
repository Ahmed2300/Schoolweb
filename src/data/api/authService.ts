import apiClient, { setTokens, clearTokens, API_BASE_URL } from './ApiClient';
import { endpoints } from './endpoints';
import { oneSignalService } from './onesignal';

// Helper to fix avatar URLs
const transformUser = (user: UserData): UserData => {
    if (user.avatar && !user.avatar.startsWith('http')) {
        // Ensure clean concatenation
        const baseUrl = API_BASE_URL.replace(/\/$/, '');
        const avatarPath = user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`;
        return { ...user, avatar: `${baseUrl}${avatarPath}` };
    }
    return user;
};

// Types
export interface LoginRequest {
    email: string;
    password: string;
    force_login?: boolean;
    otp?: string;
}

export interface StudentRegisterRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    country_id: number;
    city_id: number;
    parent_phone?: string;
    how_do_you_know_us?: string;
    parent_name?: string;
    parent_email?: string;
}

export interface ParentRegisterRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    address?: string;
    relationship?: 'father' | 'mother' | 'guardian' | 'other';
    image_path?: File;
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

export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
    new_password_confirmation: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    data?: {
        student?: UserData;
        parent?: UserData;
        token?: string;
        otp_sent?: boolean;
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
    avatar?: string | null;
    address?: string | null;
    phone?: string | null;
}

// Auth Service
export const authService = {
    // Student Authentication
    studentLogin: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post(endpoints.studentAuth.login, data);
        if (response.data.data?.token) {
            setTokens(response.data.data.token, '');
            oneSignalService.registerDevice();
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

    studentChangePassword: async (data: ChangePasswordRequest): Promise<AuthResponse> => {
        const response = await apiClient.post(endpoints.studentAuth.changePassword, data);
        return response.data;
    },

    studentGenerateUid: async (): Promise<{ success: boolean; message: string; data?: { uid: string } }> => {
        const response = await apiClient.post(endpoints.studentAuth.generateUid);
        return response.data;
    },

    // Parent Authentication
    parentLogin: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post(endpoints.parentAuth.login, data);
        // Transform backend response { token, parent } to expected format
        const backendData = response.data;
        if (backendData.token) {
            setTokens(backendData.token, '');
            oneSignalService.registerDevice();
        }
        return {
            success: true,
            message: 'Login successful',
            data: {
                parent: transformUser(backendData.parent),
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
                parent: transformUser(backendData.parent),
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

    parentUpdateProfile: async (data: { name?: string; phone?: string; address?: string; avatar?: File | null }): Promise<AuthResponse> => {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.address) formData.append('address', data.address);
        // Phone is read-only, but if passed we could ignore it or not append it.
        // Backend ignores it anyway.
        if (data.avatar) {
            formData.append('avatar', data.avatar);
        }

        // Must set Content-Type: multipart/form-data, but axios usually handles it with FormData
        const response = await apiClient.post(endpoints.parentAuth.updateProfile, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        return {
            success: true,
            message: response.data.message,
            data: {
                parent: transformUser(response.data.data.parent),
            },
        };
    },

    parentChangePassword: async (data: ChangePasswordRequest): Promise<AuthResponse> => {
        // Backend expects: old_password, password, password_confirmation
        const backendData = {
            old_password: data.old_password,
            password: data.new_password,
            password_confirmation: data.new_password_confirmation,
        };
        const response = await apiClient.post(endpoints.parentAuth.changePassword, backendData);
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

        await oneSignalService.unregisterDevice();
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
                    parent: transformUser(response.data),
                },
            };
        }
        return response.data;
    },
};

export default authService;
