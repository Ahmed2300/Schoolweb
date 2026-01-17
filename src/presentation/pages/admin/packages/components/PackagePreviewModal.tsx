import { X, BookOpen, Clock, Award, Percent, Tag } from 'lucide-react';
import { PackageNodeData } from '../types';

interface PackagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    packageData: PackageNodeData;
    courses: { id: number; name: string; price: number; subject?: string }[];
}

export function PackagePreviewModal({ isOpen, onClose, packageData, courses }: PackagePreviewModalProps) {
    if (!isOpen) return null;

    // Calculate discount values
    const hasDiscount = packageData.isDiscountActive && packageData.discountPercentage;
    const discountAmount = hasDiscount
        ? (packageData.totalPrice * (packageData.discountPercentage || 0)) / 100
        : 0;
    const finalPrice = hasDiscount
        ? packageData.totalPrice - discountAmount
        : packageData.totalPrice;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ fontFamily: 'Cairo, sans-serif' }}>
            <div className="bg-white rounded-[24px] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">

                {/* Left Side: Package Details & Cover - THEME: Red Gradient */}
                <div className="md:w-2/5 bg-gradient-to-br from-[#AF0C15] to-[#800000] text-white p-8 relative overflow-hidden">
                    {/* Decorative Fluid Lines/Circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    {/* Wave Motif Overlay (CSS approximation) */}
                    <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgydjJIMUMxeiIgZmlsbD0iI2ZmZiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] mix-blend-overlay"></div>

                    <div className="relative z-10 h-full flex flex-col">
                        <div className="mb-6 flex gap-2">
                            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold backdrop-blur-md">
                                باقة مميزة
                            </span>
                            {hasDiscount && (
                                <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                                    <Percent size={12} />
                                    خصم {packageData.discountPercentage}%
                                </span>
                            )}
                        </div>

                        <h2 className="text-3xl font-bold mb-4 leading-tight">{packageData.label}</h2>

                        <p className="text-white/80 text-sm leading-relaxed mb-8 flex-1">
                            {packageData.description || 'احصل على مجموعة مميزة من الكورسات التعليمية ووفر في تكلفة اشتراكك. هذه الباقة مصممة خصيصاً لتلبية احتياجاتك الدراسية.'}
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-white/90">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                                    <BookOpen size={16} />
                                </div>
                                <span>{courses.length} كورسات شاملة</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/90">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                                    <Clock size={16} />
                                </div>
                                <span>صلاحية مدى الحياة</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/90">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                                    <Award size={16} />
                                </div>
                                <span>شهادات إتمام</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/20">
                            {/* Show discount pricing */}
                            {hasDiscount ? (
                                <>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-lg text-white/60 line-through">
                                            {packageData.totalPrice.toLocaleString()} ج.م
                                        </span>
                                        <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded text-xs font-bold">
                                            وفر {discountAmount.toLocaleString()} ج.م
                                        </span>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-bold text-yellow-300">
                                            {finalPrice.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-white/80 mb-2">ج.م</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-bold text-white">
                                        {packageData.totalPrice.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-white/80 mb-2">ج.م</span>
                                </div>
                            )}
                            <p className="text-xs text-white/60 mt-1">شامل الضريبة</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Course List - THEME: Soft Cloud Background */}
                <div className="md:w-3/5 bg-[#F8F9FA] flex flex-col h-[600px] md:h-auto">
                    <div className="p-6 flex items-center justify-between bg-white shadow-sm z-10">
                        <h3 className="font-bold text-[#1F1F1F]">محتويات الباقة</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors text-[#636E72]"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="bg-white p-4 rounded-[16px] flex items-center gap-4 group transition-transform hover:-translate-y-1"
                                    style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }}
                                >
                                    <div className="w-12 h-12 rounded-[12px] bg-[#AF0C15]/5 flex items-center justify-center text-[#AF0C15] group-hover:bg-[#AF0C15] group-hover:text-white transition-colors">
                                        <BookOpen size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-[#1F1F1F] text-sm md:text-base group-hover:text-[#AF0C15] transition-colors">
                                            {course.name}
                                        </h4>
                                        <p className="text-xs text-[#636E72] mt-1">
                                            {course.subject || 'مادة دراسية'}
                                        </p>
                                    </div>
                                    <div className="font-bold text-[#1F1F1F] text-sm">
                                        {course.price.toLocaleString()} ج.م
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[#636E72] text-center p-8">
                                <BookOpen size={48} className="mb-4 opacity-20" />
                                <p>لا يوجد كورسات في هذه الباقة حتى الآن</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-white border-t border-[#E9ECEF]">
                        <button className="w-full py-3.5 bg-[#AF0C15] text-white rounded-full font-bold hover:bg-[#920a11] transition-all shadow-lg shadow-[#AF0C15]/20 flex items-center justify-center gap-2 cursor-not-allowed opacity-90 hover:shadow-xl hover:shadow-[#AF0C15]/30">
                            <span>اشترك الآن</span>
                            <span className="text-xs font-normal opacity-70">(معاينة فقط)</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
