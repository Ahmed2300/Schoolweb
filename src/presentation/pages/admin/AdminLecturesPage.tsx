import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Plus,
    Video,
    PlayCircle,
    Eye,
    Edit2,
    Trash2,
    ChevronDown,
    Loader2,
    AlertCircle,
    Clock,
    Users,
    BookOpen,
} from 'lucide-react';
import { lectureService } from '../../../data/api/lectureService';
import { adminService } from '../../../data/api/adminService';
import { AddLectureModal } from '../../components/admin/AddLectureModal';
import { EditLectureModal } from '../../components/admin/EditLectureModal';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

interface Lecture {
    id: number;
    title: { ar?: string; en?: string } | string;
    description?: { ar?: string; en?: string } | string;
    course_id: number;
    teacher_id: number;
    recording_path?: string;
    recording_url?: string;
    has_recording?: boolean;
    video_path?: string;
    start_time?: string;
    end_time?: string;
    is_online: boolean;
    is_published?: boolean;
    course?: { id: number; name: string | { ar?: string; en?: string } };
    teacher?: { id: number; name: string };
}

interface CourseOption {
    id: number;
    name: string;
}

interface TeacherOption {
    id: number;
    name: string;
}

const extractName = (name: unknown): string => {
    if (!name) return '';
    if (typeof name === 'string') {
        try {
            const parsed = JSON.parse(name);
            if (typeof parsed === 'object' && parsed !== null) {
                return parsed.ar || parsed.en || name;
            }
        } catch {
            return name;
        }
        return name;
    }
    if (typeof name === 'object' && name !== null) {
        const obj = name as { ar?: string; en?: string };
        return obj.ar || obj.en || '';
    }
    return '';
};

export function AdminLecturesPage() {
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [teachers, setTeachers] = useState<TeacherOption[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchLectures = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await lectureService.getLectures({
                per_page: 10,
                page: currentPage,
                search: searchQuery || undefined,
                course_id: selectedCourseId || undefined,
                teacher_id: selectedTeacherId || undefined,
            });
            setLectures(response.data || []);
            setTotalPages(response.meta?.last_page || 1);
            setTotalCount(response.meta?.total || 0);
        } catch (err) {
            setError('فشل تحميل المحاضرات');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery, selectedCourseId, selectedTeacherId]);

    const fetchDropdowns = useCallback(async () => {
        try {
            const [coursesRes, teachersRes] = await Promise.allSettled([
                adminService.getCourses({ per_page: 100 }),
                adminService.getTeachers({ per_page: 100 }),
            ]);

            if (coursesRes.status === 'fulfilled') {
                setCourses(coursesRes.value.data.map((c: any) => ({
                    id: c.id,
                    name: extractName(c.name),
                })));
            }
            if (teachersRes.status === 'fulfilled') {
                setTeachers(teachersRes.value.data.map((t: any) => ({
                    id: t.id,
                    name: t.name || t.email || `معلم ${t.id}`,
                })));
            }
        } catch (err) {
            console.error('Failed to fetch dropdowns:', err);
        }
    }, []);

    useEffect(() => {
        fetchDropdowns();
    }, [fetchDropdowns]);

    useEffect(() => {
        fetchLectures();
    }, [fetchLectures]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchLectures();
    };

    const handleEdit = (lecture: Lecture) => {
        setSelectedLecture(lecture);
        setIsEditModalOpen(true);
    };

    const handleDelete = (lecture: Lecture) => {
        setSelectedLecture(lecture);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedLecture) return;
        setDeleteLoading(true);
        try {
            await lectureService.deleteLecture(selectedLecture.id);
            setIsDeleteModalOpen(false);
            setSelectedLecture(null);
            fetchLectures();
        } catch (err) {
            console.error('Failed to delete lecture:', err);
        } finally {
            setDeleteLoading(false);
        }
    };

    const stats = {
        total: totalCount,
        withVideo: lectures.filter(l => l.recording_path).length,
        online: lectures.filter(l => l.is_online).length,
    };

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-charcoal">إدارة المحاضرات</h1>
                    <p className="text-slate-500 text-sm mt-1">إدارة وتنظيم المحاضرات والفيديوهات</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-11 px-5 rounded-xl bg-shibl-crimson hover:bg-shibl-crimson-dark text-white font-medium shadow-lg shadow-crimson/25 hover:shadow-xl hover:shadow-crimson/30 transition-all flex items-center gap-2"
                >
                    <Plus size={18} />
                    إضافة محاضرة
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-shibl-crimson/10 flex items-center justify-center">
                            <PlayCircle size={24} className="text-shibl-crimson" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-charcoal">{stats.total}</p>
                            <p className="text-sm text-slate-500">إجمالي المحاضرات</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <Video size={24} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-charcoal">{stats.withVideo}</p>
                            <p className="text-sm text-slate-500">تحتوي فيديو</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Users size={24} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-charcoal">{stats.online}</p>
                            <p className="text-sm text-slate-500">أونلاين</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-4 flex-wrap">
                    <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="بحث عن محاضرة..."
                                className="w-full h-10 pr-10 pl-4 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                                dir="rtl"
                            />
                        </div>
                    </form>

                    <div className="relative min-w-[160px]">
                        <select
                            value={selectedCourseId || ''}
                            onChange={(e) => {
                                setSelectedCourseId(e.target.value ? parseInt(e.target.value) : null);
                                setCurrentPage(1);
                            }}
                            className="w-full h-10 px-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 outline-none text-sm appearance-none cursor-pointer"
                        >
                            <option value="">كل الكورسات</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>{course.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative min-w-[160px]">
                        <select
                            value={selectedTeacherId || ''}
                            onChange={(e) => {
                                setSelectedTeacherId(e.target.value ? parseInt(e.target.value) : null);
                                setCurrentPage(1);
                            }}
                            className="w-full h-10 px-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 outline-none text-sm appearance-none cursor-pointer"
                        >
                            <option value="">كل المدرسين</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-blue-500" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-red-500">
                        <AlertCircle size={40} className="mb-3" />
                        <p>{error}</p>
                    </div>
                ) : lectures.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <PlayCircle size={48} className="mb-3" />
                        <p className="font-medium">لا توجد محاضرات</p>
                        <p className="text-sm">اضغط على "إضافة محاضرة" لإنشاء أول محاضرة</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">العنوان</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">الكورس</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">المدرس</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">فيديو</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {lectures.map((lecture) => (
                                    <tr key={lecture.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-shibl-crimson/10 flex items-center justify-center text-shibl-crimson">
                                                    <PlayCircle size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-charcoal">{extractName(lecture.title)}</p>
                                                    {lecture.start_time && (
                                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {new Date(lecture.start_time).toLocaleDateString('ar-EG')}
                                                        </p>
                                                    )}
                                                    {lecture.is_published === false && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                                                            جلسة تجريبية
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <BookOpen size={14} className="text-slate-400" />
                                                <span className="text-sm text-slate-600">
                                                    {lecture.course ? extractName(lecture.course.name) : '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-slate-600">
                                                {lecture.teacher?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {(lecture.has_recording || lecture.recording_url || lecture.video_path) ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                                    <Video size={12} />
                                                    متوفر
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs">
                                                    لا يوجد
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                {(lecture.has_recording || lecture.recording_url || lecture.video_path) && (
                                                    <button
                                                        onClick={() => {
                                                            const url = lecture.recording_url || lecture.video_path;
                                                            if (url) window.open(url, '_blank');
                                                        }}
                                                        className="w-8 h-8 rounded-lg hover:bg-green-100 text-green-500 hover:text-green-600 flex items-center justify-center transition-colors"
                                                        title="مشاهدة التسجيل"
                                                    >
                                                        <PlayCircle size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(lecture)}
                                                    className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-shibl-crimson flex items-center justify-center transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(lecture)}
                                                    className="w-8 h-8 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            الصفحة {currentPage} من {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="h-9 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                السابق
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="h-9 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AddLectureModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    fetchLectures();
                }}
                courses={courses}
                teachers={teachers}
            />

            {selectedLecture && (
                <EditLectureModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedLecture(null);
                    }}
                    onSuccess={() => {
                        setIsEditModalOpen(false);
                        setSelectedLecture(null);
                        fetchLectures();
                    }}
                    lecture={selectedLecture}
                    courses={courses}
                    teachers={teachers}
                />
            )}

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedLecture(null);
                }}
                onConfirm={confirmDelete}
                title="حذف المحاضرة"
                message={`هل أنت متأكد من حذف المحاضرة "${selectedLecture ? extractName(selectedLecture.title) : ''}"؟ سيتم حذف الفيديو المرتبط أيضاً.`}
            // loading={deleteLoading}
            />
        </div>
    );
}
