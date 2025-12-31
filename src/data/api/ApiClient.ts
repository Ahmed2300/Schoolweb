import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API configuration - Dynamically detect the backend URL based on current hostname
// This allows the app to work across different networks without manual IP changes
const getApiBaseUrl = (): string => {
    // First check for explicit environment variable
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Get the current hostname (works for both localhost and network IPs)
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Use the same hostname as the frontend but with backend port (8000)
    return `${protocol}//${hostname}:8000`;
};

const API_BASE_URL = getApiBaseUrl();

// Token storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add language header for i18n
        const language = localStorage.getItem('language') || 'ar';
        if (config.headers) {
            config.headers['Accept-Language'] = language;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // List of public auth endpoints that should NOT trigger auto-redirect on 401
        // These endpoints handle their own 401 errors (e.g., invalid OTP, wrong password)
        const publicAuthEndpoints = [
            '/auth/students/verify-email',
            '/auth/students/login',
            '/auth/students/register',
            '/auth/students/resend-otp',
            '/auth/students/forgot-password',
            '/auth/students/reset-password',
            '/auth/parents/verify-email',
            '/auth/parents/login',
            '/auth/parents/register',
            '/auth/parents/resend-otp',
            '/auth/parents/forgot-password',
            '/auth/parents/reset-password',
        ];

        const isPublicAuthEndpoint = publicAuthEndpoints.some(
            endpoint => originalRequest.url?.includes(endpoint)
        );

        // Handle 401 - try to refresh token (but NOT for public auth endpoints)
        if (error.response?.status === 401 && !originalRequest._retry && !isPublicAuthEndpoint) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    });

                    const { token, refresh_token } = response.data;
                    localStorage.setItem(TOKEN_KEY, token);
                    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - clear tokens and redirect to login
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        const message = (error.response?.data as { message?: string })?.message || error.message;
        return Promise.reject(new Error(message));
    }
);

// Token management utilities
export const setTokens = (token: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export default apiClient;
