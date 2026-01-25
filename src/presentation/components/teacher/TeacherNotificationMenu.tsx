
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash, X } from 'lucide-react';
import { useTeacherNotifications } from '../../../hooks/useTeacherNotifications';
import { useLanguage } from '../../hooks';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export const TeacherNotificationMenu = () => {
    const {
        unreadCount,
        notifications,
        markAllAsRead,
        markAsRead,
        loading
    } = useTeacherNotifications();
    const { isRTL } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Format time
    const formatTime = (date: string) => {
        try {
            return formatDistanceToNow(new Date(date), {
                addSuffix: true,
                locale: isRTL ? ar : enUS
            });
        } catch (e) {
            return date;
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 rounded-xl bg-[#F8F9FA] hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-[#636E72] hover:text-[#1F1F1F] transition-all"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-shibl-crimson text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={`absolute top-12 ${isRTL ? 'left-0' : 'right-0'} w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">الإشعارات</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="text-xs text-shibl-crimson hover:text-shibl-crimson-dark flex items-center gap-1 font-medium transition-colors"
                            >
                                <Check size={14} />
                                تحديد الكل كمقروء
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                جاري التحميل...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center gap-3">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                                    <Bell size={24} />
                                </div>
                                <p className="text-slate-500 font-medium">لا توجد إشعارات جديدة</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {Array.isArray(notifications) && notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!notification.read_at ? 'bg-amber-50/30' : ''}`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${!notification.read_at ? 'bg-shibl-crimson' : 'bg-transparent'}`} />
                                            <div className="flex-1">
                                                <p className={`text-sm ${!notification.read_at ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
                                                    {notification.data.message || 'إشعار جديد'}
                                                </p>
                                                {/* Specialized content based on type if needed */}
                                                {notification.data.approval && (
                                                    <div className="mt-1">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${notification.data.approval.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            notification.data.approval.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                                                            }`}>
                                                            {notification.data.approval.status === 'approved' ? 'مقبول' :
                                                                notification.data.approval.status === 'rejected' ? 'مرفوض' : notification.data.approval.status}
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                                                    {formatTime(notification.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
                        <button className="text-xs text-slate-500 hover:text-shibl-crimson transition-colors">
                            عرض كل الإشعارات
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
