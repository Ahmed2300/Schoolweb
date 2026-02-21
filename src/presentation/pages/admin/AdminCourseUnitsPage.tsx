/**
 * AdminCourseUnitsPage
 * 
 * Full-page units management for a specific course.
 * Allows admins to add, edit, delete, reorder units, and manage lectures within units.
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowRight,
    Layers,
    BookOpen,
    Loader2,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../../data/api/adminService';
import { UnitList, UnitFormModal } from '../../components/admin/units';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { AddLectureModal } from '../../components/admin/AddLectureModal';
import { EditLectureModal } from '../../components/admin/EditLectureModal';
import { lectureService } from '../../../data/api/lectureService';
import {
    useUnits,
    useCreateUnit,
    useUpdateUnit,
    useDeleteUnit,
    useReorderUnits,
    useReorderLectures,
    useMoveLecture,
    useToggleUnitPublish,
} from '../../../hooks/useUnits';
import type { Unit, CreateUnitRequest, UpdateUnitRequest, UnitLecture } from '../../../types/unit';

// Helper to get localized name - handles both objects and JSON strings
const getLocalizedName = (name: { ar?: string; en?: string } | string | undefined): string => {
    if (!name) return 'بدون اسم';

    // If it's a string, try to parse as JSON
    if (typeof name === 'string') {
        try {
            const parsed = JSON.parse(name);
            if (typeof parsed === 'object' && parsed !== null) {
                return parsed.ar || parsed.en || name;
            }
            return name;
        } catch {
            // Not JSON, return as-is
            return name;
        }
    }

    // It's an object
    return name.ar || name.en || 'بدون اسم';
};

export function AdminCourseUnitsPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const numericCourseId = parseInt(courseId || '0', 10);

    // Modal states - Units
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);

    // Modal states - Lectures
    const [showAddLectureModal, setShowAddLectureModal] = useState(false);
    const [selectedUnitForLecture, setSelectedUnitForLecture] = useState<Unit | null>(null);
    const [editingLecture, setEditingLecture] = useState<UnitLecture | null>(null);
    const [deletingLecture, setDeletingLecture] = useState<UnitLecture | null>(null);
    const [isDeletingLecture, setIsDeletingLecture] = useState(false);

    // Fetch course details
    const { data: courseData, isLoading: courseLoading } = useQuery({
        queryKey: ['course', numericCourseId],
        queryFn: () => adminService.getCourse(numericCourseId),
        enabled: !!numericCourseId,
    });

    // Fetch units
    const { data: unitsData, isLoading: unitsLoading, error: unitsError, refetch } = useUnits(numericCourseId);

    // Mutations
    const createUnit = useCreateUnit();
    const updateUnit = useUpdateUnit();
    const deleteUnit = useDeleteUnit();
    const reorderUnits = useReorderUnits();
    const reorderLectures = useReorderLectures();
    const moveLecture = useMoveLecture();
    const togglePublish = useToggleUnitPublish();

    const course = courseData;
    const units: Unit[] = unitsData?.data || [];

    // Fetch teachers for lecture modals
    const { data: teachersData } = useQuery({
        queryKey: ['teachers'],
        queryFn: () => adminService.getTeachers({ per_page: 100 }),
    });

    // Prepare course and teacher options for lecture modals
    const courseOptions = useMemo(() => {
        if (!course) return [];
        const name = typeof course.name === 'string' ? course.name : (course.name?.ar || course.name?.en || 'Unknown');
        return [{ id: numericCourseId, name }];
    }, [course, numericCourseId]);

    const teacherOptions = useMemo(() => {
        const teachers = teachersData?.data || [];
        return teachers.map((t: any) => ({
            id: t.id,
            name: t.name || t.email || `Teacher ${t.id}`,
        }));
    }, [teachersData]);

    // Handlers
    const handleAddUnit = () => {
        setEditingUnit(null);
        setShowFormModal(true);
    };

    const handleEditUnit = (unit: Unit) => {
        setEditingUnit(unit);
        setShowFormModal(true);
    };

    const handleDeleteUnit = (unit: Unit) => {
        setDeletingUnit(unit);
    };

    const handleConfirmDelete = async () => {
        if (deletingUnit) {
            await deleteUnit.mutateAsync({
                courseId: numericCourseId,
                unitId: deletingUnit.id,
            });
            setDeletingUnit(null);
        }
    };

    const handleFormSubmit = async (data: CreateUnitRequest | UpdateUnitRequest) => {
        if (editingUnit) {
            await updateUnit.mutateAsync({
                courseId: numericCourseId,
                unitId: editingUnit.id,
                data: data as UpdateUnitRequest,
            });
        } else {
            await createUnit.mutateAsync({
                courseId: numericCourseId,
                data: data as CreateUnitRequest,
            });
        }
        setShowFormModal(false);
        setEditingUnit(null);
    };

    const handleReorder = (orderedIds: number[]) => {
        reorderUnits.mutate({
            courseId: numericCourseId,
            order: orderedIds,
        });
    };

    const handleTogglePublish = (unit: Unit) => {
        togglePublish.mutate(unit.id);
    };

    const handleReorderLectures = (unitId: number, orderedIds: number[]) => {
        reorderLectures.mutate({ unitId, order: orderedIds });
    };

    const handleMoveLecture = (lectureId: number, targetUnitId: number, order?: number) => {
        moveLecture.mutate({ unitId: targetUnitId, lectureId, order });
    };

    // Lecture handlers
    const handleAddLecture = (unit: Unit) => {
        setSelectedUnitForLecture(unit);
        setShowAddLectureModal(true);
    };

    const handleLectureCreated = () => {
        setShowAddLectureModal(false);
        setSelectedUnitForLecture(null);
        refetch(); // Refresh units to show new lecture
    };

    const handleEditLecture = (lecture: UnitLecture) => {
        setEditingLecture(lecture);
    };

    const handleLectureUpdated = () => {
        setEditingLecture(null);
        refetch();
    };

    const handleDeleteLecture = (lecture: UnitLecture) => {
        setDeletingLecture(lecture);
    };

    const handleConfirmDeleteLecture = async () => {
        if (deletingLecture) {
            setIsDeletingLecture(true);
            try {
                await lectureService.deleteLecture(deletingLecture.id);
                setDeletingLecture(null);
                refetch();
            } catch (err) {
                console.error('Failed to delete lecture:', err);
            } finally {
                setIsDeletingLecture(false);
            }
        }
    };

    const handleTogglePublishLecture = async (lecture: UnitLecture) => {
        try {
            await lectureService.updateLecture(lecture.id, {
                is_published: !lecture.is_published
            });
            refetch();
        } catch (err) {
            console.error('Failed to toggle lecture publish status:', err);
        }
    };

    // Loading state
    if (courseLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={40} className="animate-spin text-shibl-crimson" />
            </div>
        );
    }

    // Course not found
    if (!course && !courseLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertCircle size={48} className="text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-700 mb-2">الكورس غير موجود</h2>
                <p className="text-slate-500 mb-6">لم يتم العثور على الكورس المطلوب</p>
                <button
                    onClick={() => navigate('/admin/courses')}
                    className="px-6 py-3 bg-shibl-crimson text-white rounded-xl font-medium hover:bg-shibl-crimson/90 transition-colors"
                >
                    العودة للكورسات
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Breadcrumb */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Link to="/admin/courses" className="hover:text-shibl-crimson transition-colors">
                            الكورسات
                        </Link>
                        <ArrowRight size={14} className="rotate-180" />
                        <span className="text-slate-700 font-medium">
                            {getLocalizedName(course?.name)}
                        </span>
                        <ArrowRight size={14} className="rotate-180" />
                        <span className="text-shibl-crimson font-semibold">الوحدات</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-extrabold text-charcoal dark:text-white flex items-center gap-3">
                        <Layers size={28} className="text-shibl-crimson" />
                        إدارة وحدات الكورس
                    </h1>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={unitsLoading}
                        className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-2"
                        title="تحديث"
                    >
                        <RefreshCw size={18} className={unitsLoading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => navigate('/admin/courses')}
                        className="h-11 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors flex items-center gap-2"
                    >
                        <ArrowRight size={18} className="rotate-180" />
                        العودة
                    </button>
                </div>
            </div>

            {/* Course Info Card */}
            <div className="bg-gradient-to-l from-shibl-crimson/5 to-transparent border border-shibl-crimson/10 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                    {/* Course Cover Image */}
                    {course?.image_path ? (
                        <img
                            src={course.image_path}
                            alt={getLocalizedName(course?.name)}
                            className="w-20 h-20 rounded-xl object-cover shadow-md"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-xl bg-shibl-crimson/10 flex items-center justify-center">
                            <BookOpen size={32} className="text-shibl-crimson" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-slate-800">
                            {getLocalizedName(course?.name)}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {course?.code} • {units.length} وحدة
                        </p>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {unitsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span>فشل في تحميل الوحدات</span>
                    <button
                        onClick={() => refetch()}
                        className="mr-auto px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-semibold transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {/* Units List */}
            <UnitList
                units={units}
                onReorder={handleReorder}
                onReorderLectures={handleReorderLectures}
                onMoveLecture={handleMoveLecture}
                onEdit={handleEditUnit}
                onDelete={handleDeleteUnit}
                onTogglePublish={handleTogglePublish}
                onAddLecture={handleAddLecture}
                onEditLecture={handleEditLecture}
                onDeleteLecture={handleDeleteLecture}
                onTogglePublishLecture={handleTogglePublishLecture}
                onAddUnit={handleAddUnit}
                deletingId={deleteUnit.isPending ? deletingUnit?.id : null}
                togglingPublishId={togglePublish.isPending ? togglePublish.variables : null}
                isLoading={unitsLoading}
            />

            {/* Form Modal */}
            <UnitFormModal
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false);
                    setEditingUnit(null);
                }}
                onSubmit={handleFormSubmit}
                unit={editingUnit}
                isSubmitting={createUnit.isPending || updateUnit.isPending}
            />

            {/* Delete Unit Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={!!deletingUnit}
                title="حذف الوحدة"
                message="هل أنت متأكد من حذف هذه الوحدة؟ سيتم حذف جميع المحاضرات المرتبطة بها."
                itemName={deletingUnit ? getLocalizedName(deletingUnit.title) : undefined}
                onConfirm={handleConfirmDelete}
                onClose={() => setDeletingUnit(null)}
            />

            {/* Add Lecture Modal */}
            {showAddLectureModal && (
                <AddLectureModal
                    isOpen={showAddLectureModal}
                    onClose={() => {
                        setShowAddLectureModal(false);
                        setSelectedUnitForLecture(null);
                    }}
                    onSuccess={handleLectureCreated}
                    courses={courseOptions}
                    teachers={teacherOptions}
                    initialCourseId={numericCourseId}
                    initialUnitId={selectedUnitForLecture?.id}
                />
            )}

            {/* Edit Lecture Modal */}
            {editingLecture && (
                <EditLectureModal
                    isOpen={!!editingLecture}
                    onClose={() => setEditingLecture(null)}
                    onSuccess={handleLectureUpdated}
                    lecture={{
                        id: editingLecture.id,
                        title: editingLecture.title,
                        description: editingLecture.description,
                        course_id: numericCourseId,
                        unit_id: editingLecture.unit_id ?? undefined,
                        teacher_id: editingLecture.teacher_id || 0,
                        is_online: editingLecture.is_online || false,
                        start_time: editingLecture.start_time,
                        end_time: editingLecture.end_time,
                    }}
                    courses={courseOptions}
                    teachers={teacherOptions}
                />
            )}

            {/* Delete Lecture Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={!!deletingLecture}
                title="حذف المحاضرة"
                message="هل أنت متأكد من حذف هذه المحاضرة؟"
                itemName={deletingLecture ? getLocalizedName(deletingLecture.title) : undefined}
                onConfirm={handleConfirmDeleteLecture}
                onClose={() => setDeletingLecture(null)}
            />
        </div>
    );
}

export default AdminCourseUnitsPage;
