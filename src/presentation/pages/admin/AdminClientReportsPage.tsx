
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Search,
    Filter,
    Eye,
    MessageSquare,
    Calendar,
    User,
    Mail,
    ImageIcon,
    X
} from 'lucide-react';
import { clientReportingService, ClientReporting, UserRole } from '../../../data/api/clientReportingService';
import Modal from '../../components/ui/Modal';

export function AdminClientReportsPage() {
    const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReport, setSelectedReport] = useState<ClientReporting | null>(null);

    const { data: reportsResponse, isLoading } = useQuery({
        queryKey: ['client-reports', selectedRole],
        queryFn: () => clientReportingService.getReports(selectedRole === 'all' ? undefined : selectedRole),
        refetchInterval: 5000, // Poll every 5 seconds
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        staleTime: 0,
    });

    const reports = reportsResponse?.data || [];

    const filteredReports = reports.filter(report =>
        report.text_content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.guest_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (report.reportable_type && report.reportable_type.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getRoleBadge = (report: ClientReporting) => {
        // Fallback logic if submitter_role isn't directly available or to map standard roles
        // Fallback logic if submitter_role isn't directly available or to map standard roles
        const role = report.submitter_role || 'guest';

        const styles = {
            student: 'bg-blue-100 text-blue-700',
            teacher: 'bg-emerald-100 text-emerald-700',
            parent: 'bg-amber-100 text-amber-700',
            guest: 'bg-slate-100 text-slate-700',
        };

        const labels = {
            student: 'طالب',
            teacher: 'مدرس',
            parent: 'ولي أمر',
            guest: 'زائر',
        };

        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[role as keyof typeof styles] || styles.guest}`}>
                {labels[role as keyof typeof labels] || 'زائر'}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-charcoal dark:text-white mb-1">بلاغات الدعم الفني</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">إدارة ومتابعة البلاغات والمشاكل التقنية</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-[20px] shadow-sm border border-slate-100 dark:border-white/10 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="بحث في البلاغات..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pr-10 pl-4 rounded-xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all dark:text-white dark:placeholder-slate-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-slate-400" size={20} />
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as any)}
                        className="h-11 px-4 rounded-xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/10 focus:border-shibl-crimson outline-none cursor-pointer dark:text-white"
                    >
                        <option value="all">جميع المستخدمين</option>
                        <option value="student">الطلاب</option>
                        <option value="teacher">المدرسين</option>
                        <option value="parent">أولياء الأمور</option>
                        <option value="guest">الزوار</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10">
                            <tr>
                                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">المرسل</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">الدور</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">نص البلاغ</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">التاريخ</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">المرفقات</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-white/10 rounded w-32" /></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-100 dark:bg-white/10 rounded-full w-16" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-white/10 rounded w-48" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-white/10 rounded w-24" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-100 dark:bg-white/10 rounded" /></td>
                                        <td className="px-6 py-4"></td>
                                    </tr>
                                ))
                            ) : filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <MessageSquare size={40} className="text-slate-200" />
                                            <p>لا توجد بلاغات مطابقة للبحث</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredReports.map((report) => (
                                <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {report.submitter_image ? (
                                                <img
                                                    src={report.submitter_image}
                                                    alt={report.submitter_name || 'User'}
                                                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                    {(report.submitter_name || report.guest_name || '?').charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-charcoal dark:text-white text-sm">{report.submitter_name || report.guest_name || 'زائر'}</p>
                                                <p className="text-xs text-slate-400">{report.submitter_email || report.guest_email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRoleBadge(report)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1 max-w-xs" title={report.text_content}>
                                            {report.text_content}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                            <Calendar size={14} />
                                            <span dir="ltr">{new Date(report.created_at).toLocaleDateString('en-GB')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {report.images && report.images.length > 0 ? (
                                            <div className="flex items-center gap-1 text-shibl-crimson font-bold text-xs">
                                                <ImageIcon size={16} />
                                                <span>{report.images.length} صور</span>
                                            </div>
                                        ) : report.image_path ? (
                                            <div className="flex items-center gap-1 text-shibl-crimson font-bold text-xs">
                                                <ImageIcon size={16} />
                                                <span>صورة</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-left">
                                        <button
                                            onClick={() => setSelectedReport(report)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-shibl-crimson hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                            title="عرض التفاصيل"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                title="تفاصيل البلاغ"
                size="lg"
            >
                {selectedReport && (
                    <div className="space-y-6">
                        {/* Submitter Info */}
                        <div className="bg-slate-50 dark:bg-[#2A2A2A] rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {selectedReport.submitter_image ? (
                                    <img
                                        src={selectedReport.submitter_image}
                                        alt={selectedReport.submitter_name || 'User'}
                                        className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg shadow-sm">
                                        {(selectedReport.submitter_name || selectedReport.guest_name || '?').charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-charcoal dark:text-white">{selectedReport.submitter_name || selectedReport.guest_name || 'زائر'}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Mail size={14} />
                                        <span>{selectedReport.submitter_email || selectedReport.guest_email}</span>
                                    </div>
                                </div>
                            </div>
                            {getRoleBadge(selectedReport)}
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <MessageSquare size={16} className="text-shibl-crimson" />
                                وصف المشكلة
                            </label>
                            <div className="bg-slate-50 dark:bg-[#2A2A2A] p-4 rounded-xl border border-slate-100 dark:border-white/10 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {selectedReport.text_content}
                            </div>
                        </div>

                        {/* Image Attachment */}
                        {(selectedReport.images && selectedReport.images.length > 0) || selectedReport.image_path ? (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <ImageIcon size={16} className="text-shibl-crimson" />
                                    المرفقات ({selectedReport.images?.length || 1})
                                </label>

                                {selectedReport.images && selectedReport.images.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedReport.images.map((img, idx) => (
                                            <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                                <img
                                                    src={img}
                                                    alt={`Attachment ${idx + 1}`}
                                                    className="w-full h-48 object-cover hover:object-contain transition-all duration-300 cursor-zoom-in"
                                                    onClick={() => window.open(img, '_blank')}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                        <img
                                            src={selectedReport.image_path!}
                                            alt="Report attachment"
                                            className="w-full max-h-[400px] object-contain"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {/* Footer Info */}
                        <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-400">
                            <span>رقم البلاغ: #{selectedReport.id}</span>
                            <span dir="ltr">{new Date(selectedReport.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
