import React, { useState, useEffect, useCallback } from 'react';
import {
    Calendar as CalendarIcon,
    Search,
    X,
    Video,
    Clock,
    User,
    BookOpen,
    GraduationCap,
    Filter,
} from 'lucide-react';
import { useClassSchedules } from '../../hooks/useClassSchedules';
import { useGrades, useTeachers } from '../../hooks';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import adminService, { type SemesterData } from '../../../data/api/adminService';

const DAY_NAMES_AR: Record<number, string> = {
    0: 'الأحد',
    1: 'الإثنين',
    2: 'الثلاثاء',
    3: 'الأربعاء',
    4: 'الخميس',
    5: 'الجمعة',
    6: 'السبت',
};

export function AdminClassSchedulesPage() {
    // State
    const [search, setSearch] = useState('');
    const [selectedGrade, setSelectedGrade] = useState<string>('');
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [selectedDay, setSelectedDay] = useState<string>('');
    const [bookingStatus, setBookingStatus] = useState<'all' | 'booked' | 'not_booked'>('all');
    const [selectedSemesters, setSelectedSemesters] = useState<Record<number, number | 'all'>>({});
    const [semestersByGrade, setSemestersByGrade] = useState<Record<number, SemesterData[]>>({});

    // Queries
    const { data: groupedData, isLoading, error } = useClassSchedules({
        search,
        grade_id: selectedGrade ? Number(selectedGrade) : undefined,
        teacher_id: selectedTeacher ? Number(selectedTeacher) : undefined,
        day_of_week: selectedDay !== '' ? Number(selectedDay) : undefined,
        grouped: true,
        booking_status: bookingStatus,
    });

    // Fetch semesters for each grade in the response
    useEffect(() => {
        if (!groupedData?.data) return;
        const gradeIds = groupedData.data.map((g: any) => g.id as number);
        gradeIds.forEach((gradeId: number) => {
            if (semestersByGrade[gradeId]) return; // already fetched
            adminService.getSemestersByGrade(gradeId)
                .then((sems) => {
                    setSemestersByGrade((prev) => ({ ...prev, [gradeId]: sems }));
                })
                .catch(() => { /* silently ignore */ });
        });
    }, [groupedData?.data]);

    const handleSemesterChange = useCallback((gradeId: number, value: string) => {
        setSelectedSemesters((prev) => ({
            ...prev,
            [gradeId]: value === 'all' ? 'all' : Number(value),
        }));
    }, []);

    const getFilteredSlots = useCallback((gradeId: number, slots: any[]) => {
        const selected = selectedSemesters[gradeId];
        if (!selected || selected === 'all') return slots;
        return slots.filter((s: any) => s.semester_id === selected);
    }, [selectedSemesters]);

    const { data: grades } = useGrades();
    const { data: teachers } = useTeachers();

    const clearFilters = () => {
        setSearch('');
        setSelectedGrade('');
        setSelectedTeacher('');
        setSelectedDay('');
        setBookingStatus('all');
    };

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">جداول الحصص</h1>
                    <p className="text-slate-500">عرض شامل لجميع الحصص والمواعيد المجدولة (مصنفة حسب الصفوف)</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                    <Clock size={16} />
                    <span>تحديث</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    <input
                        type="text"
                        placeholder="بحث باسم المدرس أو الصف..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all"
                    />
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson"
                    >
                        <option value="">جميع الصفوف</option>
                        {grades?.data.map((g) => (
                            <option key={g.id} value={g.id}>{typeof g.name === 'object' ? (g.name as any).ar || (g.name as any).en : g.name}</option>
                        ))}
                    </select>

                    <select
                        value={selectedTeacher}
                        onChange={(e) => setSelectedTeacher(e.target.value)}
                        className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson"
                    >
                        <option value="">جميع المدرسين</option>
                        {teachers?.data.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>

                    <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson"
                    >
                        <option value="">جميع الأيام</option>
                        <option value="0">الأحد</option>
                        <option value="1">الإثنين</option>
                        <option value="2">الثلاثاء</option>
                        <option value="3">الأربعاء</option>
                        <option value="4">الخميس</option>
                        <option value="5">الجمعة</option>
                        <option value="6">السبت</option>
                    </select>

                    <select
                        value={bookingStatus}
                        onChange={(e) => setBookingStatus(e.target.value as 'all' | 'booked' | 'not_booked')}
                        className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson"
                    >
                        <option value="all">جميع الحصص</option>
                        <option value="booked">المحجوزة فقط</option>
                        <option value="not_booked">غير المحجوزة</option>
                    </select>
                </div>

                {/* Active Filters Summary & Clear */}
                {(selectedGrade || selectedTeacher || selectedDay || bookingStatus !== 'all') && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex flex-wrap gap-2">
                            {/* Chips could go here */}
                        </div>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                        >
                            <X size={14} />
                            مسح التصفية
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : !groupedData?.data || groupedData.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <CalendarIcon className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">لا توجد جداول</h3>
                    <p className="text-slate-500">لم يتم العثور على أي حصص مطابقة لمعايير البحث</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Iterate over Grades */}
                    {groupedData.data.map((group: any) => (
                        <div key={group.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            {(() => {
                                const filteredSlots = getFilteredSlots(group.id, group.slots);
                                const gradeSemesters = semestersByGrade[group.id] || [];
                                const currentSemester = selectedSemesters[group.id] ?? 'all';
                                return (
                                    <>
                                        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                                    <GraduationCap size={20} />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-bold text-slate-800">{group.name}</h2>
                                                    <p className="text-sm text-slate-500">
                                                        {filteredSlots.length} حصة مجدولة
                                                        {bookingStatus === 'all' && filteredSlots.length > 0 && (
                                                            <span className="text-slate-400 mr-1">
                                                                ({filteredSlots.filter((s: any) => s.is_booked).length} محجوزة)
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Semester Filter per Grade Card */}
                                            {gradeSemesters.length > 0 && (
                                                <select
                                                    value={String(currentSemester)}
                                                    onChange={(e) => handleSemesterChange(group.id, e.target.value)}
                                                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all min-w-[140px]"
                                                >
                                                    <option value="all">كل الفصول</option>
                                                    {gradeSemesters.map((sem) => (
                                                        <option key={sem.id} value={sem.id}>
                                                            {typeof sem.name === 'object' ? (sem.name.ar || sem.name.en || '') : sem.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>

                                        {filteredSlots.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 bg-slate-50/30 text-right text-xs uppercase tracking-wider text-slate-500">
                                                            <th className="px-6 py-3 font-semibold">المعلم</th>
                                                            <th className="px-6 py-3 font-semibold">العنوان (المحاضرة)</th>
                                                            <th className="px-6 py-3 font-semibold">الفصل الدراسي</th>
                                                            <th className="px-6 py-3 font-semibold">اليوم</th>
                                                            <th className="px-6 py-3 font-semibold">التاريخ</th>
                                                            <th className="px-6 py-3 font-semibold">التوقيت</th>
                                                            <th className="px-6 py-3 font-semibold">الحالة</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {filteredSlots.map((slot: any) => (
                                                            <tr
                                                                key={slot.id}
                                                                className={`transition-colors ${slot.is_booked
                                                                    ? 'hover:bg-slate-50/80'
                                                                    : 'bg-slate-50/40 border-r-2 border-r-dashed border-r-slate-300 hover:bg-slate-100/60'
                                                                    }`}
                                                            >
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${slot.is_booked
                                                                            ? 'bg-slate-100 text-slate-500'
                                                                            : 'bg-slate-200/60 text-slate-400'
                                                                            }`}>
                                                                            <User size={14} />
                                                                        </div>
                                                                        <span className={`font-medium ${slot.is_booked ? 'text-slate-700' : 'text-slate-400 italic'
                                                                            }`}>
                                                                            {slot.is_booked ? slot.teacher_name : 'شاغر'}
                                                                        </span>
                                                                    </div>
                                                                </td>

                                                                <td className="px-6 py-4">
                                                                    <div className={`flex items-center gap-2 ${slot.is_booked ? 'text-slate-600' : 'text-slate-400'
                                                                        }`}>
                                                                        {slot.is_booked ? (
                                                                            slot.type === 'Lecture' ? (
                                                                                <Video size={16} className="text-blue-500" />
                                                                            ) : (
                                                                                <Clock size={16} className="text-orange-500" />
                                                                            )
                                                                        ) : (
                                                                            <Clock size={16} className="text-slate-300" />
                                                                        )}
                                                                        <span className="truncate max-w-[200px]" title={slot.lecture_title}>
                                                                            {slot.is_booked ? (slot.lecture_title || 'حجز موعد') : '—'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-slate-600 text-sm">
                                                                    {slot.semester_name || <span className="text-slate-400">—</span>}
                                                                </td>
                                                                <td className="px-6 py-4 text-slate-600">
                                                                    <div className="flex flex-col gap-1">
                                                                        <span>{DAY_NAMES_AR[slot.day_of_week as number] ?? '—'}</span>
                                                                        {slot.type === 'Recurring' && (
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-600 border border-purple-100 w-fit">
                                                                                أسبوعي
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-slate-600 font-numeric">
                                                                    {slot.date ? format(new Date(slot.date), 'dd MMMM yyyy', { locale: ar }) : (
                                                                        <span className="text-slate-400">—</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium font-numeric">
                                                                        {slot.start_time} - {slot.end_time}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <StatusBadge status={slot.status} />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-slate-500 text-sm italic">
                                                لا توجد حصص مجدولة لهذا الفصل
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        available: 'bg-green-50 text-green-600 border-green-100',
        booked: 'bg-blue-50 text-blue-600 border-blue-100',
        pending: 'bg-amber-50 text-amber-600 border-amber-100',
        approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        rejected: 'bg-red-50 text-red-600 border-red-100',
    };

    const labels: Record<string, string> = {
        available: 'متاح',
        booked: 'محجوز',
        pending: 'قيد الانتظار',
        approved: 'مؤكد',
        rejected: 'مرفوض',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
            {labels[status] || status}
        </span>
    );
}
