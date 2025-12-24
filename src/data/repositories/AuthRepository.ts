import { apiClient, endpoints, setTokens, clearTokens } from '../api';
import type {
    IAuthRepository,
    LoginCredentials,
    RegisterData,
    AuthResponse
} from '../../core/repositories';
import type { User } from '../../core/entities';

export class AuthRepository implements IAuthRepository {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await apiClient.post(endpoints.auth.login, credentials);
        const { user, token, refresh_token } = response.data;
        setTokens(token, refresh_token);
        return { user, token, refreshToken: refresh_token };
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await apiClient.post(endpoints.auth.register, data);
        const { user, token, refresh_token } = response.data;
        setTokens(token, refresh_token);
        return { user, token, refreshToken: refresh_token };
    }

    async logout(): Promise<void> {
        try {
            await apiClient.post(endpoints.auth.logout);
        } finally {
            clearTokens();
        }
    }

    async refreshToken(token: string): Promise<AuthResponse> {
        const response = await apiClient.post(endpoints.auth.refresh, { refresh_token: token });
        const { user, token: newToken, refresh_token } = response.data;
        setTokens(newToken, refresh_token);
        return { user, token: newToken, refreshToken: refresh_token };
    }

    async sendOtp(email: string): Promise<void> {
        await apiClient.post(endpoints.auth.sendOtp, { email });
    }

    async verifyOtp(email: string, otp: string): Promise<boolean> {
        const response = await apiClient.post(endpoints.auth.verifyOtp, { email, otp });
        return response.data.valid;
    }

    async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
        await apiClient.post(endpoints.auth.resetPassword, {
            email,
            otp,
            password: newPassword,
            password_confirmation: newPassword
        });
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await apiClient.get(endpoints.auth.me);
            return response.data.user;
        } catch {
            return null;
        }
    }

    async updateProfile(data: Partial<User>): Promise<User> {
        const response = await apiClient.put(endpoints.auth.updateProfile, data);
        return response.data.user;
    }
}
