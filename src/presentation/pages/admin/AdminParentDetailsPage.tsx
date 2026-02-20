import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Users,
    Calendar,
    Loader2,
    GraduationCap,
    AlertCircle
} from 'lucide-react';
import { adminService } from '../../../data/api/adminService';

export default function AdminParentDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: parent, isLoading, isError } = useQuery({
        queryKey: ['admin-parent-details', id],
        queryFn: async () => {
            if (!id) throw new Error('Parent ID is required');
            const response = await adminService.getParent(Number(id));
            return response;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isError || !parent) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                <p>فشل في تحميل بيانات ولي الأمر. يرجى المحاولة مرة أخرى.</p>
                <button
                    onClick={() => navigate('/admin/users')}
                    className="mt-2 text-primary hover:underline flex items-center gap-1"
                >
                    <ArrowLeft size={16} /> العودة إلى المستخدمين
                </button>
            </div>
        );
    }

    const students = parent.students || [];

    return (
        <div className="space-y-6">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    aria-label="العودة للمستخدمين"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">تفاصيل ولي الأمر</h1>
                    <p className="text-slate-500 text-sm">عرض شامل لمعلومات ولي الأمر والطلاب المرتبطين به</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Parent Profile Section */}
                <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-fit">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="text-indigo-600" size={20} />
                            <h2 className="text-lg font-semibold text-slate-800">الملف الشخصي</h2>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${parent.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            parent.status === 'inactive' ? 'bg-slate-100 text-slate-700' :
                                'bg-amber-100 text-amber-700'
                            }`}>
                            {parent.status === 'active' ? 'نشط' : parent.status === 'inactive' ? 'غير نشط' : 'غير معروف'}
                        </span>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                            <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                <AvatarImage
                                    src={parent.image_path}
                                    alt={parent.name}
                                    fallbackIcon={User}
                                    fallbackColorClass="text-indigo-600"
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{parent.name}</h3>
                                <p className="text-sm text-slate-500 capitalize">ولي أمر</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <InfoItem icon={<Mail size={16} />} label="البريد الإلكتروني" value={parent.email} />
                            <InfoItem icon={<Phone size={16} />} label="رقم الهاتف" value={parent.phone || 'غير متوفر'} />
                            <InfoItem icon={<Users size={16} />} label="صلة القرابة" value={parent.relationship || 'غير متوفر'} />
                            <InfoItem icon={<Briefcase size={16} />} label="الوظيفة" value={parent.occupation || 'غير متوفر'} />
                            <InfoItem icon={<MapPin size={16} />} label="العنوان" value={parent.address || 'غير متوفر'} />
                            <InfoItem
                                icon={<Calendar size={16} />}
                                label="تاريخ التسجيل"
                                value={parent.created_at ? new Date(parent.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير متوفر'}
                            />
                        </div>
                    </div>
                </div>

                {/* Connected Students Section */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-2">
                        <GraduationCap className="text-primary" size={20} />
                        <h2 className="text-lg font-semibold text-slate-800">الطلاب المرتبطين ({students.length})</h2>
                    </div>

                    <div className="p-6 flex-1 bg-slate-50/50">
                        {students.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {students.map((student: any) => (
                                    <div
                                        key={student.id}
                                        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/30 transition-all group flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    <AvatarImage
                                                        src={student.image_path}
                                                        alt={student.name}
                                                        fallbackIcon={User}
                                                        fallbackColorClass="text-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">{student.name}</h3>
                                                </div>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Mail size={14} className="text-slate-400" />
                                                    <span className="truncate">{student.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/admin/users/students/${student.id}`)}
                                            className="w-full py-2 mt-4 bg-slate-50 hover:bg-primary hover:text-white text-primary border border-primary/20 hover:border-primary rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                        >
                                            عرض ملف الطالب
                                            <ArrowLeft size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                                <GraduationCap size={48} className="mb-4 text-slate-300" />
                                <p className="text-lg font-medium text-slate-600">لا يوجد طلاب مرتبطين</p>
                                <p className="text-sm mt-1 text-center max-w-xs">
                                    هذا الحساب ليس لديه أي طلاب مرتبطين به حاليًا.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper component for displaying info items consistently
function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-slate-400">
                {icon}
            </div>
            <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">{label}</p>
                <p className="text-sm text-slate-800">{value}</p>
            </div>
        </div>
    );
}

// Helper component for avatars that fallback to an icon on image error
function AvatarImage({ src, alt, fallbackIcon: FallbackIcon, fallbackColorClass }: { src?: string | null, alt: string, fallbackIcon: any, fallbackColorClass: string }) {
    const [error, setError] = React.useState(false);

    if (!src || error) {
        return <FallbackIcon size={32} className={fallbackColorClass} />;
    }

    return (
        <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover rounded-full"
            onError={() => setError(true)}
        />
    );
}
