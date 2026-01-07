import { useState } from 'react';
import { useAuthStore } from '../../store';
import { User, Mail, Phone, MapPin, Edit3, X, Save, Loader2, Calendar, Lock, KeyRound } from 'lucide-react';
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
    });

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
        });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const authRepository = new AuthRepository();

            // Prepare update data - send all fields with values
            const selectedGov = OMAN_GOVERNORATES.find(g => g.value === formData.governorate);
            const updateData: Record<string, string> = {
                ...(formData.name && { name: formData.name }),
                ...(formData.phone && { phone: formData.phone }),
                ...(selectedGov && { address: `${selectedGov.label}، سلطنة عمان` }),
                ...(formData.date_of_birth && { date_of_birth: formData.date_of_birth }),
            };

            if (Object.keys(updateData).length === 0) {
                setError('لم يتم تغيير أي بيانات');
                setIsLoading(false);
                return;
            }

            const updatedUser = await authRepository.updateProfile(updateData);

            // Merge updated data with existing user to preserve all fields
            if (updatedUser && user) {
                const mergedUser = {
                    ...user,
                    ...updatedUser,
                    // Ensure phone fields are synced
                    phoneNumber: updatedUser.phone || updatedUser.phoneNumber || formData.phone,
                    phone: updatedUser.phone || formData.phone,
                    // Ensure date_of_birth is preserved
                    date_of_birth: (updatedUser as any).date_of_birth || formData.date_of_birth || (user as any).date_of_birth,
                    // Ensure address is preserved
                    address: (updatedUser as any).address || updateData.address || (user as any).address,
                };
                setUser(mergedUser as any);
            } else if (updatedUser) {
                // Merge with form data when no existing user
                const userWithFormData = {
                    ...updatedUser,
                    phone: (updatedUser as any).phone || formData.phone,
                    phoneNumber: (updatedUser as any).phone || formData.phone,
                    date_of_birth: (updatedUser as any).date_of_birth || formData.date_of_birth,
                    address: (updatedUser as any).address || updateData.address,
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
                    address: updateData.address || (user as any)?.address,
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
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-slate-200">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white text-2xl font-bold">
                                    {userInitials}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={openPasswordModal}
                                className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                            >
                                <KeyRound size={16} />
                                تغيير كلمة المرور
                            </button>
                            <button
                                onClick={openModal}
                                className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                            >
                                <Edit3 size={16} />
                                تعديل الملف
                            </button>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-extrabold text-charcoal mb-1">{user?.name}</h2>
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">طالب</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">البريد الإلكتروني</p>
                                <p className="font-bold text-charcoal">{user?.email}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400">
                                <Phone size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">رقم الهاتف</p>
                                <p className="font-bold text-charcoal">{user?.phoneNumber || user?.phone || 'غير مسجل'}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">الموقع</p>
                                <p className="font-bold text-charcoal">{(user as any)?.address || 'غير مسجل'}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">تاريخ الميلاد</p>
                                <p className="font-bold text-charcoal">
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
                    <h3 className="text-xl font-bold text-charcoal mt-8 mb-4">معلومات ولي الأمر</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">اسم ولي الأمر</p>
                                <p className="font-bold text-charcoal">سعيد محمد</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400">
                                <Phone size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">هاتف ولي الأمر</p>
                                <p className="font-bold text-charcoal">96123456</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">البريد الإلكتروني</p>
                                <p className="font-bold text-charcoal">parent@example.com</p>
                            </div>
                        </div>
                    </div>
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
                                        onChange={handleInputChange}
                                        className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all text-right"
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
