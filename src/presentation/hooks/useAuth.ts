import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { AuthRepository } from '../../data/repositories';
import {
    LoginUseCase,
    RegisterUseCase,
    LogoutUseCase,
    GetCurrentUserUseCase
} from '../../core/use-cases';
import type { LoginCredentials, RegisterData } from '../../core/repositories';
import { ROUTES } from '../../shared/constants';

export function useAuth() {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading, error, setUser, setLoading, setError, logout: clearAuth } = useAuthStore();

    const authRepository = useMemo(() => new AuthRepository(), []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        setLoading(true);
        setError(null);

        try {
            const loginUseCase = new LoginUseCase(authRepository);
            const response = await loginUseCase.execute(credentials);
            setUser(response.user);
            navigate(ROUTES.DASHBOARD);
            return response;
        } catch (err: any) {
            let message = 'Login failed';
            
            if (err?.response?.status === 409 || err?.response?.data?.error_code === 'ACTIVE_SESSION') {
                message = ''; // Handled by component modal
            } else if (err?.response?.data?.error_code === 'email_not_verified') {
                message = ''; // Handled by component redirection to verify email
            } else if (err?.response?.data?.message_ar) {
                message = err.response.data.message_ar;
            } else if (err?.response?.data?.message) {
                message = err.response.data.message;
            } else if (err instanceof Error) {
                message = err.message;
            }
            
            if (message) setError(message);
            throw err;
        }
    }, [authRepository, navigate, setUser, setLoading, setError]);

    const register = useCallback(async (data: RegisterData) => {
        setLoading(true);
        setError(null);

        try {
            const registerUseCase = new RegisterUseCase(authRepository);
            const response = await registerUseCase.execute(data);
            setUser(response.user);
            navigate(ROUTES.DASHBOARD);
            return response;
        } catch (err: any) {
            let message = 'Registration failed';
            const hasFieldErrors = !!err?.response?.data?.errors;

            if (err?.response?.data?.message_ar) {
                message = err.response.data.message_ar;
            } else if (err?.response?.data?.message) {
                message = err.response.data.message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            // Only set global error if there are no field-specific errors to show inline
            if (hasFieldErrors) {
                setError(null);
            } else {
                setError(message);
            }
            
            throw err;
        }
    }, [authRepository, navigate, setUser, setLoading, setError]);

    const logout = useCallback(async () => {
        setLoading(true);

        try {
            const logoutUseCase = new LogoutUseCase(authRepository);
            await logoutUseCase.execute();
        } finally {
            clearAuth();
            navigate(ROUTES.LOGIN);
        }
    }, [authRepository, clearAuth, navigate, setLoading]);

    const checkAuth = useCallback(async () => {
        setLoading(true);

        try {
            const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);
            const currentUser = await getCurrentUserUseCase.execute();
            setUser(currentUser);
            return currentUser;
        } catch {
            clearAuth();
            return null;
        }
    }, [authRepository, setUser, clearAuth, setLoading]);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        checkAuth,
    };
}
