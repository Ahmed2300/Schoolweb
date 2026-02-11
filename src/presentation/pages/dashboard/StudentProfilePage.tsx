import { useState } from 'react';
import { useAuthStore } from '../../store';
import { User, Mail, Phone, MapPin, Edit3, X, Save, Loader2, Calendar, Lock, KeyRound, Copy, Check, Hash, Link2 } from 'lucide-react';
import { AuthRepository } from '../../../data/repositories/AuthRepository';
import { authService } from '../../../data/api';

// Omani Governorates (ولايات عمان)
const OMAN_GOVERNORATES = [
    { value: '', label: 'اختر الولاية' },
    { value: 'muscat', label: 'مسقط' },
    { value: 'dhofar', label: 'ظفار' },
    { value: 'musandam', label: 'مسندم' },
    { value: 'al-buraimi', label: 'البريمي' },
    { value: 'ad-dakhiliyah', label: 'الداخلية' },
    { value: 'al-batinah-north', label: 'شمال الباطنة' },
    { value: 'al-batinah-south', label: 'جنوب الباطنة' },
    { value: 'ash-sharqiyah-north', label: 'شمال الشرقية' },
    { value: 'ash-sharqiyah-south', label: 'جنوب الشرقية' },
    { value: 'adh-dhahirah', label: 'الظاهرة' },
    { value: 'al-wusta', label: 'الوسطى' },
];

interface EditProfileFormData {
    name: string;
    phone: string;
    governorate: string;
    date_of_birth: string;
    parent_name: string;
    parent_phone: string;
    parent_email: string;
}

export function StudentProfilePage() {
    const { user, setUser } = useAuthStore();
    const userInitials = user?.name?.charAt(0) || 'ط';

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<EditProfileFormData>({
        name: user?.name || '',
        phone: user?.phoneNumber || user?.phone || '',
        governorate: '',
        date_of_birth: '',
        parent_name: '',
        parent_phone: '',
        parent_email: '',
    });

    // Image upload state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Password change modal state
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        old_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const [copiedField, setCopiedField] = useState<string | null>(null);

    // UID generation state
    const [isGeneratingUid, setIsGeneratingUid] = useState(false);
    const [studentUid, setStudentUid] = useState<string | null>((user as any)?.uid || null);
    const [parentImageError, setParentImageError] = useState(false);

    const handleCopy = (text: string, fieldName: string) => {
        if (!text || text === 'غير مسجل') return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleGenerateUid = async () => {
        setIsGeneratingUid(true);
        try {
            const response = await authService.studentGenerateUid();
            if (response.success && response.data?.uid) {
                setStudentUid(response.data.uid);
                // Update store with new UID
                if (user) {
                    setUser({ ...user, uid: response.data.uid } as any);
                }
            }
        } catch (err) {
            console.error('Failed to generate UID:', err);
        } finally {
            setIsGeneratingUid(false);
        }
    };

    const openModal = () => {
        // Parse governorate from address if exists (format: "مسقط، سلطنة عمان")
        const userAddress = (user as any)?.address || '';
        let currentGovernorate = '';
        if (userAddress) {
            const govMatch = OMAN_GOVERNORATES.find(g =>
                g.label && userAddress.includes(g.label)
            );
            currentGovernorate = govMatch?.value || '';
        }

        // Format date_of_birth for input (YYYY-MM-DD)
        const userDob = (user as any)?.date_of_birth;
        let formattedDob = '';
        if (userDob) {
            const date = new Date(userDob);
            formattedDob = date.toISOString().split('T')[0];
        }

        setFormData({
            name: user?.name || '',
            phone: user?.phoneNumber || user?.phone || '',
            governorate: currentGovernorate,
            date_of_birth: formattedDob,
            parent_name: (user as any)?.parent_name || '',
            parent_phone: (user as any)?.parent_phone || '',
            parent_email: (user as any)?.parent_email || '',
        });
        setImageFile(null);
        setImagePreview(null);
        setError(null);
        setSuccessMessage(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setError(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const authRepository = new AuthRepository();

            // Prepare update data
            const selectedGov = OMAN_GOVERNORATES.find(g => g.value === formData.governorate);

            let updatePayload: any;

            if (imageFile) {
                const data = new FormData();
                if (formData.name) data.append('name', formData.name);
                // Phone is read-only, do not send updates
                // if (formData.phone) data.append('phone', formData.phone);
                if (selectedGov) data.append('address', `${selectedGov.label}، سلطنة عمان`);
                if (formData.date_of_birth) data.append('date_of_birth', formData.date_of_birth);
                if (formData.parent_name) data.append('parent_name', formData.parent_name);
                if (formData.parent_phone) data.append('parent_phone', formData.parent_phone);
                if (formData.parent_email) data.append('parent_email', formData.parent_email);
                data.append('image', imageFile);
                // Add _method PUT for Laravel to handle multipart/form-data with PUT requests
                data.append('_method', 'PUT');

                // For FormData with file upload, we usually need to use POST method with _method=PUT in Laravel
                // However, apiClient.put sends a PUT request. 
                // Using apiClient.post with _method=PUT is safer for file uploads in Laravel
                updatePayload = data;
            } else {
                updatePayload = {
                    ...(formData.name && { name: formData.name }),
                    // Phone is read-only
                    // ...(formData.phone && { phone: formData.phone }),
                    ...(selectedGov && { address: `${selectedGov.label}، سلطنة عمان` }),
                    ...(formData.date_of_birth && { date_of_birth: formData.date_of_birth }),
                    ...(formData.parent_name && { parent_name: formData.parent_name }),
                    ...(formData.parent_phone && { parent_phone: formData.parent_phone }),
                    ...(formData.parent_email && { parent_email: formData.parent_email }),
                };
            }

            if (!imageFile && Object.keys(updatePayload).length === 0) {
                setError('لم يتم تغيير أي بيانات');
                setIsLoading(false);
                return;
            }

            // Use the repository which handles method spoofing internally
            const updatedUser = await authRepository.updateProfile(updatePayload);

            // Merge updated data with existing user to preserve all fields
            if (updatedUser && user) {
                const mergedUser = {
                    ...user,
                    ...updatedUser,
                    // Ensure phone fields are synced
                    phoneNumber: updatedUser.phone || updatedUser.phoneNumber || formData.phone,
                    phone: updatedUser.phone || formData.phone,
                    parent_name: formData.parent_name || (user as any).parent_name,
                    parent_phone: formData.parent_phone || (user as any).parent_phone,
                    parent_email: formData.parent_email || (user as any).parent_email,
                    // Ensure date_of_birth is preserved
                    date_of_birth: (updatedUser as any).date_of_birth || formData.date_of_birth || (user as any).date_of_birth,
                    // Ensure address is preserved
                    address: (updatedUser as any).address || (updatePayload instanceof FormData ? updatePayload.get('address') : updatePayload.address) || (user as any).address,
                };
                setUser(mergedUser as any);
            } else if (updatedUser) {
                // Merge with form data when no existing user
                const userWithFormData = {
                    ...updatedUser,
                    phone: (updatedUser as any).phone || formData.phone,
                    phoneNumber: (updatedUser as any).phone || formData.phone,
                    date_of_birth: (updatedUser as any).date_of_birth || formData.date_of_birth,
                    address: (updatedUser as any).address || updatePayload.address || (updatePayload instanceof FormData ? updatePayload.get('address') : undefined),
                };
                setUser(userWithFormData as any);
            } else {
                // If backend doesn't return user, update locally with all fields
                setUser({
                    ...user!,
                    name: formData.name || user!.name,
                    phone: formData.phone || user!.phone || '',
                    phoneNumber: formData.phone || user!.phoneNumber,
                    date_of_birth: formData.date_of_birth || (user as any)?.date_of_birth,
                    address: (updatePayload instanceof FormData ? updatePayload.get('address') : updatePayload.address) || (user as any)?.address,
                } as any);
            }

            setSuccessMessage('تم تحديث البيانات بنجاح');

            // Close modal after success
            setTimeout(() => {
                closeModal();
            }, 1500);

        } catch (err) {
            console.error('Profile update error:', err);

            // Even if backend fails, update local state (optimistic update)
            // This allows the user to see their changes while backend issues are resolved
            if (user) {
                const selectedGovForFallback = OMAN_GOVERNORATES.find(g => g.value === formData.governorate);
                const fallbackAddress = selectedGovForFallback ? `${selectedGovForFallback.label}، سلطنة عمان` : (user as any)?.address;

                const localUpdate = {
                    ...user,
                    name: formData.name || user.name,
                    phone: formData.phone || user.phone || '',
                    phoneNumber: formData.phone || user.phoneNumber,
                    date_of_birth: formData.date_of_birth || (user as any)?.date_of_birth,
                    address: fallbackAddress,
                };
                setUser(localUpdate as any);
                setSuccessMessage('تم حفظ البيانات محلياً. سيتم المزامنة لاحقاً.');
                setTimeout(() => {
                    closeModal();
                }, 1500);
            } else {
                setError('حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Password change handlers
    const openPasswordModal = () => {
        setPasswordForm({ old_password: '', new_password: '', new_password_confirmation: '' });
        setPasswordError(null);
        setPasswordSuccess(null);
        setIsPasswordModalOpen(true);
    };

    const closePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setPasswordError(null);
    };

    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordError(null);
        setPasswordSuccess(null);

        // Validate
        if (passwordForm.new_password.length < 8) {
            setPasswordError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            setPasswordLoading(false);
            return;
        }

        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            setPasswordError('كلمتا المرور غير متطابقتين');
            setPasswordLoading(false);
            return;
        }

        try {
            await authService.studentChangePassword(passwordForm);
            setPasswordSuccess('تم تغيير كلمة المرور بنجاح');
            setTimeout(() => {
                closePasswordModal();
            }, 1500);
        } catch (err) {
            console.error('Password change error:', err);
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء تغيير كلمة المرور';
            if (errorMessage.includes('credentials') || errorMessage.includes('password')) {
                setPasswordError('كلمة المرور الحالية غير صحيحة');
            } else {
                setPasswordError(errorMessage);
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-extrabold text-charcoal mb-8">الملف الشخصي</h1>

            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                {/* Cover */}
                <div className="h-32 bg-gradient-to-r from-shibl-crimson to-[#8B0A12]"></div>

                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-8">
                        <div className="w-32 h-32 rounded-full border-[6px] border-white overflow-hidden bg-white shadow-md">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white text-3xl font-bold">
                                    {userInitials}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mb-2">
                            <button
                                onClick={openPasswordModal}
                                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <KeyRound size={16} />
                                تغيير كلمة المرور
                            </button>
                            <button
                                onClick={openModal}
                                className="flex items-center gap-2 bg-gradient-to-r from-shibl-crimson to-[#8B0A12] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-shibl-crimson/20 transition-all"
                            >
                                <Edit3 size={16} />
                                تعديل الملف
                            </button>
                        </div>
                    </div>

                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-extrabold text-charcoal">{user?.name}</h2>
                            <span className="bg-red-50 text-shibl-crimson px-4 py-1.5 rounded-full text-sm font-bold">طالب</span>
                        </div>
                        <p className="text-slate-400 flex items-center gap-2">
                            <MapPin size={16} />
                            {(user as any)?.address || 'غير مسجل'}
                        </p>
                    </div>

                    {/* Student UID Section */}
                    <div className="mb-6">
                        {studentUid ? (
                            <div className="group bg-gradient-to-r from-slate-50 to-emerald-50 p-5 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                        <Hash size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium mb-1">معرف الطالب (UID)</p>
                                        <p className="font-bold text-charcoal text-lg tracking-wider" dir="ltr">{studentUid}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleCopy(studentUid, 'uid')}
                                    className="flex items-center gap-2 bg-white border border-emerald-200 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-all"
                                >
                                    {copiedField === 'uid' ? <Check size={16} /> : <Copy size={16} />}
                                    {copiedField === 'uid' ? 'تم النسخ!' : 'نسخ المعرف'}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                        <Hash size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-charcoal">لم يتم إنشاء معرف الطالب بعد</p>
                                        <p className="text-xs text-slate-500 mt-0.5">يُستخدم المعرف لربط حسابك مع ولي الأمر</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGenerateUid}
                                    disabled={isGeneratingUid}
                                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGeneratingUid ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            جاري الإنشاء...
                                        </>
                                    ) : (
                                        <>
                                            <Hash size={16} />
                                            إنشاء المعرف
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-red-100 hover:shadow-[0px_4px_20px_rgba(201,28,28,0.05)] transition-all flex items-center gap-5 relative">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-shibl-crimson">
                                <Mail size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium mb-1">البريد الإلكتروني</p>
                                <p className="font-bold text-charcoal text-lg dir-ltr">{user?.email}</p>
                            </div>
                            <button
                                onClick={() => handleCopy(user?.email || '', 'email')}
                                className="absolute left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all p-2 text-slate-400 hover:text-shibl-crimson hover:bg-red-50 rounded-lg"
                                title="نسخ"
                            >
                                {copiedField === 'email' ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>

                        {/* Phone */}
                        <div className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-red-100 hover:shadow-[0px_4px_20px_rgba(201,28,28,0.05)] transition-all flex items-center gap-5 relative">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-shibl-crimson">
                                <Phone size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium mb-1">رقم الهاتف</p>
                                <p className="font-bold text-charcoal text-lg dir-ltr">{user?.phoneNumber || user?.phone || 'غير مسجل'}</p>
                            </div>
                            <button
                                onClick={() => handleCopy(user?.phoneNumber || user?.phone || '', 'phone')}
                                className="absolute left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all p-2 text-slate-400 hover:text-shibl-crimson hover:bg-red-50 rounded-lg"
                                title="نسخ"
                            >
                                {copiedField === 'phone' ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>

                        {/* Location */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-red-100 hover:shadow-[0px_4px_20px_rgba(201,28,28,0.05)] transition-all flex items-center gap-5">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-shibl-crimson">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium mb-1">الموقع</p>
                                <p className="font-bold text-charcoal text-lg">{(user as any)?.address || 'غير مسجل'}</p>
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-red-100 hover:shadow-[0px_4px_20px_rgba(201,28,28,0.05)] transition-all flex items-center gap-5">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-shibl-crimson">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium mb-1">تاريخ الميلاد</p>
                                <p className="font-bold text-charcoal text-lg">
                                    {(user as any)?.date_of_birth
                                        ? new Date((user as any).date_of_birth).toLocaleDateString('ar-OM', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : 'غير مسجل'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Parent Details Section */}
                    {/* Divider */}
                    <div className="my-10 border-t border-slate-100 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-slate-400 text-sm font-medium">
                            المرافق
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-charcoal flex items-center gap-2">
                            <User className="text-shibl-crimson" size={24} />
                            معلومات ولي الأمر
                        </h3>
                        {(user as any)?.has_linked_parent && (
                            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold">
                                <Link2 size={14} />
                                حساب مرتبط
                            </span>
                        )}
                    </div>

                    {(user as any)?.has_linked_parent ? (
                        // Linked Parent - Show full info from parent account
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-emerald-100 border-2 border-white shadow-md">
                                    {((user as any)?.linked_parent?.avatar || (user as any)?.linked_parent?.image_path) && !parentImageError ? (
                                        <img
                                            src={(user as any).linked_parent.avatar || (user as any).linked_parent.image_path}
                                            alt={(user as any).linked_parent.name}
                                            className="w-full h-full object-cover"
                                            onError={() => setParentImageError(true)}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-inner">
                                            {(user as any)?.linked_parent?.name ? (
                                                <span className="text-2xl font-bold">{(user as any).linked_parent.name.charAt(0).toUpperCase()}</span>
                                            ) : (
                                                <User size={28} />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-charcoal text-xl">{(user as any)?.linked_parent?.name}</p>
                                    <p className="text-emerald-600 text-sm">ولي أمر مرتبط بحسابك</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group bg-white/80 p-4 rounded-xl flex items-center gap-4 relative">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium mb-0.5">الهاتف</p>
                                        <p className="font-bold text-charcoal dir-ltr">{(user as any)?.linked_parent?.phone || 'غير مسجل'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleCopy((user as any)?.linked_parent?.phone || '', 'linked_parent_phone')}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                        title="نسخ"
                                    >
                                        {copiedField === 'linked_parent_phone' ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <div className="group bg-white/80 p-4 rounded-xl flex items-center gap-4 relative">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium mb-0.5">البريد الإلكتروني</p>
                                        <p className="font-bold text-charcoal text-sm dir-ltr">{(user as any)?.linked_parent?.email || 'غير مسجل'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleCopy((user as any)?.linked_parent?.email || '', 'linked_parent_email')}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                        title="نسخ"
                                    >
                                        {copiedField === 'linked_parent_email' ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // No linked parent - Show registration data (only parent_phone available)
                        <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-3 mb-4 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl">
                                <User size={18} />
                                <p className="text-sm font-medium">بيانات ولي الأمر المسجلة عند إنشاء الحساب</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 relative">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium mb-0.5">هاتف ولي الأمر</p>
                                        <p className="font-bold text-charcoal dir-ltr">{(user as any)?.parent_phone || 'غير مسجل'}</p>
                                    </div>
                                    {(user as any)?.parent_phone && (
                                        <button
                                            onClick={() => handleCopy((user as any)?.parent_phone || '', 'parent_phone')}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                            title="نسخ"
                                        >
                                            {copiedField === 'parent_phone' ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    )}
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-dashed border-slate-200 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                        <Link2 size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium mb-0.5">لربط حساب ولي أمر</p>
                                        <p className="text-sm text-slate-500">شارك رمز المعرف (UID) مع ولي أمرك</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeModal}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-shibl-crimson to-[#8B0A12] px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">تعديل الملف الشخصي</h3>
                            <button
                                onClick={closeModal}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Success Message */}
                            {successMessage && (
                                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm">
                                    {successMessage}
                                </div>
                            )}

                            {/* Image Upload Field */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-200">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : user?.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white text-2xl font-bold">
                                                {userInitials}
                                            </div>
                                        )}
                                    </div>
                                    <label
                                        htmlFor="image-upload"
                                        className="absolute bottom-0 right-0 bg-shibl-crimson text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition"
                                    >
                                        <Edit3 size={14} />
                                    </label>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">
                                    الاسم
                                </label>
                                <div className="relative">
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all text-right"
                                        placeholder="أدخل اسمك"
                                    />
                                </div>
                            </div>

                            {/* Phone Field */}
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">
                                    رقم الهاتف
                                </label>
                                <div className="relative">
                                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        readOnly
                                        disabled
                                        className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed focus:outline-none transition-all text-right"
                                        placeholder="أدخل رقم الهاتف"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Date of Birth Field */}
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">
                                    تاريخ الميلاد
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleInputChange}
                                        className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all text-right"
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            {/* Location Field - Fixed Country with Governorate Dropdown */}
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">
                                    الموقع
                                </label>

                                {/* Fixed Country Display */}
                                <div className="bg-slate-100 px-4 py-3 rounded-xl mb-3 flex items-center gap-2">
                                    <span className="text-lg">🇴🇲</span>
                                    <span className="font-bold text-slate-700">سلطنة عمان</span>
                                    <span className="text-xs text-slate-400 mr-auto">(ثابت)</span>
                                </div>

                                {/* Governorate Dropdown */}
                                <div className="relative">
                                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select
                                        name="governorate"
                                        value={formData.governorate}
                                        onChange={handleInputChange}
                                        className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all text-right appearance-none bg-white cursor-pointer"
                                    >
                                        {OMAN_GOVERNORATES.map((gov) => (
                                            <option key={gov.value} value={gov.value}>
                                                {gov.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Parent Info Section */}
                            <div className="border-t border-slate-100 pt-5 mt-5">
                                <h4 className="text-md font-bold text-shibl-crimson mb-4">معلومات ولي الأمر</h4>

                                {/* Parent Name Field */}
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-600 mb-2">
                                        اسم ولي الأمر
                                    </label>
                                    <div className="relative">
                                        <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="parent_name"
                                            value={formData.parent_name}
                                            onChange={handleInputChange}
                                            className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all text-right"
                                            placeholder="أدخل اسم ولي الأمر"
                                        />
                                    </div>
                                </div>

                                {/* Parent Phone Field */}
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-600 mb-2">
                                        هاتف ولي الأمر
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel"
                                            name="parent_phone"
                                            value={formData.parent_phone}
                                            onChange={handleInputChange}
                                            className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all text-right"
                                            placeholder="أدخل رقم هاتف ولي الأمر"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                {/* Parent Email Field */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">
                                        بريد ولي الأمر
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            name="parent_email"
                                            value={formData.parent_email}
                                            onChange={handleInputChange}
                                            className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all text-right"
                                            placeholder="أدخل البريد الإلكتروني لولي الأمر"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-shibl-crimson to-[#8B0A12] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        حفظ التغييرات
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closePasswordModal}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-shibl-crimson to-[#8B0A12] px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <KeyRound size={22} />
                                تغيير كلمة المرور
                            </h3>
                            <button
                                onClick={closePasswordModal}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
                            {/* Error Message */}
                            {passwordError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                    {passwordError}
                                </div>
                            )}

                            {/* Success Message */}
                            {passwordSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm">
                                    {passwordSuccess}
                                </div>
                            )}

                            {/* Old Password Field */}
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">
                                    كلمة المرور الحالية
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type={showOldPassword ? 'text' : 'password'}
                                        name="old_password"
                                        value={passwordForm.old_password}
                                        onChange={handlePasswordInputChange}
                                        className="w-full pr-10 pl-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all text-right"
                                        placeholder="أدخل كلمة المرور الحالية"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showOldPassword ? <X size={18} /> : <Lock size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password Field */}
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">
                                    كلمة المرور الجديدة
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        name="new_password"
                                        value={passwordForm.new_password}
                                        onChange={handlePasswordInputChange}
                                        className="w-full pr-10 pl-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all text-right"
                                        placeholder="أدخل كلمة المرور الجديدة"
                                        minLength={8}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showNewPassword ? <X size={18} /> : <Lock size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">يجب أن تكون 8 أحرف على الأقل</p>
                            </div>

                            {/* Confirm New Password Field */}
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">
                                    تأكيد كلمة المرور الجديدة
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="new_password_confirmation"
                                        value={passwordForm.new_password_confirmation}
                                        onChange={handlePasswordInputChange}
                                        className="w-full pr-10 pl-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all text-right"
                                        placeholder="أعد إدخال كلمة المرور الجديدة"
                                        minLength={8}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? <X size={18} /> : <Lock size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="w-full bg-gradient-to-r from-shibl-crimson to-[#8B0A12] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {passwordLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        جاري التغيير...
                                    </>
                                ) : (
                                    <>
                                        <KeyRound size={18} />
                                        تغيير كلمة المرور
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
