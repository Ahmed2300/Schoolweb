import { useState, useEffect } from 'react';
import { studentService, Course, Subscription, getLocalizedName } from '../../../data/api/studentService';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    Clock,
    Users,
    CheckCircle2,
    Loader2,
    AlertCircle,
    ChevronLeft,
    Trophy,
    Target,
    FileText,
    Video,
    XCircle,
    MessageCircle,
    Star,
    Play,
    GraduationCap
} from 'lucide-react';
import { useLanguage } from '../../hooks';
import SubscriptionModal from '../../components/student/SubscriptionModal';
import teacherPlaceholder from '../../../assets/images/teacher-placeholder.png';
import { CourseDetailSkeleton } from '../../components/shimmer';

interface CourseDetailsProps {
    courseId: number;
    onBack: () => void;
    onEnroll?: (courseId: number) => void;
}

export function StudentCourseDetailsPage({ courseId, onBack }: CourseDetailsProps) {
    const { isRTL } = useLanguage();
    const [course, setCourse] = useState<Course | null>(null);
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
                const data = await studentService.getCourseById(String(courseId));
                setCourse(data);
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
    const isFree = !course.price || course.price === 0;

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
                            {course.is_promoted && (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 text-sm font-black rounded-full border border-amber-100">
                                    <Star size={14} fill="currentColor" />
                                    مادة مميزة
                                </span>
                            )}
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.15] tracking-tight">
                                {courseName}
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
                            {/* Detailed Pricing Card */}
                            <div className="bg-white rounded-[3rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-50 sticky top-10">
                                <div className="text-center mb-10">
                                    <p className="text-slate-400 font-bold mb-2">سعر الدورة</p>
                                    <div className="flex items-baseline justify-center gap-3">
                                        <span className="text-6xl font-black text-slate-900">{course.price || '99.99'}</span>
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
                                    {courseDescription ? (
                                        <p
                                            className="text-slate-600 text-xl lg:text-2xl leading-[1.8] whitespace-pre-line text-right"
                                            dir="rtl"
                                        >
                                            {courseDescription}
                                        </p>
                                    ) : (
                                        <p className="text-slate-300 italic text-2xl font-medium">لا يوجد وصف متاح لهذه المادة حالياً.</p>
                                    )}
                                </div>
                            </div>

                            {/* Teacher Section */}
                            {course.teacher && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                                            <GraduationCap size={30} className="text-blue-600" />
                                        </div>
                                        <h2 className="text-3xl lg:text-4xl font-black text-slate-900">مدرس المادة</h2>
                                    </div>
                                    <div className="bg-white rounded-[3rem] p-8 lg:p-10 shadow-sm border border-slate-50/50">
                                        <div className="flex items-center gap-6">
                                            {/* Teacher Image */}
                                            {course.teacher.image_path && !course.teacher.image_path.includes('default.jpg') ? (
                                                <img
                                                    src={course.teacher.image_path}
                                                    alt={course.teacher.name}
                                                    className="w-24 h-24 lg:w-28 lg:h-28 rounded-3xl object-cover border-4 border-slate-100 shadow-lg"
                                                />
                                            ) : (
                                                <img
                                                    src={teacherPlaceholder}
                                                    alt={course.teacher.name}
                                                    className="w-24 h-24 lg:w-28 lg:h-28 rounded-3xl object-cover border-4 border-slate-100 shadow-lg"
                                                />
                                            )}

                                            {/* Teacher Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-2xl lg:text-3xl font-black text-slate-900">
                                                        {course.teacher.name}
                                                    </h3>
                                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${course.is_academic === false
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {course.is_academic === false ? 'مدرب' : 'مدرس'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-lg font-medium">
                                                    مسؤول عن تدريس هذه المادة
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Learning Objectives */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                                        <Target size={30} className="text-[#C41E3A]" />
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900">ماذا ستتعلم؟</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        'إتقان المفاهيم الأساسية والمتقدمة',
                                        'حل النماذج الامتحانية والتدريبات',
                                        'تطوير مهارات التفكير المنطقي',
                                        'فهم شامل للمنهج الدراسي المعتمد'
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-5 p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-50 hover:border-emerald-100 transition-colors group">
                                            <div className="mt-1 w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                <CheckCircle2 size={20} className="text-emerald-500 group-hover:text-white" />
                                            </div>
                                            <span className="text-slate-800 text-xl font-bold leading-tight">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Content Breakdown */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                                        <Video size={30} className="text-[#C41E3A]" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl lg:text-4xl font-black text-slate-900">محتوى المادة</h2>
                                        {course.lectures_count && (
                                            <p className="text-slate-400 font-bold text-lg mt-1">{course.lectures_count} درس تعليمي</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {course.lectures && course.lectures.length > 0 ? (
                                        course.lectures.map((lecture, i) => {
                                            const lectureTitle = getLocalizedName(lecture.title, `درس ${i + 1}`);
                                            const hasVideo = Boolean(lecture.video_path);

                                            return (
                                                <div
                                                    key={lecture.id}
                                                    className="flex items-center justify-between p-8 bg-white rounded-[2.5rem] hover:bg-slate-50 transition-all cursor-pointer group border border-slate-50 hover:border-slate-200 shadow-sm"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                                            {hasVideo ? (
                                                                <Play size={28} className="text-[#C41E3A] ml-1" fill="currentColor" />
                                                            ) : (
                                                                <FileText size={28} className="text-[#C41E3A]" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 text-2xl mb-1">{lectureTitle}</p>
                                                            {lecture.duration_minutes && (
                                                                <div className="flex items-center gap-2 text-slate-400 font-bold">
                                                                    <Clock size={14} />
                                                                    <span>{lecture.duration_minutes} دقيقة</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        {lecture.is_free && (
                                                            <span className="px-5 py-2 bg-emerald-50 text-emerald-600 text-sm font-black rounded-full border border-emerald-100">
                                                                تـجربة مجانية
                                                            </span>
                                                        )}
                                                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-red-50 group-hover:text-red-500 transition-all">
                                                            <ChevronLeft size={24} className={isRTL ? '' : 'rotate-180'} />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
                                            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <Video size={48} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 text-2xl font-black mb-2">جاري العمل على المحتوى</p>
                                            <p className="text-slate-300 font-bold text-lg">ترقبوا الدروس قريباً جداً</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Subscription Modal Container */}
            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                course={course}
                onSuccess={() => {
                    studentService.getSubscriptionByCourse(courseId).then(setExistingSubscription);
                }}
            />
        </div>
    );
}

export default StudentCourseDetailsPage;
