
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage, useAuth } from '../../hooks';
import { teacherService, getCourseName, getCourseDescription, type TeacherCourse, type TeacherCourseStudent } from '../../../data/api';
import { teacherLectureService } from '../../../data/api/teacherLectureService';
import { teacherContentApprovalService } from '../../../data/api/teacherContentApprovalService';
import type { Unit, CreateUnitRequest, UpdateUnitRequest, UnitLecture } from '../../../types/unit';
import { quizService, type Quiz } from '../../../data/api/quizService';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

// Icons
import {
    ArrowRight,
    BookOpen,
    Users,

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
    EyeOff,
    Trash2,
    Edit2,
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
    GripVertical,
    HelpCircle,
    PlayCircle
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    useDraggable,
    useDroppable,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Components
import { TeacherAddLectureModal } from '../../components/teacher/courses/modals/TeacherAddLectureModal';
import { TeacherEditLectureModal } from '../../components/teacher/courses/modals/TeacherEditLectureModal';
import { UnitFormModal } from '../../components/admin/units/UnitFormModal';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

// Tabs
import { CourseQuizzesTab } from '../../components/teacher/courses/CourseQuizzesTab';
import { CreateQuizModal } from '../../components/teacher/CreateQuizModal';
import { useMutation } from '@tanstack/react-query';
import { CourseDetailsSkeleton } from '../../components/ui/skeletons/CourseDetailsSkeleton';
import { formatTime, formatShortDate } from '../../../utils/timeUtils';
import { LiveSessionEmbedModal } from '../../components/shared/LiveSessionEmbedModal';


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

const getQuizStatusStyle = (status: string) => {
    switch (status) {
        case 'published':
        case 'approved':
            return {
                label: 'معتمد',
                bgClass: 'bg-emerald-100',
                textClass: 'text-emerald-700'
            };
        case 'pending':
            return {
                label: 'قيد المراجعة',
                bgClass: 'bg-amber-100',
                textClass: 'text-amber-700'
            };
        case 'rejected':
            return {
                label: 'مرفوض',
                bgClass: 'bg-rose-100',
                textClass: 'text-rose-700'
            };
        default:
            return {
                label: 'مسودة',
                bgClass: 'bg-slate-100',
                textClass: 'text-slate-600'
            };
    }
};

// Helper to get localized title
const getLocalizedTitle = (title: string | { ar?: string; en?: string } | undefined): string => {
    if (!title) return 'بدون عنوان';
    if (typeof title === 'string') return title;
    return title.ar || title.en || 'بدون عنوان';
};

// Draggable Unassigned Quiz Wrapper
function DraggableUnassignedQuiz({ quiz, children }: { quiz: Quiz, children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `unassigned-quiz-${quiz.id}`,
        data: {
            type: 'unassigned-quiz',
            quiz
        }
    });

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.8 : 1,
        position: 'relative' as 'relative',
        touchAction: 'none'
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {children}
        </div>
    );
}

// Sortable Unit Wrapper
function SortableUnit({ unit, ...props }: { unit: Unit } & any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: unit.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as 'relative',
    };

    return (
        <div ref={setNodeRef} style={style}>
            <UnitCard
                unit={unit}
                {...props}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
}

// Sortable Content Item Wrapper (Lecture or Quiz)
function SortableContentItem({ id, item, type, renderItem }: { id: string, item: any, type: 'lecture' | 'quiz', renderItem: (item: any) => React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as 'relative',
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div className="flex items-center gap-2">
                <div
                    className="p-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical size={16} />
                </div>
                <div className="flex-1">
                    {renderItem(item)}
                </div>
            </div>
        </div>
    );
}

function UnitCard({
    unit,
    isExpanded,
    onToggle,
    onEditUnit,
    onDeleteUnit,
    onAddLecture,
    onEditLecture,
    onDeleteLecture,
    onAddQuizToUnit,
    onAddQuizToLecture,
    onEditQuiz,
    onDeleteQuiz,
    onToggleQuizActive,
    onStartSession,
    onEndSession,
    quizzes,
    dragHandleProps
}: {
    unit: Unit;
    isExpanded: boolean;
    onToggle: () => void;
    onEditUnit: () => void;
    onDeleteUnit: () => void;
    onAddLecture: () => void;
    onEditLecture: (lecture: any) => void;
    onDeleteLecture: (lecture: any) => void;
    onAddQuizToUnit: () => void;
    onAddQuizToLecture: (lecture: any) => void;
    onEditQuiz: (quiz: Quiz) => void;
    onDeleteQuiz: (quiz: Quiz) => void;
    onToggleQuizActive: (quiz: Quiz) => void;

    onStartSession?: (lectureId: number) => void;
    onEndSession?: (lectureId: number) => void;
    quizzes?: Quiz[];
    dragHandleProps?: any;
}) {
    const { isRTL } = useLanguage();

    // Make Unit Droppable
    const { setNodeRef, isOver } = useDroppable({
        id: `unit-${unit.id}`,
        data: {
            type: 'unit',
            unit
        }
    });

    // Combine lectures and quizzes (if available in unit)
    // Filter out quizzes that serve as nested content for lectures to avoid duplication
    const allUnitQuizzes = unit.quizzes || (quizzes?.filter(q => q.unit_id == unit.id) || []);
    const unitQuizzes = allUnitQuizzes.filter(q => !q.lecture_id);

    // Merge lectures and quizzes for sorting
    // We add a 'sortType' and 'uniqueId' to handle DND
    const mixedContent = [
        ...(unit.lectures || []).map((l: any) => ({ ...l, sortType: 'lecture', uniqueId: `l-${l.id}`, order: l.order || 0 })),
        ...unitQuizzes.map((q: any) => ({ ...q, sortType: 'quiz', uniqueId: `q-${q.id}`, order: q.order || 0 }))
    ].sort((a, b) => (a.order || 0) - (b.order || 0));

    const [items, setItems] = useState(mixedContent);

    // Sync state when props change
    useEffect(() => {
        setItems(mixedContent);
    }, [unit, quizzes]); // Added quizzes dependency

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = items.findIndex((item) => item.uniqueId === active.id);
            const newIndex = items.findIndex((item) => item.uniqueId === over?.id);

            const newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems); // Optimistic update of local state

            // Prepare payload
            const payload = newItems.map(item => ({
                id: item.id,
                type: item.sortType as 'lecture' | 'quiz'
            }));

            try {
                await teacherService.reorderContent(unit.course_id, unit.id, payload);
                toast.success('تم تحديث الترتيب');
            } catch (e) {
                console.error('Reorder content failed', e);
                toast.error('فشل حفظ الترتيب');
                setItems(mixedContent); // Revert
            }
        }
    };

    return (
        <div
            ref={setNodeRef}
            className={`bg-white rounded-xl border transition-all shadow-sm ${isOver ? 'border-shibl-crimson ring-2 ring-shibl-crimson/20 bg-red-50/10' : 'border-slate-200'} overflow-hidden`}
        >
            {/* Unit Header */}
            <div
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                onClick={onToggle}
            >
                <div className="flex items-center gap-3 flex-1">
                    <div
                        className="p-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
                        onClick={(e) => e.stopPropagation()}
                        {...dragHandleProps}
                    >
                        <GripVertical size={20} />
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-shibl-crimson/10 flex items-center justify-center text-shibl-crimson">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900">{getLocalizedTitle(unit.title)}</h4>
                        <p className="text-sm text-slate-500">
                            {unit.lectures?.length || 0} محاضرة • {unitQuizzes.length || 0} اختبار
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={onAddLecture}
                        className="p-2 text-slate-400 hover:text-shibl-crimson transition-colors"
                        title="إضافة محاضرة"
                    >
                        <Video size={18} />
                    </button>
                    <button
                        onClick={onAddQuizToUnit}
                        className="p-2 text-slate-400 hover:text-shibl-crimson transition-colors"
                        title="إضافة اختبار"
                    >
                        <HelpCircle size={18} />
                    </button>
                    <button onClick={onEditUnit} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit2 size={18} />
                    </button>
                    <button onClick={onDeleteUnit} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                    </button>
                    {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={items.map(i => i.uniqueId)}
                            strategy={verticalListSortingStrategy}
                        >
                            {items.length === 0 && (
                                <div className="text-center py-8 text-slate-400 bg-white rounded-lg border border-dashed border-slate-200">
                                    لا يوجد محتوى في هذه الوحدة
                                </div>
                            )}

                            {items.map((item) => (
                                <SortableContentItem
                                    key={item.uniqueId}
                                    id={item.uniqueId}
                                    item={item}
                                    type={item.sortType}
                                    renderItem={(contentItem) => {
                                        if (item.sortType === 'lecture') {
                                            // Render Lecture
                                            return (
                                                <div className="flex flex-col gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:shadow-sm transition-shadow">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${contentItem.is_online ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                                {contentItem.is_online ? <Video size={16} /> : <PlayCircle size={16} />}
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-medium text-slate-900">{getLocalizedTitle(contentItem.title)}</h5>
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                        {contentItem.is_pending_approval ? (
                                                                            <span className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                                                                                قيد المراجعة
                                                                            </span>
                                                                        ) : (
                                                                            <span className={contentItem.is_published ? 'text-green-600' : 'text-slate-400'}>
                                                                                {contentItem.is_published ? 'منشور' : 'مسودة'}
                                                                            </span>
                                                                        )}
                                                                        {!contentItem.is_pending_approval && contentItem.duration_minutes > 0 && <span>• {contentItem.duration_minutes} دقيقة</span>}
                                                                    </div>
                                                                    {contentItem.is_online && (contentItem.start_time || contentItem.time_slot) && (() => {
                                                                        // Use time_slot times as fallback when lecture times aren't set
                                                                        const displayStartTime = contentItem.start_time || contentItem.time_slot?.start_time;
                                                                        const displayEndTime = contentItem.end_time || contentItem.time_slot?.end_time;
                                                                        const slotStatus = contentItem.time_slot?.status;

                                                                        if (!displayStartTime) return null;

                                                                        return (
                                                                            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium flex-wrap">
                                                                                <Calendar size={12} />
                                                                                <span>
                                                                                    {formatShortDate(displayStartTime)} • {formatTime(displayStartTime)}
                                                                                    {displayEndTime && ` - ${formatTime(displayEndTime)}`}
                                                                                </span>
                                                                                {/* Time Slot Status Badge */}
                                                                                {slotStatus && (
                                                                                    <span className={`mr-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${slotStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                                                                        slotStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                                                            slotStatus === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                                                                                'bg-slate-100 text-slate-600'
                                                                                        }`}>
                                                                                        {slotStatus === 'approved' ? 'مجدول ✓' :
                                                                                            slotStatus === 'pending' ? 'قيد الانتظار' :
                                                                                                slotStatus === 'rejected' ? 'مرفوض' : ''}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {!contentItem.is_pending_approval && contentItem.is_online && (
                                                                (() => {
                                                                    const now = new Date();
                                                                    const startTime = contentItem.start_time ? new Date(contentItem.start_time) : null;
                                                                    const endTime = contentItem.end_time ? new Date(contentItem.end_time) : null;

                                                                    // Allow starting 15 mins before
                                                                    const canStart = startTime ? new Date(startTime.getTime() - 15 * 60000) <= now : true;
                                                                    const isEnded = endTime ? now > endTime : false;

                                                                    if (isEnded) {
                                                                        // Check if recording is available
                                                                        const hasRecording = contentItem.has_recording || contentItem.recording_url || contentItem.video_path;

                                                                        return (
                                                                            <div className="flex items-center gap-1">
                                                                                {hasRecording ? (
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            const url = contentItem.recording_url || contentItem.video_path;
                                                                                            if (url) window.open(url, '_blank');
                                                                                        }}
                                                                                        className="px-2 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors flex items-center gap-1 mr-1"
                                                                                        title="مشاهدة التسجيل"
                                                                                    >
                                                                                        <PlayCircle size={14} />
                                                                                        <span>مشاهدة التسجيل</span>
                                                                                    </button>
                                                                                ) : (
                                                                                    <span className="px-2 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-md flex items-center gap-1 mr-1">
                                                                                        <Clock size={14} />
                                                                                        <span>منتهية</span>
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    }

                                                                    if (!canStart && startTime) {
                                                                        return (
                                                                            <span className="px-2 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 rounded-md flex items-center gap-1 mr-1" title={`يبدأ في ${formatTime(contentItem.start_time)}`}>
                                                                                <Clock size={14} />
                                                                                <span>لم يبدأ بعد</span>
                                                                            </span>
                                                                        );
                                                                    }

                                                                    return (
                                                                        <div className="flex items-center gap-1">
                                                                            <button
                                                                                onClick={() => onStartSession && onStartSession(contentItem.id)}
                                                                                className="px-2 py-1.5 text-xs font-medium text-white bg-shibl-crimson hover:bg-shibl-crimson/90 rounded-md transition-colors flex items-center gap-1 shadow-sm mr-1"
                                                                                title="الانضمام للبث المباشر"
                                                                            >
                                                                                <Video size={14} />
                                                                                <span>الانضمام</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => onEndSession && onEndSession(contentItem.id)}
                                                                                className="px-2 py-1.5 text-xs font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-md transition-colors flex items-center gap-1 shadow-sm mr-1 border border-rose-200"
                                                                                title="إنهاء البث"
                                                                            >
                                                                                <X size={14} />
                                                                                <span>إنهاء</span>
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })()
                                                            )}
                                                            {!contentItem.is_pending_approval && (
                                                                <>
                                                                    <button onClick={() => onAddQuizToLecture(contentItem)} className="p-1.5 text-slate-400 hover:text-shibl-crimson rounded-md" title="إضافة اختبار للمحاضرة">
                                                                        <HelpCircle size={16} />
                                                                    </button>
                                                                    <button onClick={() => onEditLecture(contentItem)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md">
                                                                        <Edit2 size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                onClick={() => onDeleteLecture(contentItem)}
                                                                className={`p-1.5 rounded-md ${contentItem.is_pending_approval ? 'text-rose-500 hover:bg-rose-50' : 'text-slate-400 hover:text-red-600'}`}
                                                                title={contentItem.is_pending_approval ? 'إلغاء الطلب' : 'حذف المحاضرة'}
                                                            >
                                                                {contentItem.is_pending_approval ? <X size={16} /> : <Trash2 size={16} />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Nested Quizzes in Lecture */}
                                                    {quizzes?.filter(q => q.lecture_id === contentItem.id).map(quiz => (
                                                        <div key={quiz.id} className="mr-8 mt-2 flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 border-r-4 border-r-amber-500">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-6 h-6 rounded bg-amber-100 text-amber-600 flex items-center justify-center">
                                                                    <HelpCircle size={14} />
                                                                </div>
                                                                <div>
                                                                    <h6 className="text-xs font-semibold text-slate-800">{getLocalizedTitle(quiz.name)}</h6>
                                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                                        <span className={`px-1 py-0.5 rounded text-[9px] ${quiz.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                            quiz.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                                                'bg-slate-100 text-slate-600'
                                                                            }`}>
                                                                            {quiz.status === 'approved' ? 'معتمد' :
                                                                                quiz.status === 'pending' ? 'قيد المراجعة' : 'مسودة'}
                                                                        </span>
                                                                        <span>• {quiz.questions_count || 0} أسئلة</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => (quiz.status || 'draft') !== 'draft' && onToggleQuizActive(quiz)}
                                                                    disabled={!quiz.status || quiz.status === 'draft'}
                                                                    className={`p-1 rounded-md transition-colors ${(!quiz.status || quiz.status === 'draft')
                                                                        ? 'text-slate-300 cursor-not-allowed hidden'
                                                                        : quiz.is_active
                                                                            ? 'text-emerald-500 hover:text-emerald-700'
                                                                            : 'text-slate-400 hover:text-slate-600'
                                                                        }`}
                                                                    title={(!quiz.status || quiz.status === 'draft') ? undefined : (quiz.is_active ? 'إيقاف الاختبار' : 'تفعيل الاختبار')}
                                                                >
                                                                    {(!quiz.status || quiz.status === 'draft') ? <EyeOff size={14} className="opacity-50" /> : (quiz.is_active ? <Eye size={14} /> : <EyeOff size={14} />)}
                                                                </button>
                                                                <button onClick={() => onEditQuiz(quiz)} className="p-1 text-slate-400 hover:text-blue-600 rounded-md">
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button onClick={() => onDeleteQuiz(quiz)} className="p-1 text-slate-400 hover:text-red-600 rounded-md">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        } else {
                                            // Render Quiz
                                            return (
                                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:shadow-sm transition-shadow border-l-4 border-l-amber-500">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                                            <HelpCircle size={16} />
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-medium text-slate-900">{getLocalizedTitle(contentItem.name)}</h5>
                                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${contentItem.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                    contentItem.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                                        'bg-slate-100 text-slate-600'
                                                                    }`}>
                                                                    {contentItem.status === 'approved' ? 'معتمد' :
                                                                        contentItem.status === 'pending' ? 'قيد المراجعة' : 'مسودة'}
                                                                </span>
                                                                <span>• {contentItem.questions_count || 0} أسئلة</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => (contentItem.status || 'draft') !== 'draft' && onToggleQuizActive(contentItem)}
                                                            disabled={!contentItem.status || contentItem.status === 'draft'}
                                                            className={`p-1.5 rounded-md transition-colors ${(!contentItem.status || contentItem.status === 'draft')
                                                                ? 'text-slate-300 cursor-not-allowed hidden'
                                                                : contentItem.is_active
                                                                    ? 'text-emerald-500 hover:text-emerald-700'
                                                                    : 'text-slate-400 hover:text-slate-600'
                                                                }`}
                                                            title={(!contentItem.status || contentItem.status === 'draft') ? undefined : (contentItem.is_active ? 'إيقاف الاختبار' : 'تفعيل الاختبار')}
                                                        >
                                                            {(!contentItem.status || contentItem.status === 'draft') ? <EyeOff size={16} className="opacity-50" /> : (contentItem.is_active ? <Eye size={16} /> : <EyeOff size={16} />)}
                                                        </button>
                                                        <button onClick={() => onEditQuiz(contentItem)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => onDeleteQuiz(contentItem)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    }}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </div>
    );
}



export function TeacherCourseDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const courseId = parseInt(id || '0');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isRTL } = useLanguage();

    // State
    const [course, setCourse] = useState<TeacherCourse | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'content' | 'students' | 'quizzes' | 'settings'>('content');

    // Content State
    const [units, setUnits] = useState<Unit[]>([]);
    const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]); // All quizzes for the course
    const [expandedUnits, setExpandedUnits] = useState<number[]>([]);

    // Modal States
    const [showAddLecture, setShowAddLecture] = useState(false);
    const [showEditLecture, setShowEditLecture] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [selectedLecture, setSelectedLecture] = useState<any | null>(null);
    const [deletingLecture, setDeletingLecture] = useState<any | null>(null);

    // Unit Modal States
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);

    // Quiz Modal States
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [quizContextUnit, setQuizContextUnit] = useState<Unit | null>(null);
    const [quizContextLecture, setQuizContextLecture] = useState<any | null>(null);
    const [startingTestSession, setStartingTestSession] = useState(false);
    const [selectedQuizForEdit, setSelectedQuizForEdit] = useState<Quiz | null>(null);

    // Live Session Modal States
    const [liveSessionEmbedUrl, setLiveSessionEmbedUrl] = useState<string | null>(null);
    const [isLiveSessionModalOpen, setIsLiveSessionModalOpen] = useState(false);

    // Fetch Course Data
    const fetchCourseData = useCallback(async () => {
        if (!courseId) return;

        try {
            setLoading(true);
            const courseData = await teacherService.getCourse(courseId);
            setCourse(courseData);

            // Fetch Pending Approvals (Parallel)
            let pendingLectures: any[] = [];
            try {
                // We assume approvals for creating lectures are attached to the Course
                // approvable_type="Modules\Courses\App\Models\Course" (or however backend expects it, usually simple 'course')
                // Actually backend service expects 'course' which maps to class.
                // Filter specifically for action="create_lecture"
                const approvals = await teacherContentApprovalService.getMyRequests({
                    status: 'pending',
                    approvable_type: 'course',
                    approvable_id: Number(courseId),
                    per_page: 50 // reasonable limit
                });

                // Filter for create_lecture action
                pendingLectures = approvals.data.filter(req =>
                    req.payload.action === 'create_lecture' || req.payload.unit_id // simplistic check if action missing
                );
            } catch (err) {
                console.error('Failed to load pending approvals:', err);
            }

            // Fetch Units
            try {
                // Corrected Call to Flat Method
                const unitsResponse = await teacherService.getUnits(courseId);
                // The API might return { success: true, data: [...] } or just [...]
                // Based on service definition: Promise<{ success: boolean; data: Unit[] }>
                const unitsList = unitsResponse.data || [];

                // MERGE PENDING LECTURES INTO UNITS
                // Map approvals to "Fake" Lecture objects
                const pendingLectureObjects = pendingLectures.map(req => {
                    const payload = req.payload;
                    return {
                        id: `pending-${req.id}`, // String ID to avoid collision
                        title: payload.title, // likely {ar:..., en:...} or string
                        description: payload.description,
                        unit_id: payload.unit_id,
                        order: 9999, // Put at end or use payload order
                        is_published: false,
                        is_pending_approval: true, // Custom flag for UI
                        type: 'lecture', // Ensure type is set
                        sortType: 'lecture', // For sortable list
                        created_at: req.created_at
                    };
                });

                // Group by unit_id
                const pendingByUnit = pendingLectureObjects.reduce((acc, lecture) => {
                    const uId = lecture.unit_id;
                    if (!acc[uId]) acc[uId] = [];
                    acc[uId].push(lecture);
                    return acc;
                }, {} as Record<number, any[]>);

                // Inject into units
                const unitsWithPending = unitsList.map((unit: Unit) => {
                    const pendingForThis = pendingByUnit[unit.id] || [];
                    if (pendingForThis.length > 0) {
                        return {
                            ...unit,
                            lectures: [...(unit.lectures || []), ...pendingForThis]
                        };
                    }
                    return unit;
                });

                // Ensure units are sorted by order
                const sortedUnits = unitsWithPending.sort((a: Unit, b: Unit) => (a.order || 0) - (b.order || 0));
                setUnits(sortedUnits);

                // Expand first unit by default if none expanded
                if (expandedUnits.length === 0 && sortedUnits.length > 0) {
                    setExpandedUnits([sortedUnits[0].id]);
                }
            } catch (err) {
                console.error('Failed to load units:', err);
                setUnits([]);
            }

            // Fetch All Quizzes to find unassigned ones
            try {
                const quizzesResponse = await quizService.getQuizzes({ course_id: courseId });
                setAllQuizzes(quizzesResponse.data || []);
            } catch (err) {
                console.error('Failed to load quizzes:', err);
            }

        } catch (error) {
            console.error('Error fetching course:', error);
            toast.error('فشل تحميل بيانات الكورس');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchCourseData();
    }, [fetchCourseData]);

    // Listen for real-time quiz status changes (WebSocket notifications)
    useEffect(() => {
        const handleQuizStatusChange = async (event: Event) => {
            const customEvent = event as CustomEvent;
            console.log('TeacherCourseDetailsPage: Quiz status changed, refreshing data...', customEvent.detail);

            // Refresh quizzes only (not the entire course to avoid full page reload flicker)
            try {
                const quizzesResponse = await quizService.getQuizzes({ course_id: courseId });
                setAllQuizzes(quizzesResponse.data || []);
                console.log('TeacherCourseDetailsPage: Quiz data refreshed successfully');
            } catch (err) {
                console.error('Failed to refresh quizzes after status change:', err);
            }
        };

        console.log('TeacherCourseDetailsPage: Adding quiz-status-change event listener');
        window.addEventListener('quiz-status-change', handleQuizStatusChange);
        return () => {
            window.removeEventListener('quiz-status-change', handleQuizStatusChange);
        };
    }, [courseId]);

    // Listen for lecture/content approval updates
    useEffect(() => {
        const handleApprovalUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            console.log('TeacherCourseDetailsPage: Content approval update received:', customEvent.detail);

            // Refresh full course data to update units/lectures list
            fetchCourseData();
        };

        console.log('TeacherCourseDetailsPage: Adding teacher-approval-update listener');
        window.addEventListener('teacher-approval-update', handleApprovalUpdate);
        return () => {
            window.removeEventListener('teacher-approval-update', handleApprovalUpdate);
        };
    }, [fetchCourseData]);

    // Unit Handlers
    const handleToggleUnit = (unitId: number) => {
        setExpandedUnits(prev =>
            prev.includes(unitId)
                ? prev.filter(id => id !== unitId)
                : [...prev, unitId]
        );
    };

    const handleCreateUnit = () => {
        setEditingUnit(null);
        setShowUnitModal(true);
    };

    const handleEditUnit = (unit: Unit) => {
        setEditingUnit(unit);
        setShowUnitModal(true);
    };

    const handleDeleteUnit = (unit: Unit) => {
        setDeletingUnit(unit);
    };

    const handleConfirmDeleteUnit = async () => {
        if (!deletingUnit) return;

        // Optimistic State Update
        const previousUnits = [...units];
        setUnits(prev => prev.filter(u => u.id !== deletingUnit.id));
        setExpandedUnits(prev => prev.filter(id => id !== deletingUnit.id));
        setDeletingUnit(null);

        try {
            await teacherService.deleteUnit(courseId, deletingUnit.id);
            toast.success('تم حذف الوحدة بنجاح');
        } catch (error) {
            console.error('Delete unit error:', error);
            toast.error('فشل حذف الوحدة');
            // Revert on failure
            setUnits(previousUnits);
        }
    };

    // Unit Drag and Drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleGlobalDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        // CASE 1: Reordering Units (SortableUnit)
        if (
            active.data?.current?.sortable?.containerId === 'units-list' ||
            (typeof active.id === 'number' && units.some(u => u.id === active.id))
        ) {
            if (active.id !== over.id) {
                const oldIndex = units.findIndex((unit) => unit.id === active.id);
                const newIndex = units.findIndex((unit) => unit.id === over.id);

                if (oldIndex !== -1 && newIndex !== -1) {
                    const newUnits = arrayMove(units, oldIndex, newIndex);
                    setUnits(newUnits); // Optimistic

                    // API Call
                    const orderedIds = newUnits.map(u => u.id);
                    try {
                        await teacherService.reorderUnits(courseId, orderedIds);
                        toast.success('تم تحديث ترتيب الوحدات');
                    } catch (error) {
                        console.error('Reorder units failed:', error);
                        fetchCourseData(); // Revert
                    }
                }
            }
            return;
        }

        // CASE 2: Dropping Unassigned Quiz (DraggableUnassignedQuiz) into Unit (Droppable)
        const isUnassignedQuiz = String(active.id).startsWith('unassigned-quiz-');
        const isTargetUnit = String(over.id).startsWith('unit-');

        if (isUnassignedQuiz && isTargetUnit) {
            const quiz = active.data.current?.quiz;
            const targetUnit = over.data.current?.unit;

            if (quiz && targetUnit) {
                // 1. Optimistic Update
                const updatedQuizzes = allQuizzes.map(q =>
                    q.id === quiz.id ? { ...q, unit_id: targetUnit.id } : q
                );
                setAllQuizzes(updatedQuizzes);

                try {
                    // 2. API Call
                    const unitItems = [
                        ...(targetUnit.lectures || []).map((l: any) => ({ id: l.id, type: 'lecture' as const, order: l.order || 0 })),
                        ...(targetUnit.quizzes || []).map((q: any) => ({ id: q.id, type: 'quiz' as const, order: q.order || 0 })),
                    ].sort((a, b) => a.order - b.order);

                    unitItems.push({ id: quiz.id, type: 'quiz', order: unitItems.length + 1 });

                    await teacherService.reorderContent(courseId, targetUnit.id, unitItems);

                    toast.success(`تم نقل الاختبار إلى وحدة ${getLocalizedTitle(targetUnit.name)}`);
                    fetchCourseData();

                } catch (error) {
                    console.error('Move quiz failed:', error);
                    toast.error('فشل نقل الاختبار');
                    fetchCourseData(); // Revert
                }
            }
        }
    };

    // Lecture Handlers
    const handleAddLecture = (unit: Unit) => {
        setSelectedUnit(unit);
        setShowAddLecture(true);
    };

    const handleEditLecture = (lecture: any) => {
        setSelectedLecture(lecture);
        setShowEditLecture(true);
    };

    const handleDeleteLecture = (lecture: any) => {
        setDeletingLecture(lecture);
    };

    const handleConfirmDeleteLecture = async () => {
        if (!deletingLecture) return;

        // Optimistic State Update
        const previousUnits = [...units];
        const lectureId = deletingLecture.id;
        const isPending = deletingLecture.is_pending_approval || String(lectureId).startsWith('pending-');

        // Remove from UI immediately
        setUnits(prevUnits => prevUnits.map(unit => ({
            ...unit,
            lectures: unit.lectures ? unit.lectures.filter((l: any) => l.id !== lectureId) : []
        })));

        setDeletingLecture(null);

        try {
            // Check if it's a pending approval request
            if (isPending) {
                const id = parseInt(String(lectureId).replace('pending-', ''));
                await teacherContentApprovalService.cancelRequest(id);
                toast.success('تم إلغاء الطلب بنجاح');
            } else {
                await teacherLectureService.deleteLecture(lectureId);
                toast.success('تم حذف المحاضرة بنجاح');
            }
        } catch (error) {
            console.error('Delete lecture error:', error);
            toast.error('فشل حذف المحاضرة');
            // Revert on failure
            setUnits(previousUnits);
        }
    };

    const handleLectureSaved = (savedLecture?: any) => {
        setShowAddLecture(false);
        setShowEditLecture(false);

        if (savedLecture) {
            const isEdit = !!selectedLecture;

            setUnits(prevUnits => prevUnits.map(unit => {
                // If this is the target unit
                if (unit.id === (savedLecture.unit_id || selectedUnit?.id)) {
                    const existingLectures = unit.lectures || [];

                    if (isEdit) {
                        // Update existing
                        return {
                            ...unit,
                            lectures: existingLectures.map((l: any) => l.id === savedLecture.id ? { ...l, ...savedLecture } : l)
                        };
                    } else {
                        // Add new
                        return {
                            ...unit,
                            lectures: [...existingLectures, savedLecture]
                        };
                    }
                }
                // If moving lecture between units, we might need to remove from old unit (not handled yet for simplicity)
                return unit;
            }));

            toast.success('تم حفظ المحاضرة بنجاح');
        } else {
            fetchCourseData(); // Fallback
        }
    };

    const handleStartSession = async (lectureId: number) => {
        // Show initial loading with descriptive steps
        const loadingToast = toast.loading(
            <div className="flex flex-col gap-1">
                <span className="font-semibold">جاري بدء الجلسة المباشرة...</span>
                <span className="text-xs text-gray-400">الاتصال بخادم البث المباشر</span>
            </div>,
            { duration: Infinity }
        );

        // Update loading message after 3 seconds
        const step1Timeout = setTimeout(() => {
            toast.loading(
                <div className="flex flex-col gap-1">
                    <span className="font-semibold">جاري إنشاء غرفة البث...</span>
                    <span className="text-xs text-gray-400">يرجى الانتظار، قد يستغرق هذا بضع ثوانٍ</span>
                </div>,
                { id: loadingToast }
            );
        }, 3000);

        // Update loading message after 8 seconds
        const step2Timeout = setTimeout(() => {
            toast.loading(
                <div className="flex flex-col gap-1">
                    <span className="font-semibold">جاري تحضير الجلسة...</span>
                    <span className="text-xs text-gray-400">جاري إعداد إعدادات التسجيل والبث</span>
                </div>,
                { id: loadingToast }
            );
        }, 8000);

        // Update loading message after 15 seconds (for slow connections)
        const step3Timeout = setTimeout(() => {
            toast.loading(
                <div className="flex flex-col gap-1">
                    <span className="font-semibold">الاتصال يستغرق وقتاً أطول...</span>
                    <span className="text-xs text-gray-400">يرجى عدم إغلاق الصفحة</span>
                </div>,
                { id: loadingToast }
            );
        }, 15000);

        // Update loading message after 30 seconds (for very slow connections)
        const step4Timeout = setTimeout(() => {
            toast.loading(
                <div className="flex flex-col gap-1">
                    <span className="font-semibold">جاري الاتصال بخادم البث...</span>
                    <span className="text-xs text-gray-400">الخادم بطيء الاستجابة، يرجى الانتظار قليلاً</span>
                </div>,
                { id: loadingToast }
            );
        }, 30000);

        try {
            // Generate secure one-time-use embed token
            const response = await teacherLectureService.generateSecureEmbedToken(lectureId);

            // Clear all timeouts
            clearTimeout(step1Timeout);
            clearTimeout(step2Timeout);
            clearTimeout(step3Timeout);
            clearTimeout(step4Timeout);
            toast.dismiss(loadingToast);

            if (response.success && response.data?.embed_url) {
                // Open in secure embed modal
                setLiveSessionEmbedUrl(response.data.embed_url);
                setIsLiveSessionModalOpen(true);
                toast.success('تم بدء الجلسة بنجاح! 🎉');
            } else {
                toast.error(response.message || 'لم يتم استلام رابط الجلسة');
            }
        } catch (error: any) {
            // Clear all timeouts
            clearTimeout(step1Timeout);
            clearTimeout(step2Timeout);
            clearTimeout(step3Timeout);
            clearTimeout(step4Timeout);
            toast.dismiss(loadingToast);

            console.error('Start session error:', error);
            const errorMessage = error.response?.data?.message || 'فشل بدء الجلسة - يرجى المحاولة مرة أخرى';
            toast.error(errorMessage, { duration: 5000 });
        }
    };

    // Close live session modal
    const handleCloseLiveSession = () => {
        setIsLiveSessionModalOpen(false);
        setLiveSessionEmbedUrl(null);
    };

    // Quiz Handlers
    const handleAddQuizToUnit = (unit: Unit) => {
        setQuizContextUnit(unit);
        setQuizContextLecture(null);
        setShowQuizModal(true);
    };

    const handleAddQuizToLecture = (lecture: any) => {
        // Find unit for this lecture
        const unit = units.find(u => u.id === lecture.unit_id);
        setQuizContextUnit(unit || null);
        setQuizContextLecture(lecture);
        setShowQuizModal(true);
    };

    const handleEditQuiz = async (quiz: Quiz) => {
        try {
            const response = await quizService.getQuiz(quiz.id);
            setSelectedQuizForEdit(response.data);
            setQuizContextUnit(quiz.unit_id ? units.find(u => u.id === quiz.unit_id) || null : null);
            setQuizContextLecture(null);
            setShowQuizModal(true);
        } catch (err) {
            toast.error('فشل في تحميل بيانات الاختبار');
        }
    };

    const handleDeleteQuiz = async (quiz: Quiz) => {
        const result = await Swal.fire({
            title: 'هل أنت متأكد؟',
            text: "لن تتمكن من التراجع عن هذا الإجراء!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، احذفه!',
            cancelButtonText: 'إلغاء'
        });

        if (result.isConfirmed) {
            // Optimistic Updates
            const previousQuizzes = [...allQuizzes];
            const previousUnits = [...units];

            // 1. Update All Quizzes List
            setAllQuizzes(prev => prev.filter(q => q.id !== quiz.id));

            // 2. Update Units (Deep update to remove quiz from any unit it might be in)
            setUnits(prevUnits => prevUnits.map(unit => ({
                ...unit,
                quizzes: unit.quizzes ? unit.quizzes.filter(q => q.id !== quiz.id) : []
            })));

            try {
                await quizService.deleteQuiz(quiz.id);
                toast.success('تم حذف الاختبار بنجاح');
            } catch (error) {
                console.error('Delete quiz failed:', error);
                toast.error('فشل حذف الاختبار');

                // Revert on failure
                setAllQuizzes(previousQuizzes);
                setUnits(previousUnits);
            }
        }
    };

    /**
     * Toggle quiz is_active status
     */
    const handleToggleQuizActive = async (quiz: Quiz) => {
        // Optimistic update
        const previousQuizzes = [...allQuizzes];

        setAllQuizzes(prev => prev.map(q =>
            q.id === quiz.id ? { ...q, is_active: !q.is_active } : q
        ));

        try {
            const result = await quizService.toggleActive(quiz.id);
            toast.success(result.message);
        } catch (error) {
            console.error('Toggle quiz failed:', error);
            toast.error('فشل في تغيير حالة الاختبار');
            // Revert on failure
            setAllQuizzes(previousQuizzes);
        }
    };

    const handleEndSession = async (lectureId: number) => {
        const result = await Swal.fire({
            title: 'هل أنت متأكد من إنهاء الجلسة؟',
            text: "سيتم إيقاف البث وحفظ التسجيل تلقائياً.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، إنهاء الجلسة',
            cancelButtonText: 'إلغاء'
        });

        if (result.isConfirmed) {
            const loadingToast = toast.loading('جاري إنهاء الجلسة...');
            try {
                await teacherLectureService.endSession(lectureId);
                toast.dismiss(loadingToast);
                toast.success('تم إنهاء الجلسة بنجاح، جاري معالجة التسجيل');
                fetchCourseData(); // Refresh to update status
            } catch (error) {
                toast.dismiss(loadingToast);
                console.error('End session failed:', error);
                toast.error('فشل إنهاء الجلسة');
            }
        }
    };

    const handleStartTestSession = async () => {
        if (startingTestSession) return;

        try {
            setStartingTestSession(true);
            toast.loading('جاري بدء الجلسة التجريبية...', { id: 'test-session-toast' });

            const response = await teacherLectureService.startTestSession(courseId);

            if (response.success && response.join_url) {
                toast.dismiss('test-session-toast');
                toast.success('تم بدء الجلسة بنجاح');
                window.open(response.join_url, '_blank');
            }
        } catch (error: any) {
            toast.dismiss('test-session-toast');
            console.error('Failed to start test session:', error);
            toast.error(error.response?.data?.message || 'فشل بدء الجلسة التجريبية');
        } finally {
            setStartingTestSession(false);
        }
    };

    // Mutations
    const createUnit = useMutation({
        mutationFn: async (data: CreateUnitRequest) => {
            return await teacherService.createUnit(courseId, data);
        }
    });

    const updateUnit = useMutation({
        mutationFn: async (data: { unitId: number, req: UpdateUnitRequest }) => {
            return await teacherService.updateUnit(courseId, data.unitId, data.req);
        }
    });

    const handleUnitFormSubmit = async (data: CreateUnitRequest | UpdateUnitRequest) => {
        try {
            if (editingUnit) {
                const updatedUnit = await updateUnit.mutateAsync({ unitId: editingUnit.id, req: data });

                // Optimistic Update
                setUnits(prev => prev.map(u => u.id === editingUnit.id ? updatedUnit : u));
                toast.success('تم تحديث الوحدة بنجاح');
            } else {
                const newUnit = await createUnit.mutateAsync(data as CreateUnitRequest);

                // Optimistic Add
                setUnits(prev => [...prev, newUnit]);
                toast.success('تم إنشاء الوحدة بنجاح');
            }
            setShowUnitModal(false);
            setEditingUnit(null);
        } catch (error) {
            console.error('Unit form error:', error);
            toast.error('حدث خطأ أثناء حفظ الوحدة');
        }
    };

    // Derived State
    const courseName = useMemo(() => course ? getCourseName(course.name) : '', [course]);

    if (loading) {
        return <CourseDetailsSkeleton />;
    }

    if (!course) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-slate-800">الكورس غير موجود</h2>
                <button
                    onClick={() => navigate('/teacher/courses')}
                    className="mt-4 text-shibl-crimson hover:underline"
                >
                    العودة للكورسات
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 pb-32">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-shibl-crimson to-shibl-red-500"></div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                            <span onClick={() => navigate('/teacher/courses')} className="cursor-pointer hover:text-shibl-crimson transition-colors">
                                كورساتي
                            </span>
                            <ChevronDown className="w-4 h-4 -rotate-90 rtl:rotate-90" />
                            <span className="text-slate-900 font-medium">تفاصيل الكورس</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">{courseName}</h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                {course.is_active ? 'نشط' : 'مسودة'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {course.students_count || 0} طالب
                            </span>

                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
                        >
                            <Settings className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleStartTestSession}
                            disabled={startingTestSession}
                            className={`px-4 py-2.5 bg-white border border-shibl-crimson text-shibl-crimson hover:bg-shibl-crimson hover:text-white rounded-xl transition-all flex items-center gap-2 font-medium shadow-sm ${startingTestSession ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="جلسة تجريبية (30 دقيقة - لا تظهر للطلاب)"
                        >
                            {startingTestSession ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                            <span className="hidden sm:inline">جلسة تجريبية</span>
                        </button>

                        <button
                            className="px-4 py-2.5 bg-shibl-crimson hover:bg-shibl-red-600 text-white rounded-xl transition-colors flex items-center gap-2 font-medium shadow-lg shadow-shibl-crimson/20"
                            onClick={fetchCourseData}
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>تحديث</span>
                        </button>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    <StatCard icon={BookOpen} label="الوحدات" value={units.length} />
                    <StatCard icon={Users} label="الطلاب" value={course.students_count || 0} />
                    <StatCard icon={Video} label="المحاضرات" value={course.lectures_count || 0} />
                    <StatCard icon={Clock} label="الساعات" value={0} />
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 overflow-x-auto pb-1 mt-8 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'content'
                            ? 'text-shibl-crimson border-b-2 border-shibl-crimson'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        محتوى الكورس
                    </button>
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'students'
                            ? 'text-shibl-crimson border-b-2 border-shibl-crimson'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        الطلاب
                    </button>
                    <button
                        onClick={() => setActiveTab('quizzes')}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'quizzes'
                            ? 'text-shibl-crimson border-b-2 border-shibl-crimson'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        الاختبارات
                    </button>

                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'content' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900">محتوى الكورس</h2>
                        <button
                            onClick={handleCreateUnit}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <Plus size={18} />
                            <span>إضافة وحدة</span>
                        </button>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleGlobalDragEnd}
                    >
                        {/* Units List */}
                        <SortableContext
                            id="units-list"
                            items={units.map(u => u.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {units.map((unit) => (
                                    <SortableUnit
                                        key={unit.id}
                                        unit={unit}
                                        isExpanded={expandedUnits.includes(unit.id)}
                                        onToggle={() => handleToggleUnit(unit.id)}
                                        onEditUnit={() => handleEditUnit(unit)}
                                        onDeleteUnit={() => handleDeleteUnit(unit)}
                                        onAddLecture={() => handleAddLecture(unit)}
                                        onEditLecture={handleEditLecture}
                                        onDeleteLecture={handleDeleteLecture}
                                        onAddQuizToUnit={() => {
                                            setQuizContextUnit(unit);
                                            setQuizContextLecture(null);
                                            setShowQuizModal(true);
                                        }}
                                        onAddQuizToLecture={(lecture: UnitLecture) => {
                                            setQuizContextUnit(unit);
                                            setQuizContextLecture(lecture);
                                            setShowQuizModal(true);
                                        }}
                                        onEditQuiz={handleEditQuiz}
                                        onDeleteQuiz={handleDeleteQuiz}
                                        onToggleQuizActive={handleToggleQuizActive}
                                        onStartSession={handleStartSession}
                                        onEndSession={handleEndSession}
                                        quizzes={allQuizzes} // Pass all quizzes for filtering inside UnitCard
                                    />
                                ))}
                            </div>
                        </SortableContext>

                        {/* Unassigned Quizzes Section */}
                        {allQuizzes.filter(q => !q.unit_id).length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <FileQuestion className="text-amber-500" />
                                    اختبارات غير مرتبطة بوحدة
                                    <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                        {allQuizzes.filter(q => !q.unit_id).length}
                                    </span>
                                </h3>
                                <div className="grid gap-3">
                                    {allQuizzes.filter(q => !q.unit_id).map(quiz => (
                                        <DraggableUnassignedQuiz key={quiz.id} quiz={quiz}>
                                            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-white text-amber-500 flex items-center justify-center shadow-sm">
                                                        <GripVertical size={20} className="text-slate-300" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-medium text-slate-900">{getLocalizedTitle(quiz.name)}</h5>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {quiz.questions_count || 0} أسئلة • {quiz.duration_minutes} دقيقة
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-amber-700 bg-amber-100/50 px-2 py-1 rounded">
                                                        غير مرتبط
                                                    </span>
                                                    <button
                                                        onPointerDown={(e) => e.stopPropagation()}
                                                        onClick={() => handleEditQuiz(quiz)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onPointerDown={(e) => e.stopPropagation()}
                                                        onClick={() => handleDeleteQuiz(quiz)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </DraggableUnassignedQuiz>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 mt-2 pr-1">
                                    * اسحب الاختبار وأفلته داخل أي وحدة لربطه بها.
                                </p>
                            </div>
                        )}
                        <DragOverlay />
                    </DndContext>
                </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-6">
                        <Users size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">قائمة الطلاب المسجلين</h3>
                    <p className="text-slate-500 max-w-sm mx-auto text-center">
                        لا يوجد طلاب مسجلين في هذا الكورس حالياً. سيظهر جميع الطلاب المنضمين إلى الكورس في هذه القائمة.
                    </p>
                </div>
            )}

            {/* Quizzes Tab */}
            {activeTab === 'quizzes' && (
                <CourseQuizzesTab
                    courseId={courseId}
                    courseName={courseName}
                    units={units}
                    teacherId={user?.teacher_id || 0}
                />
            )}

            {/* Modals */}
            {showAddLecture && selectedUnit && (
                <TeacherAddLectureModal
                    isOpen={showAddLecture}
                    onClose={() => setShowAddLecture(false)}
                    onSuccess={handleLectureSaved}
                    courseId={courseId}
                    courseName={courseName}
                    teacherId={user?.teacher_id || 0}
                    units={units}
                    initialUnitId={selectedUnit.id}
                    gradeId={course?.grade_id || course?.grade?.id}
                    semesterId={course?.semester_id || course?.semester?.id}
                />
            )}

            {showEditLecture && selectedLecture && (
                <TeacherEditLectureModal
                    isOpen={showEditLecture}
                    onClose={() => setShowEditLecture(false)}
                    lecture={selectedLecture}
                    onSuccess={handleLectureSaved}
                    units={units}
                    courseName={courseName}
                />
            )}

            {showUnitModal && (
                <UnitFormModal
                    isOpen={showUnitModal}
                    onClose={() => setShowUnitModal(false)}
                    onSubmit={handleUnitFormSubmit}
                    unit={editingUnit}
                    isSubmitting={createUnit.isPending || updateUnit.isPending}
                />
            )}

            {deletingUnit && (
                <DeleteConfirmModal
                    isOpen={!!deletingUnit}
                    onClose={() => setDeletingUnit(null)}
                    onConfirm={handleConfirmDeleteUnit}
                    title="حذف الوحدة"
                    message={`هل أنت متأكد من حذف الوحدة "${getLocalizedTitle(deletingUnit.title)}"? سيتم حذف جميع المحتويات بداخلها.`}
                />
            )}

            {deletingLecture && (
                <DeleteConfirmModal
                    isOpen={!!deletingLecture}
                    onClose={() => setDeletingLecture(null)}
                    onConfirm={handleConfirmDeleteLecture}
                    title="حذف المحاضرة"
                    message={`هل أنت متأكد من حذف المحاضرة "${getLocalizedTitle(deletingLecture.title)}"?`}
                />
            )}

            {/* Create Quiz Modal */}
            {showQuizModal && (
                <CreateQuizModal
                    isOpen={showQuizModal}
                    onClose={() => {
                        setShowQuizModal(false);
                        setQuizContextUnit(null);
                        setQuizContextLecture(null);
                        setSelectedQuizForEdit(null);
                    }}
                    onSuccess={(savedQuiz) => {
                        setShowQuizModal(false);
                        setSelectedQuizForEdit(null);

                        // Optimistic Update
                        if (savedQuiz) {
                            if (selectedQuizForEdit) {
                                // Update existing
                                setAllQuizzes(prev => prev.map(q => q.id === savedQuiz.id ? { ...q, ...savedQuiz } : q));
                                // Update inside units if needed (for display consistency)
                                setUnits(prev => prev.map(u => ({
                                    ...u,
                                    quizzes: u.quizzes ? u.quizzes.map(q => q.id === savedQuiz.id ? { ...q, ...savedQuiz } : q) : []
                                })));
                            } else {
                                // Add new
                                setAllQuizzes(prev => [...prev, savedQuiz]);
                            }
                        } else {
                            fetchCourseData();
                        }
                    }}
                    // Force the context
                    courses={course ? [course as TeacherCourse] : []}
                    lockedCourseId={courseId}
                    unitId={quizContextUnit?.id}
                    lectureId={quizContextLecture?.id}
                    quiz={selectedQuizForEdit}
                />
            )}

            {/* Live Session Embed Modal */}
            <LiveSessionEmbedModal
                isOpen={isLiveSessionModalOpen}
                onClose={handleCloseLiveSession}
                embedUrl={liveSessionEmbedUrl}
                title="جلستك المباشرة"
            />
        </div>
    );
}

export default TeacherCourseDetailsPage;
