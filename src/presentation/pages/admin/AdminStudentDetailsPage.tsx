import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../../data/api/adminService';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Globe,
    GraduationCap,
    Info,
    Briefcase,
    Users
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminStudentDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: student, isLoading, error } = useQuery({
        queryKey: ['admin-student-details', id],
        queryFn: () => adminService.getStudent(Number(id)),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                <p>فشل في تحميل بيانات الطالب. يرجى المحاولة مرة أخرى.</p>
                <button
                    onClick={() => navigate('/admin/users')}
                    className="mt-2 text-primary hover:underline flex items-center gap-1"
                >
                    <ArrowLeft size={16} /> العودة إلى المستخدمين
                </button>
            </div>
        );
    }

    // Since UserData might not have explicit typings for included relationships in the frontend,
    // we use `any` casting carefully for the loaded relationships.
    const parent = (student as any).parent;
    const country = (student as any).country;
    const city = (student as any).city;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    aria-label="العودة للمستخدمين"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">تفاصيل الطالب</h1>
                    <p className="text-slate-500 text-sm">عرض شامل لمعلومات الطالب وولي الأمر</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="text-primary" size={20} />
                            <h2 className="text-lg font-semibold text-slate-800">الملف الشخصي للطالب</h2>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${student.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            student.status === 'inactive' ? 'bg-slate-100 text-slate-700' :
                                'bg-amber-100 text-amber-700'
                            }`}>
                            {student.status === 'active' ? 'نشط' : student.status === 'inactive' ? 'غير نشط' : 'في إجازة'}
                        </span>
                    </div>
                    <div className="p-6 space-y-4 flex-1">
                        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                <AvatarImage
                                    src={student.image_path}
                                    alt={student.name}
                                    fallbackIcon={User}
                                    fallbackColorClass="text-primary"
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{student.name}</h3>
                                <p className="text-sm text-slate-500 capitalize">{student.role === 'student' ? 'طالب' : student.role}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <InfoItem icon={<Mail size={16} />} label="البريد الإلكتروني" value={student.email} />
                            <InfoItem icon={<Phone size={16} />} label="رقم الهاتف" value={student.phone || 'غير متوفر'} />
                            <InfoItem icon={<GraduationCap size={16} />} label="الصف الدراسي" value={student.grade || 'غير متوفر'} />
                            <InfoItem icon={<Globe size={16} />} label="الدولة" value={country?.name || 'غير متوفر'} />
                            <InfoItem icon={<MapPin size={16} />} label="المدينة" value={city?.name || 'غير متوفر'} />
                            <InfoItem icon={<Info size={16} />} label="كيف تعرفت علينا" value={student.how_do_you_know_us || 'غير متوفر'} />
                            <InfoItem
                                icon={<Calendar size={16} />}
                                label="تاريخ التسجيل"
                                value={student.created_at ? new Date(student.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير متوفر'}
                            />
                        </div>
                    </div>
                </div>

                {/* Parent Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-2">
                        <Users className="text-indigo-600" size={20} />
                        <h2 className="text-lg font-semibold text-slate-800">الملف الشخصي لولي الأمر</h2>
                    </div>
                    <div className="p-6 space-y-4 flex-1">
                        {parent ? (
                            <>
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
                                        <p className="text-sm text-slate-500">ولي الأمر المرتبط</p>
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
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                                <Users size={48} className="mb-4 text-slate-300" />
                                <p className="text-lg font-medium text-slate-600">لا يوجد ولي أمر مرتبط</p>
                                <p className="text-sm mt-1 text-center max-w-xs">
                                    هذا الطالب ليس لديه حساب ولي أمر مرتبط به حاليًا.
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
