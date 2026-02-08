import { useState } from 'react';
import {
    X,
    Search,
    UserPlus,
    Loader2,
    CheckCircle,
    AlertCircle,
    Users
} from 'lucide-react';
import { parentService, type StudentSearchResult, type ParentStudentRequest } from '../../../data/api';

interface LinkStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (request: ParentStudentRequest) => void;
}

type ModalStep = 'search' | 'confirm' | 'success' | 'error';

export function LinkStudentModal({ isOpen, onClose, onSuccess }: LinkStudentModalProps) {
    const [step, setStep] = useState<ModalStep>('search');
    const [uid, setUid] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [studentResult, setStudentResult] = useState<StudentSearchResult | null>(null);
    const [createdRequest, setCreatedRequest] = useState<ParentStudentRequest | null>(null);

    const resetModal = () => {
        setStep('search');
        setUid('');
        setMessage('');
        setIsLoading(false);
        setError(null);
        setStudentResult(null);
        setCreatedRequest(null);
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const handleSearch = async () => {
        if (!uid.trim()) {
            setError('الرجاء إدخال رمز الطالب');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await parentService.searchStudent(uid.trim().toUpperCase());
            setStudentResult(result);

            if (result.has_parent) {
                setError('هذا الطالب مرتبط بولي أمر آخر بالفعل');
            } else {
                setStep('confirm');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'لم يتم العثور على طالب بهذا الرمز';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendRequest = async () => {
        if (!studentResult) return;

        setIsLoading(true);
        setError(null);

        try {
            const request = await parentService.sendLinkRequest(studentResult.id, message || undefined);
            setCreatedRequest(request);
            setStep('success');
            onSuccess?.(request);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'فشل إرسال الطلب. حاول مرة أخرى.';
            setError(errorMessage);
            setStep('error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Header Accent */}
                <div className="h-1.5 bg-gradient-to-r from-shibl-crimson to-rose-500" />

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
                >
                    <X size={20} className="text-slate-400" />
                </button>

                {/* Content */}
                <div className="p-6 md:p-8">
                    {/* Step: Search */}
                    {step === 'search' && (
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-shibl-crimson/10 to-rose-100 flex items-center justify-center">
                                    <UserPlus size={28} className="text-shibl-crimson" />
                                </div>
                                <h2 className="text-xl font-extrabold text-charcoal">ربط طالب جديد</h2>
                                <p className="text-sm text-slate-500 mt-2">
                                    أدخل رمز الطالب (UID) للبحث عنه وإرسال طلب الربط
                                </p>
                            </div>

                            {/* UID Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-charcoal">
                                    رمز الطالب (UID)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={uid}
                                        onChange={(e) => {
                                            setUid(e.target.value.toUpperCase());
                                            setError(null);
                                        }}
                                        placeholder="STD-2024-000001"
                                        className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl text-charcoal font-mono text-center text-lg focus:outline-none focus:ring-2 focus:ring-shibl-crimson/50 focus:border-shibl-crimson transition-all"
                                        dir="ltr"
                                    />
                                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                </div>
                                <p className="text-xs text-slate-400 text-center">
                                    يمكن للطالب الحصول على الرمز من ملفه الشخصي
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Search Button */}
                            <button
                                onClick={handleSearch}
                                disabled={isLoading || !uid.trim()}
                                className="w-full py-3 bg-gradient-to-r from-shibl-crimson to-rose-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        جاري البحث...
                                    </>
                                ) : (
                                    <>
                                        <Search size={20} />
                                        بحث
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step: Confirm */}
                    {step === 'confirm' && studentResult && (
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="text-center">
                                <h2 className="text-xl font-extrabold text-charcoal">تأكيد الطالب</h2>
                                <p className="text-sm text-slate-500 mt-2">
                                    هل هذا هو الطالب الذي تريد ربطه؟
                                </p>
                            </div>

                            {/* Student Card */}
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                        {studentResult.image_url ? (
                                            <img
                                                src={studentResult.image_url}
                                                alt={studentResult.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Users size={28} className="text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-extrabold text-charcoal">{studentResult.name}</h3>
                                        <p className="text-sm text-slate-500 font-medium">{studentResult.grade || 'غير محدد'}</p>
                                        <p className="text-xs text-slate-400 font-mono mt-1" dir="ltr">{studentResult.uid}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Optional Message */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-charcoal">
                                    رسالة (اختياري)
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="أنا والد/والدة الطالب..."
                                    rows={2}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-shibl-crimson/50 focus:border-shibl-crimson transition-all resize-none"
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setStep('search');
                                        setStudentResult(null);
                                        setError(null);
                                    }}
                                    className="flex-1 py-3 bg-slate-100 text-charcoal font-bold rounded-xl hover:bg-slate-200 transition-all"
                                >
                                    رجوع
                                </button>
                                <button
                                    onClick={handleSendRequest}
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-gradient-to-r from-shibl-crimson to-rose-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            جاري الإرسال...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={20} />
                                            إرسال الطلب
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: Success */}
                    {step === 'success' && (
                        <div className="space-y-6 text-center py-4">
                            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle size={40} className="text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-charcoal">تم إرسال الطلب!</h2>
                                <p className="text-sm text-slate-500 mt-2">
                                    سيتم إشعار الطالب بطلب الربط. بمجرد قبوله، سيظهر في قائمة أبنائك.
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-full py-3 bg-gradient-to-r from-shibl-crimson to-rose-600 text-white font-bold rounded-xl hover:opacity-90 transition-all"
                            >
                                تم
                            </button>
                        </div>
                    )}

                    {/* Step: Error */}
                    {step === 'error' && (
                        <div className="space-y-6 text-center py-4">
                            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle size={40} className="text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-charcoal">فشل إرسال الطلب</h2>
                                <p className="text-sm text-slate-500 mt-2">
                                    {error || 'حدث خطأ غير متوقع. حاول مرة أخرى.'}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-3 bg-slate-100 text-charcoal font-bold rounded-xl hover:bg-slate-200 transition-all"
                                >
                                    إغلاق
                                </button>
                                <button
                                    onClick={() => {
                                        setStep('search');
                                        setError(null);
                                    }}
                                    className="flex-1 py-3 bg-gradient-to-r from-shibl-crimson to-rose-600 text-white font-bold rounded-xl hover:opacity-90 transition-all"
                                >
                                    حاول مرة أخرى
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LinkStudentModal;
