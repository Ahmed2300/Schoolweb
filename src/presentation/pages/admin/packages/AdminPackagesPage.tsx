import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    BackgroundVariant,
    ReactFlowProvider,
    Panel,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import toast from 'react-hot-toast';

import {
    LayoutDashboard,
    Plus,
    Search,
    MoreVertical,
    Save,
    ArrowLeft,
    Undo,
    Redo,
    BookOpen,
    Calendar,
    GraduationCap,
    Grid,
    List as ListIcon,
    Loader2,
    Trash2,
    Edit,
    X,
    AlertTriangle,
    Maximize,
    Minimize
} from 'lucide-react';

import { adminService } from '../../../../data/api/adminService';
import { usePackageBuilder } from './hooks/usePackageBuilder';
import { nodeTypes } from './components/nodes';
import { CourseNodeData, TermNodeData, GradeNodeData, PackageNodeData, AppNode, AppEdge } from './types';
import { PackagePreviewModal } from './components/PackagePreviewModal';

// ==================== TYPES (Local UI Types) ====================

type ViewMode = 'list' | 'studio';

interface PackageItem {
    id: number;
    name: string;
    price: number;
    original_price?: number;
    final_price?: number;
    courses_count?: number;
    is_active: boolean;
    // Cover image
    image?: string;
    // Discount fields
    is_discount_active?: boolean;
    discount_percentage?: number;
    discount_price?: number;
}

interface ResourceItem {
    id: number;
    name: string | { ar?: string; en?: string };
    price?: number; // for courses
    duration_hours?: number; // for courses
}

const extractName = (name: unknown): string => {
    if (!name) return '';
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name !== null) {
        const obj = name as Record<string, string>;
        return obj.ar || obj.en || '';
    }
    return '';
};

// ==================== COMPONENT ====================

export function AdminPackagesPage() {
    return (
        <ReactFlowProvider>
            <AdminPackagesContent />
        </ReactFlowProvider>
    );
}

function AdminPackagesContent() {
    // State
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [packages, setPackages] = useState<PackageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [saving, setSaving] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Sidebar State
    const [courses, setCourses] = useState<ResourceItem[]>([]);
    const [semesters, setSemesters] = useState<ResourceItem[]>([]);
    const [grades, setGrades] = useState<ResourceItem[]>([]);
    const [sidebarSearch, setSidebarSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'courses' | 'terms' | 'grades'>('courses');

    // Edit State
    const [originalPackageCourses, setOriginalPackageCourses] = useState<number[]>([]);

    // Dropdown & Modal State
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [deleteModalPackage, setDeleteModalPackage] = useState<PackageItem | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [previewData, setPreviewData] = useState<{
        package: PackageNodeData;
        courses: { id: number; name: string; price: number; subject?: string }[];
    } | null>(null);

    // Builder Hook
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setNodes,
        setEdges,
        undo,
        redo,
        historyIndex,
        historyLength,
        addPackageNode,
    } = usePackageBuilder();

    const { screenToFlowPosition } = useReactFlow();

    // ==================== DATA FETCHING ====================

    const fetchPackages = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminService.getPackages();
            setPackages(response.data || []);
        } catch (error) {
            console.error('Error fetching packages:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchResources = useCallback(async () => {
        try {
            const [coursesRes, semestersRes, gradesRes] = await Promise.allSettled([
                adminService.getCourses({ per_page: 100 }),
                adminService.getSemesters({ per_page: 100 }),
                adminService.getGrades({ per_page: 100 }),
            ]);

            if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value.data || []);
            if (semestersRes.status === 'fulfilled') setSemesters(semestersRes.value.data || []);
            if (gradesRes.status === 'fulfilled') setGrades(gradesRes.value.data || []);
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    }, []);

    useEffect(() => {
        fetchPackages();
        fetchResources();
    }, [fetchPackages, fetchResources]);

    // ==================== SAVE PACKAGE ====================

    const handlePreview = useCallback(() => {
        const packageNode = nodes.find(n => n.type === 'packageNode');
        if (!packageNode) {
            toast.error('الرجاء إضافة باقة أولاً للمعاينة');
            return;
        }

        const currentCourses: { id: number; price: number; name: string; subject?: string }[] = [];
        const addedIds = new Set<number>();

        // Collect courses from all connected nodes
        nodes.forEach(node => {
            if (node.type === 'termNode' || node.type === 'gradeNode') {
                const data = node.data as (TermNodeData | GradeNodeData);
                if (data.includedCourses) {
                    data.includedCourses.forEach(c => {
                        if (!addedIds.has(c.id)) {
                            addedIds.add(c.id);
                            currentCourses.push(c);
                        }
                    });
                }
            } else if (node.type === 'courseNode') {
                const data = node.data as CourseNodeData;
                if (data.originalId && !addedIds.has(data.originalId)) {
                    addedIds.add(data.originalId);
                    currentCourses.push({
                        id: data.originalId,
                        price: Number(data.price),
                        name: data.label,
                        subject: 'مادة منفصلة'
                    });
                }
            }
        });

        if (currentCourses.length === 0 && (packageNode.data as PackageNodeData).coursesCount === 0) {
            toast('الباقة فارغة. أضف بعض الكورسات لمعاينتها', { icon: 'ℹ️' });
        }

        setPreviewData({
            package: packageNode.data as PackageNodeData,
            courses: currentCourses
        });
    }, [nodes]);

    const savePackage = useCallback(async () => {
        if (saving) return;

        // Find the package node
        const packageNode = nodes.find(n => n.type === 'packageNode');
        if (!packageNode) {
            toast.error('لا توجد باقة للحفظ! أضف باقة أولاً');
            return;
        }

        const packageData = packageNode.data as PackageNodeData;

        // Collect all course IDs that should be attached
        // We need to find all courses connected to the package (directly or via term/grade)
        const courseIds: number[] = [];

        // Get directly connected courses
        for (const edge of edges) {
            if (edge.target === packageNode.id) {
                const sourceNode = nodes.find(n => n.id === edge.source);
                if (sourceNode?.type === 'courseNode') {
                    const courseData = sourceNode.data as CourseNodeData;
                    if (courseData.originalId) {
                        courseIds.push(courseData.originalId);
                    }
                }
            }
        }

        // For terms and grades, we need to fetch their courses
        // Since we store calculatedCount, we need to get the actual course IDs from the API
        const termNodes = nodes.filter(n => {
            const isConnected = edges.some(e => e.source === n.id && e.target === packageNode.id);
            return n.type === 'termNode' && isConnected;
        });

        const gradeNodes = nodes.filter(n => {
            const isConnected = edges.some(e => e.source === n.id && e.target === packageNode.id);
            return n.type === 'gradeNode' && isConnected;
        });

        setSaving(true);

        try {
            // Use a Set to prevent duplicates
            const uniqueCourseIds = new Set<number>(courseIds);

            // Fetch course IDs for connected terms
            for (const termNode of termNodes) {
                const termData = termNode.data as TermNodeData;

                // USE INCLUDED COURSES IF AVAILABLE (Efficient & Consistent)
                if (termData.includedCourses && termData.includedCourses.length > 0) {
                    termData.includedCourses.forEach(c => uniqueCourseIds.add(c.id));
                } else {
                    // Fallback to API if not present (Legacy support)
                    const coursesResponse = await adminService.getCourses({ semester_id: termData.originalId });
                    coursesResponse.data.forEach((course: any) => {
                        uniqueCourseIds.add(course.id);
                    });
                }
            }

            // Fetch course IDs for connected grades
            for (const gradeNode of gradeNodes) {
                const gradeData = gradeNode.data as GradeNodeData;

                // USE INCLUDED COURSES IF AVAILABLE (Efficient & Consistent)
                if (gradeData.includedCourses && gradeData.includedCourses.length > 0) {
                    gradeData.includedCourses.forEach(c => uniqueCourseIds.add(c.id));
                } else {
                    // Fallback to API
                    // Get all semesters for this grade
                    const semestersResponse = await adminService.getSemesters({ grade_id: gradeData.originalId });
                    // Get courses for each semester
                    for (const semester of semestersResponse.data) {
                        const coursesResponse = await adminService.getCourses({ semester_id: semester.id });
                        coursesResponse.data.forEach((course: any) => {
                            uniqueCourseIds.add(course.id);
                        });
                    }
                }
            }

            // VALIDATION: Check if we have any courses
            if (uniqueCourseIds.size === 0) {
                toast.error('لا يمكن حفظ باقة فارغة. الرجاء إضافة كورسات أو مراحل دراسية.');
                setSaving(false);
                return;
            }

            // Convert back to array for API
            const finalCourseIds = Array.from(uniqueCourseIds);

            // CHECK IF CREATING OR UPDATING
            if (packageData.originalId) {
                await adminService.updatePackage(packageData.originalId, {
                    name: packageData.label, // use label as name
                    price: packageData.totalPrice,
                    description: packageData.description,
                    is_active: true,
                    // Cover image
                    image: packageData.coverImageFile || null,
                    // Discount fields
                    is_discount_active: packageData.isDiscountActive || false,
                    discount_percentage: packageData.discountPercentage || null,
                    discount_price: packageData.discountPrice || null,
                    discount_start_date: packageData.discountStartDate || null,
                    discount_end_date: packageData.discountEndDate || null,
                    // Builder layout (preserves the visual structure)
                    builder_layout: { nodes, edges },
                });

                const toAttach = finalCourseIds.filter(id => !originalPackageCourses.includes(id));
                const toDetach = originalPackageCourses.filter(id => !finalCourseIds.includes(id));

                const promises = [];
                if (toAttach.length > 0) promises.push(adminService.attachCoursesToPackage(packageData.originalId, toAttach));
                if (toDetach.length > 0) promises.push(adminService.detachCoursesFromPackage(packageData.originalId, toDetach));
                await Promise.all(promises);

                toast.success('تم تحديث الباقة بنجاح');
            } else {
                // Create the package
                const createResponse = await adminService.createPackage({
                    name: packageData.label || 'باقة جديدة',
                    price: packageData.totalPrice || 0,
                    description: packageData.description || '',
                    is_active: true,
                    // Cover image
                    image: packageData.coverImageFile || null,
                    // Discount fields
                    is_discount_active: packageData.isDiscountActive || false,
                    discount_percentage: packageData.discountPercentage || null,
                    discount_price: packageData.discountPrice || null,
                    discount_start_date: packageData.discountStartDate || null,
                    discount_end_date: packageData.discountEndDate || null,
                    // Builder layout (preserves the visual structure)
                    builder_layout: { nodes, edges },
                });

                const newPackageId = createResponse.data.id;

                // CRITICAL: Update the node with the new ID immediately
                // This prevents duplicate creation if the next step (attach courses) fails and user retries
                setNodes(nds => nds.map(node => {
                    if (node.id === packageNode.id) {
                        return {
                            ...node,
                            data: { ...node.data, originalId: newPackageId }
                        } as AppNode;
                    }
                    return node;
                }));

                // Attach courses if any
                if (finalCourseIds.length > 0) {
                    await adminService.attachCoursesToPackage(newPackageId, finalCourseIds);
                }

                toast.success('تم إنشاء الباقة بنجاح');
            }

            // Refresh packages list and switch to list view
            await fetchPackages();
            setViewMode('list');

            // Clear the canvas
            setNodes([]);
            setEdges([]);
            setOriginalPackageCourses([]);

        } catch (error: any) {
            console.error('Error saving package:', error);
            toast.error(error.message || 'حدث خطأ أثناء حفظ الباقة');
        } finally {
            setSaving(false);
        }
    }, [nodes, edges, fetchPackages, setNodes, setEdges, originalPackageCourses]);

    // ==================== EDIT & DELETE ====================

    const handleEditPackage = async (pkg: PackageItem) => {
        setOpenDropdownId(null);
        setLoading(true);
        try {
            console.log('📦 Fetching package:', pkg.id);
            const fullPkg = await adminService.getPackage(pkg.id);
            console.log('📦 Full package data:', fullPkg);
            console.log('📦 Courses:', fullPkg.courses);

            // Check if we have a saved builder layout
            if (fullPkg.builder_layout && fullPkg.builder_layout.nodes && fullPkg.builder_layout.edges) {
                console.log('📦 Restoring saved builder layout');
                const savedNodes = fullPkg.builder_layout.nodes as AppNode[];
                const savedEdges = fullPkg.builder_layout.edges as AppEdge[];

                // CRITICAL: Update the package node's originalId to the actual database ID
                // This ensures that saving will UPDATE the package instead of creating a new one
                const updatedNodes = savedNodes.map(node => {
                    if (node.type === 'packageNode') {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                originalId: pkg.id, // Use the actual package ID from the database
                            }
                        };
                    }
                    return node;
                });

                // Extract course IDs from the saved nodes
                const courseIds: number[] = [];
                updatedNodes.forEach(node => {
                    if (node.type === 'courseNode' && node.data?.originalId) {
                        courseIds.push(node.data.originalId);
                    } else if ((node.type === 'termNode' || node.type === 'gradeNode') && node.data?.includedCourses) {
                        (node.data as any).includedCourses.forEach((c: any) => courseIds.push(c.id));
                    }
                });

                setNodes(updatedNodes as AppNode[]);
                setEdges(savedEdges);
                setOriginalPackageCourses(courseIds);
                setViewMode('studio');
                setLoading(false);
                return;
            }

            // FALLBACK: No saved layout, reconstruct from courses (legacy behavior)
            console.log('📦 No saved layout, using fallback circular layout');

            // Validate that we have courses
            const courses = fullPkg.courses || [];
            console.log('📦 Number of courses:', courses.length);

            // Calculate total price from courses
            const totalPrice = courses.reduce((sum, c) => sum + (c.price || 0), 0);

            // Reconstruct Graph
            const pkgId = `package-existing-${fullPkg.id}`;

            // Create package node with proper data
            // Use pkg.id as fallback since fullPkg.id might be null from API response parsing issues
            const packageOriginalId = fullPkg.id || pkg.id;
            console.log('📦 Package originalId:', packageOriginalId);

            const packageNode: AppNode = {
                id: pkgId,
                type: 'packageNode' as const,
                position: { x: 600, y: 300 },
                data: {
                    label: fullPkg.name || pkg.name,
                    totalPrice: fullPkg.price || pkg.price || totalPrice,
                    coursesCount: courses.length,
                    description: fullPkg.description || '',
                    originalId: packageOriginalId,
                    isRoot: true,
                    // Restore cover image
                    coverImage: fullPkg.image || null,
                    // Restore discount fields
                    isDiscountActive: fullPkg.is_discount_active || false,
                    discountPercentage: fullPkg.discount_percentage || undefined,
                    discountPrice: fullPkg.discount_price || undefined,
                    discountStartDate: fullPkg.discount_start_date || undefined,
                    discountEndDate: fullPkg.discount_end_date || undefined,
                }
            };

            const newNodes: AppNode[] = [packageNode];
            const newEdges: AppEdge[] = [];
            const courseIds: number[] = [];

            // Layout courses in a circle around the package
            courses.forEach((course, index) => {
                courseIds.push(course.id);
                const courseNodeId = `course-existing-${course.id}`;

                // Circular layout calculation
                const angle = (index / courses.length) * 2 * Math.PI - Math.PI / 2; // Start from top
                const radius = 280;
                const x = 600 + radius * Math.cos(angle);
                const y = 300 + radius * Math.sin(angle);

                // Extract course name (handle translation object)
                const courseName = extractName(course.name);
                console.log(`📚 Course ${index + 1}:`, { id: course.id, name: courseName, price: course.price });

                // Create course node
                const courseNode: AppNode = {
                    id: courseNodeId,
                    type: 'courseNode' as const,
                    position: { x, y },
                    data: {
                        label: courseName,
                        price: course.price || 0,
                        originalId: course.id
                    }
                };
                newNodes.push(courseNode);

                // Create edge from course to package
                newEdges.push({
                    id: `e-${courseNodeId}-${pkgId}`,
                    source: courseNodeId,
                    target: pkgId,
                    type: 'default',
                    animated: true,
                    style: { stroke: '#94a3b8', strokeWidth: 2 }
                });
            });

            console.log('📦 Setting nodes:', newNodes.length);
            console.log('📦 Setting edges:', newEdges.length);

            // Set the nodes and edges
            setNodes(newNodes);
            setEdges(newEdges);
            setOriginalPackageCourses(courseIds);

            // Switch to studio view
            setViewMode('studio');

            toast.success(`تم تحميل الباقة "${pkg.name}" بنجاح`);
        } catch (error) {
            console.error('❌ Error loading package:', error);
            toast.error('فشل تحميل تفاصيل الباقة');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePackage = (pkg: PackageItem) => {
        setOpenDropdownId(null);
        setDeleteModalPackage(pkg);
    };

    const confirmDeletePackage = async () => {
        if (!deleteModalPackage) return;

        setDeleting(true);
        try {
            await adminService.deletePackage(deleteModalPackage.id);
            toast.success('تم حذف الباقة بنجاح');
            setDeleteModalPackage(null);
            fetchPackages();
        } catch (error) {
            console.error(error);
            toast.error('فشل حذف الباقة');
        } finally {
            setDeleting(false);
        }
    };

    // ==================== DRAG & DROP HANDLERS ====================

    const onDragStart = (event: React.DragEvent, type: string, item: ResourceItem) => {
        event.dataTransfer.setData('application/reactflow/type', type);
        event.dataTransfer.setData('application/reactflow/item', JSON.stringify(item));
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow/type');
            const itemString = event.dataTransfer.getData('application/reactflow/item');

            if (!itemString || !type) return;

            const item: ResourceItem = JSON.parse(itemString);

            // CHECK FOR DUPLICATES
            const isDuplicate = nodes.some(node =>
                node.type === type &&
                (node.data as any).originalId === item.id
            );

            if (isDuplicate) {
                toast.error('هذا العنصر مضاف بالفعل إلى الباقة');
                return;
            }

            const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            const id = `${type}-${item.id}-${Date.now()}`;

            const label = extractName(item.name);
            let data: any = { label, originalId: item.id };

            if (type === 'courseNode') {
                data = { ...data, price: item.price, hours: item.duration_hours } as CourseNodeData;
            } else if (type === 'termNode') {
                data = { ...data, isFetched: false } as TermNodeData;
            } else if (type === 'gradeNode') {
                data = { ...data, isFetched: false } as GradeNodeData;
            }

            const newNode: AppNode = {
                id,
                type: type as any, // Cast type to satisfy discriminated union if needed, or better, leverage proper typing
                position,
                data,
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes, nodes]
    );

    // ==================== RENDER HELPERS ====================

    // Filter resources
    const filteredCourses = courses.filter(c => extractName(c.name).toLowerCase().includes(sidebarSearch.toLowerCase()));
    const filteredSemesters = semesters.filter(s => extractName(s.name).toLowerCase().includes(sidebarSearch.toLowerCase()));
    const filteredGrades = grades.filter(g => extractName(g.name).toLowerCase().includes(sidebarSearch.toLowerCase()));

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (viewMode !== 'studio') return;
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewMode, undo, redo]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (openDropdownId !== null) {
                setOpenDropdownId(null);
            }
        };

        if (openDropdownId !== null) {
            // Delay to prevent immediate close on the same click
            const timer = setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 0);
            return () => {
                clearTimeout(timer);
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [openDropdownId]);


    if (viewMode === 'list') {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">باقات الاشتراكات</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">إدارة الباقات الدراسية وتخصيص محتواها</p>
                    </div>
                    <button
                        onClick={() => setViewMode('studio')}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all"
                    >
                        <Plus size={20} />
                        <span>تصميم باقة جديدة</span>
                    </button>
                </div>

                {/* List View Table (Simplified for brevity) */}
                <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 overflow-visible">
                    <div className="p-4 border-b border-slate-100 dark:border-white/10 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="بحث عن باقة..."
                                className="w-full pr-10 pl-4 py-2 bg-slate-50 dark:bg-[#2A2A2A] border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 dark:text-white dark:placeholder-slate-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400">جاري التحميل...</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">اسم الباقة</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">السعر</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">عدد الكورسات</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">الحالة</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                {packages.map(pkg => (
                                    <tr key={pkg.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {pkg.image ? (
                                                    <img
                                                        src={pkg.image}
                                                        alt={pkg.name}
                                                        className="w-10 h-10 rounded-lg object-cover shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                                                        <LayoutDashboard size={20} />
                                                    </div>
                                                )}
                                                <span className="font-medium text-slate-800 dark:text-white">{pkg.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                {pkg.is_discount_active && pkg.discount_percentage ? (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-red-600">
                                                                {pkg.final_price?.toLocaleString() || (pkg.price - (pkg.price * (pkg.discount_percentage || 0) / 100)).toLocaleString()} ر.ع
                                                            </span>
                                                            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
                                                                -{pkg.discount_percentage}%
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-slate-400 line-through">
                                                            {pkg.price?.toLocaleString()} ر.ع
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="font-bold text-slate-700 dark:text-slate-200">{pkg.price?.toLocaleString()} ر.ع</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{pkg.courses_count || 0}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {pkg.is_active ? 'نشط' : 'غيز نشط'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenDropdownId(openDropdownId === pkg.id ? null : pkg.id)}
                                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                                >
                                                    <MoreVertical size={20} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {openDropdownId === pkg.id && (
                                                    <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-[#1E1E1E] rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                        <button
                                                            onClick={() => handleEditPackage(pkg)}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-right"
                                                        >
                                                            <Edit size={18} className="text-blue-500" />
                                                            <span className="font-medium">تعديل الباقة</span>
                                                        </button>
                                                        <div className="h-px bg-slate-100 dark:bg-white/10 my-1" />
                                                        <button
                                                            onClick={() => handleDeletePackage(pkg)}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-right"
                                                        >
                                                            <Trash2 size={18} />
                                                            <span className="font-medium">حذف الباقة</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {deleteModalPackage && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
                        onClick={() => setDeleteModalPackage(null)}
                    >
                        <div
                            className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <AlertTriangle size={22} className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">تأكيد الحذف</h3>
                                </div>
                                <button
                                    onClick={() => setDeleteModalPackage(null)}
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-white" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                                        <Trash2 size={32} className="text-red-500" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 text-lg">
                                        هل أنت متأكد من حذف الباقة
                                    </p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                                        "{deleteModalPackage.name}"
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                        سيتم حذف الباقة نهائياً ولا يمكن التراجع عن هذا الإجراء
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteModalPackage(null)}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-3 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-white/15 transition-colors disabled:opacity-50"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        onClick={confirmDeletePackage}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {deleting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                <span>جاري الحذف...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 size={18} />
                                                <span>حذف الباقة</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // STUDIO VIEW
    return (
        <div className={`flex flex-col gap-4 transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-slate-50 p-4' : 'h-[calc(100vh-100px)]'}`}>
            {/* Header */}
            <div className="flex items-center justify-between bg-white dark:bg-[#1E1E1E] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setViewMode('list')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">استوديو تصميم الباقات</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>نظام التجميع التلقائي نشط</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className={`p-2 rounded-lg transition-colors ${isFullScreen ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        title={isFullScreen ? 'تصغير' : 'تكميل الشاشة'}
                    >
                        {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>

                    <button
                        onClick={handlePreview}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium text-sm transition-colors"
                    >
                        معاينة
                    </button>
                    <button
                        onClick={savePackage}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>{saving ? 'جاري الحفظ...' : 'حفظ الباقة'}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-4 min-h-0">
                {/* Canvas Area */}
                <div className="flex-1 rounded-2xl border-2 border-slate-200 bg-slate-50 overflow-hidden relative shadow-inner">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        fitView
                        deleteKeyCode={['Backspace', 'Delete']}
                        edgesReconnectable={true}
                        defaultEdgeOptions={{
                            style: { stroke: '#94a3b8', strokeWidth: 2 },
                            animated: true,
                        }}
                    >
                        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
                        <Controls className="!bg-white !shadow-lg !rounded-xl !border-slate-200" />

                        <Panel position="top-left" className="flex gap-2">
                            <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-lg flex gap-1">
                                <button
                                    onClick={undo}
                                    disabled={historyIndex <= 0}
                                    className="p-2 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Undo (Ctrl+Z)"
                                >
                                    <Undo size={18} />
                                </button>
                                <button
                                    onClick={redo}
                                    disabled={historyIndex >= historyLength - 1}
                                    className="p-2 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Redo (Ctrl+Y)"
                                >
                                    <Redo size={18} />
                                </button>
                            </div>

                            <button
                                onClick={addPackageNode}
                                className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-lg text-amber-600 font-bold hover:bg-amber-50 flex items-center gap-2"
                            >
                                <Plus size={18} />
                                <span>إضافة باقة</span>
                            </button>
                        </Panel>
                    </ReactFlow>
                </div>

                {/* Sidebar Resources */}
                <div className="w-80 bg-white dark:bg-[#1E1E1E] rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4">المصادر التعليمية</h3>

                        {/* Tabs */}
                        <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
                            <button
                                onClick={() => setActiveTab('courses')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'courses' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                الكورسات
                            </button>
                            <button
                                onClick={() => setActiveTab('terms')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'terms' ? 'bg-white shadow text-green-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                التيرمات
                            </button>
                            <button
                                onClick={() => setActiveTab('grades')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'grades' ? 'bg-white shadow text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                المراحل
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={sidebarSearch}
                                onChange={(e) => setSidebarSearch(e.target.value)}
                                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            اسحب العناصر إلى اللوحة
                        </div>

                        {activeTab === 'courses' && filteredCourses.map(course => (
                            <div
                                key={course.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, 'courseNode', course)}
                                className="bg-white p-3 rounded-xl border border-blue-100 hover:border-blue-400 hover:shadow-md cursor-grab active:cursor-grabbing group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <BookOpen size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-slate-700 truncate">{extractName(course.name)}</h4>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-blue-600 font-bold">{course.price} ر.ع</span>
                                            <span className="text-[10px] text-slate-400">{course.duration_hours}h</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {activeTab === 'terms' && filteredSemesters.map(term => (
                            <div
                                key={term.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, 'termNode', term)}
                                className="bg-white p-3 rounded-xl border border-green-100 hover:border-green-400 hover:shadow-md cursor-grab active:cursor-grabbing group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                        <Calendar size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-slate-700">{extractName(term.name)}</h4>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {activeTab === 'grades' && filteredGrades.map(grade => (
                            <div
                                key={grade.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, 'gradeNode', grade)}
                                className="bg-white p-3 rounded-xl border border-purple-100 hover:border-purple-400 hover:shadow-md cursor-grab active:cursor-grabbing group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                        <GraduationCap size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-slate-700">{extractName(grade.name)}</h4>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Package Preview Modal */}
            {previewData && (
                <PackagePreviewModal
                    isOpen={!!previewData}
                    onClose={() => setPreviewData(null)}
                    packageData={previewData.package}
                    courses={previewData.courses}
                />
            )}
        </div>
    );
}

export default AdminPackagesPage;
