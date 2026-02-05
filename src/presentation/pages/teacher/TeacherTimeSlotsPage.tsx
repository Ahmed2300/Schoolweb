import React, { useState, useMemo } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    Search,
    Filter,
    X,
    Plus,
    Loader2,
    CheckCircle,
    XCircle,
    HourglassIcon,
    BookOpen,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Printer,
    Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    useAvailableSlots,
    useMyRequests,
    useRequestSlot,
    useCancelSlotRequest,
    useTeacherCourses,
    useCourseLectures,
    useCancelAllRequests
} from '../../hooks';
import type { TimeSlot } from '../../../types/timeSlot';
import { useAuth } from '../../hooks/useAuth';
import { getCourseName } from '../../../data/api/teacherService';
import { formatTime, formatDate } from '../../../utils/timeUtils';
import { frontendSettings } from '../../../services/FrontendSettingsService';
import { TimeSlotPicker } from '../../components/teacher/timeslots/TimeSlotPicker';

// Helper function to extract localized text from translatable fields
const getLocalizedText = (
    value: string | { ar?: string; en?: string } | undefined | null,
    lang: 'ar' | 'en' = 'ar'
): string => {
    if (!value) return '—';
    if (typeof value === 'string') return value;
    return value[lang] || value.en || value.ar || '—';
};

// Status configurations
const STATUS_CONFIG: Record<string, {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ReactNode;
}> = {
    pending: {
        label: 'قيد الانتظار',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        icon: <HourglassIcon size={14} />
    },
    approved: {
        label: 'موافق عليه',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: <CheckCircle size={14} />
    },
    rejected: {
        label: 'مرفوض',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <XCircle size={14} />
    },
};

export function TeacherTimeSlotsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'available' | 'requests' | 'summary'>('available');
    const [dateFilter, setDateFilter] = useState('');

    // Request Modal State
    const [requestModalOpen, setRequestModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedLecture, setSelectedLecture] = useState<string>('');
    const [requestNotes, setRequestNotes] = useState('');
    const [isExtraClass, setIsExtraClass] = useState(false);

    // Cancel Modal State
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [slotToCancel, setSlotToCancel] = useState<TimeSlot | null>(null);
    const [cancelAllModalOpen, setCancelAllModalOpen] = useState(false);

    // Queries
    const { data: rawAvailableSlots = [], isLoading: loadingAvailable } = useAvailableSlots(dateFilter || undefined);

    // Filter slots based on Academic Term (Frontend Settings)
    const availableSlots = useMemo(() => {
        return rawAvailableSlots.filter(slot => frontendSettings.isDateInTerm(slot.start_time));
    }, [rawAvailableSlots]);

    const { data: myRequests = [], isLoading: loadingRequests } = useMyRequests();
    const { data: myCourses = [] } = useTeacherCourses();
    const { data: lectures = [], isLoading: loadingLectures } = useCourseLectures(selectedCourse ? Number(selectedCourse) : null);

    // Mutations
    const requestMutation = useRequestSlot();
    const cancelMutation = useCancelSlotRequest();
    const cancelAllMutation = useCancelAllRequests();

    // Reset form when modal closes
    const closeRequestModal = () => {
        setRequestModalOpen(false);
        setSelectedSlot(null);
        setSelectedCourse('');
        setSelectedLecture('');
        setRequestNotes('');
    };

    // Handle Request Submit
    const handleRequestSubmit = async () => {
        if (!selectedSlot || !selectedLecture) return;

        try {
            const notes = isExtraClass
                ? `[حصة إضافية] ${requestNotes}`.trim()
                : requestNotes;

            await requestMutation.mutateAsync({
                id: selectedSlot.id,
                lectureId: Number(selectedLecture),
                notes: notes
            });
            closeRequestModal();
            if (isExtraClass) {
                toast.success('تم رفع طلب الحصة الإضافية بنجاح');
            } else {
                toast.success('تم رفع طلب الحجز بنجاح');
            }
        } catch (error) {
            console.error('Failed to request slot:', error);
            toast.error('فشل في رفع الطلب');
        }
    };

    // Handle Cancel Submit
    const handleCancelSubmit = async () => {
        if (!slotToCancel) return;

        try {
            await cancelMutation.mutateAsync(slotToCancel.id);
            setCancelModalOpen(false);
            setSlotToCancel(null);
        } catch (error) {
            console.error('Failed to cancel request:', error);
        }
    };

    // Handle Cancel All Submit
    const handleCancelAllSubmit = async () => {
        try {
            await cancelAllMutation.mutateAsync();
            setCancelAllModalOpen(false);
            toast.success('تم إلغاء جميع الطلبات المعلقة بنجاح');
        } catch (error) {
            console.error('Failed to cancel all requests:', error);
            toast.error('فشل في إلغاء الطلبات');
        }
    };

    // formatTime and formatDate imported from ../../../utils/timeUtils


    // Summary Tab State
    const [summaryWeekStart, setSummaryWeekStart] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        const day = d.getDay(); // 0 is Sunday
        d.setDate(d.getDate() - day); // Go back to Sunday
        return d;
    });

    const handleNextWeek = () => {
        const next = new Date(summaryWeekStart);
        next.setDate(next.getDate() + 7);
        setSummaryWeekStart(next);
    };

    const handlePrevWeek = () => {
        const prev = new Date(summaryWeekStart);
        prev.setDate(prev.getDate() - 7);
        setSummaryWeekStart(prev);
    };

    const printSchedule = () => {
        window.print();
    };

    // Filter requests for the summary view
    const summarySlots = useMemo(() => {
        const start = summaryWeekStart.getTime();
        const end = start + (7 * 24 * 60 * 60 * 1000); // 7 days later

        return myRequests.filter(slot => {
            const slotTime = new Date(slot.start_time).getTime();
            return slotTime >= start && slotTime < end;
        });
    }, [myRequests, summaryWeekStart]);

    // Group summary slots by Day Index (0-6)
    const slotsByDay = useMemo(() => {
        const days: Record<number, TimeSlot[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
        summarySlots.forEach(slot => {
            const d = new Date(slot.start_time);
            days[d.getDay()].push(slot);
        });
        // Sort slots by time within each day
        Object.values(days).forEach(daySlots => {
            daySlots.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
        });
        return days;
    }, [summarySlots]);

    const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    return (
        <div className="space-y-6 pb-8 p-6 print:p-0">
            {/* Header - Hidden in Print */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white shadow-lg shadow-violet-500/25">
                            <Clock size={24} />
                        </div>
                        إدارة المواعيد والحصص
                    </h1>
                    <p className="text-slate-500 mt-1">عرض المواعيد المتاحة وتقديم طلبات للحصص المباشرة</p>
                </div>
            </div>

            {/* Tabs - Hidden in Print */}
            <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 w-fit print:hidden">
                <button
                    onClick={() => setActiveTab('available')}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'available'
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    المواعيد المتاحة
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'requests'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    طلباتي
                    {myRequests.length > 0 && (
                        <span className={`mr-2 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'requests' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                            {myRequests.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'summary'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    جدولي الأسبوعي
                </button>
            </div>

            {/* Available Slots Tab */}
            {activeTab === 'available' && (
                <div className="space-y-4 print:hidden">
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="flex items-center gap-2 flex-1 max-w-xs">
                            <CalendarIcon size={18} className="text-slate-400" />
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
                            />
                        </div>
                        {dateFilter && (
                            <button
                                onClick={() => setDateFilter('')}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
                                title="مسح الفلتر"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Term Warning if no slots due to term */}
                    {!loadingAvailable && rawAvailableSlots.length > 0 && availableSlots.length === 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                            <AlertCircle size={20} className="text-amber-600 mt-1 shrink-0" />
                            <div>
                                <h4 className="font-bold text-amber-800">تنبيه الفصل الدراسي</h4>
                                <p className="text-sm text-amber-700">
                                    توجد فترات زمنية ولكنها تقع خارج نطاق الفصل الدراسي الحالي المحدد من قبل الإدارة.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        {loadingAvailable ? (
                            <div className="p-12 flex justify-center">
                                <Loader2 size={32} className="animate-spin text-violet-600" />
                            </div>
                        ) : availableSlots.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <Clock size={48} className="mx-auto mb-4 text-slate-300" />
                                <p>لا توجد مواعيد متاحة حالياً</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">التاريخ</th>
                                        <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">الوقت</th>
                                        <th className="text-center py-4 px-6 font-semibold text-slate-600 text-sm">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {availableSlots.map(slot => (
                                        <tr key={slot.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition">
                                            <td className="py-4 px-6 font-medium text-slate-700">{formatDate(slot.start_time)}</td>
                                            <td className="py-4 px-6 font-medium text-violet-700">
                                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedSlot(slot);
                                                        setRequestModalOpen(true);
                                                    }}
                                                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
                                                >
                                                    حجز الموعد
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* My Requests Tab */}
            {activeTab === 'requests' && (
                <div className="space-y-4 print:hidden">
                    {/* Header with Actions */}
                    {myRequests.some(r => r.status === 'pending') && (
                        <div className="flex justify-end">
                            <button
                                onClick={() => setCancelAllModalOpen(true)}
                                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition flex items-center gap-2 border border-red-200"
                            >
                                <Trash2 size={18} />
                                إلغاء جميع الطلبات المعلقة
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        {loadingRequests ? (
                            <div className="p-12 flex justify-center">
                                <Loader2 size={32} className="animate-spin text-blue-600" />
                            </div>
                        ) : myRequests.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <HourglassIcon size={48} className="mx-auto mb-4 text-slate-300" />
                                <p>لم تقم بتقديم أي طلبات بعد</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">التاريخ والوقت</th>
                                        <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">المحاضرة</th>
                                        <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">الحالة</th>
                                        <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">ملاحظات</th>
                                        <th className="text-center py-4 px-6 font-semibold text-slate-600 text-sm">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myRequests.map(slot => {
                                        const status = STATUS_CONFIG[slot.status] || STATUS_CONFIG.pending;
                                        return (
                                            <tr key={slot.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition">
                                                <td className="py-4 px-6">
                                                    <div className="font-medium text-slate-800">{formatDate(slot.start_time)}</div>
                                                    <div className="text-sm text-slate-500 mt-1">
                                                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen size={16} className="text-slate-400" />
                                                        <span className="font-medium text-slate-700">{getLocalizedText(slot.lecture?.title)}</span>
                                                    </div>
                                                    {slot.lecture?.course && (
                                                        <div className="text-xs text-slate-500 mt-1 mr-6">
                                                            {getCourseName(slot.lecture.course.name)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color} border ${status.borderColor}`}>
                                                        {status.icon}
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {slot.rejection_reason && (
                                                        <div className="mb-2">
                                                            <span className="text-xs font-bold text-red-600 block">سبب الرفض:</span>
                                                            <span className="text-sm text-red-700">{slot.rejection_reason}</span>
                                                        </div>
                                                    )}
                                                    <span className="text-sm text-slate-600">{slot.request_notes || '—'}</span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {slot.status === 'pending' && (
                                                        <button
                                                            onClick={() => {
                                                                setSlotToCancel(slot);
                                                                setCancelModalOpen(true);
                                                            }}
                                                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition"
                                                        >
                                                            إلغاء الطلب
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Weekly Summary Tab */}
            {
                activeTab === 'summary' && (
                    <div className="space-y-4">
                        {/* Summary Controls */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between print:hidden">
                            <div className="flex items-center gap-4">
                                <button onClick={handlePrevWeek} className="p-2 hover:bg-slate-100 rounded-lg transition">
                                    <ChevronRight size={20} className="text-slate-600" />
                                </button>
                                <span className="font-bold text-lg dir-ltr">
                                    {formatDate(summaryWeekStart.toISOString())} - {formatDate(new Date(summaryWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString())}
                                </span>
                                <button onClick={handleNextWeek} className="p-2 hover:bg-slate-100 rounded-lg transition">
                                    <ChevronLeft size={20} className="text-slate-600" />
                                </button>
                            </div>
                            <button
                                onClick={printSchedule}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium"
                            >
                                <span className="hidden sm:inline">طباعة الجدول</span>
                                <CalendarIcon size={18} />
                            </button>
                        </div>

                        {/* Printable Weekly Grid */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-none">
                            {/* Print Header */}
                            <div className="hidden print:block p-8 text-center border-b border-slate-200">
                                <h2 className="text-3xl font-bold mb-2">جدولي الأسبوعي</h2>
                                <p className="text-slate-600">
                                    {formatDate(summaryWeekStart.toISOString())} - {formatDate(new Date(summaryWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString())}
                                </p>
                                <p className="mt-4 font-bold text-xl">{user?.name}</p>
                            </div>

                            <div className="grid grid-cols-7 divide-x divide-x-reverse divide-slate-100 min-w-[800px]">
                                {weekDays.map((day, index) => (
                                    <div key={index} className="flex flex-col">
                                        <div className="bg-slate-50/80 p-3 text-center border-b border-slate-100 font-bold text-slate-700">
                                            {day}
                                            <div className="text-xs text-slate-400 font-normal mt-1">
                                                {formatDate(new Date(summaryWeekStart.getTime() + index * 24 * 60 * 60 * 1000).toISOString()).split(' ')[0]}
                                            </div>
                                        </div>
                                        <div className="flex-1 p-2 space-y-2 min-h-[200px]">
                                            {slotsByDay[index].map(slot => {
                                                const status = STATUS_CONFIG[slot.status] || STATUS_CONFIG.pending;
                                                return (
                                                    <div key={slot.id} className={`p-2 rounded-lg border text-sm ${status.bgColor} ${status.borderColor} ${status.color}`}>
                                                        <div className="font-bold flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {formatTime(slot.start_time)}
                                                        </div>
                                                        <div className="mt-1 truncate font-medium">
                                                            {getLocalizedText(slot.lecture?.title)}
                                                        </div>
                                                        <div className="text-[10px] opacity-75 mt-0.5 truncate">
                                                            {slot.lecture?.course ? getCourseName(slot.lecture.course.name) : '-'}
                                                        </div>
                                                        <div className="mt-1.5 flex items-center justify-between">
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-white/50 rounded-full border border-current opacity-75 inline-block">
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {slotsByDay[index].length === 0 && (
                                                <div className="h-full flex items-center justify-center text-slate-300">
                                                    <span className="text-xl opacity-20">-</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Request Modal */}
            {
                requestModalOpen && selectedSlot && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
                        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-charcoal">طلب حجز موعد</h3>
                                <button onClick={closeRequestModal} className="p-2 hover:bg-slate-100 rounded-lg transition"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl border border-violet-100 text-violet-800">
                                    <Clock size={20} />
                                    <div>
                                        <p className="font-bold">{formatDate(selectedSlot.start_time)}</p>
                                        <p className="text-sm">{formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</p>
                                    </div>
                                    {isExtraClass && (
                                        <div className="mr-auto bg-violet-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                                            حصة إضافية
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">الكورس</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white"
                                        value={selectedCourse}
                                        onChange={(e) => {
                                            setSelectedCourse(e.target.value);
                                            setSelectedLecture('');
                                        }}
                                    >
                                        <option value="">اختر الكورس...</option>
                                        {myCourses.map(course => (
                                            <option key={course.id} value={course.id}>{getCourseName(course.name)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">المحاضرة</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white"
                                        value={selectedLecture}
                                        onChange={(e) => setSelectedLecture(e.target.value)}
                                        disabled={!selectedCourse || loadingLectures}
                                    >
                                        <option value="">
                                            {!selectedCourse ? 'اختر الكورس أولاً' : loadingLectures ? 'جارِ التحميل...' : 'اختر المحاضرة...'}
                                        </option>
                                        {lectures.map((lecture: any) => (
                                            <option key={lecture.id} value={lecture.id}>{lecture.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات (اختياري)</label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none"
                                        rows={3}
                                        value={requestNotes}
                                        onChange={(e) => setRequestNotes(e.target.value)}
                                        placeholder="أي ملاحظات إضافية..."
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex gap-3">
                                <button onClick={closeRequestModal} className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition">إلغاء</button>
                                <button
                                    onClick={handleRequestSubmit}
                                    disabled={!selectedLecture || requestMutation.isPending}
                                    className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {requestMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'تأكيد الحجز'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Cancel Modal */}
            {
                cancelModalOpen && slotToCancel && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
                        <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-charcoal mb-2">إلغاء الطلب؟</h3>
                                <p className="text-slate-500">هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟</p>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex gap-3">
                                <button onClick={() => setCancelModalOpen(false)} className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition">تراجع</button>
                                <button
                                    onClick={handleCancelSubmit}
                                    disabled={cancelMutation.isPending}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {cancelMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'نعم، إلغاء'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Cancel All Modal */}
            {
                cancelAllModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
                        <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-charcoal mb-2">إلغاء جميع الطلبات؟</h3>
                                <p className="text-slate-500">هل أنت متأكد من رغبتك في إلغاء جميع الطلبات المعلقة؟ لا يمكن التراجع عن هذا الإجراء.</p>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex gap-3">
                                <button onClick={() => setCancelAllModalOpen(false)} className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition">تراجع</button>
                                <button
                                    onClick={handleCancelAllSubmit}
                                    disabled={cancelAllMutation.isPending}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {cancelAllMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'نعم، إلغاء الجميع'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
