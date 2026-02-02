
import React, { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../../../hooks';
import { adminContentApprovalService } from '../../../../data/api/adminContentApprovalService';
import { ContentApprovalListResponse, ContentApprovalRequest } from '../../../../data/api/teacherContentApprovalService';
import { ContentApprovalDetailsModal } from '../../../components/admin/approvals/ContentApprovalDetailsModal';
import {
    Clock,
    Filter,
    ChevronLeft,
    ChevronRight,
    Eye,
    BookOpen,
    Video
} from 'lucide-react';

// Status filter labels
const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    approved: 'موافق عليها',
    rejected: 'مرفوضة',
};

import { subscribeToAllAdminsChannel, unsubscribeFromAllAdminsChannel } from '../../../../services/websocket';

import { useSearchParams } from 'react-router-dom';

export const AdminContentApprovalsPage = () => {
    const { isRTL } = useLanguage();
    const [searchParams] = useSearchParams();
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ContentApprovalListResponse | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<ContentApprovalRequest | null>(null);
    const [page, setPage] = useState(1);

    // Deep linking handling
    useEffect(() => {
        const requestId = searchParams.get('requestId');
        if (requestId) {
            const fetchSpecificRequest = async () => {
                try {
                    const response = await adminContentApprovalService.getRequest(Number(requestId));
                    if (response && response.data) {
                        setSelectedRequest(response.data);
                    }
                } catch (err) {
                    console.error('Failed to load specific request:', err);
                }
            };
            fetchSpecificRequest();
        }
    }, [searchParams]);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminContentApprovalService.getRequests({
                status: statusFilter,
                page: page,
                per_page: 15
            });
            setData(response);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, page]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // Real-time updates
    useEffect(() => {
        const handleNotification = (event: any) => {
            console.log('Real-time request received:', event);
            // Refresh list to show new request
            fetchRequests();
        };

        subscribeToAllAdminsChannel(handleNotification);

        return () => {
            unsubscribeFromAllAdminsChannel();
        };
    }, [fetchRequests]);

    const handleStatusChange = (status: 'pending' | 'approved' | 'rejected') => {
        setStatusFilter(status);
        setPage(1);
    };

    // Extract friendly type label from full model path
    const getTypeLabel = (fullPath: string): string => {
        const parts = fullPath.replace(/\\\\/g, '\\').split('\\');
        const modelName = parts[parts.length - 1] || fullPath;

        const typeMap: Record<string, string> = {
            'Course': 'دورة',
            'Lecture': 'محاضرة',
            'Unit': 'وحدة',
        };
        return typeMap[modelName] || modelName;
    };

    // Get just the model type for icon matching
    const getModelType = (fullPath: string): string => {
        const parts = fullPath.replace(/\\\\/g, '\\').split('\\');
        return (parts[parts.length - 1] || fullPath).toLowerCase();
    };

    // Extract approvable name from the object
    const getApprovableName = (req: ContentApprovalRequest): string => {
        const approvable = req.approvable;
        if (!approvable) return `#${req.approvable_id}`;

        if (approvable.name) {
            if (typeof approvable.name === 'string') return approvable.name;
            return approvable.name.ar || approvable.name.en || `#${req.approvable_id}`;
        }
        if (approvable.title) return approvable.title;
        return `#${req.approvable_id}`;
    };

    const getTypeIcon = (type: string) => {
        const modelType = getModelType(type);
        switch (modelType) {
            case 'course': return <BookOpen size={16} className="text-blue-500" />;
            case 'lecture': return <Video size={16} className="text-purple-500" />;
            case 'unit': return <BookOpen size={16} className="text-emerald-500" />;
            default: return <Clock size={16} className="text-slate-400" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">طلبات التعديل</h1>
                    <p className="text-slate-500">إدارة طلبات تعديل المحتوى من المعلمين</p>
                </div>

                {/* Filters */}
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {(['pending', 'approved', 'rejected'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                ? 'bg-slate-900 text-white shadow'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {statusLabels[status]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">جاري تحميل الطلبات...</div>
                ) : data?.data && data.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-4 font-medium text-slate-500">الرقم</th>
                                    <th className="p-4 font-medium text-slate-500">المحتوى</th>
                                    <th className="p-4 font-medium text-slate-500">مقدم الطلب</th>
                                    <th className="p-4 font-medium text-slate-500">التغييرات</th>
                                    <th className="p-4 font-medium text-slate-500">التاريخ</th>
                                    <th className="p-4 font-medium text-slate-500 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.data.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-slate-400">#{req.id}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(req.approvable_type)}
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900">{getApprovableName(req)}</span>
                                                    <span className="text-xs text-slate-400">{getTypeLabel(req.approvable_type)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                                    {req.requester?.name?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-slate-700">{req.requester?.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                                                {Object.keys(req.payload).length} تعديل
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500">
                                            {new Date(req.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => setSelectedRequest(req)}
                                                className="p-2 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm rounded-lg text-slate-500 hover:text-blue-600 transition h-auto w-auto inline-flex"
                                                title="عرض التفاصيل"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Filter size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">لا توجد طلبات</h3>
                        <p className="text-slate-500 mt-1">
                            {statusFilter === 'pending'
                                ? 'أحسنت! تم معالجة جميع الطلبات المعلقة.'
                                : `لا توجد طلبات ${statusLabels[statusFilter]}.`}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {data && data.meta.last_page > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.min(data.meta.last_page, p + 1))}
                            disabled={page === data.meta.last_page}
                            className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50"
                        >
                            <ChevronRight size={20} />
                        </button>
                        <span className="text-sm text-slate-600">
                            صفحة {page} من {data.meta.last_page}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedRequest && (
                <ContentApprovalDetailsModal
                    isOpen={!!selectedRequest}
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onSuccess={() => {
                        fetchRequests();
                    }}
                />
            )}
        </div>
    );
};
