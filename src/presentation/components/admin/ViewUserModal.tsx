import { useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, GraduationCap, Calendar, Clock, CheckCircle, XCircle, Users, Briefcase, MessageCircle } from 'lucide-react';
import { UserData, UserRole } from '../../../data/api/adminService';

interface ViewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserData | null;
    onEdit?: (user: UserData) => void;
}

interface InfoItem {
    label: string;
    value: string | null | undefined;
    icon: React.ReactNode;
}

const roleLabels: Record<UserRole, string> = {
    student: 'طالب',
    parent: 'ولي أمر',
    teacher: 'مدرس',
};

const roleColors: Record<UserRole, { bg: string; text: string }> = {
    student: { bg: 'bg-blue-100', text: 'text-blue-700' },
    parent: { bg: 'bg-green-100', text: 'text-green-700' },
    teacher: { bg: 'bg-purple-100', text: 'text-purple-700' },
};

const howKnowUsLabels: Record<string, string> = {
    instagram: 'Instagram',
    twitter: 'Twitter',
    snapchat: 'Snapchat',
    facebook: 'Facebook',
    whatsapp: 'WhatsApp',
    phone_call: 'مكالمة هاتفية',
    friend: 'صديق',
    other: 'أخرى',
};

const relationshipLabels: Record<string, string> = {
    father: 'أب',
    mother: 'أم',
    guardian: 'وصي',
    other: 'أخرى',
};

const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateString;
    }
};

export function ViewUserModal({ isOpen, onClose, user, onEdit }: ViewUserModalProps) {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !user) return null;

    // Build info items based on role
    const getInfoItems = (): InfoItem[] => {
        const commonItems: InfoItem[] = [
            { label: 'البريد الإلكتروني', value: user.email, icon: <Mail size={18} /> },
            { label: 'رقم الهاتف', value: user.phone, icon: <Phone size={18} /> },
        ];

        switch (user.role) {
            case 'student':
                return [
                    ...commonItems,
                    { label: 'هاتف ولي الأمر', value: user.parent_phone, icon: <Users size={18} /> },
                    { label: 'الصف الدراسي', value: user.grade, icon: <GraduationCap size={18} /> },
                    {
                        label: 'كيف عرفت عنا؟',
                        value: user.how_do_you_know_us ? howKnowUsLabels[user.how_do_you_know_us] || user.how_do_you_know_us : null,
                        icon: <MessageCircle size={18} />
                    },
                ];

            case 'parent':
                return [
                    ...commonItems,
                    { label: 'العنوان', value: user.address, icon: <MapPin size={18} /> },
                    {
                        label: 'صلة القرابة',
                        value: user.relationship ? relationshipLabels[user.relationship] || user.relationship : null,
                        icon: <Users size={18} />
                    },
                    { label: 'المهنة', value: user.occupation, icon: <Briefcase size={18} /> },
                ];

            case 'teacher':
                return [...commonItems];

            default:
                return commonItems;
        }
    };

    const infoItems = getInfoItems();
    const isActive = user.status === 'active';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-[20px] shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header with gradient */}
                <div className="bg-gradient-to-br from-shibl-crimson to-red-700 px-6 py-8 text-white relative">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                    >
                        <X size={18} />
                    </button>

                    {/* Avatar */}
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold mb-3 ring-4 ring-white/30">
                            {user.name.charAt(0)}
                        </div>
                        <h2 className="text-xl font-extrabold text-center">{user.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role].bg} ${roleColors[user.role].text}`}>
                                {roleLabels[user.role]}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                {isActive ? 'نشط' : 'غير نشط'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Info Grid */}
                    <div className="space-y-4">
                        {infoItems.map((item, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-[10px] bg-soft-cloud flex items-center justify-center text-slate-400 flex-shrink-0">
                                    {item.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-grey font-medium">{item.label}</p>
                                    <p className="text-sm font-semibold text-charcoal truncate" dir="auto">
                                        {item.value || <span className="text-slate-400">غير محدد</span>}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Timestamps */}
                    <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-xs text-slate-grey">
                            <Calendar size={14} />
                            <div>
                                <p className="font-medium">تاريخ الانضمام</p>
                                <p className="text-charcoal font-semibold">{formatDate(user.created_at)}</p>
                            </div>
                        </div>
                        {user.updated_at && (
                            <div className="flex items-center gap-2 text-xs text-slate-grey">
                                <Clock size={14} />
                                <div>
                                    <p className="font-medium">آخر تحديث</p>
                                    <p className="text-charcoal font-semibold">{formatDate(user.updated_at)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 h-11 rounded-pill bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold text-sm transition-all"
                        >
                            إغلاق
                        </button>
                        {onEdit && (
                            <button
                                onClick={() => {
                                    onClose();
                                    onEdit(user);
                                }}
                                className="flex-1 h-11 rounded-pill bg-shibl-crimson hover:bg-shibl-crimson-dark text-white font-bold text-sm shadow-crimson transition-all duration-300 hover:-translate-y-0.5"
                            >
                                تعديل البيانات
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
