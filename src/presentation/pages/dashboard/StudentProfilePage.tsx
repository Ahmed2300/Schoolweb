import { useAuthStore } from '../../store';
import { User, Mail, Phone, MapPin, Edit3 } from 'lucide-react';

export function StudentProfilePage() {
    const { user } = useAuthStore();
    const userInitials = user?.name?.charAt(0) || 'ط';

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
                        <button className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                            <Edit3 size={16} />
                            تعديل الملف
                        </button>
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
                                <p className="font-bold text-charcoal">{user?.phoneNumber || 'غير مسجل'}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">الموقع</p>
                                <p className="font-bold text-charcoal">مسقط، سلطنة عمان</p>
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
        </div>
    );
}
