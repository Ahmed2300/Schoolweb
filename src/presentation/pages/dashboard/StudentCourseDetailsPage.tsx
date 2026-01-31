import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService, Subscription, getLocalizedName } from '../../../data/api/studentService';
import { studentCourseService, StudentCourseDetails, SyllabusUnit, Unit, CourseContentItem } from '../../../data/api/studentCourseService';
import { CourseContentList } from '../../components/student/course/CourseContentList';
import {
    ArrowRight,
    BookOpen,
    Clock,
    Users,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Trophy,
    FileText,
    Video,
    XCircle,
    MessageCircle,
    Star,
    Play
} from 'lucide-react';
import { useLanguage } from '../../hooks';
import SubscriptionModal from '../../components/student/SubscriptionModal';
import { CourseDetailSkeleton } from '../../components/shimmer';
import { CourseProgressWidget } from '../../components/student/course/CourseProgressWidget';

interface CourseDetailsProps {
    courseId: number;
    onBack: () => void;
    onEnroll?: (courseId: number) => void;
}

export function StudentCourseDetailsPage({ courseId, onBack }: CourseDetailsProps) {
    const { isRTL } = useLanguage();
    const [course, setCourse] = useState<StudentCourseDetails | null>(null);
    const [syllabus, setSyllabus] = useState<SyllabusUnit[]>([]); // New state for syllabus status
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [existingSubscription, setExistingSubscription] = useState<Subscription | null>(null);
    const [enrollingFree, setEnrollingFree] = useState(false);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                // Use the new service that fetches full details including units/quizzes
                const [detailsData, syllabusData] = await Promise.all([
                    studentCourseService.getStudentCourseDetails(courseId),
                    studentCourseService.getSyllabusStatus(courseId)
                ]);

                setCourse(detailsData);
                setSyllabus(syllabusData);
            } catch (err) {
                console.error('Error fetching course details:', err);
                setError('فشل في تحميل تفاصيل المادة');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId]);

    // Check if student already has a subscription for this course
    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const subscription = await studentService.getSubscriptionByCourse(courseId);
                setExistingSubscription(subscription);
            } catch (err) {
                console.error('Error checking subscription:', err);
            }
        };
        checkSubscription();
    }, [courseId]);

    // Premium shimmer skeleton loading state
    if (loading) {
        return <CourseDetailSkeleton />;
    }

    if (error || !course) {
        return (
            <div className="p-10 text-center">
                <AlertCircle className="mx-auto mb-4 text-red-400" size={60} />
                <p className="text-xl font-bold text-slate-800 mb-6">{error || 'لم يتم العثور على المادة'}</p>
                <button
                    onClick={onBack}
                    className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
                >
                    العودة للقائمة
                </button>
            </div>
        );
    }

    const courseName = getLocalizedName(course.name, 'مادة');
    const courseDescription = getLocalizedName(course.description, '');
    const isFree = !course.price || course.price === '0' || Number(course.price) === 0;

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Minimalist Header / Back Button */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl transition-all border border-slate-100 shadow-sm font-bold active:scale-95"
                >
                    <ArrowRight size={20} className={isRTL ? '' : 'rotate-180'} />
                    جميع المواد الدراسية
                </button>
            </div>

            {/* Hero Section - Clean Light Theme */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-center">
                    {/* Course Image - Left Side */}
                    <div className="w-full md:w-[45%] lg:w-[540px] flex-shrink-0">
                        <div className="relative transform hover:scale-[1.01] transition-all duration-700">
                            {course.image_path ? (
                                <div className="relative">
                                    <img
                                        src={course.image_path}
                                        alt={courseName}
                                        className="w-full h-auto object-contain max-h-[500px] drop-shadow-[0_25px_50px_rgba(0,0,0,0.1)]"
                                    />
                                    {/* Sub-decoration */}
                                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-50 rounded-full blur-3xl opacity-50 -z-10"></div>
                                </div>
                            ) : (
                                <div className="w-full aspect-[4/3] bg-slate-50 rounded-[4rem] flex items-center justify-center border-2 border-dashed border-slate-100">
                                    <BookOpen size={120} className="text-slate-100" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Course Titles & CTA - Right Side */}
                    <div className="flex-1 text-right space-y-8 lg:space-y-10">
                        <div className="space-y-4">
                            {/* Promoted/Featured badge - assume false for now if prop missing, or update interface */}
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.15] tracking-tight">
                                {getLocalizedName(course.name, 'مادة')}
                            </h1>
                        </div>

                        <p className="text-slate-500 text-lg lg:text-2xl leading-relaxed max-w-2xl ml-auto font-medium opacity-90 text-right" dir="rtl">
                            {courseDescription.length > 300
                                ? courseDescription.substring(0, 300) + '...'
                                : courseDescription || 'استكشف هذه الدورة التعليمية المتكاملة والمصممة خصيصاً لمساعدتك على التفوق في دراستك.'}
                        </p>

                        <div className="pt-4">
                            {!existingSubscription ? (
                                <button
                                    onClick={async () => {
                                        if (isFree) {
                                            setEnrollingFree(true);
                                            try {
                                                const subscription = await studentService.subscribeToCourse(courseId);
                                                setExistingSubscription(subscription);
                                            } catch (err) {
                                                console.error('Free enrollment failed:', err);
                                            } finally {
                                                setEnrollingFree(false);
                                            }
                                        } else {
                                            setShowSubscriptionModal(true);
                                        }
                                    }}
                                    disabled={enrollingFree}
                                    className="px-14 py-6 bg-[#C41E3A] hover:bg-[#A31830] text-white font-black text-2xl rounded-[2rem] shadow-2xl shadow-red-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95 disabled:opacity-70"
                                >
                                    {enrollingFree ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 size={24} className="animate-spin" />
                                            جاري...
                                        </div>
                                    ) : (
                                        isFree ? 'ابدأ الآن مجاناً' : 'اشترك الآن'
                                    )}
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    {existingSubscription.status === 1 ? (
                                        <div className="inline-flex items-center gap-4 px-10 py-5 bg-emerald-50 text-emerald-600 rounded-[2rem] border border-emerald-100 font-black text-xl">
                                            <CheckCircle2 size={32} />
                                            أنت مشترك بالفعل
                                        </div>
                                    ) : existingSubscription.status === 2 ? (
                                        <div className="inline-flex items-center gap-4 px-10 py-5 bg-amber-50 text-amber-600 rounded-[2rem] border border-amber-100 font-black text-xl">
                                            <Loader2 size={32} className="animate-spin" />
                                            طلبك قيد المراجعة
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-end gap-3">
                                            <div className="px-10 py-5 bg-rose-50 text-rose-600 rounded-[2rem] border border-rose-100 font-black text-xl flex items-center gap-3">
                                                <XCircle size={32} />
                                                لم تتم الموافقة على الطلب
                                            </div>
                                            <div className="flex gap-3">
                                                <a
                                                    href="https://wa.me/+96899999999"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-6 py-3 bg-white text-emerald-600 border border-emerald-100 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all"
                                                >
                                                    <MessageCircle size={20} />
                                                    تواصل معنا
                                                </a>
                                                <button
                                                    onClick={() => setShowSubscriptionModal(true)}
                                                    className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all"
                                                >
                                                    إعادة تقديم الطلب
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-[#F8FAFC]/50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-24">

                        {/* LEFT COLUMN: Pricing & Support (1/3) */}
                        <div className="lg:col-span-1 space-y-8 order-2 lg:order-1">
                            {/* Detailed Pricing Card OR Progress Widget */}
                            {existingSubscription?.status === 1 && course.progress ? (
                                <CourseProgressWidget
                                    progress={course.progress}
                                    courseName={courseName}
                                />
                            ) : (
                                <div className="bg-white rounded-[3rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-50 sticky top-10">
                                    <div className="text-center mb-10">
                                        <p className="text-slate-400 font-bold mb-2">سعر الدورة</p>
                                        <div className="flex items-baseline justify-center gap-3">
                                            <span className="text-6xl font-black text-slate-900">{String(course.price) || '99.99'}</span>
                                            <span className="text-slate-300 font-black text-2xl">ر.ع</span>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 mb-8 flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                                            <Trophy size={28} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="font-black text-emerald-900 text-lg">ضمان التميز</p>
                                            <p className="text-emerald-600 font-medium text-sm leading-tight">محتوى تعليمي بمعايير عالمية</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {[
                                            { icon: Video, text: 'دروس مرئية بجودة عالية', color: 'text-rose-500', bg: 'bg-rose-50' },
                                            { icon: FileText, text: 'ملخصات شاملة بصيغة PDF', color: 'text-blue-500', bg: 'bg-blue-50' },
                                            { icon: Clock, text: 'وصول مفتوح في أي وقت', color: 'text-amber-500', bg: 'bg-amber-50' },
                                            { icon: Users, text: 'مجتمع تعليمي متفاعل', color: 'text-emerald-500', bg: 'bg-emerald-50' }
                                        ].map((feat, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl ${feat.bg} flex items-center justify-center flex-shrink-0`}>
                                                    <feat.icon size={22} className={feat.color} />
                                                </div>
                                                <p className="font-bold text-slate-700">{feat.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Description & Content (2/3) */}
                        <div className="lg:col-span-2 space-y-16 order-1 lg:order-2">
                            {/* Description Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                                        <FileText size={30} className="text-[#C41E3A]" />
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900">وصف المادة</h2>
                                </div>
                                <div className="bg-white rounded-[3rem] p-10 lg:p-14 shadow-sm border border-slate-50/50">
                                    {course.description ? (
                                        <p
                                            className="text-slate-600 text-xl lg:text-2xl leading-[1.8] whitespace-pre-line text-right"
                                            dir="rtl"
                                        >
                                            {getLocalizedName(course.description, '')}
                                        </p>
                                    ) : (
                                        <p className="text-slate-300 italic text-2xl font-medium">لا يوجد وصف متاح لهذه المادة حالياً.</p>
                                    )}
                                </div>
                            </div>

                            {/* Content Breakdown - NEW COMPONENT */}
                            {/* Merge course content with syllabus status */}
                            <CourseContentList
                                units={course.content.map(unit => {
                                    // Find corresponding unit in syllabus
                                    const syllabusUnit = syllabus.find(u => u.id === unit.id);
                                    if (!syllabusUnit) return unit;

                                    return {
                                        ...unit,
                                        items: unit.items.map(item => {
                                            // Find corresponding item in syllabus (flattened or nested)
                                            // Syllabus structure might differ slightly, let's search carefully.
                                            // SyllabusUnit items includes lectures and unit-quizzes.
                                            // Lecture items in syllabus have nested quizzes.

                                            // Find top-level item in unit (Lecture or Unit Quiz)
                                            // Note: syllabus uses 'type' not 'item_type', match carefully
                                            const sItem = syllabusUnit.items.find(si =>
                                                si.id === item.id && (
                                                    si.type === item.item_type ||
                                                    (si.type === 'unit_quiz' && item.item_type === 'quiz')
                                                )
                                            );

                                            if (!sItem) return item;

                                            // Clone item to avoid mutation and cast to allow extra properties
                                            const newItem: any = { ...item };

                                            // Apply status from service
                                            newItem.is_locked = sItem.is_locked;
                                            newItem.is_completed = sItem.is_completed;

                                            // Apply session status fields for live session rules
                                            if (sItem.session_status) newItem.session_status = sItem.session_status;
                                            if (sItem.can_complete !== undefined) newItem.can_complete = sItem.can_complete;
                                            if (sItem.has_recording !== undefined) newItem.has_recording = sItem.has_recording;

                                            // If it's a lecture, update nested quizzes
                                            if (newItem.item_type === 'lecture' && newItem.quizzes && sItem.quizzes) {
                                                newItem.quizzes = newItem.quizzes.map((q: any) => {
                                                    const sQuiz = sItem.quizzes?.find(sq => sq.id === q.id);
                                                    if (sQuiz) {
                                                        return { ...q, is_locked: sQuiz.is_locked, is_completed: sQuiz.is_completed };
                                                    }
                                                    return q;
                                                });
                                            }

                                            return newItem;
                                        })
                                    };
                                })}
                                courseId={String(courseId)}
                            />

                        </div>
                    </div>
                </div>
            </div>

            {/* Subscription Modal Container */}
            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                course={course as any} // Cast safely due to type overlap
                onSuccess={() => {
                    studentService.getSubscriptionByCourse(courseId).then(setExistingSubscription);
                }}
            />
        </div>
    );
}

// Student Session Button using the standard Lecture type from components or service
function StudentSessionButton({ lecture }: { lecture: import('../../../data/api/studentCourseService').Lecture }) {
    const [status, setStatus] = useState<string>('scheduled');
    const [isLive, setIsLive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Auto-refresh timer
    const [, setTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Check if session is expired - using optional chaining as checks are done in component
    // Note: Lecture type interface update might be needed if end_time is not in new interface
    // But assuming it might be present in future or is part of shared type structure
    const isExpired = () => {
        // cast to any to access properties that might not be in the strict new interface yet
        const l = lecture as any;
        if (!l.end_time) return false;
        const endTime = new Date(l.end_time);
        return new Date() > endTime;
    };

    useEffect(() => {
        if (lecture.is_active && lecture.is_online && !isExpired()) {
            checkStatus();
        }
    }, [lecture]);

    const checkStatus = async () => {
        try {
            const res = await studentService.getMeetingStatus(lecture.id);
            setIsLive(res.is_live);
            setStatus(res.status);
        } catch (e) {
            console.error(e);
        }
    };

    const handleJoin = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            setIsLoading(true);
            const res = await studentService.joinSession(lecture.id);
            if (res.success) {
                navigate(`/classroom/${lecture.id}`);
            } else {
                alert(res.message || 'فشل في الانضمام للجلسة');
            }
        } catch (e) {
            alert('خطأ في الانضمام');
        } finally {
            setIsLoading(false);
        }
    };

    if (!lecture.is_online) return null;

    if (isExpired()) {
        return (
            <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
                <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                    <Clock size={12} />
                    انتهت الجلسة
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
            {isLive ? (
                <button
                    onClick={handleJoin}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors animate-pulse"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
                    انضم للبث المباشر
                </button>
            ) : (
                <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                    <Clock size={12} />
                    جلسة مجدولة
                </span>
            )}
        </div>
    );
}

export default StudentCourseDetailsPage;
