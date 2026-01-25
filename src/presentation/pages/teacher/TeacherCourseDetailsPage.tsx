import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage, useAuth } from '../../hooks';
import { teacherService, TeacherCourse, getCourseName, getCourseDescription, TeacherCourseStudent } from '../../../data/api';
import { teacherLectureService } from '../../../data/api/teacherLectureService';
import { teacherContentApprovalService } from '../../../data/api/teacherContentApprovalService';
import { Unit, UnitLecture, CreateUnitRequest, UpdateUnitRequest } from '../../../types/unit';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

// Icons
import {
    ArrowRight,
    BookOpen,
    Users,
    Star,
    Clock,
    Settings,
    GraduationCap,
    Check,
    Play,
    Plus,
    MoreVertical,
    FileText,
    Download,
    Eye,
    Trash2,
    Edit2 as Edit,
    Video,
    X,
    AlertCircle,
    Calendar,
    User,
    Send,
    FileQuestion,
    Layers,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    Loader2,
} from 'lucide-react';

// Teacher Modals
import { TeacherAddLectureModal } from '../../components/teacher/courses/modals/TeacherAddLectureModal';
import { TeacherEditLectureModal } from '../../components/teacher/courses/modals/TeacherEditLectureModal';
import { TeacherEditCourseRequestModal } from '../../components/teacher/courses/modals/TeacherEditCourseRequestModal';
import { UnitFormModal } from '../../components/admin/units';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { CourseDetailsSkeleton } from '../../components/ui/CourseDetailsSkeleton';

// Teacher Unit Hooks
import {
    useTeacherCreateUnit,
    useTeacherUpdateUnit,
    useTeacherDeleteUnit,
} from '../../../hooks/useTeacherUnits';


// ==================== TYPES ====================

type TabId = 'lectures' | 'students' | 'quizzes' | 'settings';

interface CourseStats {
    students: number;
    lectures: number;
    rating: number;
    duration: string;
}

// ==================== HELPER COMPONENTS ====================

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/60">
            <div className="p-2 bg-shibl-crimson/10 rounded-lg">
                <Icon className="w-5 h-5 text-shibl-crimson" />
            </div>
            <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-lg font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );
}

// Helper to get localized title
const getLocalizedTitle = (title: string | { ar?: string; en?: string } | undefined): string => {
    if (!title) return 'بدون عنوان';
    if (typeof title === 'string') return title;
    return title.ar || title.en || 'بدون عنوان';
};

function UnitCard({
    unit,
    isExpanded,
    onToggle,
    onEditUnit,
    onDeleteUnit,
    onAddLecture,
    onEditLecture,
    onDeleteLecture,
}: {
    unit: Unit;
    isExpanded: boolean;
    onToggle: () => void;
    onEditUnit: () => void;
    onDeleteUnit: () => void;
    onAddLecture: () => void;
    onEditLecture: (lecture: UnitLecture) => void;
    onDeleteLecture: (lecture: UnitLecture) => void;
}) {
    const lectures = unit.lectures || [];
    const publishedCount = lectures.filter((l) => l.is_published).length;

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Unit Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-slate-50/80">
                <div
                    className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-slate-100/80 transition-colors -m-2 p-2 rounded-lg"
                    onClick={onToggle}
                >
                    <Layers className="w-5 h-5 text-shibl-crimson" />
                    <div>
                        <h4 className="font-semibold text-slate-900">{getLocalizedTitle(unit.title)}</h4>
                        <p className="text-sm text-slate-500">
                            {lectures.length} محاضرة • {publishedCount} منشور
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onEditUnit}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="تعديل الوحدة"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDeleteUnit}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف الوحدة"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={onToggle} className="p-2 text-slate-400 hover:text-slate-600">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Lectures List */}
            {isExpanded && (
                <div className="divide-y divide-slate-100">
                    {lectures.length === 0 ? (
                        <div className="px-5 py-6 text-center text-slate-400">
                            <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">لا توجد محاضرات في هذه الوحدة</p>
                        </div>
                    ) : (
                        lectures.map((lecture) => (
                            <div key={lecture.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                <div className="flex items-center justify-between px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <Video className="w-4 h-4 text-shibl-crimson" />
                                        <span className="text-slate-700">{getLocalizedTitle(lecture.title)}</span>
                                        {!lecture.is_published && (
                                            <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">مسودة</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => onEditLecture(lecture)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDeleteLecture(lecture)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {lecture.is_online && (
                                    <div className="px-5 pb-3">
                                        <LectureSessionControls lecture={lecture} />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {/* Add Lecture Button */}
                    <button
                        onClick={onAddLecture}
                        className="flex items-center gap-2 w-full px-5 py-3 text-sm text-shibl-crimson hover:bg-shibl-crimson/5 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إضافة محاضرة</span>
                    </button>
                </div>
            )}
        </div>
    );
}

// ==================== LECTURE SESSION CONTROLS ====================

function LectureSessionControls({ lecture }: { lecture: UnitLecture }) {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Auto-refresh timer: forces re-render every 30 seconds to update time-based status
    // This fixes the "Mobile Timer Discrepancy" issue where UI doesn't update without refresh
    const [, setTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1); // Force re-render
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, []);

    // Calculate session status based on time
    const getSessionStatus = () => {
        const now = new Date();
        const startTime = lecture.start_time ? new Date(lecture.start_time) : null;
        const endTime = lecture.end_time ? new Date(lecture.end_time) : null;

        if (!startTime || !endTime) {
            return { status: 'no_time', canStart: true }; // No time limits defined
        }

        // Allow starting 15 minutes before scheduled time
        const earliestStart = new Date(startTime.getTime() - 15 * 60 * 1000);

        if (now < earliestStart) {
            return { status: 'pending', canStart: false, startsAt: startTime };
        }

        if (now > endTime) {
            return { status: 'expired', canStart: false, endedAt: endTime };
        }

        return { status: 'active', canStart: true, endsAt: endTime };
    };

    const sessionState = getSessionStatus();

    const handleStartSession = async () => {
        try {
            setIsLoading(true);
            const response = await teacherLectureService.startSession(lecture.id);

            if (response.success) {
                navigate(`/classroom/${lecture.id}`);
            } else {
                toast.error(response.message || 'فشل في بدء الجلسة');
            }
        } catch (error: any) {
            console.error('Start session error:', error);
            toast.error(error.response?.data?.message || 'خطأ في الاتصال بالخادم');
        } finally {
            setIsLoading(false);
        }
    };

    // Render based on session status
    if (sessionState.status === 'expired') {
        return (
            <div className="flex items-center gap-3 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        انتهت فترة الجلسة
                    </p>
                </div>
                <span className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-lg">
                    منتهية
                </span>
            </div>
        );
    }

    if (sessionState.status === 'pending') {
        const timeUntil = sessionState.startsAt ? new Date(sessionState.startsAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '';
        return (
            <div className="flex items-center gap-3 mt-2 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                <div className="flex-1">
                    <p className="text-xs text-amber-700 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        موعد البدء: {timeUntil}
                    </p>
                </div>
                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg">
                    قريباً
                </span>
            </div>
        );
    }

    // Active session window
    const endsAt = sessionState.endsAt ? new Date(sessionState.endsAt) : null;
    const now = new Date();
    const minutesRemaining = endsAt ? Math.max(0, Math.floor((endsAt.getTime() - now.getTime()) / 60000)) : null;
    const isLowTime = minutesRemaining !== null && minutesRemaining <= 5;

    return (
        <div className={`flex items-center gap-3 mt-2 p-2 rounded-lg border ${isLowTime ? 'bg-orange-50/50 border-orange-200' : 'bg-blue-50/50 border-blue-100'}`}>
            <div className="flex-1">
                <p className={`text-xs font-medium flex items-center gap-1 ${isLowTime ? 'text-orange-700' : 'text-blue-700'}`}>
                    <Video className="w-3 h-3" />
                    محاضرة مباشرة
                    {lecture.start_time && (
                        <span className="text-slate-500 font-normal">
                            - {new Date(lecture.start_time).toLocaleString('ar-EG')}
                        </span>
                    )}
                </p>
                {/* Late Joiner Warning: Show remaining time */}
                {minutesRemaining !== null && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${isLowTime ? 'text-orange-600 font-medium' : 'text-slate-500'}`}>
                        <Clock className="w-3 h-3" />
                        {isLowTime ? (
                            <>⚠️ تبقى {minutesRemaining} دقيقة فقط قبل انتهاء الجلسة!</>
                        ) : (
                            <>تبقى {minutesRemaining} دقيقة</>
                        )}
                    </p>
                )}
            </div>
            <button
                onClick={handleStartSession}
                disabled={isLoading}
                className={`flex items-center gap-2 px-3 py-1.5 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-colors ${isLowTime ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                بدء البث
            </button>
        </div>
    );
}

// ==================== MAIN COMPONENT ====================

export default function TeacherCourseDetailsPage() {
    const { id: courseIdParam } = useParams<{ id: string }>();
    const courseId = Number(courseIdParam);
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user } = useAuth();

    // State
    const [activeTab, setActiveTab] = useState<TabId>('lectures');
    const [course, setCourse] = useState<TeacherCourse | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());
    const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
    const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

    // Modal states - Lectures
    const [showAddLecture, setShowAddLecture] = useState(false);
    const [showEditLecture, setShowEditLecture] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [selectedLecture, setSelectedLecture] = useState<UnitLecture | null>(null);

    // Modal states - Edit Request
    const [showEditRequestModal, setShowEditRequestModal] = useState(false);

    // Modal states - Units
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);
    const [deletingLecture, setDeletingLecture] = useState<UnitLecture | null>(null);

    // Unit mutations
    const createUnit = useTeacherCreateUnit();
    const updateUnit = useTeacherUpdateUnit();
    const deleteUnit = useTeacherDeleteUnit();

    // Fetch course data
    const fetchCourse = useCallback(async () => {
        if (!courseId) return;
        setIsLoading(true);
        setError(null);

        try {
            const courseData = await teacherService.getCourse(courseId);
            setCourse(courseData);

            // Fetch units
            const unitsResponse = await teacherService.getUnits(courseId);
            setUnits(unitsResponse.data || []);

            // Fetch pending approval count
            try {
                // Using generic pending count if teacherContentApprovalService is avail
                // Pending count logic might exist in multiple places now, consolidation needed later
                const count = await teacherContentApprovalService.getPendingCount(courseId);
                // Also could fetch regular edits pending count?
                // setPendingApprovalCount(count); 
                // For now keeping existing pending approval logic if it relates to other content

            } catch (e) {
                // ignore
            }
        } catch (err) {
            console.error('Error fetching course:', err);
            setError('فشل في تحميل بيانات الكورس');
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    // Real-time updates
    useEffect(() => {
        if (!user?.id) return;

        const handleNotification = (event: any) => {
            console.log('Real-time update received:', event);
            // Refresh course data on any content decision
            fetchCourse();
        };

        import('../../../services/websocket').then(({ subscribeToTeacherChannel, unsubscribeFromTeacherChannel }) => {
            subscribeToTeacherChannel(Number(user.id), handleNotification);
        });

        return () => {
            import('../../../services/websocket').then(({ unsubscribeFromTeacherChannel }) => {
                unsubscribeFromTeacherChannel(Number(user.id));
            });
        };
    }, [user?.id, fetchCourse]);

    // Students State
    const [students, setStudents] = useState<TeacherCourseStudent[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);

    // Fetch students when tab is active
    const fetchStudents = useCallback(async () => {
        if (activeTab !== 'students') return;

        setStudentsLoading(true);
        try {
            const response = await teacherService.getCourseStudents(courseId); // Changed parseInt(id!) to courseId
            if (response.success) {
                setStudents(response.data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setStudentsLoading(false);
        }
    }, [activeTab, courseId]); // Changed id to courseId

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // Derived stats
    const stats = useMemo<CourseStats>(() => ({
        students: students.length > 0 ? students.length : (course?.students_count || 0),
        lectures: course?.lectures_count || 0,
        rating: 4.5, // Mock rating
        duration: '0 دقيقة', // Mock duration until we calculate real total
    }), [course, students.length]);

    // Bulk approval logic removed in favor of granular edit requests
    // Future implementation will handle unit/lecture publish requests individually

    // Toggle unit expansion
    const toggleUnit = (unitId: number) => {
        setExpandedUnits((prev) => {
            const next = new Set(prev);
            if (next.has(unitId)) {
                next.delete(unitId);
            } else {
                next.add(unitId);
            }
            return next;
        });
    };

    // ==================== UNIT HANDLERS ====================

    const handleAddUnit = () => {
        setEditingUnit(null);
        setShowUnitModal(true);
    };

    const handleEditUnit = (unit: Unit) => {
        setEditingUnit(unit);
        setShowUnitModal(true);
    };

    const handleDeleteUnitClick = (unit: Unit) => {
        setDeletingUnit(unit);
    };

    const handleConfirmDeleteUnit = async () => {
        if (deletingUnit) {
            try {
                await deleteUnit.mutateAsync({
                    courseId,
                    unitId: deletingUnit.id,
                });
                toast.success('تم حذف الوحدة');
                setDeletingUnit(null);
                fetchCourse();
            } catch (err) {
                console.error('Error deleting unit:', err);
                toast.error('فشل في حذف الوحدة');
            }
        }
    };

    const handleUnitFormSubmit = async (data: CreateUnitRequest | UpdateUnitRequest) => {
        try {
            if (editingUnit) {
                await updateUnit.mutateAsync({
                    courseId,
                    unitId: editingUnit.id,
                    data: data as UpdateUnitRequest,
                });
                toast.success('تم تحديث الوحدة');
            } else {
                // New Phase 6 Logic: Submit Request for Creation
                await teacherContentApprovalService.submitApprovalRequest({
                    approvable_type: 'course',
                    approvable_id: courseId,
                    action: 'create_unit',
                    payload: data as any,
                });
                // await createUnit.mutateAsync({
                //     courseId,
                //     data: data as CreateUnitRequest,
                // });
                toast.success('تم إرسال طلب إضافة الوحدة للمراجعة');
            }
            setShowUnitModal(false);
            setEditingUnit(null);
            fetchCourse();
        } catch (err) {
            console.error('Error saving unit:', err);
            toast.error('فشل في حفظ الوحدة');
        }
    };

    // ==================== LECTURE HANDLERS ====================

    const handleAddLecture = (unit: Unit) => {
        setSelectedUnit(unit);
        setShowAddLecture(true);
    };

    const handleEditLecture = (lecture: UnitLecture) => {
        setSelectedLecture(lecture);
        setShowEditLecture(true);
    };

    const handleDeleteLectureClick = (lecture: UnitLecture) => {
        setDeletingLecture(lecture);
    };

    const handleConfirmDeleteLecture = async () => {
        if (deletingLecture) {
            try {
                await teacherLectureService.deleteLecture(deletingLecture.id);
                toast.success('تم حذف المحاضرة');
                setDeletingLecture(null);
                fetchCourse();
            } catch (err) {
                console.error('Error deleting lecture:', err);
                toast.error('فشل في حذف المحاضرة');
            }
        }
    };

    const handleLectureSaved = () => {
        setShowAddLecture(false);
        setShowEditLecture(false);
        setSelectedUnit(null);
        setSelectedLecture(null);
        fetchCourse();
    };

    // Tabs
    const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
        { id: 'lectures', label: 'المحاضرات', icon: BookOpen },
        { id: 'students', label: 'الطلاب', icon: Users },
        { id: 'quizzes', label: 'الاختبارات', icon: FileQuestion },
        { id: 'settings', label: 'الإعدادات', icon: Settings },
    ];

    // Loading state
    if (isLoading) {
        return <CourseDetailsSkeleton />;
    }

    // Error state
    if (error || !course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-slate-600">{error || 'الكورس غير موجود'}</p>
                <button
                    onClick={() => navigate('/teacher/courses')}
                    className="px-4 py-2 bg-shibl-crimson text-white rounded-lg hover:bg-shibl-crimson/90"
                >
                    العودة للكورسات
                </button>
            </div>
        );
    }

    const courseName = getCourseName(course.name);
    const courseDescription = getCourseDescription(course.description);


    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/teacher/courses')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowRight className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{courseName}</h1>
                        <p className="text-sm text-slate-500 line-clamp-1">{courseDescription}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {pendingApprovalCount > 0 && (
                        <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm rounded-full flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {pendingApprovalCount} طلب قيد الانتظار
                        </span>
                    )}


                    <button
                        onClick={fetchCourse}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="تحديث"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Users} label="الطلاب" value={stats.students} />
                <StatCard icon={BookOpen} label="المحاضرات" value={stats.lectures} />
                <StatCard icon={Star} label="التقييم" value={stats.rating} />
                <StatCard icon={Clock} label="المدة" value={stats.duration} />
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                                ${activeTab === tab.id
                                    ? 'border-shibl-crimson text-shibl-crimson'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }
                            `}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {/* Lectures Tab */}
                {activeTab === 'lectures' && (
                    <div className="space-y-4">
                        {/* Add Unit Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleAddUnit}
                                className="flex items-center gap-2 px-4 py-2 bg-shibl-crimson text-white rounded-lg hover:bg-shibl-crimson/90 transition-colors shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                إضافة وحدة
                            </button>
                        </div>

                        {units.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <Layers className="w-12 h-12 text-slate-300 mb-4" />
                                <p className="text-slate-500 mb-4">لم يتم إضافة وحدات بعد</p>
                                <button
                                    onClick={handleAddUnit}
                                    className="flex items-center gap-2 px-4 py-2 bg-shibl-crimson text-white rounded-lg hover:bg-shibl-crimson/90"
                                >
                                    <Plus className="w-4 h-4" />
                                    إضافة أول وحدة
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {units.map((unit) => (
                                    <UnitCard
                                        key={unit.id}
                                        unit={unit}
                                        isExpanded={expandedUnits.has(unit.id)}
                                        onToggle={() => toggleUnit(unit.id)}
                                        onEditUnit={() => handleEditUnit(unit)}
                                        onDeleteUnit={() => handleDeleteUnitClick(unit)}
                                        onAddLecture={() => handleAddLecture(unit)}
                                        onEditLecture={handleEditLecture}
                                        onDeleteLecture={handleDeleteLectureClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Students Tab */}
                {/* Students Tab */}
                {activeTab === 'students' && (
                    <div className="bg-white rounded-[16px] shadow-sm border border-slate-200 overflow-hidden">
                        {studentsLoading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Loader2 className="w-10 h-10 text-shibl-crimson animate-spin mb-4" />
                                <p className="text-slate-500">جاري تحميل قائمة الطلاب...</p>
                            </div>
                        ) : students.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الطالب</th>
                                            <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">البريد الإلكتروني / الهاتف</th>
                                            <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">تاريخ الاشتراك</th>
                                            <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {students.map((student) => (
                                            <tr key={student.subscription_id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                            {student.avatar ? (
                                                                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="w-5 h-5 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <span className="font-semibold text-charcoal">{student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-charcoal mb-0.5">{student.email}</span>
                                                        <span className="text-xs text-slate-500">{student.phone || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        <span>{student.subscribed_at}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                        نشط
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16">
                                <GraduationCap className="w-16 h-16 text-slate-200 mb-4" />
                                <h3 className="text-lg font-bold text-slate-700 mb-2">لا يوجد طلاب مشتركين</h3>
                                <p className="text-slate-500 text-center max-w-sm">
                                    لم يقم أي طالب بالاشتراك في هذه الدورة حتى الآن.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Quizzes Tab */}
                {activeTab === 'quizzes' && (
                    <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <FileQuestion className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-slate-500">إدارة اختبارات الكورس</p>
                        <p className="text-sm text-slate-400 mt-2">قريباً - سيتم إضافة إمكانية إنشاء وإدارة الاختبارات</p>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                <Settings className="w-5 h-5 text-slate-400" />
                                <h3 className="font-semibold text-slate-900">إعدادات الكورس</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-slate-600">اسم الكورس</span>
                                    <span className="font-medium text-slate-900">{courseName}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-t border-slate-100">
                                    <span className="text-slate-600">السعر</span>
                                    <span className="font-medium text-slate-900">{course.price} ج.م</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-t border-slate-100">
                                    <span className="text-slate-600">الحالة</span>
                                    <span
                                        className={`px-2 py-1 text-sm rounded-full ${course.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}
                                    >
                                        {course.is_active ? 'نشط' : 'مسودة'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    لتعديل معلومات الكورس الأساسية، يرجى التواصل مع الإدارة
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ==================== MODALS ==================== */}

            {/* Add Lecture Modal */}
            {showAddLecture && selectedUnit && (
                <TeacherAddLectureModal
                    isOpen={showAddLecture}
                    onClose={() => {
                        setShowAddLecture(false);
                        setSelectedUnit(null);
                    }}
                    onSuccess={handleLectureSaved}
                    courseId={courseId}
                    courseName={courseName}
                    teacherId={typeof user?.id === 'number' ? user.id : 0}
                    initialUnitId={selectedUnit.id}
                    units={units}
                />
            )}

            {/* Edit Lecture Modal */}
            {showEditLecture && selectedLecture && (
                <TeacherEditLectureModal
                    isOpen={showEditLecture}
                    onClose={() => {
                        setShowEditLecture(false);
                        setSelectedLecture(null);
                    }}
                    onSuccess={handleLectureSaved}
                    courseName={courseName}
                    lecture={{
                        id: selectedLecture.id,
                        title: selectedLecture.title,
                        description: selectedLecture.description,
                        course_id: courseId,
                        unit_id: selectedLecture.unit_id ?? undefined,
                        teacher_id: typeof user?.id === 'number' ? user.id : 0,
                        recording_path: selectedLecture.video_url,
                        is_online: selectedLecture.is_online ?? false,
                        start_time: selectedLecture.start_time,
                        end_time: selectedLecture.end_time,
                    }}
                    units={units}
                />
            )}

            {/* Unit Form Modal */}
            <UnitFormModal
                isOpen={showUnitModal}
                onClose={() => {
                    setShowUnitModal(false);
                    setEditingUnit(null);
                }}
                onSubmit={handleUnitFormSubmit}
                unit={editingUnit}
                isSubmitting={createUnit.isPending || updateUnit.isPending}
            />

            {/* Delete Unit Confirmation */}
            <DeleteConfirmModal
                isOpen={!!deletingUnit}
                title="حذف الوحدة"
                message="هل أنت متأكد من حذف هذه الوحدة؟ سيتم حذف جميع المحاضرات المرتبطة بها."
                itemName={deletingUnit ? getLocalizedTitle(deletingUnit.title) : undefined}
                onConfirm={handleConfirmDeleteUnit}
                onClose={() => setDeletingUnit(null)}
            />

            {/* Delete Lecture Confirmation */}
            <DeleteConfirmModal
                isOpen={!!deletingLecture}
                title="حذف المحاضرة"
                message="هل أنت متأكد من حذف هذه المحاضرة؟"
                itemName={deletingLecture ? getLocalizedTitle(deletingLecture.title) : undefined}
                onConfirm={handleConfirmDeleteLecture}
                onClose={() => setDeletingLecture(null)}
            />
        </div>
    );
}
