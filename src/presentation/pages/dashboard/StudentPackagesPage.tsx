import { useState, useEffect, useCallback } from 'react';
import {
    Package,
    Search,
    Filter,
    BookOpen,
    DollarSign,
    CheckCircle,
    AlertCircle,
    Loader2,
    ChevronLeft,
    GraduationCap,
    Upload,
    X,
    Clock
} from 'lucide-react';
import { packageService, Package as PackageType, PackageSubscription } from '../../../data/api';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
        pending: { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Clock size={14} /> },
        active: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <CheckCircle size={14} /> },
        rejected: { bg: 'bg-red-50', text: 'text-red-600', icon: <AlertCircle size={14} /> },
        expired: { bg: 'bg-slate-100', text: 'text-slate-500', icon: <Clock size={14} /> },
    };
    const labels: Record<string, string> = {
        pending: 'قيد المراجعة',
        active: 'نشط',
        rejected: 'مرفوض',
        expired: 'منتهي',
    };
    const style = styles[status] || styles.pending;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
            {style.icon}
            {labels[status] || status}
        </span>
    );
};

export function StudentPackagesPage() {
    const [view, setView] = useState<'browse' | 'subscriptions' | 'details'>('browse');
    const [packages, setPackages] = useState<PackageType[]>([]);
    const [subscriptions, setSubscriptions] = useState<PackageSubscription[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Purchase modal state
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [billImage, setBillImage] = useState<File | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);

    // Fetch packages and subscriptions
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (view === 'browse' || view === 'details') {
                // Fetch both packages and subscriptions for cross-reference
                const [packagesData, subscriptionsData] = await Promise.all([
                    packageService.getPackages(),
                    packageService.getMyPackageSubscriptions()
                ]);
                setPackages(packagesData);
                setSubscriptions(subscriptionsData);
            } else if (view === 'subscriptions') {
                const data = await packageService.getMyPackageSubscriptions();
                setSubscriptions(data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
        } finally {
            setIsLoading(false);
        }
    }, [view]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Listen for real-time package subscription status updates (when admin approves/rejects)
    useEffect(() => {
        const handlePackageSubscriptionUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            const notification = customEvent.detail;

            // Refetch subscriptions when package subscription status changes
            if (notification?.type?.includes('package') || notification?.type?.includes('subscription')) {
                console.log('Package subscription status changed, refreshing data...');
                fetchData();
            }
        };

        window.addEventListener('student-notification', handlePackageSubscriptionUpdate);

        return () => {
            window.removeEventListener('student-notification', handlePackageSubscriptionUpdate);
        };
    }, [fetchData]);

    // Handle package selection
    const handleViewDetails = async (pkg: PackageType) => {
        setIsLoading(true);
        try {
            const details = await packageService.getPackageDetails(pkg.id);
            setSelectedPackage(details);
            setView('details');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle purchase
    const handlePurchase = async () => {
        if (!selectedPackage) return;
        if (!billImage) {
            setError('يرجى إرفاق صورة إيصال الدفع');
            return;
        }

        setIsPurchasing(true);
        try {
            await packageService.purchasePackage(selectedPackage.id, billImage);
            setPurchaseSuccess(true);
            setTimeout(() => {
                setShowPurchaseModal(false);
                setPurchaseSuccess(false);
                setBillImage(null);
                setView('subscriptions');
            }, 2000);
        } catch (err: unknown) {
            // Extract error message from axios response
            let errorMessage = 'فشل في إتمام الاشتراك';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
                if (axiosError.response?.data?.message) {
                    errorMessage = axiosError.response.data.message;
                } else if (axiosError.response?.data?.errors) {
                    // Get first validation error
                    const errors = axiosError.response.data.errors;
                    const firstKey = Object.keys(errors)[0];
                    if (firstKey && errors[firstKey]?.[0]) {
                        errorMessage = errors[firstKey][0];
                    }
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setIsPurchasing(false);
        }
    };

    // Get subscription for a specific package (if exists)
    const getPackageSubscription = (packageId: number): PackageSubscription | undefined => {
        return subscriptions.find(sub => sub.package_id === packageId);
    };

    // Filter packages
    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-charcoal flex items-center gap-3">
                            <Package className="text-shibl-crimson" size={28} />
                            الباقات الدراسية
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">اشترك في الباقات للحصول على خصومات على الدورات</p>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-slate-200">
                        <button
                            onClick={() => setView('browse')}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${view === 'browse'
                                ? 'bg-shibl-crimson text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            تصفح الباقات
                        </button>
                        <button
                            onClick={() => setView('subscriptions')}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${view === 'subscriptions'
                                ? 'bg-shibl-crimson text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            اشتراكاتي
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={20} />
                        <p className="text-red-600 text-sm font-medium">{error}</p>
                        <button onClick={() => setError(null)} className="mr-auto text-red-400 hover:text-red-600">
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-shibl-crimson" size={40} />
                    </div>
                )}

                {/* Browse View */}
                {!isLoading && view === 'browse' && (
                    <>
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="ابحث عن باقة..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pr-12 pl-4 bg-white rounded-xl border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm"
                            />
                        </div>

                        {/* Packages Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPackages.map((pkg) => {
                                // Check if discount is active
                                const hasDiscount = pkg.is_discount_valid || (pkg.is_discount_active && pkg.discount_percentage && pkg.discount_percentage > 0);
                                const displayPrice = pkg.final_price ?? pkg.price;
                                const originalPrice = pkg.price;

                                // Check subscription status
                                const subscription = getPackageSubscription(pkg.id);
                                const isSubscribed = !!subscription;
                                const subscriptionStatus = subscription?.status;

                                return (
                                    <div
                                        key={pkg.id}
                                        className={`group bg-white rounded-[20px] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isSubscribed ? 'ring-2 ring-offset-2 ring-shibl-crimson/50' : ''}`}
                                        style={{
                                            boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
                                        }}
                                    >
                                        {/* Cover Image */}
                                        <div className="relative h-44 overflow-hidden">
                                            <img
                                                src={pkg.image || '/images/package-placeholder.png'}
                                                alt={pkg.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/images/package-placeholder.png';
                                                }}
                                            />
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                            {/* Subscription Status Badge */}
                                            {isSubscribed && (
                                                <div className={`absolute top-4 right-4 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 ${subscriptionStatus === 'active'
                                                    ? 'bg-emerald-500 text-white'
                                                    : subscriptionStatus === 'pending'
                                                        ? 'bg-amber-500 text-white'
                                                        : subscriptionStatus === 'rejected'
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-slate-500 text-white'
                                                    }`}>
                                                    {subscriptionStatus === 'active' && <CheckCircle size={14} />}
                                                    {subscriptionStatus === 'pending' && <Clock size={14} />}
                                                    {subscriptionStatus === 'rejected' && <X size={14} />}
                                                    <span className="text-xs font-bold">
                                                        {subscriptionStatus === 'active' ? 'مشترك'
                                                            : subscriptionStatus === 'pending' ? 'قيد المراجعة'
                                                                : subscriptionStatus === 'rejected' ? 'مرفوض'
                                                                    : 'منتهي'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Discount Badge - only show if not subscribed */}
                                            {!isSubscribed && hasDiscount && pkg.discount_percentage && (
                                                <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1">
                                                    <span className="text-sm font-extrabold">{Math.round(pkg.discount_percentage)}%</span>
                                                    <span className="text-xs">خصم</span>
                                                </div>
                                            )}

                                            {/* Price Badge */}
                                            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-lg">
                                                {hasDiscount ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs text-slate-400 line-through">{originalPrice} ر.ع</span>
                                                        <span className="text-sm font-extrabold text-shibl-crimson">{displayPrice} ر.ع</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-extrabold text-shibl-crimson">{displayPrice} ر.ع</span>
                                                )}
                                            </div>

                                            {/* Grade Badge */}
                                            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-2">
                                                <GraduationCap size={14} className="text-shibl-crimson" />
                                                <span className="text-xs font-bold text-charcoal">{pkg.grade?.name || 'جميع المراحل'}</span>
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-6 space-y-4">
                                            {/* Package Title */}
                                            <h3 className="font-extrabold text-lg text-charcoal leading-tight group-hover:text-shibl-crimson transition-colors">
                                                {pkg.name}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                                                {pkg.description || 'باقة شاملة تحتوي على مجموعة متكاملة من الدورات الدراسية'}
                                            </p>

                                            {/* Savings info if discounted */}
                                            {hasDiscount && pkg.savings && pkg.savings > 0 && (
                                                <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 flex items-center gap-2">
                                                    <CheckCircle size={14} className="text-emerald-500" />
                                                    <span className="text-xs font-bold text-emerald-600">
                                                        وفر {pkg.savings.toFixed(2)} ر.ع
                                                    </span>
                                                </div>
                                            )}

                                            {/* Stats Row */}
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-shibl-crimson/10 rounded-lg flex items-center justify-center">
                                                        <BookOpen size={14} className="text-shibl-crimson" />
                                                    </div>
                                                    <span className="text-sm font-bold text-charcoal">
                                                        {pkg.courses_count || pkg.courses?.length || 0}
                                                    </span>
                                                    <span className="text-xs text-slate-400">دورة</span>
                                                </div>

                                                {/* Package Type Badge */}
                                                {pkg.type && (
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${pkg.type === 'grade'
                                                        ? 'bg-emerald-50 text-emerald-600'
                                                        : pkg.type === 'semester'
                                                            ? 'bg-blue-50 text-blue-600'
                                                            : pkg.type === 'term'
                                                                ? 'bg-purple-50 text-purple-600'
                                                                : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {pkg.type === 'grade' ? 'سنوية' :
                                                            pkg.type === 'semester' ? 'فصلية' :
                                                                pkg.type === 'term' ? 'ترم' : 'مخصصة'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* CTA Button */}
                                            <button
                                                onClick={() => handleViewDetails(pkg)}
                                                className="w-full bg-charcoal text-white py-3.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:bg-shibl-crimson hover:shadow-lg hover:shadow-shibl-crimson/25"
                                            >
                                                عرض التفاصيل
                                                <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Empty State */}
                        {filteredPackages.length === 0 && (
                            <div className="text-center py-20">
                                <Package className="mx-auto text-slate-300" size={60} />
                                <h3 className="mt-4 font-bold text-slate-600">لا توجد باقات متاحة</h3>
                                <p className="text-slate-400 text-sm mt-1">تحقق لاحقاً من الباقات الجديدة</p>
                            </div>
                        )}
                    </>
                )}

                {/* Subscriptions View */}
                {!isLoading && view === 'subscriptions' && (
                    <div className="space-y-4">
                        {subscriptions.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                                <Package className="mx-auto text-slate-300" size={60} />
                                <h3 className="mt-4 font-bold text-slate-600">لا توجد اشتراكات</h3>
                                <p className="text-slate-400 text-sm mt-1">اشترك في الباقات للبدء</p>
                                <button
                                    onClick={() => setView('browse')}
                                    className="mt-4 bg-shibl-crimson text-white px-6 py-2.5 rounded-xl font-bold text-sm"
                                >
                                    تصفح الباقات
                                </button>
                            </div>
                        ) : (
                            subscriptions.map((sub) => (
                                <div key={sub.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        {/* Package Image */}
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                            <img
                                                src={sub.package?.image || '/images/package-placeholder.png'}
                                                alt={sub.package?.name || 'Package'}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/images/package-placeholder.png';
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-charcoal">{sub.package?.name || 'باقة'}</h3>
                                            <p className="text-slate-400 text-sm">
                                                تاريخ الاشتراك: {new Date(sub.created_at).toLocaleDateString('ar-EG')}
                                            </p>
                                            {sub.package?.courses_count && (
                                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                    <BookOpen size={12} />
                                                    {sub.package.courses_count} دورة
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <StatusBadge status={sub.status} />
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Package Details View */}
                {!isLoading && view === 'details' && selectedPackage && (
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        {/* Header with Cover Image */}
                        <div className="relative">
                            {/* Package Cover Image */}
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={selectedPackage.image || '/images/package-placeholder.png'}
                                    alt={selectedPackage.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/images/package-placeholder.png';
                                    }}
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                                <button
                                    onClick={() => setView('browse')}
                                    className="absolute top-4 right-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full px-4 py-2 text-sm transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                    العودة للباقات
                                </button>

                                <h2 className="text-2xl font-extrabold">{selectedPackage.name}</h2>
                                <p className="text-white/80 mt-2 line-clamp-2">{selectedPackage.description}</p>

                                <div className="flex items-center gap-6 mt-4">
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                        <BookOpen size={16} />
                                        <span className="text-sm font-bold">{selectedPackage.courses?.length || 0} دورة</span>
                                    </div>

                                    {/* Price with discount display */}
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                        <DollarSign size={16} />
                                        {selectedPackage.is_discount_valid && selectedPackage.final_price ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs line-through opacity-70">{selectedPackage.price}</span>
                                                <span className="text-sm font-bold">{selectedPackage.final_price} ر.ع</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm font-bold">{selectedPackage.price} ر.ع</span>
                                        )}
                                    </div>

                                    {/* Discount Badge */}
                                    {selectedPackage.is_discount_valid && selectedPackage.discount_percentage && (
                                        <div className="bg-emerald-500 rounded-full px-4 py-2 flex items-center gap-1">
                                            <span className="text-sm font-extrabold">{Math.round(selectedPackage.discount_percentage)}%</span>
                                            <span className="text-xs">خصم</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Courses List */}
                        <div className="p-8">
                            <h3 className="font-bold text-charcoal text-lg mb-4">الدورات المتضمنة</h3>
                            <div className="space-y-3">
                                {selectedPackage.courses?.map((course) => {
                                    const courseImage = course.image || course.thumbnail;

                                    return (
                                        <div key={course.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                            {/* Course Image or Icon */}
                                            {courseImage ? (
                                                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={courseImage}
                                                        alt={course.name || course.title || 'Course'}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            // On error, replace with icon container
                                                            const parent = (e.target as HTMLImageElement).parentElement;
                                                            if (parent) {
                                                                parent.innerHTML = `<div class="w-full h-full bg-shibl-crimson/10 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-shibl-crimson"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg></div>`;
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-14 h-14 bg-shibl-crimson/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <BookOpen size={24} className="text-shibl-crimson" />
                                                </div>
                                            )}

                                            {/* Course Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-charcoal text-sm truncate">
                                                    {course.name || course.title || 'دورة'}
                                                </h4>
                                                <p className="text-slate-400 text-xs truncate">
                                                    {course.teacher?.name || course.subject?.name || 'مدرس'}
                                                </p>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-sm font-bold text-shibl-crimson">{course.price} ر.ع</span>
                                                <div className="w-8 h-8 bg-shibl-crimson rounded-lg flex items-center justify-center">
                                                    <BookOpen size={14} className="text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Purchase Button or Status */}
                            {(() => {
                                const subscription = selectedPackage ? getPackageSubscription(selectedPackage.id) : undefined;
                                const isSubscribed = !!subscription;
                                const subscriptionStatus = subscription?.status;

                                if (isSubscribed) {
                                    return (
                                        <div className="mt-8 space-y-4">
                                            {/* Status Banner */}
                                            <div className={`p-4 rounded-xl flex items-center gap-4 ${subscriptionStatus === 'active'
                                                ? 'bg-emerald-50 border border-emerald-200'
                                                : subscriptionStatus === 'pending'
                                                    ? 'bg-amber-50 border border-amber-200'
                                                    : subscriptionStatus === 'rejected'
                                                        ? 'bg-red-50 border border-red-200'
                                                        : 'bg-slate-50 border border-slate-200'
                                                }`}>
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${subscriptionStatus === 'active'
                                                    ? 'bg-emerald-500'
                                                    : subscriptionStatus === 'pending'
                                                        ? 'bg-amber-500'
                                                        : subscriptionStatus === 'rejected'
                                                            ? 'bg-red-500'
                                                            : 'bg-slate-500'
                                                    }`}>
                                                    {subscriptionStatus === 'active' && <CheckCircle size={24} className="text-white" />}
                                                    {subscriptionStatus === 'pending' && <Clock size={24} className="text-white" />}
                                                    {subscriptionStatus === 'rejected' && <X size={24} className="text-white" />}
                                                    {subscriptionStatus === 'expired' && <Clock size={24} className="text-white" />}
                                                </div>
                                                <div>
                                                    <h4 className={`font-bold ${subscriptionStatus === 'active'
                                                        ? 'text-emerald-700'
                                                        : subscriptionStatus === 'pending'
                                                            ? 'text-amber-700'
                                                            : subscriptionStatus === 'rejected'
                                                                ? 'text-red-700'
                                                                : 'text-slate-700'
                                                        }`}>
                                                        {subscriptionStatus === 'active' ? 'أنت مشترك في هذه الباقة'
                                                            : subscriptionStatus === 'pending' ? 'طلب الاشتراك قيد المراجعة'
                                                                : subscriptionStatus === 'rejected' ? 'تم رفض طلب الاشتراك'
                                                                    : 'انتهى اشتراكك في هذه الباقة'}
                                                    </h4>
                                                    <p className="text-sm text-slate-500">
                                                        {subscriptionStatus === 'active'
                                                            ? 'يمكنك الوصول لجميع الدورات في هذه الباقة'
                                                            : subscriptionStatus === 'pending'
                                                                ? 'سيتم إشعارك فور الموافقة على طلبك'
                                                                : subscriptionStatus === 'rejected'
                                                                    ? subscription?.rejection_reason || 'يمكنك المحاولة مرة أخرى'
                                                                    : 'يمكنك تجديد الاشتراك'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Button for rejected/expired - allow re-subscribe */}
                                            {(subscriptionStatus === 'rejected' || subscriptionStatus === 'expired') && (
                                                <button
                                                    onClick={() => setShowPurchaseModal(true)}
                                                    className="w-full bg-shibl-crimson text-white py-4 rounded-full font-bold text-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-3 shadow-lg shadow-shibl-crimson/25"
                                                >
                                                    <CheckCircle size={22} />
                                                    {subscriptionStatus === 'rejected' ? 'إعادة طلب الاشتراك' : 'تجديد الاشتراك'} - {selectedPackage.final_price ?? selectedPackage.price} ر.ع
                                                </button>
                                            )}

                                            {/* Go to subscriptions button */}
                                            <button
                                                onClick={() => setView('subscriptions')}
                                                className="w-full border-2 border-shibl-crimson text-shibl-crimson py-3 rounded-full font-bold text-sm hover:bg-shibl-crimson/5 transition-colors flex items-center justify-center gap-2"
                                            >
                                                عرض اشتراكاتي
                                                <ChevronLeft size={18} />
                                            </button>
                                        </div>
                                    );
                                }

                                // Not subscribed - show purchase button
                                return (
                                    <button
                                        onClick={() => setShowPurchaseModal(true)}
                                        className="w-full mt-8 bg-shibl-crimson text-white py-4 rounded-full font-bold text-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-3 shadow-lg shadow-shibl-crimson/25"
                                    >
                                        <CheckCircle size={22} />
                                        اشترك الآن - {selectedPackage?.final_price ?? selectedPackage?.price} ر.ع
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* Purchase Modal */}
                {showPurchaseModal && selectedPackage && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-br from-shibl-crimson to-red-700 p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg">إتمام الاشتراك</h3>
                                    <button onClick={() => setShowPurchaseModal(false)} className="text-white/80 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-white/80 text-sm mt-1">{selectedPackage.name}</p>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Success State */}
                                {purchaseSuccess ? (
                                    <div className="text-center py-8">
                                        <CheckCircle className="mx-auto text-emerald-500" size={60} />
                                        <h4 className="mt-4 font-bold text-charcoal">تم إرسال طلبك بنجاح!</h4>
                                        <p className="text-slate-400 text-sm mt-1">سيتم مراجعة طلبك قريباً</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Price Summary */}
                                        <div className="bg-slate-50 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-600">إجمالي المبلغ</span>
                                                <span className="font-bold text-xl text-charcoal">{selectedPackage.price} ر.ع</span>
                                            </div>
                                        </div>

                                        {/* Bill Upload */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 mb-2">
                                                صورة إيصال الدفع <span className="text-red-500">*</span>
                                            </label>
                                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-shibl-crimson transition-colors">
                                                {billImage ? (
                                                    <div className="space-y-2">
                                                        <CheckCircle className="mx-auto text-emerald-500" size={32} />
                                                        <p className="text-sm text-slate-600">{billImage.name}</p>
                                                        <button
                                                            onClick={() => setBillImage(null)}
                                                            className="text-red-500 text-xs hover:underline"
                                                        >
                                                            إزالة
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer">
                                                        <Upload className="mx-auto text-slate-400" size={32} />
                                                        <p className="text-sm text-slate-500 mt-2">اضغط لرفع الصورة</p>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => setBillImage(e.target.files?.[0] || null)}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            onClick={handlePurchase}
                                            disabled={isPurchasing || !billImage}
                                            className="w-full bg-shibl-crimson text-white py-3.5 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isPurchasing ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={18} />
                                                    جاري الإرسال...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle size={18} />
                                                    تأكيد الاشتراك
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentPackagesPage;
