/**
 * Maintenance Wrapper Component
 * @module presentation/components/MaintenanceWrapper
 * 
 * Wraps the app and checks Firebase Remote Config on mount.
 * Shows MaintenancePage if isLive is false, otherwise renders children.
 * 
 * Features:
 * - Fetches Remote Config on app load
 * - Shows loading skeleton during fetch
 * - Safe fallback to normal mode on error
 */

import React, { useState, useEffect, type ReactNode } from 'react';
import { fetchMaintenanceStatus } from '../../services/maintenanceService';
import { MaintenancePage } from '../pages/MaintenancePage';

interface MaintenanceWrapperProps {
    children: ReactNode;
}

/**
 * Loading skeleton shown while fetching maintenance status
 */
function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                {/* Animated Logo Placeholder */}
                <div className="relative">
                    <div
                        className="w-16 h-16 rounded-2xl animate-pulse"
                        style={{
                            background: 'linear-gradient(135deg, #AF0C15 0%, #8B0A11 100%)',
                        }}
                    />
                    <div
                        className="absolute inset-0 w-16 h-16 rounded-2xl opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, #AF0C15 0%, transparent 100%)',
                            animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                        }}
                    />
                </div>

                {/* Loading Text */}
                <p className="text-slate-500 text-sm animate-pulse">
                    جاري التحميل...
                </p>
            </div>
        </div>
    );
}

export function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
    const [isLive, setIsLive] = useState(true); // Default to live for fast initial render

    useEffect(() => {
        let isMounted = true;

        async function checkMaintenanceStatus() {
            try {
                const status = await fetchMaintenanceStatus();

                if (isMounted) {
                    setIsLive(status.isLive);

                    if (status.error) {
                        console.warn('Maintenance check had error, defaulting to live mode:', status.error);
                    }
                }
            } catch (error) {
                console.error('Unexpected error in maintenance check:', error);
                // Keep default isLive = true
            }
        }

        checkMaintenanceStatus();

        return () => {
            isMounted = false;
        };
    }, []);

    // Show maintenance page if not live
    if (!isLive) {
        return <MaintenancePage />;
    }

    // Normal operation - render the app immediately while fetching in background
    return <>{children}</>;
}

export default MaintenanceWrapper;
