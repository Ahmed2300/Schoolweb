import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    BookOpen,
    Package,
    GraduationCap,
    Search,
    Loader2,
    Users,
    CheckCircle,
    Clock,
    X,
    DollarSign,
    ArrowRight,
    ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { commonService, type Grade, type Semester } from '../../../data/api/commonService';
import { parentService } from '../../../data/api/parentService';
import { packageService } from '../../../data/api/packageService';
import type { Package as PackageType } from '../../../data/api/packageService';
import { ParentPurchaseModal, type PurchaseItem } from '../../components/parent/ParentPurchaseModal';
import type { LinkedStudent } from '../../../data/api/parentService';

// ==================== Types ====================

type TabType = 'packages' | 'courses';

interface CourseItem {
    id: number;
    name: string | Record<string, string>;
    title?: string | Record<string, string>;
    description?: string;
    price: number;
    image?: string;
    thumbnail?: string;
    teacher?: { id: number; name: string };
    subject?: { id: number; name: string | Record<string, string> };
    grade?: { id: number; name: string };
    is_subscribed?: boolean;
    subscription_status?: string;
}

interface ChildInfo extends Omit<LinkedStudent, 'grade'> {
    grade: string;
    // avatar is already in LinkedStudent
}

// ==================== Helpers ====================

function getLocalizedName(name: string | { ar?: string; en?: string } | Record<string, string> | undefined): string {
    if (!name) return '';
    if (typeof name === 'string') return name;
    return name.ar || name.en || Object.values(name)[0] || '';
}

// ==================== Skeleton Components ====================

function PackageCardSkeleton() {
    return (
        <div className="bg-white rounded-[20px] overflow-hidden animate-pulse">
            <div className="h-44 bg-slate-200" />
            <div className="p-6 space-y-4">
                <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-100 rounded-lg w-full" />
                <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="h-8 bg-slate-100 rounded-lg w-16" />
                    <div className="h-6 bg-slate-100 rounded-full w-14" />
                </div>
                <div className="h-12 bg-slate-200 rounded-full w-full" />
            </div>
        </div>
    );
}

function CourseCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden animate-pulse border border-slate-100">
            <div className="h-36 bg-slate-200" />
            <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="h-6 bg-slate-100 rounded-lg w-20" />
                    <div className="h-10 bg-slate-200 rounded-xl w-24" />
                </div>
            </div>
        </div>
    );
}

// ==================== Status Badge ====================

function SubscriptionBadge({ status, label }: { status: string; label?: string }) {
    const config: Record<string, { bg: string; text: string; icon: typeof CheckCircle; label: string }> = {
        active: { bg: 'bg-emerald-500', text: 'text-white', icon: CheckCircle, label: 'مشترك' },
        pending: { bg: 'bg-amber-500', text: 'text-white', icon: Clock, label: 'قيد المراجعة' },
        rejected: { bg: 'bg-red-500', text: 'text-white', icon: X, label: 'مرفوض' },
        expired: { bg: 'bg-slate-500', text: 'text-white', icon: Clock, label: 'منتهي' },
        cancelled: { bg: 'bg-slate-500', text: 'text-white', icon: X, label: 'ملغي' },
    };

    const normalizeStatus = (s: string) => {
        if (s === 'approved') return 'active';
        return s.toLowerCase();
    };

    const cfg = config[normalizeStatus(status)] ?? config.expired;
    const Icon = cfg.icon;

    return (
        <div className={`${cfg.bg} ${cfg.text} rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5`}>
            <Icon size={14} />
            <span className="text-xs font-bold">{label || cfg.label}</span>
        </div>
    );
}

// ==================== Main Page Component ====================

export function ParentStorePage() {
    const { childId } = useParams<{ childId: string }>();
    const navigate = useNavigate();

    // --- State ---
    const [activeTab, setActiveTab] = useState<TabType>('packages');
    const [childInfo, setChildInfo] = useState<ChildInfo | null>(null);
    const [packages, setPackages] = useState<PackageType[]>([]);
    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [grades, setGrades] = useState<Grade[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
    const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');

    // Purchase modal state
    const [purchaseItem, setPurchaseItem] = useState<PurchaseItem | null>(null);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);

    // ---- Fetch data ----

    const fetchChildInfo = useCallback(async () => {
        if (!childId) return;
        try {
            const students = await parentService.getLinkedStudents();
            const child = students.find(
                (s) => s.id === Number(childId)
            );
            if (child) {
                setChildInfo({
                    ...child,
                    grade: (typeof child.grade === 'object' ? child.grade?.name : child.grade) || 'غير محدد',
                    avatar: child.image_path || child.avatar || undefined,
                });
                // Initialize selected grade if child has one
                if (child.grade_id) {
                    setSelectedGrade(child.grade_id);
                }
            }
        } catch (err) {
            console.error('Failed to fetch child info:', err);
            toast.error('فشل في تحميل بيانات الطالب');
        }
    }, [childId]);

    // Fetch filters (Grades)
    useEffect(() => {
        const loadGrades = async () => {
            try {
                const data = await commonService.getGrades();
                setGrades(data.filter(g => g.is_active !== false));
            } catch (error) {
                console.error('Failed to load grades', error);
            }
        };
        loadGrades();
    }, []);

    // Fetch semesters when grade changes
    useEffect(() => {
        const loadSemesters = async () => {
            if (selectedGrade === 'all') {
                setSemesters([]);
                setSelectedSemester('all');
                return;
            }
            try {
                const data = await commonService.getSemestersByGrade(selectedGrade);
                setSemesters(data);
                // Reset semester selection when grade changes
                setSelectedSemester('all');
            } catch (error) {
                console.error('Failed to load semesters', error);
            }
        };
        loadSemesters();
    }, [selectedGrade]);

    const fetchPackages = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await packageService.getPackages();
            setPackages(data || []);
        } catch {
            setError('فشل تحميل الباقات');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await parentService.getAvailableCoursesForStudent({
                grade_id: selectedGrade === 'all' ? undefined : selectedGrade,
                semester_id: selectedSemester === 'all' ? undefined : selectedSemester,
                per_page: 50, // Get more items one page
            });

            // If child info is loaded, filter out courses that don't match child's grade if user selected "all"
            // But usually we want to let parents explore other grades too?
            // The requirement is just "filter for grade and semester" so manual selection is fine.
            // If child has a grade, we set it as default in fetchChildInfo, so it starts filtered.

            setCourses(response.data as unknown as CourseItem[]);
        } catch (err) {
            console.error(err);
            setError('فشل في تحميل الدورات المتاحة');
        } finally {
            setIsLoading(false);
        }
    }, [selectedGrade, selectedSemester]); // Re-fetch when filters change

    useEffect(() => {
        fetchChildInfo();
    }, [fetchChildInfo]);

    useEffect(() => {
        if (activeTab === 'packages') fetchPackages();
        else fetchCourses();
    }, [activeTab, fetchPackages, fetchCourses]);

    // ---- Search Filter ----

    const filteredPackages = packages.filter(
        (pkg) =>
            pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (pkg.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCourses = courses.filter((c) => {
        const name = getLocalizedName(c.name || c.title);
        const teacherName = c.teacher?.name || '';
        const q = searchQuery.toLowerCase();
        return name.toLowerCase().includes(q) || teacherName.toLowerCase().includes(q);
    });

    // ---- Purchase handlers ----

    const openPurchaseModal = (item: PurchaseItem) => {
        setPurchaseItem(item);
        setShowPurchaseModal(true);
    };

    const handlePurchaseSubmit = async (billImage: File) => {
        if (!purchaseItem || !childId) return;
        if (purchaseItem.type === 'package') {
            await parentService.purchasePackageForStudent(
                Number(childId),
                purchaseItem.id,
                billImage
            );
        } else {
            await parentService.subscribeCourseForStudent(
                Number(childId),
                purchaseItem.id,
                billImage
            );
        }
        toast.success('تم إرسال طلبك بنجاح! سيتم مراجعته قريباً');
        // Refresh child info to get updated subscriptions
        fetchChildInfo();
        if (activeTab === 'packages') fetchPackages();
        else fetchCourses();
    };

    // ---- Render ----

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back Navigation + Child Header */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => navigate('/parent/children')}
                    className="flex items-center gap-2 text-slate-500 hover:text-shibl-crimson transition-colors w-fit"
                >
                    <ArrowRight size={18} className="rtl:rotate-180" />
                    <span className="text-sm font-bold">العودة لقائمة الأبناء</span>
                </button>

                {/* Child Info Banner */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
                    <div className="w-14 h-14 rounded-full border-2 border-slate-100 overflow-hidden flex items-center justify-center bg-slate-50 shrink-0">
                        {childInfo?.avatar ? (
                            <img
                                src={childInfo.avatar}
                                alt={childInfo.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Users size={24} className="text-slate-300" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg md:text-xl font-extrabold text-charcoal">
                            متجر{' '}
                            <span className="text-shibl-crimson">
                                {childInfo?.name || 'الطالب'}
                            </span>
                        </h1>
                        <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-0.5">
                            <GraduationCap size={14} />
                            {childInfo?.grade || ''}
                        </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-shibl-crimson/10 text-shibl-crimson px-4 py-2 rounded-xl">
                        <ShoppingBag size={16} />
                        <span className="text-sm font-bold">المتجر</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm">
                <button
                    onClick={() => setActiveTab('packages')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'packages'
                        ? 'bg-shibl-crimson text-white shadow-md shadow-shibl-crimson/20'
                        : 'text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    <Package size={16} />
                    الباقات
                </button>
                <button
                    onClick={() => setActiveTab('courses')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'courses'
                        ? 'bg-shibl-crimson text-white shadow-md shadow-shibl-crimson/20'
                        : 'text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    <BookOpen size={16} />
                    الدورات
                </button>
            </div>

            {/* Filters & Search - Only show filters for Courses tab */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="بحث..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all"
                    />
                </div>

                {activeTab === 'courses' && (
                    <>
                        <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all min-w-[150px]"
                        >
                            <option value="all">كل المراحل</option>
                            {grades.map(g => (
                                <option key={g.id} value={g.id}>
                                    {getLocalizedName(g.name)}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all min-w-[150px]"
                            disabled={selectedGrade === 'all' || semesters.length === 0}
                        >
                            <option value="all">كل الفصول</option>
                            {semesters.map(s => (
                                <option key={s.id} value={s.id}>
                                    {getLocalizedName(s.name)}
                                </option>
                            ))}
                        </select>
                    </>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm flex items-center gap-2">
                    <X size={16} />
                    {error}
                    <button
                        onClick={() =>
                            activeTab === 'packages' ? fetchPackages() : fetchCourses()
                        }
                        className="mr-auto text-xs font-bold underline"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) =>
                        activeTab === 'packages' ? (
                            <PackageCardSkeleton key={i} />
                        ) : (
                            <CourseCardSkeleton key={i} />
                        )
                    )}
                </div>
            )}

            {/* ==================== PACKAGES TAB ==================== */}
            {!isLoading && activeTab === 'packages' && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredPackages.map((pkg) => {
                            const hasDiscount =
                                pkg.is_discount_valid && pkg.final_price != null;
                            const displayPrice = hasDiscount
                                ? pkg.final_price
                                : pkg.price;
                            const originalPrice = pkg.price;

                            // Check subscription status
                            const subscription = childInfo?.package_subscriptions?.find(sub => sub.package_id === pkg.id);
                            const isSubscribed = !!subscription;
                            const status = subscription?.status || '';
                            const statusLabel = subscription?.status_label || '';

                            return (
                                <div
                                    key={pkg.id}
                                    className={`group bg-white rounded-[20px] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border ${isSubscribed
                                        ? 'border-emerald-200 ring-1 ring-emerald-100'
                                        : 'border-transparent'
                                        }`}
                                    style={{
                                        boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
                                    }}
                                >
                                    {/* Cover Image */}
                                    <div className="relative h-44 overflow-hidden">
                                        <img
                                            src={
                                                pkg.image ||
                                                '/images/package-placeholder.png'
                                            }
                                            alt={pkg.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).src =
                                                    '/images/package-placeholder.png';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        {/* Status Badge */}
                                        {isSubscribed && (
                                            <div className="absolute top-4 right-4 z-10">
                                                <SubscriptionBadge
                                                    status={status}
                                                    label={statusLabel}
                                                />
                                            </div>
                                        )}

                                        {/* Discount Badge */}
                                        {hasDiscount && !isSubscribed &&
                                            pkg.discount_percentage != null && (
                                                <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1">
                                                    <span className="text-sm font-extrabold">
                                                        {Math.round(
                                                            pkg.discount_percentage
                                                        )}
                                                        %
                                                    </span>
                                                    <span className="text-xs">
                                                        خصم
                                                    </span>
                                                </div>
                                            )}

                                        {/* Price Badge */}
                                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-lg">
                                            {hasDiscount ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs text-slate-400 line-through">
                                                        {originalPrice} ر.ع
                                                    </span>
                                                    <span className="text-sm font-extrabold text-shibl-crimson">
                                                        {displayPrice} ر.ع
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-extrabold text-shibl-crimson">
                                                    {displayPrice} ر.ع
                                                </span>
                                            )}
                                        </div>

                                        {/* Grade Badge */}
                                        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-2">
                                            <GraduationCap
                                                size={14}
                                                className="text-shibl-crimson"
                                            />
                                            <span className="text-xs font-bold text-charcoal">
                                                {pkg.grade?.name ||
                                                    'جميع المراحل'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6 space-y-4">
                                        <h3 className="font-extrabold text-lg text-charcoal leading-tight group-hover:text-shibl-crimson transition-colors">
                                            {pkg.name}
                                        </h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                                            {pkg.description ||
                                                'باقة شاملة تحتوي على مجموعة متكاملة من الدورات الدراسية'}
                                        </p>

                                        {/* Savings */}
                                        {hasDiscount && !isSubscribed &&
                                            pkg.savings != null &&
                                            pkg.savings > 0 && (
                                                <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 flex items-center gap-2">
                                                    <CheckCircle
                                                        size={14}
                                                        className="text-emerald-500"
                                                    />
                                                    <span className="text-xs font-bold text-emerald-600">
                                                        وفر{' '}
                                                        {pkg.savings.toFixed(2)}{' '}
                                                        ر.ع
                                                    </span>
                                                </div>
                                            )}

                                        {/* Stats */}
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-shibl-crimson/10 rounded-lg flex items-center justify-center">
                                                    <BookOpen
                                                        size={14}
                                                        className="text-shibl-crimson"
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-charcoal">
                                                    {pkg.courses_count ||
                                                        pkg.courses?.length ||
                                                        0}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    دورة
                                                </span>
                                            </div>

                                            {pkg.type && (
                                                <span
                                                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${pkg.type === 'grade'
                                                        ? 'bg-emerald-50 text-emerald-600'
                                                        : pkg.type ===
                                                            'semester'
                                                            ? 'bg-blue-50 text-blue-600'
                                                            : pkg.type ===
                                                                'term'
                                                                ? 'bg-purple-50 text-purple-600'
                                                                : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                >
                                                    {pkg.type === 'grade'
                                                        ? 'سنوية'
                                                        : pkg.type ===
                                                            'semester'
                                                            ? 'فصلية'
                                                            : pkg.type === 'term'
                                                                ? 'ترم'
                                                                : 'مخصصة'}
                                                </span>
                                            )}
                                        </div>

                                        {/* CTA */}
                                        {isSubscribed && (status === 'active' || status === 'pending') ? (
                                            <div className={`w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 ${status === 'active'
                                                ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                                                : 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
                                                }`}>
                                                {status === 'active' ? (
                                                    <>
                                                        <CheckCircle size={16} />
                                                        مشترك في الباقة
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock size={16} />
                                                        طلب الشراء قيد المراجعة
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    openPurchaseModal({
                                                        id: pkg.id,
                                                        name: pkg.name,
                                                        description: pkg.description,
                                                        price: pkg.price,
                                                        finalPrice:
                                                            pkg.final_price ??
                                                            undefined,
                                                        discountPercentage:
                                                            pkg.discount_percentage ??
                                                            undefined,
                                                        image: pkg.image,
                                                        coursesCount:
                                                            pkg.courses_count ||
                                                            pkg.courses?.length ||
                                                            0,
                                                        type: 'package',
                                                        childName:
                                                            childInfo?.name ||
                                                            'الطالب',
                                                    })
                                                }
                                                className={`w-full text-white py-3.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg ${status === 'rejected'
                                                    ? 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/25'
                                                    : 'bg-charcoal hover:bg-shibl-crimson hover:shadow-shibl-crimson/25'
                                                    }`}
                                            >
                                                {status === 'rejected' ? (
                                                    <>
                                                        <ShoppingBag size={16} />
                                                        إعادة المحاولة
                                                    </>
                                                ) : status === 'expired' ? (
                                                    <>
                                                        <ShoppingBag size={16} />
                                                        تجديد الاشتراك
                                                    </>
                                                ) : (
                                                    <>
                                                        شراء الباقة
                                                        <ChevronLeft
                                                            size={16}
                                                            className="transition-transform group-hover:-translate-x-1"
                                                        />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty */}
                    {filteredPackages.length === 0 && (
                        <div className="text-center py-20">
                            <Package
                                className="mx-auto text-slate-300"
                                size={60}
                            />
                            <h3 className="mt-4 font-bold text-slate-600">
                                لا توجد باقات متاحة
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">
                                تحقق لاحقاً من الباقات الجديدة
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* ==================== COURSES TAB ==================== */}
            {!isLoading && activeTab === 'courses' && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCourses.map((course) => {
                            const courseImage =
                                course.image || course.thumbnail;
                            const courseName = getLocalizedName(
                                course.name || course.title
                            );

                            // Check subscription status from child subjects
                            const linkedSubject = childInfo?.subjects?.find(s => s.id === course.id);
                            const isSubscribed = !!linkedSubject;
                            // Use subscription_status_key for logic if available (from API updates), else fallback
                            const statusKey = linkedSubject?.subscription_status_key || (isSubscribed ? 'active' : '');
                            const statusLabel = linkedSubject?.subscription_status || '';

                            return (
                                <div
                                    key={course.id}
                                    className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${isSubscribed
                                        ? 'border-emerald-200 ring-1 ring-emerald-100'
                                        : 'border-slate-100'
                                        }`}
                                >
                                    {/* Cover */}
                                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                                        {courseImage ? (
                                            <img
                                                src={courseImage}
                                                alt={courseName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    (
                                                        e.target as HTMLImageElement
                                                    ).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen
                                                    size={40}
                                                    className="text-slate-300"
                                                />
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        {isSubscribed && (
                                            <div className="absolute top-3 right-3">
                                                <SubscriptionBadge
                                                    status={statusKey}
                                                    label={statusLabel}
                                                />
                                            </div>
                                        )}

                                        {/* Price Badge */}
                                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                                            <span className="text-xs font-extrabold text-shibl-crimson">
                                                {course.price} ر.ع
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 space-y-3">
                                        <h3 className="font-extrabold text-base text-charcoal leading-tight truncate group-hover:text-shibl-crimson transition-colors">
                                            {courseName}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                                            <Users size={12} />
                                            {course.teacher?.name || 'مدرس'}
                                        </p>

                                        {course.grade && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <GraduationCap size={12} />
                                                {course.grade.name}
                                            </div>
                                        )}

                                        <div className="pt-3 border-t border-slate-100">
                                            {isSubscribed && (statusKey === 'active' || statusKey === 'pending') ? (
                                                <div className={`flex items-center gap-2 text-sm font-bold ${statusKey === 'active' ? 'text-emerald-600' : 'text-amber-600'
                                                    }`}>
                                                    {statusKey === 'active' ? <CheckCircle size={16} /> : <Clock size={16} />}
                                                    {statusLabel || 'مشترك'}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        openPurchaseModal({
                                                            id: course.id,
                                                            name: courseName,
                                                            description:
                                                                course.description,
                                                            price: course.price,
                                                            image: courseImage,
                                                            type: 'course',
                                                            childName:
                                                                childInfo?.name ||
                                                                'الطالب',
                                                        })
                                                    }
                                                    className={`w-full text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-colors flex items-center justify-center gap-2 ${statusKey === 'rejected'
                                                        ? 'bg-red-500 hover:bg-red-600'
                                                        : 'bg-charcoal hover:bg-shibl-crimson'
                                                        }`}
                                                >
                                                    {statusKey === 'rejected' ? (
                                                        <>
                                                            <ShoppingBag size={14} />
                                                            إعادة المحاولة
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DollarSign size={14} />
                                                            اشتراك —{' '}
                                                            {course.price} ر.ع
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty */}
                    {filteredCourses.length === 0 && (
                        <div className="text-center py-20">
                            <BookOpen
                                className="mx-auto text-slate-300"
                                size={60}
                            />
                            <h3 className="mt-4 font-bold text-slate-600">
                                لا توجد دورات متاحة
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">
                                تحقق لاحقاً من الدورات الجديدة
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* ==================== PURCHASE MODAL ==================== */}
            {purchaseItem && (
                <ParentPurchaseModal
                    item={purchaseItem}
                    isOpen={showPurchaseModal}
                    onClose={() => {
                        setShowPurchaseModal(false);
                        setPurchaseItem(null);
                    }}
                    onSubmit={handlePurchaseSubmit}
                />
            )}
        </div>
    );
}

export default ParentStorePage;
