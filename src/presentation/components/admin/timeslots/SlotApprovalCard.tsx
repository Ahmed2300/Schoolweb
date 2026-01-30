/**
 * SlotApprovalCard Component
 * 
 * Card showing a pending slot request for admin to approve/reject.
 * Displays teacher info, lecture details, and action buttons.
 */

import { useState } from 'react';
import { Calendar, Clock, User, BookOpen, Check, X, MessageSquare, Loader2 } from 'lucide-react';
import { AdminTimeSlot, adminTimeSlotService } from '../../../../data/api/adminTimeSlotService';
import { formatDate, formatTime } from '../../../../utils/timeUtils';

interface SlotApprovalCardProps {
    slot: AdminTimeSlot;
    onApproved: () => void;
    onRejected: () => void;
}


export function SlotApprovalCard({ slot, onApproved, onRejected }: SlotApprovalCardProps) {
    const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleApprove = async () => {
        setLoading('approve');
        setError(null);
        try {
            await adminTimeSlotService.approve(slot.id);
            onApproved();
        } catch (err) {
            setError('فشل في الموافقة على الطلب');
            console.error(err);
        } finally {
            setLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            setError('يرجى إدخال سبب الرفض');
            return;
        }

        setLoading('reject');
        setError(null);
        try {
            await adminTimeSlotService.reject(slot.id, rejectReason);
            onRejected();
        } catch (err) {
            setError('فشل في رفض الطلب');
            console.error(err);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            {/* Header - Date & Time */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Calendar className="text-purple-600" size={24} />
                    </div>
                    <div>
                        <p className="font-bold text-charcoal">{formatDate(slot.start_time)}</p>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Clock size={14} />
                            <span>{formatTime(slot.start_time)}</span>
                            <span className="mx-1">-</span>
                            <span>{formatTime(slot.end_time)}</span>
                        </div>
                    </div>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                    قيد الانتظار
                </span>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4 bg-slate-50 rounded-lg p-3">
                {/* Teacher */}
                <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-slate-400" />
                    <span className="text-slate-600">المعلم:</span>
                    <span className="font-medium text-charcoal">{slot.teacher_name || 'غير معروف'}</span>
                </div>

                {/* Lecture */}
                {slot.lecture_title && (
                    <div className="flex items-center gap-2 text-sm">
                        <BookOpen size={14} className="text-slate-400" />
                        <span className="text-slate-600">المحاضرة:</span>
                        <span className="font-medium text-charcoal">{slot.lecture_title}</span>
                    </div>
                )}

                {/* Course */}
                {slot.course_name && (
                    <div className="flex items-center gap-2 text-sm">
                        <BookOpen size={14} className="text-slate-400" />
                        <span className="text-slate-600">الكورس:</span>
                        <span className="font-medium text-charcoal">{slot.course_name}</span>
                    </div>
                )}

                {/* Request Notes */}
                {slot.request_notes && (
                    <div className="flex items-start gap-2 text-sm pt-2 border-t border-slate-200">
                        <MessageSquare size={14} className="text-slate-400 mt-0.5" />
                        <span className="text-slate-600">{slot.request_notes}</span>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <X size={14} />
                    {error}
                </div>
            )}

            {/* Reject Form */}
            {showRejectForm ? (
                <div className="space-y-3">
                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="سبب الرفض (مطلوب)..."
                        className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none focus:border-red-400 outline-none"
                        rows={2}
                        dir="rtl"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleReject}
                            disabled={loading === 'reject'}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                            {loading === 'reject' ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <X size={16} />
                            )}
                            تأكيد الرفض
                        </button>
                        <button
                            onClick={() => {
                                setShowRejectForm(false);
                                setRejectReason('');
                                setError(null);
                            }}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            ) : (
                /* Action Buttons */
                <div className="flex gap-2">
                    <button
                        onClick={handleApprove}
                        disabled={loading !== null}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading === 'approve' ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Check size={16} />
                        )}
                        موافقة
                    </button>
                    <button
                        onClick={() => setShowRejectForm(true)}
                        disabled={loading !== null}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition disabled:opacity-50"
                    >
                        <X size={16} />
                        رفض
                    </button>
                </div>
            )}
        </div>
    );
}
