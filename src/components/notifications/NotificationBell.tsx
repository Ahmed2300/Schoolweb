import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { AdminNotification } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * Notification Bell Component
 * Displays a bell icon with unread badge and dropdown list of notifications
 */
export function NotificationBell() {
    const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification: AdminNotification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        const data = notification.data || {};

        // Navigate based on notification type
        switch (notification.type) {
            case 'new_subscription':
            case 'subscription_approved':
            case 'subscription_rejected':
                if (data.subscription_id) {
                    window.location.href = `/admin/subscriptions?highlight=${data.subscription_id}`;
                }
                break;

            case 'content_approval_requested':
                if (data.approval_id) {
                    window.location.href = `/admin/content-approvals?requestId=${data.approval_id}`;
                }
                break;

            case 'new_payment':
                // Assuming data contains payment_id or id
                const paymentId = data.payment_id || data.id;
                if (paymentId) {
                    window.location.href = `/admin/payments?highlight=${paymentId}`;
                }
                break;

            case 'new_package_subscription':
                const pkgSubId = data.package_subscription_id || data.id;
                if (pkgSubId) {
                    window.location.href = `/admin/package-subscriptions?highlight=${pkgSubId}`;
                }
                break;

            default:
                // Fallback for older notifications or unknown types
                if (data.subscription_id) {
                    window.location.href = `/admin/subscriptions?highlight=${data.subscription_id}`;
                }
                break;
        }

        setIsOpen(false);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'new_subscription':
                return '🔔';
            case 'subscription_approved':
                return '✅';
            case 'subscription_rejected':
                return '❌';
            case 'new_payment':
                return '💰';
            default:
                return '📢';
        }
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                className="relative w-11 h-11 rounded-[12px] bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                title={`${unreadCount} إشعارات غير مقروءة`}
            >
                <Bell size={20} className="text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-[360px] max-h-[480px] bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-slate-100">
                    <div className="flex justify-between items-center p-4 border-b border-slate-100">
                        <h3 className="text-base font-semibold text-slate-800">الإشعارات</h3>
                        {unreadCount > 0 && (
                            <button
                                className="flex items-center gap-1 text-indigo-600 text-sm hover:underline"
                                onClick={markAllAsRead}
                                title="تحديد الكل كمقروء"
                            >
                                <CheckCheck size={16} />
                                تحديد الكل كمقروء
                            </button>
                        )}
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                        {isLoading ? (
                            <div className="py-10 text-center text-slate-400">جاري التحميل...</div>
                        ) : notifications.length === 0 ? (
                            <div className="py-10 text-center text-slate-400">لا توجد إشعارات</div>
                        ) : (
                            notifications.slice(0, 10).map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-slate-50 border-b border-slate-50 ${!notification.is_read ? 'bg-amber-50' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm text-slate-800">{notification.title}</div>
                                        <div className="text-sm text-slate-500 truncate">{notification.message}</div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {formatDistanceToNow(new Date(notification.created_at), {
                                                addSuffix: true,
                                                locale: ar,
                                            })}
                                        </div>
                                    </div>
                                    {!notification.is_read && (
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 10 && (
                        <div className="p-3 border-t border-slate-100 text-center">
                            <a href="/admin/notifications" className="inline-flex items-center gap-1 text-indigo-600 text-sm hover:underline">
                                عرض الكل <ExternalLink size={14} />
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
