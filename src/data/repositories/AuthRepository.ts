import apiClient from '../api/ApiClient';
import { setTokens, clearTokens } from '../api/ApiClient';
import { endpoints } from '../api/endpoints';
import type {
    IAuthRepository,
    LoginCredentials,
    RegisterData,
    AuthResponse
} from '../../core/repositories';
import type { User } from '../../core/entities';

export class AuthRepository implements IAuthRepository {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        // Default to student auth for now, or determining based on context
        const response = await apiClient.post(endpoints.studentAuth.login, credentials);
        const { user, token, refresh_token } = response.data;
        setTokens(token, refresh_token);
        return { user, token, refreshToken: refresh_token };
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await apiClient.post(endpoints.studentAuth.register, data);
        const { user, token, refresh_token } = response.data;
        setTokens(token, refresh_token);
        return { user, token, refreshToken: refresh_token };
    }

    async logout(): Promise<void> {
        try {
            await apiClient.post(endpoints.studentAuth.logout);
        } finally {
            clearTokens();
        }
    }

    async refreshToken(token: string): Promise<AuthResponse> {
        const response = await apiClient.post(endpoints.studentAuth.refresh, { refresh_token: token });
        const { user, token: newToken, refresh_token } = response.data;
        setTokens(newToken, refresh_token);
        return { user, token: newToken, refreshToken: refresh_token };
    }

    async sendOtp(email: string): Promise<void> {
        // Attempting student resend-otp as 'sendOtp' is likely resend in this flow or generic
        await apiClient.post(endpoints.studentAuth.resendOtp, { email });
    }

    async verifyOtp(email: string, otp: string): Promise<boolean> {
        const response = await apiClient.post(endpoints.studentAuth.verifyEmail, { email, otp });
        // Assuming verify email endpoint returns { valid: boolean } or similar structure
        return response.data.success || response.data.valid;
    }

    async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
        await apiClient.post(endpoints.studentAuth.resetPassword, {
            email,
            otp,
            password: newPassword,
            password_confirmation: newPassword
        });
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await apiClient.get(endpoints.studentAuth.me);
            return response.data.user;
        } catch {
            return null;
        }
    }

    async updateProfile(data: Partial<User> | FormData): Promise<User> {
        // Handle FormData with POST method spoofing for Laravel
        if (data instanceof FormData) {
            // Ensure _method is set to PUT
            if (!data.has('_method')) {
                data.append('_method', 'PUT');
            }

            // Use POST endpoint but it's the same URL as PUT usually
            const response = await apiClient.post(endpoints.studentAuth.me, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data.data || response.data.user || response.data;
        }

        // Standard JSON PUT update
        const response = await apiClient.put(endpoints.studentAuth.me, data);
        return response.data.data || response.data.user || response.data;
    }
}
