import { useEffect } from 'react';
import { useAuthStore } from '../presentation/store/authStore';
import {
    getEcho,
    getStudentEcho,
    getParentEcho,
    getTeacherEcho,
    initializeEcho,
    initializeStudentEcho,
    initializeParentEcho,
    initializeTeacherEcho,
} from '../services/websocket';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

/**
 * Hook that listens for ForceLogout WebSocket events to terminate
 * the current session when the user logs in from another device.
 *
 * Self-initializes the Echo instance if it hasn't been created yet,
 * resolving the race condition where this hook runs before the
 * notification bell component initializes WebSocket.
 */
export function useSessionEnforcement() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        // Defer WebSocket initialization by 3 seconds to avoid competing
        // with critical chunk downloads during dashboard load.
        // Notifications/force-logout are not critical-path.
        const deferTimer = setTimeout(() => {
            // Retrieve the stored auth token – needed to initialize Echo
            const token = localStorage.getItem('auth_token');
            if (!token) {
                console.warn('SessionEnforcement: No auth token in localStorage');
                return;
            }

            let echo;
            let channelName: string;

            // Determine which Echo instance and channel to use based on user role.
            // If the getter returns null, we initialize it ourselves.
            switch (user.role) {
                case 'student':
                    echo = getStudentEcho() ?? initializeStudentEcho(token);
                    channelName = `student.${user.id}`;
                    break;
                case 'parent':
                    echo = getParentEcho() ?? initializeParentEcho(token);
                    channelName = `parent.${user.id}`;
                    break;
                case 'teacher':
                    echo = getTeacherEcho() ?? initializeTeacherEcho(token);
                    channelName = `teacher.${user.id}`;
                    break;
                case 'admin':
                    echo = getEcho() ?? initializeEcho(token);
                    channelName = `admin.${user.id}`;
                    break;
                default:
                    return;
            }

            if (!echo) {
                console.warn('SessionEnforcement: Failed to create Echo instance for role', user.role);
                return;
            }

            const channel = echo.private(channelName);

            // Handler that runs when the server pushes a force-logout event
            const handleForceLogout = (_event: unknown) => {
                toast.error('تم تسجيل الدخول من جهاز آخر. تم إنهاء الجلسة الحالية.', {
                    duration: 6000,
                    icon: '🔒',
                });

                // Clear local state and redirect
                logout();
                navigate('/login');
            };

            // Laravel Echo prepends a dot to custom broadcastAs names
            channel.listen('.force.logout', handleForceLogout);

            // Store cleanup ref for unmount
            cleanupRef = () => {
                channel.stopListening('.force.logout');
            };
        }, 3000);

        let cleanupRef: (() => void) | undefined;

        return () => {
            clearTimeout(deferTimer);
            cleanupRef?.();
        };
    }, [user, logout, navigate]);
}
