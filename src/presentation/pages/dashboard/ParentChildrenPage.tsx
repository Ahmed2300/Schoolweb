import { useState } from 'react';
import {
    User,
    GraduationCap,
    Calendar,
    Award,
    ChevronDown,
    Mail,
    FileText,
    TrendingUp,
    Clock,
    Plus,
    AlertCircle
} from 'lucide-react';

// Mock Data Types
interface Child {
    id: number;
    name: string;
    grade: string;
    avatar: string;
    school: string;
    gpa: string;
    attendance: number;
}

interface Subject {
    id: number;
    name: string;
    teacher: string;
    score: number;
    grade: string;
    feedback: string;
}

export function ParentChildrenPage() {
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    // Mock Data
    const children: Child[] = [
        {
            id: 1,
            name: 'أحمد',
            grade: 'الصف العاشر',
            avatar: '/images/signin-student.png',
            school: 'مدرسة التفوق النموذجية',
            gpa: '3.8',
            attendance: 95
        },
        {
            id: 2,
            name: 'سارة',
            grade: 'الصف الخامس',
            avatar: '/images/signup-student.png',
            school: 'مدرسة المستقبل الابتدائية',
            gpa: '4.0',
            attendance: 98
        }
    ];

    const subjects: Subject[] = [
        { id: 1, name: 'الرياضيات', teacher: 'أ. محمد العلي', score: 92, grade: 'A', feedback: 'ممتاز، يشارك بفعالية في الفصل.' },
        { id: 2, name: 'الفيزياء', teacher: 'أ. سامي يوسف', score: 88, grade: 'B+', feedback: 'يحتاج للتركيز أكثر على التجارب العملية.' },
        { id: 3, name: 'اللغة العربية', teacher: 'أ. فهد الأحمد', score: 95, grade: 'A', feedback: 'متميز في التعبير والكتابة.' },
        { id: 4, name: 'اللغة الإنجليزية', teacher: 'Mr. John Smith', score: 90, grade: 'A-', feedback: 'Excellent vocabulary skills.' },
    ];

    const [selectedChildId, setSelectedChildId] = useState<number>(children[0].id);
    const [activeTab, setActiveTab] = useState<'academics' | 'attendance' | 'teachers'>('academics');

    const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

    return (
        <div className="p-6 space-y-6">
            {/* Header & Child Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-charcoal">إدارة الأبناء</h1>
                    <p className="text-slate-500 text-sm">تابع التفاصيل الأكاديمية لكل ابن على حدة</p>
                </div>
            </div>

            {/* Child Toggle Strip */}
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 w-fit">
                {children.map(child => (
                    <button
                        key={child.id}
                        onClick={() => setSelectedChildId(child.id)}
                        className={`
                            flex items-center gap-3 px-4 py-2 rounded-xl transition-all
                            ${selectedChildId === child.id
                                ? 'bg-shibl-crimson text-white shadow-md'
                                : 'hover:bg-slate-50 text-slate-500'
                            }
                        `}
                    >
                        <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${selectedChildId === child.id ? 'border-white/30' : 'border-slate-200'}`}>
                            <img src={child.avatar} alt={child.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold">{child.name}</p>
                            {selectedChildId === child.id && (
                                <p className="text-[10px] opacity-90">{child.grade}</p>
                            )}
                        </div>
                    </button>
                ))}

                {/* Add Child Button */}
                <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-shibl-crimson hover:text-shibl-crimson transition-all"
                >
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                        <Plus size={18} />
                    </div>
                    <span className="text-sm font-bold hidden md:block">إضافة ابن</span>
                </button>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Quick Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-slate-100 to-white"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-sm mb-4">
                                <img src={selectedChild.avatar} alt={selectedChild.name} className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-xl font-extrabold text-charcoal">{selectedChild.name}</h2>
                            <p className="text-slate-500 text-sm font-medium mb-4">{selectedChild.grade}</p>

                            <div className="flex items-center justify-center gap-2 bg-slate-50 px-3 py-1 rounded-full text-xs text-slate-500 font-bold mb-6">
                                <GraduationCap size={14} />
                                {selectedChild.school}
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="bg-green-50 p-3 rounded-2xl">
                                    <p className="text-xs text-green-600 font-bold mb-1">المعدل التراكمي</p>
                                    <p className="text-xl font-extrabold text-green-700">{selectedChild.gpa}</p>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-2xl">
                                    <p className="text-xs text-blue-600 font-bold mb-1">نسبة الحضور</p>
                                    <p className="text-xl font-extrabold text-blue-700">{selectedChild.attendance}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm">
                        <h3 className="font-bold text-charcoal mb-4">إجراءات سريعة</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-sm font-bold text-slate-600">
                                <span className="flex items-center gap-2"><FileText size={16} /> طلب تقرير أكاديمي</span>
                                <ChevronDown size={16} className="-rotate-90" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-sm font-bold text-slate-600">
                                <span className="flex items-center gap-2"><Clock size={16} /> سجل الحضور والغياب</span>
                                <ChevronDown size={16} className="-rotate-90" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Tabs & Detailed Data */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="bg-white rounded-2xl p-1.5 border border-slate-100 inline-flex">
                        {[
                            { id: 'academics', label: 'الأداء الأكاديمي', icon: TrendingUp },
                            { id: 'attendance', label: 'الحضور', icon: Calendar },
                            { id: 'teachers', label: 'المعلمين', icon: User },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                                    ${activeTab === tab.id
                                        ? 'bg-charcoal text-white shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50'
                                    }
                                `}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden p-6 min-h-[400px]">
                        {activeTab === 'academics' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg text-charcoal">تقرير المواد الدراسية</h3>
                                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">الفصل الدراسي الأول</span>
                                </div>

                                <div className="space-y-4">
                                    {subjects.map(subject => (
                                        <div key={subject.id} className="border border-slate-100 rounded-xl p-4 hover:border-shibl-crimson/20 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex gap-4">
                                                    <div className={`
                                                        w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl
                                                        ${subject.grade.startsWith('A') ? 'bg-green-50 text-green-600' :
                                                            subject.grade.startsWith('B') ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}
                                                    `}>
                                                        {subject.grade}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-charcoal">{subject.name}</h4>
                                                        <p className="text-xs text-slate-400 font-medium">{subject.teacher}</p>
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    <span className="text-2xl font-extrabold text-charcoal">{subject.score}</span>
                                                    <span className="text-xs text-slate-400 font-bold block">/ 100</span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-lg flex items-start gap-2">
                                                <div className="mt-0.5"><Award size={14} className="text-shibl-crimson" /></div>
                                                <p className="text-xs text-slate-600 leading-relaxed font-medium">"{subject.feedback}"</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'attendance' && (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                    <Calendar size={32} />
                                </div>
                                <h3 className="font-bold text-charcoal mb-2">سجل الحضور قريباً</h3>
                                <p className="text-slate-400 text-sm max-w-xs">سيتم عرض تفاصيل الحضور والغياب اليومية هنا مع إشعارات بالتأخير.</p>
                            </div>
                        )}

                        {activeTab === 'teachers' && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg text-charcoal mb-4">قائمة المعلمين</h3>
                                {subjects.map(subject => (
                                    <div key={subject.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-charcoal text-sm">{subject.teacher}</p>
                                                <p className="text-xs text-slate-400">{subject.name}</p>
                                            </div>
                                        </div>
                                        <button className="p-2 text-shibl-crimson bg-red-50 rounded-lg hover:bg-red-100 transition-colors" title="إرسال رسالة">
                                            <Mail size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Student Modal */}
            {showAddStudentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-shibl-crimson/10 text-shibl-crimson rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus size={32} />
                            </div>
                            <h3 className="text-xl font-extrabold text-charcoal">إضافة ابن جديد</h3>
                            <p className="text-slate-500 text-sm mt-1">أدخل رمز الطالب لربط حسابه بحسابك</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">رمز الطالب (Student Code)</label>
                                <input
                                    type="text"
                                    placeholder="مثال: STD-123456"
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-center font-mono font-bold text-lg"
                                />
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
                                <div className="mt-0.5 text-blue-600"><AlertCircle size={18} /></div>
                                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                    يمكنك الحصول على رمز الطالب من إدارة المدرسة أو من خلال بطاقة الطالب المدرسية.
                                </p>
                            </div>

                            <button className="w-full bg-charcoal text-white py-3.5 rounded-xl font-bold cursor-not-allowed opacity-80 hover:opacity-100 transition-opacity">
                                تحقق وإضافة
                            </button>

                            <button
                                onClick={() => setShowAddStudentModal(false)}
                                className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

