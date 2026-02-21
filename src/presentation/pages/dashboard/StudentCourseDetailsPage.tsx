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

                // Set state directly without logs
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

    // Process units with syllabus status
    const processedUnits = course.content.map(unit => {
        const syllabusUnit = syllabus.find(u => u.id === unit.id);
        if (!syllabusUnit) return unit;

        return {
            ...unit,
            items: unit.items.map(item => {
                const sItem = syllabusUnit.items.find(si =>
                    si.id === item.id && (
                        si.type === item.item_type ||
                        (si.type === 'unit_quiz' && item.item_type === 'quiz')
                    )
                );

                if (!sItem) return item;

                const newItem: any = { ...item };
                newItem.is_locked = sItem.is_locked;
                newItem.is_completed = sItem.is_completed;

                if (sItem.session_status) newItem.session_status = sItem.session_status;
                if (sItem.can_complete !== undefined) newItem.can_complete = sItem.can_complete;
                if (sItem.has_recording !== undefined) newItem.has_recording = sItem.has_recording;

                if (newItem.item_type === 'lecture' && newItem.quizzes && sItem.quizzes) {
                    newItem.quizzes = newItem.quizzes.map((q: any) => {
                        const sQuiz = sItem.quizzes?.find(sq => sq.id === q.id);
                        return sQuiz ? { ...q, is_locked: sQuiz.is_locked, is_completed: sQuiz.is_completed } : q;
                    });
                }
                return newItem;
            })
        };
    });

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Minimalist Header / Back Button */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base bg-white hover:bg-slate-50 text-slate-600 rounded-2xl transition-all border border-slate-100 shadow-sm font-bold active:scale-95"
                >
                    <ArrowRight size={20} className={isRTL ? '' : 'rotate-180'} />
                    جميع المواد الدراسية
                </button>
            </div>

            {/* Hero Section - Clean Light Theme */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
                <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-24 items-center">
                    {/* Course Image - Left Side */}
                    <div className="w-full lg:w-[45%] xl:w-[540px] flex-shrink-0 order-1 lg:order-none">
                        <div className="relative transform hover:scale-[1.01] transition-all duration-700">
                            {course.image_path ? (
                                <div className="relative">
                                    <img
                                        src={course.image_path}
                                        alt={courseName}
                                        className="w-full h-auto object-contain max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] drop-shadow-[0_25px_50px_rgba(0,0,0,0.1)]"
                                    />
                                    {/* Sub-decoration */}
                                    <div className="absolute -bottom-6 -left-6 sm:-bottom-10 sm:-left-10 w-24 h-24 sm:w-40 sm:h-40 bg-red-50 rounded-full blur-2xl sm:blur-3xl opacity-50 -z-10"></div>
                                </div>
                            ) : (
                                <div className="w-full aspect-[4/3] bg-slate-50 rounded-3xl sm:rounded-[4rem] flex items-center justify-center border-2 border-dashed border-slate-100">
                                    <BookOpen size={80} className="text-slate-100 sm:w-[120px] sm:h-[120px]" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Course Titles & CTA - Right Side */}
                    <div className="flex-1 text-center lg:text-right space-y-6 sm:space-y-8 lg:space-y-10 order-2 lg:order-none">
                        <div className="space-y-4">
                            {/* Promoted/Featured badge - assume false for now if prop missing, or update interface */}
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.2] lg:leading-[1.15] tracking-tight">
                                {getLocalizedName(course.name, 'مادة')}
                            </h1>
                        </div>

                        <p className="text-slate-500 text-base sm:text-lg lg:text-2xl leading-relaxed max-w-2xl mx-auto lg:ml-auto lg:mr-0 font-medium opacity-90 text-center lg:text-right" dir="rtl">
                            {courseDescription.length > 300
                                ? courseDescription.substring(0, 300) + '...'
                                : courseDescription || 'استكشف هذه الدورة التعليمية المتكاملة والمصممة خصيصاً لمساعدتك على التفوق في دراستك.'}
                        </p>

                        <div className="pt-2 sm:pt-4 flex justify-center lg:justify-end">
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
                                    className="w-full sm:w-auto px-8 sm:px-14 py-4 sm:py-6 bg-[#C41E3A] hover:bg-[#A31830] text-white font-black text-xl sm:text-2xl rounded-2xl sm:rounded-[2rem] shadow-xl sm:shadow-2xl shadow-red-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95 disabled:opacity-70"
                                >
                                    {enrollingFree ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <Loader2 size={24} className="animate-spin" />
                                            جاري...
                                        </div>
                                    ) : (
                                        isFree ? 'ابدأ الآن مجاناً' : 'اشترك الآن'
                                    )}
                                </button>
                            ) : (
                                <div className="space-y-4 w-full sm:w-auto">
                                    {existingSubscription.status === 1 ? (
                                        <div className="inline-flex w-full sm:w-auto items-center justify-center gap-3 sm:gap-4 px-6 sm:px-10 py-4 sm:py-5 bg-emerald-50 text-emerald-600 rounded-2xl sm:rounded-[2rem] border border-emerald-100 font-black text-lg sm:text-xl">
                                            <CheckCircle2 size={28} className="sm:w-8 sm:h-8" />
                                            أنت مشترك بالفعل
                                        </div>
                                    ) : existingSubscription.status === 2 ? (
                                        <div className="inline-flex w-full sm:w-auto items-center justify-center gap-3 sm:gap-4 px-6 sm:px-10 py-4 sm:py-5 bg-amber-50 text-amber-600 rounded-2xl sm:rounded-[2rem] border border-amber-100 font-black text-lg sm:text-xl">
                                            <Loader2 size={28} className="animate-spin sm:w-8 sm:h-8" />
                                            طلبك قيد المراجعة
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center lg:items-end gap-3 w-full sm:w-auto">
                                            <div className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-rose-50 text-rose-600 rounded-2xl sm:rounded-[2rem] border border-rose-100 font-black text-lg sm:text-xl flex items-center justify-center gap-3">
                                                <XCircle size={28} className="sm:w-8 sm:h-8" />
                                                لم تتم الموافقة على الطلب
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                                <a
                                                    href="https://wa.me/+96899999999"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full sm:w-auto px-6 py-3 bg-white text-emerald-600 border border-emerald-100 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all text-sm sm:text-base"
                                                >
                                                    <MessageCircle size={20} />
                                                    تواصل معنا
                                                </a>
                                                <button
                                                    onClick={() => setShowSubscriptionModal(true)}
                                                    className="w-full sm:w-auto px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all text-sm sm:text-base"
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 sm:gap-16 lg:gap-24">

                        {/* LEFT COLUMN: Pricing & Support (1/3) */}
                        <div className="lg:col-span-1 space-y-6 sm:space-y-8 order-2 lg:order-1">
                            {/* Detailed Pricing Card OR Progress Widget */}
                            {existingSubscription?.status === 1 && course.progress ? (
                                <CourseProgressWidget
                                    progress={course.progress}
                                    courseName={courseName}
                                />
                            ) : (
                                <div className="bg-white rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-50 sticky top-10">
                                    <div className="text-center mb-8 sm:mb-10">
                                        <p className="text-slate-400 font-bold mb-2 text-sm sm:text-base">سعر الدورة</p>
                                        <div className="flex items-baseline justify-center gap-2 sm:gap-3">
                                            <span className="text-4xl sm:text-6xl font-black text-slate-900">{String(course.price) || '99.99'}</span>
                                            <span className="text-slate-300 font-black text-xl sm:text-2xl">ر.ع</span>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-emerald-100 mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                                            <Trophy size={24} className="text-emerald-500 sm:w-7 sm:h-7" />
                                        </div>
                                        <div>
                                            <p className="font-black text-emerald-900 text-base sm:text-lg">ضمان التميز</p>
                                            <p className="text-emerald-600 font-medium text-xs sm:text-sm leading-tight">محتوى تعليمي بمعايير عالمية</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 sm:space-y-6">
                                        {[
                                            { icon: Video, text: 'دروس مرئية بجودة عالية', color: 'text-rose-500', bg: 'bg-rose-50' },
                                            { icon: FileText, text: 'ملخصات شاملة بصيغة PDF', color: 'text-blue-500', bg: 'bg-blue-50' },
                                            { icon: Clock, text: 'وصول مفتوح في أي وقت', color: 'text-amber-500', bg: 'bg-amber-50' },
                                            { icon: Users, text: 'مجتمع تعليمي متفاعل', color: 'text-emerald-500', bg: 'bg-emerald-50' }
                                        ].map((feat, i) => (
                                            <div key={i} className="flex items-center gap-3 sm:gap-4">
                                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${feat.bg} flex items-center justify-center flex-shrink-0`}>
                                                    <feat.icon size={20} className={`${feat.color} sm:w-5 sm:h-5`} />
                                                </div>
                                                <p className="font-bold text-slate-700 text-sm sm:text-base">{feat.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Description & Content (2/3) */}
                        <div className="lg:col-span-2 space-y-12 sm:space-y-16 order-1 lg:order-2">
                            {/* Description Section */}
                            <div className="space-y-5 sm:space-y-6">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-50 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                                        <FileText size={24} className="text-[#C41E3A] sm:w-[30px] sm:h-[30px]" />
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">وصف المادة</h2>
                                </div>
                                <div className="bg-white rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 lg:p-14 shadow-sm border border-slate-50/50">
                                    {course.description ? (
                                        <p
                                            className="text-slate-600 text-base sm:text-xl lg:text-2xl leading-[1.8] whitespace-pre-line text-right"
                                            dir="rtl"
                                        >
                                            {getLocalizedName(course.description, '')}
                                        </p>
                                    ) : (
                                        <p className="text-slate-300 italic text-lg sm:text-2xl font-medium">لا يوجد وصف متاح لهذه المادة حالياً.</p>
                                    )}
                                </div>
                            </div>

                            {/* Content Breakdown - NEW COMPONENT */}
                            <CourseContentList
                                units={processedUnits}
                                courseId={String(courseId)}
                                isSubscribed={existingSubscription?.status === 1}
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
