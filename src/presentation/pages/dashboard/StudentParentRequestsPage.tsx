import { useState, useEffect } from 'react';
import {
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    UserCheck,
    UserX,
    Mail,
    Phone,
    RefreshCw
} from 'lucide-react';
import { studentService, type ParentLinkRequest } from '../../../data/api';
import { useAuthStore } from '../../store/authStore';

// ============================================================
// Parent Request Card Component
// ============================================================

interface ParentRequestCardProps {
    request: ParentLinkRequest;
    onAccept: (id: number) => void;
    onReject: (id: number) => void;
    isProcessing: boolean;
}

function ParentRequestCard({ request, onAccept, onReject, isProcessing }: ParentRequestCardProps) {
    const statusStyles = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        accepted: 'bg-green-50 text-green-700 border-green-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
        cancelled: 'bg-slate-50 text-slate-500 border-slate-200',
    };

    const statusLabels = {
        pending: 'قيد الانتظار',
        accepted: 'مقبول',
        rejected: 'مرفوض',
        cancelled: 'ملغي',
    };

    const isPending = request.status === 'pending';

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                        {request.parent?.image_path ? (
                            <img
                                src={request.parent.image_path}
                                alt={request.parent.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Users size={24} className="text-slate-400" />
                        )}
                    </div>
                    {/* Info */}
                    <div>
                        <h3 className="font-bold text-charcoal text-lg">
                            {request.parent?.name || 'ولي أمر'}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            {request.parent?.email && (
                                <span className="flex items-center gap-1">
                                    <Mail size={12} />
                                    {request.parent.email}
                                </span>
                            )}
                            {request.parent?.phone && (
                                <span className="flex items-center gap-1">
                                    <Phone size={12} />
                                    {request.parent.phone}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyles[request.status]}`}>
                    {statusLabels[request.status]}
                </span>
            </div>

            {/* Message */}
            {request.message && (
                <div className="bg-slate-50 rounded-xl p-3 mb-4">
                    <p className="text-sm text-slate-600">"{request.message}"</p>
                </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                <Clock size={14} />
                <span>
                    {request.created_at
                        ? new Date(request.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })
                        : 'غير معروف'
                    }
                </span>
            </div>

            {/* Actions */}
            {isPending && (
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                        onClick={() => onReject(request.id)}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 px-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        <UserX size={18} />
                        رفض
                    </button>
                    <button
                        onClick={() => onAccept(request.id)}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <UserCheck size={18} />
                        )}
                        قبول
                    </button>
                </div>
            )}

            {/* Accepted/Rejected State */}
            {request.status === 'accepted' && (
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle size={18} />
                        تم ربط ولي الأمر بنجاح
                    </div>
                </div>
            )}

            {request.status === 'rejected' && request.response_message && (
                <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                        <span className="font-medium">سبب الرفض:</span> {request.response_message}
                    </p>
                </div>
            )}
        </div>
    );
}

// ============================================================
// Main Page Component
// ============================================================

export function StudentParentRequestsPage() {
    const [requests, setRequests] = useState<ParentLinkRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await studentService.getParentRequests();
            setRequests(data);
        } catch (err) {
            setError('فشل تحميل طلبات الربط');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();

        // Listen for real-time notifications
        const handleNotification = (event: CustomEvent<any>) => {
            // Check if notification is about parent link requests
            if (event.detail?.type === 'parent_link_request') {
                fetchRequests();
            }
        };

        window.addEventListener('student-notification' as any, handleNotification);

        return () => {
            window.removeEventListener('student-notification' as any, handleNotification);
        };
    }, []);

    const handleAccept = async (requestId: number) => {
        setProcessingId(requestId);
        try {
            await studentService.acceptParentRequest(requestId);
            // Update local state
            setRequests(prev =>
                prev.map(r => r.id === requestId ? { ...r, status: 'accepted' as const } : r)
            );
            // Refresh user data to update linked_parent info in profile
            try {
                const freshUserData = await studentService.getProfile();
                const { user, setUser } = useAuthStore.getState();
                // Merge new profile data with existing user to preserve auth fields
                if (user) {
                    setUser({ ...user, ...freshUserData } as any);
                }
            } catch (refreshErr) {
                console.error('Failed to refresh user data:', refreshErr);
            }
        } catch (err) {
            console.error('Failed to accept request:', err);
            setError('فشل قبول الطلب. حاول مرة أخرى.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId: number) => {
        setProcessingId(requestId);
        try {
            await studentService.rejectParentRequest(requestId);
            // Update local state
            setRequests(prev =>
                prev.map(r => r.id === requestId ? { ...r, status: 'rejected' as const } : r)
            );
        } catch (err) {
            console.error('Failed to reject request:', err);
            setError('فشل رفض الطلب. حاول مرة أخرى.');
        } finally {
            setProcessingId(null);
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const historyRequests = requests.filter(r => r.status !== 'pending');

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-charcoal flex items-center gap-3">
                        <Users className="text-shibl-crimson" />
                        طلبات ربط ولي الأمر
                    </h1>
                    <p className="text-sm md:text-base text-slate-500 mt-2">
                        راجع طلبات الربط من أولياء الأمور ووافق عليها أو ارفضها
                    </p>
                </div>
                <button
                    onClick={fetchRequests}
                    disabled={isLoading}
                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
                    title="تحديث"
                >
                    <RefreshCw size={20} className={`text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 size={40} className="text-shibl-crimson animate-spin mb-4" />
                    <p className="text-slate-500">جاري التحميل...</p>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && requests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <Users size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-charcoal mb-2">لا توجد طلبات ربط</h3>
                    <p className="text-sm text-slate-500">
                        عندما يطلب ولي أمر ربط حسابه بك، ستظهر الطلبات هنا
                    </p>
                </div>
            )}

            {/* Pending Requests Section */}
            {!isLoading && pendingRequests.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
                        <Clock size={20} className="text-amber-500" />
                        طلبات قيد الانتظار
                        <span className="ml-auto text-sm font-normal text-slate-400">
                            {pendingRequests.length} طلب
                        </span>
                    </h2>
                    <div className="grid gap-4">
                        {pendingRequests.map(request => (
                            <ParentRequestCard
                                key={request.id}
                                request={request}
                                onAccept={handleAccept}
                                onReject={handleReject}
                                isProcessing={processingId === request.id}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* History Section */}
            {!isLoading && historyRequests.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
                        <CheckCircle size={20} className="text-slate-400" />
                        السجل السابق
                        <span className="ml-auto text-sm font-normal text-slate-400">
                            {historyRequests.length} طلب
                        </span>
                    </h2>
                    <div className="grid gap-4">
                        {historyRequests.map(request => (
                            <ParentRequestCard
                                key={request.id}
                                request={request}
                                onAccept={handleAccept}
                                onReject={handleReject}
                                isProcessing={processingId === request.id}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default StudentParentRequestsPage;
