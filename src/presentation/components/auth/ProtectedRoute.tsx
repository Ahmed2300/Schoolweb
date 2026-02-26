import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { ROUTES } from '../../../shared/constants';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('student' | 'parent' | 'teacher' | 'admin' | 'influencer')[];
}

/**
 * ProtectedRoute component that guards routes requiring authentication.
 * Redirects to login if user is not authenticated.
 * Optionally restricts access based on user roles.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated } = useAuthStore();
    const location = useLocation();

    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated || !user) {
        return (
            <Navigate
                to={ROUTES.LOGIN}
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    // If roles are specified, check if user has an allowed role
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
            // Redirect based on user role
            if (user.role === 'student') {
                return <Navigate to={ROUTES.DASHBOARD} replace />;
            } else if (user.role === 'parent') {
                return <Navigate to={ROUTES.PARENT_DASHBOARD} replace />;
            } else if (user.role === 'teacher') {
                return <Navigate to={ROUTES.TEACHER_DASHBOARD} replace />;
            } else if (user.role === 'admin') {
                return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
            } else if (user.role === 'influencer') {
                return <Navigate to={ROUTES.INFLUENCER_DASHBOARD} replace />;
            }
            // Fallback to home
            return <Navigate to={ROUTES.HOME} replace />;
        }
    }

    return <>{children}</>;
}

export default ProtectedRoute;
