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
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
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
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            setError(message);
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
