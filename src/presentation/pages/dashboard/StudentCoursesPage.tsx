/**
 * My Courses Page (Student Subscriptions)
 * 
 * Displays courses the student is enrolled in, grouped by status.
 * RELIES ON TAILWIND CSS - NO EXTERNAL CSS FILE.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService, Subscription, SubscriptionStatus, getLocalizedName } from '../../../data/api/studentService';
import { useLanguage } from '../../hooks';
import {
    BookOpen,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Upload,
    User,
    Calendar,
    GraduationCap,
    Play,
    RefreshCw,
    Filter,
    ChevronDown
} from 'lucide-react';

// Status configuration
const STATUS_CONFIG = {
    0: { // INACTIVE
        label: 'غير نشط',
        labelEn: 'Inactive',
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        icon: AlertCircle,
    },
    1: { // ACTIVE
        label: 'نشط',
        labelEn: 'Active',
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        icon: CheckCircle,
    },
    2: { // PENDING
        label: 'قيد المراجعة',
        labelEn: 'Pending',
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        icon: Clock,
    },
    3: { // REJECTED
        label: 'مرفوض',
        labelEn: 'Rejected',
        bg: 'bg-rose-100',
        text: 'text-rose-700',
        icon: XCircle,
    },
} as const;

type FilterTab = 'all' | 'active' | 'pending' | 'rejected';

interface SubscriptionCardProps {
    subscription: Subscription;
    onUploadReceipt: (subscription: Subscription) => void;
    onViewCourse: (courseId: number) => void;
    isRTL: boolean;
}

function SubscriptionCard({ subscription, onUploadReceipt, onViewCourse, isRTL }: SubscriptionCardProps) {
    const statusConfig = STATUS_CONFIG[subscription.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[0];
    const StatusIcon = statusConfig.icon;
    const course = subscription.course;

    if (!course) return null;

    const courseName = getLocalizedName(course.name, 'دورة غير معروفة');
    const teacherName = course.teacher?.name || 'غير محدد';

    // Placeholder Gradients (Theme Style)
    const gradients = [
        'linear-gradient(to bottom right, #FEF2F2, #FFF1F2)', // Style A
        'linear-gradient(to bottom right, #FEF2F2, #FFE4E6)', // Style B
        'linear-gradient(to bottom right, #FFF5F1, #FFF0F0)', // Soft Orange-ish
        'linear-gradient(to bottom right, #F0FDFA, #E0F2FE)', // Soft Cyan
    ];
    const gradientIndex = course.id % gradients.length;
    const placeholderGradient = gradients[gradientIndex];

    const getInitials = (name: string): string => {
        if (!name) return '📚';
        const words = name.split(' ').filter(w => w.length > 0);
        return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
    };
    const courseInitials = getInitials(courseName);

    const handleCardClick = () => {
        onViewCourse(course.id);
    };

    return (
        <div
            className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-soft-cloud overflow-hidden">
                {course.image_path ? (
                    <img
                        src={course.image_path}
                        alt={courseName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center relative"
                        style={{ background: placeholderGradient }}
                    >
                        <span className="text-4xl front-bold text-shibl-crimson/20 select-none">
                            {courseInitials}
                        </span>
                    </div>
                )}

                {/* Status Badge */}
                <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${statusConfig.bg} ${statusConfig.text}`}>
                    <StatusIcon size={14} className="stroke-[2.5]" />
                    <span>{isRTL ? statusConfig.label : statusConfig.labelEn}</span>
                </div>

                {/* Academic Badge */}
                {course.is_academic && (
                    <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} px-2.5 py-1 bg-charcoal/80 backdrop-blur-md text-white text-[10px] font-bold rounded-full`}>
                        {isRTL ? 'أكاديمي' : 'Academic'}
                    </div>
                )}

                {/* Hover Overlay Actions */}
                <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    {subscription.status === 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onViewCourse(course.id); }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-shibl-crimson text-white rounded-xl font-bold text-sm shadow-crimson hover:bg-shibl-crimson-dark transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
                        >
                            <Play size={18} fill="currentColor" />
                            <span>{isRTL ? 'مشاهدة' : 'Watch'}</span>
                        </button>
                    )}
                    {subscription.status === 2 && !subscription.bill_image_path && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onUploadReceipt(subscription); }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-charcoal rounded-xl font-bold text-sm shadow-lg hover:bg-soft-cloud transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                        >
                            <Upload size={18} />
                            <span>{isRTL ? 'رفع الإيصال' : 'Upload Receipt'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                {/* Title */}
                <h3 className="text-lg font-bold text-charcoal mb-3 line-clamp-2 leading-tight group-hover:text-shibl-crimson transition-colors">
                    {courseName}
                </h3>

                {/* Metadata */}
                <div className="space-y-2 mb-4 flex-1">
                    <div className="flex items-center gap-2 text-slate-grey text-xs lg:text-sm">
                        <User size={14} className="text-shibl-crimson/70" />
                        <span className="truncate">{teacherName}</span>
                    </div>

                    {(course.grade || course.semester) && (
                        <div className="flex items-center gap-2 text-slate-grey text-xs lg:text-sm">
                            <BookOpen size={14} className="text-shibl-crimson/70" />
                            <span className="truncate">
                                {course.grade && getLocalizedName(course.grade.name)}
                                {course.grade && course.semester && ' • '}
                                {course.semester && getLocalizedName(course.semester.name)}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-grey text-xs lg:text-sm">
                        <Calendar size={14} className="text-shibl-crimson/70" />
                        <span>
                            {subscription.created_at
                                ? new Date(subscription.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')
                                : '-'}
                        </span>
                    </div>
                </div>

                {/* Footer / Status Messages */}
                <div className="pt-4 border-t border-slate-50 mt-auto">
                    {/* Rejection */}
                    {subscription.status === 3 && subscription.rejection_reason && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-xs leading-relaxed">
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            <span>{subscription.rejection_reason}</span>
                        </div>
                    )}

                    {/* Receipt Status */}
                    {subscription.status === 2 && (
                        <div className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-bold ${subscription.bill_image_path
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                            }`}>
                            {subscription.bill_image_path ? (
                                <>
                                    <CheckCircle size={14} />
                                    <span>{isRTL ? 'تم رفع الإيصال' : 'Receipt Uploaded'}</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={14} />
                                    <span>{isRTL ? 'بانتظار الإيصال' : 'Awaiting Receipt'}</span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Price (Only show if active or no specific status message taking space) */}
                    {subscription.status !== 3 && subscription.status !== 2 && (
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${Number(course.price) > 0 ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                {Number(course.price) > 0 ? (isRTL ? 'مدفوع' : 'Paid') : (isRTL ? 'مجاني' : 'Free')}
                            </span>

                            {Number(course.price) > 0 && (
                                <div className="text-right">
                                    <span className="block text-lg font-bold text-shibl-crimson">
                                        {Number(course.price).toFixed(2)} <span className="text-xs font-normal">{isRTL ? 'ر.ع' : 'OMR'}</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function StudentCoursesPage() {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();

    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
    const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Fetch subscriptions
    const fetchSubscriptions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const subs = await studentService.getMySubscriptions();
            setSubscriptions(subs);
            setFilteredSubscriptions(subs);
        } catch (err: any) {
            console.error('Failed to fetch subscriptions:', err);
            setError(err.message || (isRTL ? 'فشل في تحميل الدورات' : 'Failed to load courses'));
        } finally {
            setIsLoading(false);
        }
    }, [isRTL]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    // Filter subscriptions
    useEffect(() => {
        let filtered = subscriptions;

        // 1. Filter by Status
        if (activeFilter !== 'all') {
            const statusMap: Record<FilterTab, SubscriptionStatus> = {
                all: 0,
                active: 1,
                pending: 2,
                rejected: 3,
            };
            filtered = filtered.filter(s => s.status === statusMap[activeFilter]);
        }

        // 2. Filter by Grade
        if (selectedGradeId) {
            filtered = filtered.filter(s => s.course?.grade?.id === selectedGradeId);
        }

        setFilteredSubscriptions(filtered);
    }, [activeFilter, selectedGradeId, subscriptions]);

    // Derived unique grades for filter dropdown
    const uniqueGrades = useMemo(() => {
        const gradesMap = new Map<number, any>();
        subscriptions.forEach(sub => {
            if (sub.course?.grade) {
                gradesMap.set(sub.course.grade.id, sub.course.grade);
            }
        });
        return Array.from(gradesMap.values());
    }, [subscriptions]);

    const counts = {
        all: subscriptions.length,
        active: subscriptions.filter(s => s.status === 1).length,
        pending: subscriptions.filter(s => s.status === 2).length,
        rejected: subscriptions.filter(s => s.status === 3).length,
    };

    // Upload Handlers
    const handleUploadReceipt = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setUploadModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setUploadFile(file);
    };

    const handleUploadSubmit = async () => {
        if (!selectedSubscription || !uploadFile) return;

        setIsUploading(true);
        try {
            await studentService.uploadPaymentReceipt(selectedSubscription.id, uploadFile);
            setUploadModalOpen(false);
            setUploadFile(null);
            setSelectedSubscription(null);
            await fetchSubscriptions();
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message || (isRTL ? 'فشل رفع الإيصال' : 'Failed to upload receipt'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleViewCourse = (courseId: number) => {
        navigate(`/dashboard/courses/${courseId}`);
    };

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-charcoal mb-2 tracking-tight">
                        {isRTL ? 'دوراتي التعليمية' : 'My Learning Journey'}
                    </h1>
                    <p className="text-slate-grey text-sm lg:text-base max-w-2xl leading-relaxed">
                        {isRTL
                            ? 'تابع تقدمك في الدورات التعليمية، وتصفح الاشتراكات الحالية والسابقة.'
                            : 'Track your progress, manage subscriptions, and continue learning.'
                        }
                    </p>
                </div>
                <button
                    onClick={fetchSubscriptions}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-shibl-crimson hover:text-shibl-crimson hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <RefreshCw size={18} className={`group-hover:rotate-180 transition-transform duration-500 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="font-bold text-sm">{isRTL ? 'تحديث' : 'Refresh'}</span>
                </button>
            </header>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                {/* Status Tabs */}
                <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar w-full sm:w-auto">
                    {(['all', 'active', 'pending', 'rejected'] as FilterTab[]).map((tab) => {
                        const isActive = activeFilter === tab;
                        const count = counts[tab];
                        const labels = {
                            all: isRTL ? 'الكل' : 'All',
                            active: isRTL ? 'نشط' : 'Active',
                            pending: isRTL ? 'قيد المراجعة' : 'Pending',
                            rejected: isRTL ? 'مرفوض' : 'Rejected',
                        };
                        const icons = {
                            all: Filter,
                            active: CheckCircle,
                            pending: Clock,
                            rejected: XCircle,
                        };
                        const Icon = icons[tab];

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all border
                                    ${isActive
                                        ? 'bg-shibl-crimson text-white border-shibl-crimson shadow-crimson'
                                        : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                    }
                                `}
                            >
                                <Icon size={16} />
                                <span>{labels[tab]}</span>
                                <span className={`
                                    ml-1 px-2 py-0.5 rounded-full text-xs
                                    ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}
                                `}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Grade Filter Dropdown */}
                {uniqueGrades.length > 0 && (
                    <div className="relative min-w-[200px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <GraduationCap size={16} />
                        </div>
                        <select
                            value={selectedGradeId || ''}
                            onChange={(e) => setSelectedGradeId(e.target.value ? Number(e.target.value) : null)}
                            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-shibl-crimson focus:border-shibl-crimson block w-full pl-10 p-2.5 appearance-none font-semibold cursor-pointer pr-8"
                            style={{ backgroundImage: 'none' }} // Remove default arrow to style custom one if desired, or keep simple
                        >
                            <option value="">{isRTL ? 'جميع الصفوف' : 'All Grades'}</option>
                            {uniqueGrades.map((grade) => (
                                <option key={grade.id} value={grade.id}>
                                    {getLocalizedName(grade.name)}
                                </option>
                            ))}
                        </select>
                        <div className={`absolute inset-y-0 ${isRTL ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-slate-400`}>
                            <ChevronDown size={14} />
                        </div>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-4 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl mb-8">
                    <AlertCircle size={24} />
                    <span className="font-semibold">{error}</span>
                    <button onClick={fetchSubscriptions} className="underline hover:text-red-800">
                        {isRTL ? 'إعادة المحاولة' : 'Retry'}
                    </button>
                </div>
            )}

            {/* Grid */}
            <div className={`
                grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
                ${isLoading ? 'opacity-50 pointer-events-none' : ''}
            `}>
                {isLoading && filteredSubscriptions.length === 0 ? (
                    // Skeletons
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-pulse">
                            <div className="bg-slate-200 aspect-video rounded-xl mb-4" />
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-slate-200 rounded w-1/2 mb-4" />
                            <div className="flex gap-2">
                                <div className="h-8 bg-slate-200 rounded w-full" />
                            </div>
                        </div>
                    ))
                ) : filteredSubscriptions.length > 0 ? (
                    filteredSubscriptions.map(sub => (
                        <SubscriptionCard
                            key={sub.id}
                            subscription={sub}
                            onUploadReceipt={handleUploadReceipt}
                            onViewCourse={handleViewCourse}
                            isRTL={isRTL}
                        />
                    ))
                ) : !isLoading && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                            <BookOpen size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-charcoal mb-2">
                            {isRTL ? 'لا توجد دورات هنا' : 'No courses found'}
                        </h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8">
                            {isRTL
                                ? 'لم يتم العثور على أي دورات في هذه القائمة. تصفح الدورات المتاحة للاشتراك.'
                                : 'We couldn\'t find any courses in this list. Browse available courses to subscribe.'
                            }
                        </p>
                        <button
                            onClick={() => navigate('/dashboard/academic-browse')}
                            className="flex items-center gap-2 px-6 py-3 bg-shibl-crimson text-white rounded-xl font-bold hover:bg-shibl-crimson-dark shadow-crimson transition-all"
                        >
                            <GraduationCap size={20} />
                            <span>{isRTL ? 'تصفح الدورات' : 'Browse Courses'}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {uploadModalOpen && selectedSubscription && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={() => setUploadModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-bold text-charcoal mb-2">
                            {isRTL ? 'رفع إيصال الدفع' : 'Upload Payment Receipt'}
                        </h3>
                        <p className="text-slate-500 mb-8">
                            {isRTL
                                ? 'يرجى رفع صورة واضحة لإيصال التحويل البنكي للمراجعة.'
                                : 'Please upload a clear image of the bank transfer receipt for review.'
                            }
                        </p>

                        <div className="mb-8">
                            <input
                                type="file"
                                id="receipt-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <label
                                htmlFor="receipt-upload"
                                className={`
                                    flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all
                                    ${uploadFile
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                        : 'border-slate-200 hover:border-shibl-crimson hover:bg-slate-50 text-slate-500'
                                    }
                                `}
                            >
                                {uploadFile ? (
                                    <>
                                        <CheckCircle size={40} />
                                        <span className="font-bold">{uploadFile.name}</span>
                                        <span className="text-xs opacity-70">
                                            {isRTL ? 'انقر للتغيير' : 'Click to change'}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <Upload size={32} />
                                        </div>
                                        <div className="text-center">
                                            <span className="block font-bold text-charcoal text-lg mb-1">
                                                {isRTL ? 'اضغط لرفع ملف' : 'Click to upload'}
                                            </span>
                                            <span className="text-xs text-slate-400">PNG, JPG up to 5MB</span>
                                        </div>
                                    </>
                                )}
                            </label>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setUploadModalOpen(false)}
                                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleUploadSubmit}
                                disabled={!uploadFile || isUploading}
                                className="px-8 py-3 rounded-xl font-bold text-white bg-shibl-crimson hover:bg-shibl-crimson-dark shadow-crimson disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                {isUploading && <RefreshCw size={18} className="animate-spin" />}
                                <span>{isRTL ? 'تأكيد الرفع' : 'Confirm Upload'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
