import React, { useCallback, useEffect, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    MarkerType,
    NodeTypes,
    Position,
    Handle,
    Connection,
    addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
    BookOpen,
    Calendar,
    GraduationCap,
    Layers,
    Library,
    Loader2,
    RefreshCw,
    Search,
    Link2,
    Unlink,
    Maximize2,
    Minimize2,
    LayoutGrid,
    GripVertical
} from 'lucide-react';
import adminService from '../../../data/api/adminService';
import { toast } from 'react-hot-toast';

// --- Custom Node Components with Loading State ---

// Base node wrapper with loading overlay
const NodeWrapper = ({
    children,
    isLoading,
    borderColor,
    isDimmed
}: {
    children: React.ReactNode;
    isLoading?: boolean;
    borderColor: string;
    isDimmed?: boolean;
}) => (
    <div className={`relative px-4 py-3 shadow-md rounded-xl bg-white border-2 ${borderColor} min-w-[200px] transition-all duration-200 ${isLoading ? 'opacity-70' : ''} ${isDimmed ? 'opacity-20 grayscale' : ''}`}>
        {children}
        {isLoading && (
            <div className="absolute inset-0 bg-white/60 rounded-xl flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={24} />
            </div>
        )}
    </div>
);

// 1. Grade Node (Root)
const GradeNode = ({ data }: { data: any }) => {
    return (
        <NodeWrapper isLoading={data.isLoading} isDimmed={data.isDimmed} borderColor="border-indigo-500">
            <div className="flex items-center">
                <div className="rounded-full bg-indigo-100 p-2 mr-3">
                    <GraduationCap size={20} className="text-indigo-600" />
                </div>
                <div>
                    <div className="text-sm font-bold text-gray-900">{data.label}</div>
                    <div className="text-xs text-gray-500">Grade Level</div>
                </div>
            </div>
            {/* Larger Handle for easier interaction */}
            <Handle type="source" position={Position.Left} className="w-4 h-4 bg-indigo-500 border-2 border-white shadow-sm hover:scale-125 transition-transform cursor-crosshair" />
        </NodeWrapper>
    );
};

// 2. Semester Node
const SemesterNode = ({ data }: { data: any }) => {
    return (
        <NodeWrapper isLoading={data.isLoading} isDimmed={data.isDimmed} borderColor="border-emerald-500">
            <Handle type="target" position={Position.Right} className="w-4 h-4 bg-emerald-500 border-2 border-white shadow-sm hover:scale-125 transition-transform cursor-crosshair" />
            <div className="flex items-center">
                <div className="rounded-full bg-emerald-100 p-2 mr-3">
                    <Calendar size={20} className="text-emerald-600" />
                </div>
                <div>
                    <div className="text-sm font-bold text-gray-900">{data.label}</div>
                    <div className="text-xs text-gray-500">Semester</div>
                </div>
            </div>
            <Handle type="source" position={Position.Left} className="w-4 h-4 bg-emerald-500 border-2 border-white shadow-sm hover:scale-125 transition-transform cursor-crosshair" />
        </NodeWrapper>
    );
};

// 3. Subject Node
const SubjectNode = ({ data }: { data: any }) => {
    return (
        <NodeWrapper isLoading={data.isLoading} isDimmed={data.isDimmed} borderColor="border-amber-500">
            <Handle type="target" position={Position.Right} className="w-4 h-4 bg-amber-500 border-2 border-white shadow-sm hover:scale-125 transition-transform cursor-crosshair" />
            <div className="flex items-center">
                <div className="rounded-full bg-amber-100 p-2 mr-3">
                    <Library size={20} className="text-amber-600" />
                </div>
                <div>
                    <div className="text-sm font-bold text-gray-900">{data.label}</div>
                    <div className="text-xs text-gray-500">Subject</div>
                </div>
            </div>
            <Handle type="source" position={Position.Left} className="w-4 h-4 bg-amber-500 border-2 border-white shadow-sm hover:scale-125 transition-transform cursor-crosshair" />
        </NodeWrapper>
    );
};

// 4. Course Node (Leaf - no loading needed as it has no children)
const CourseNode = ({ data }: { data: any }) => {
    return (
        <NodeWrapper isLoading={false} isDimmed={data.isDimmed} borderColor="border-slate-400">
            <Handle type="target" position={Position.Right} className="w-4 h-4 bg-slate-400 border-2 border-white shadow-sm hover:scale-125 transition-transform cursor-crosshair" />
            <div className="flex items-center">
                <div className="rounded-full bg-slate-100 p-2 mr-3">
                    <BookOpen size={20} className="text-slate-600" />
                </div>
                <div>
                    <div className="text-sm font-bold text-gray-900">{data.label}</div>
                    <div className="text-xs text-gray-500">Course</div>
                </div>
            </div>
        </NodeWrapper>
    );
};

const nodeTypes: NodeTypes = {
    grade: GradeNode,
    semester: SemesterNode,
    subject: SubjectNode,
    course: CourseNode,
};

const AdminAcademicGraphPage = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showPalette, setShowPalette] = useState(false); // Sidebar Toggle
    const [unlinkedItems, setUnlinkedItems] = useState<{ semesters: any[], subjects: any[], courses: any[] }>({ semesters: [], subjects: [], courses: [] });
    const [rfInstance, setRfInstance] = useState<any>(null); // React Flow Instance
    const [searchQuery, setSearchQuery] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Valid connection rules: source type -> allowed target types
    const validConnections: Record<string, string[]> = {
        grade: ['semester'],
        semester: ['subject'],
        subject: ['course'],
    };

    // Helper to extract error message
    const getErrorMessage = (error: any) => {
        return error.response?.data?.message || error.message || 'حدث خطأ غير متوقع';
    };

    // Extract node type and DB ID from node ID (e.g., "grade-1" -> {type: "grade", dbId: 1})
    const parseNodeId = (nodeId: string): { type: string; dbId: number } | null => {
        const parts = nodeId.split('-');
        if (parts.length >= 2) {
            return { type: parts[0], dbId: parseInt(parts.slice(1).join('-'), 10) };
        }
        return null;
    };

    // Fetch Initial Root Nodes (Grades)
    const fetchRoots = useCallback(async () => {
        setLoadingNodeId('root'); // Use special ID for initial load
        try {
            const response = await adminService.getAcademicNodes({ type: 'root' });
            if (response.nodes) {
                // Position grades vertically on the left
                const formattedNodes = response.nodes.map((node: any, index: number) => ({
                    ...node,
                    position: { x: 800, y: index * 150 + 50 },
                }));
                setNodes(formattedNodes);
                setExpandedNodes(new Set()); // Reset expanded state
                setEdges([]); // clear edges
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load grade levels');
        } finally {
            setLoadingNodeId(null);
        }
    }, [setNodes, setEdges]);

    useEffect(() => {
        fetchRoots();
    }, [fetchRoots]);

    // Helper function to get all descendant node IDs recursively (Smart Collapse)
    const getDescendantNodeIds = useCallback((parentNodeId: string, currentEdges: Edge[]): string[] => {
        const children = currentEdges
            .filter(edge => edge.source === parentNodeId)
            .map(edge => edge.target);

        const allDescendants: string[] = [];

        for (const childId of children) {
            // Check if child has other visible parents (Shared Node)
            const hasOtherParents = currentEdges.some(e => e.target === childId && e.source !== parentNodeId);

            // If it has other parents, it stays visible. Skip removal and skip recursion for this branch.
            if (hasOtherParents) continue;

            allDescendants.push(childId);
            allDescendants.push(...getDescendantNodeIds(childId, currentEdges));
        }

        return allDescendants;
    }, []);

    // Handle Node Click -> Toggle Expand/Collapse
    const onNodeClick = useCallback(async (_event: React.MouseEvent, node: Node) => {
        const { type, id, data, position } = node;

        // If already expanded, COLLAPSE (remove children and their descendants)
        if (expandedNodes.has(node.id)) {
            // Find all descendant nodes to remove
            const descendantIds = getDescendantNodeIds(node.id, edges);

            // Remove descendant nodes
            setNodes((nds) => nds.filter(n => !descendantIds.includes(n.id)));

            // Remove edges connected to descendants + edges from this node
            setEdges((eds) => eds.filter(e =>
                !descendantIds.includes(e.target) &&
                e.source !== node.id
            ));

            // Remove this node and all descendants from expanded set
            setExpandedNodes((prev) => {
                const next = new Set(prev);
                next.delete(node.id);
                descendantIds.forEach(id => next.delete(id));
                return next;
            });

            return;
        }

        const dbId = data.dbId;

        // Determine child type
        let childType = '';
        if (type === 'grade') childType = 'grade';
        else if (type === 'semester') childType = 'semester';
        else if (type === 'subject') childType = 'subject';
        else return; // Courses have no children

        // Set loading state on clicked node by updating its data
        setLoadingNodeId(node.id);
        setNodes((nds) => nds.map(n =>
            n.id === node.id ? { ...n, data: { ...n.data, isLoading: true } } : n
        ));

        try {
            const response = await adminService.getAcademicNodes({
                type: childType,
                parentId: dbId as number
            });

            if (response.nodes && response.nodes.length > 0) {
                const childNodes = response.nodes;
                const newEdges: Edge[] = [];
                const newNodes: Node[] = [];

                // Simple Auto-Layout for children
                const startY = position.y - ((childNodes.length - 1) * 100) / 2;

                childNodes.forEach((childNode: any, index: number) => {
                    if (!nodes.find(n => n.id === childNode.id)) {
                        newNodes.push({
                            ...childNode,
                            position: {
                                x: position.x - 400,
                                y: startY + (index * 120)
                            }
                        });
                    }

                    newEdges.push({
                        id: `e-${node.id}-${childNode.id}`,
                        source: node.id,
                        target: childNode.id,
                        type: 'smoothstep',
                        markerEnd: { type: MarkerType.ArrowClosed },
                        animated: true,
                        style: { stroke: '#64748b' }
                    });
                });

                // Update nodes: add children and clear loading on parent
                setNodes((nds) => [
                    ...nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, isLoading: false } } : n),
                    ...newNodes
                ]);
                setEdges((eds) => [...eds, ...newEdges]);
                setExpandedNodes((prev) => new Set(prev).add(node.id));
            } else {
                toast('No items found inside this node', { icon: '📭' });
                // Clear loading on this node
                setNodes((nds) => nds.map(n =>
                    n.id === node.id ? { ...n, data: { ...n.data, isLoading: false } } : n
                ));
            }

        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error));
            // Clear loading on error
            setNodes((nds) => nds.map(n =>
                n.id === node.id ? { ...n, data: { ...n.data, isLoading: false } } : n
            ));
        } finally {
            setLoadingNodeId(null);
        }

    }, [nodes, edges, expandedNodes, setNodes, setEdges, getDescendantNodeIds]);

    // Handle new connection (drag from handle to handle)
    const onConnect = useCallback(async (connection: Connection) => {
        if (!connection.source || !connection.target) return;

        const sourceInfo = parseNodeId(connection.source);
        const targetInfo = parseNodeId(connection.target);

        if (!sourceInfo || !targetInfo) {
            toast.error('Invalid connection');
            return;
        }

        // Validate connection type
        const allowedTargets = validConnections[sourceInfo.type];
        if (!allowedTargets || !allowedTargets.includes(targetInfo.type)) {
            toast.error(`Cannot connect ${sourceInfo.type} to ${targetInfo.type}. Only valid: ${allowedTargets?.join(', ') || 'none'}`);
            return;
        }

        // Check if edge already exists
        const edgeExists = edges.some(
            e => e.source === connection.source && e.target === connection.target
        );
        if (edgeExists) {
            toast('This connection already exists', { icon: 'ℹ️' });
            return;
        }

        setIsSaving(true);
        try {
            // Call backend to create connection
            await adminService.connectAcademicNodes({
                sourceId: sourceInfo.dbId,
                sourceType: sourceInfo.type,
                targetId: targetInfo.dbId,
                targetType: targetInfo.type,
            });

            // Add edge to local state on success
            const newEdge: Edge = {
                id: `e-${connection.source}-${connection.target}`,
                source: connection.source,
                target: connection.target,
                markerEnd: { type: MarkerType.ArrowClosed },
                animated: true,
                style: { stroke: '#22c55e' },
            };

            setEdges((eds) => addEdge(newEdge, eds));

            // Success (Linked)
            toast.success(`تم ربط ${sourceInfo.type === 'grade' ? 'المرحلة' : sourceInfo.type === 'semester' ? 'الفصل' : 'المادة'} بـ ${targetInfo.type === 'semester' ? 'الفصل' : targetInfo.type === 'subject' ? 'المادة' : 'الدورة'}`);

        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error));

            // Revert on error - note: simple revert might be complex if we just used addEdge, 
            // but for now we just won't add it if API fails? 
            // Actually API is called first. If API succeeds, we add edge. 
            // If API fails, we catch here and don't add edge.
        } finally {
            setIsSaving(false);
        }
    }, [edges, setEdges, validConnections]);

    // Handle edge deletion (Disconnect)
    const onEdgesDelete = useCallback(async (deletedEdges: Edge[]) => {
        for (const edge of deletedEdges) {
            const targetInfo = parseNodeId(edge.target);
            if (!targetInfo) continue;

            setIsSaving(true);
            try {
                await adminService.disconnectAcademicNodes({
                    targetId: targetInfo.dbId,
                    targetType: targetInfo.type,
                });
                toast.success(`تم فصل ${targetInfo.type === 'semester' ? 'الفصل' : targetInfo.type === 'subject' ? 'المادة' : 'الدورة'}`);
            } catch (error) {
                console.error(error);
                toast.error(getErrorMessage(error));
                // Re-add the edge if disconnect failed
                setEdges((eds) => [...eds, edge]);
            } finally {
                setIsSaving(false);
            }
        }
    }, [setEdges]);

    // Validate connection before allowing it
    const isValidConnection = useCallback((connection: Edge | Connection) => {
        if (!connection.source || !connection.target) return false;
        const sourceInfo = parseNodeId(connection.source);
        const targetInfo = parseNodeId(connection.target);
        if (!sourceInfo || !targetInfo) return false;
        const allowedTargets = validConnections[sourceInfo.type];
        return allowedTargets?.includes(targetInfo.type) ?? false;
    }, [validConnections]);

    // Fetch Unlinked Nodes for Palette
    const fetchUnlinked = useCallback(async () => {
        try {
            const data = await adminService.getUnlinkedAcademicNodes();
            if (data.unlinked) {
                setUnlinkedItems(data.unlinked);
            }
        } catch (error) {
            console.error("Failed to fetch unlinked items", error);
        }
    }, []);

    // Effect to fetch unlinked when palette opens
    useEffect(() => {
        if (showPalette) {
            fetchUnlinked();
        }
    }, [showPalette, fetchUnlinked]);

    // Handle Node Deletion (Backspace/Delete key)
    const onNodesDelete = useCallback((deletedNodes: Node[]) => {
        const count = deletedNodes.length;
        toast(`Removed ${count} node${count > 1 ? 's' : ''} from graph`, { icon: '🗑️' });

        // Optimistically update palette (or just fetch)
        // Give a small delay for backend edge disconnection triggers to settle if any
        setTimeout(() => {
            fetchUnlinked();
        }, 300);
    }, [fetchUnlinked]);

    // Drag & Drop Handlers
    const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, data: nodeData }));
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!rfInstance) return;

            const reactFlowData = event.dataTransfer.getData('application/reactflow');
            if (!reactFlowData) return;

            const { type, data } = JSON.parse(reactFlowData);
            const position = rfInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: data.id, // Use the ID from backend (e.g., 'semester-5')
                type,
                position,
                data: { ...data, label: data.label }, // Ensure label is in data
            };

            // Avoid duplicates
            setNodes((nds) => {
                if (nds.find(n => n.id === newNode.id)) {
                    toast('هذا العنصر موجود بالفعل على اللوحة', { icon: '⚠️' });
                    return nds;
                }
                return nds.concat(newNode);
            });

            // Optional: Remove from unlinked list locally (for better UX)
            setUnlinkedItems(prev => ({
                ...prev,
                semesters: type === 'semester' ? prev.semesters.filter(i => i.id !== newNode.id) : prev.semesters,
                subjects: type === 'subject' ? prev.subjects.filter(i => i.id !== newNode.id) : prev.subjects,
                courses: type === 'course' ? prev.courses.filter(i => i.id !== newNode.id) : prev.courses,
            }));

            setHasUnsavedChanges(true); // Mark as dirty
            toast.success(`تمت إضافة ${data.label} إلى اللوحة`);
        },
        [rfInstance, setNodes]
    );

    // Handle Search: Dim nodes that don't match
    useEffect(() => {
        if (!searchQuery.trim()) {
            setNodes((nds) => nds.map(n => {
                if (!n.data.isDimmed) return n; // Avoid unnecessary updates
                return { ...n, data: { ...n.data, isDimmed: false } };
            }));
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();
        setNodes((nds) => nds.map(n => {
            const label = n.data?.label || '';
            const isMatch = String(label).toLowerCase().includes(lowerQuery);
            // If match state matches current isDimmed state, avoid update (isDimmed should be !isMatch)
            if (n.data.isDimmed === !isMatch) return n;

            return {
                ...n,
                data: {
                    ...n.data,
                    isDimmed: !isMatch
                }
            };
        }));
    }, [searchQuery, setNodes]);

    // Handle Unsaved Changes Warning
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = ''; // Standard for modern browsers
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Toggle fullscreen mode
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prev => !prev);
    }, []);

    return (
        <div dir="rtl" className={`flex flex-col bg-slate-50 transition-all duration-300 ${isFullscreen
            ? 'fixed inset-0 z-[9999]'
            : 'h-[calc(100vh-64px)]'
            }`}>
            {/* Header Toolbar */}
            <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                        <Layers size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">هيكل النظام الأكاديمي</h1>
                        <p className="text-xs text-slate-500">عرض المراحل الدراسية، الفصول، والمواد</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {loadingNodeId === 'root' && <div className="flex items-center text-indigo-600 text-sm"><Loader2 className="animate-spin ml-2" size={16} /> جاري التحميل...</div>}
                    {isSaving && <div className="flex items-center text-emerald-600 text-sm"><Loader2 className="animate-spin ml-2" size={16} /> جاري الحفظ...</div>}

                    <button
                        onClick={fetchRoots}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    >
                        <RefreshCw size={18} />
                        <span>إعادة تعيين</span>
                    </button>

                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="بحث..."
                            className="pr-10 pl-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 w-64"
                        />
                    </div>

                    {/* Fullscreen Toggle Button */}
                    <button
                        onClick={toggleFullscreen}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        title={isFullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة'}
                    >
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        <span className="hidden sm:inline">{isFullscreen ? 'خروج' : 'تكبير'}</span>
                    </button>

                    {/* Palette Toggle Button */}
                    <button
                        onClick={() => setShowPalette(prev => !prev)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border ${showPalette ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 border-slate-200'}`}
                        title="تبديل لوحة العناصر"
                    >
                        <LayoutGrid size={18} />
                        <span className="hidden sm:inline">العناصر</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Graph Canvas */}
                <div className="flex-1 h-full relative" onDrop={onDrop} onDragOver={onDragOver}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        onConnect={onConnect}
                        onNodesDelete={onNodesDelete}
                        onEdgesDelete={onEdgesDelete}
                        isValidConnection={isValidConnection}
                        nodeTypes={nodeTypes}
                        fitView
                        minZoom={0.2}
                        deleteKeyCode={['Backspace', 'Delete']}
                        className="bg-slate-50"
                        onInit={setRfInstance}
                    >
                        <Background color="#cbd5e1" gap={20} size={1} />
                        <Controls />
                    </ReactFlow>
                </div>

                {/* Entity Palette Sidebar */}
                <div className={`absolute top-0 left-0 h-full bg-white border-r border-slate-200 shadow-xl transition-transform duration-300 z-40 w-80 flex flex-col ${showPalette ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <LayoutGrid size={18} className="text-indigo-600" />
                            لوحة العناصر
                        </h2>
                        <button onClick={() => fetchUnlinked()} className="text-slate-400 hover:text-indigo-600 transition-colors" title="تحديث">
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Semesters */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> فصول غير مرتبطة
                            </h3>
                            <div className="space-y-2">
                                {unlinkedItems.semesters.length === 0 && <p className="text-xs text-slate-400 italic">لا توجد فصول غير مرتبطة</p>}
                                {unlinkedItems.semesters.map(item => (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, 'semester', { ...item.data, id: item.id })}
                                        className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-grab hover:border-emerald-400 hover:shadow-md transition-all flex items-center gap-3 active:cursor-grabbing"
                                    >
                                        <GripVertical size={16} className="text-slate-300" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-700">{item.data.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Subjects */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span> مواد غير مرتبطة
                            </h3>
                            <div className="space-y-2">
                                {unlinkedItems.subjects.length === 0 && <p className="text-xs text-slate-400 italic">لا توجد مواد غير مرتبطة</p>}
                                {unlinkedItems.subjects.map(item => (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, 'subject', { ...item.data, id: item.id })}
                                        className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-grab hover:border-amber-400 hover:shadow-md transition-all flex items-center gap-3 active:cursor-grabbing"
                                    >
                                        <GripVertical size={16} className="text-slate-300" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-700">{item.data.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Courses */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span> دورات غير مرتبطة
                            </h3>
                            <div className="space-y-2">
                                {unlinkedItems.courses.length === 0 && <p className="text-xs text-slate-400 italic">لا توجد دورات غير مرتبطة</p>}
                                {unlinkedItems.courses.map(item => (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, 'course', { ...item.data, id: item.id })}
                                        className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-grab hover:border-blue-400 hover:shadow-md transition-all flex items-center gap-3 active:cursor-grabbing"
                                    >
                                        <GripVertical size={16} className="text-slate-300" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-700">{item.data.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend / Instructions */}
            <div className={`absolute bottom-6 right-6 bg-white/90 backdrop-blur shadow-lg rounded-xl p-4 border border-slate-200 z-50`}>
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 text-right">التعليمات</h3>
                <ul className="text-sm space-y-2 text-slate-700">
                    <li className="flex items-center justify-end gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <span className="font-bold text-indigo-600">لتوسيع/طي</span>
                        <span>انقر على العقدة</span>
                    </li>
                    <li className="flex items-center justify-end gap-2">
                        <Link2 size={14} className="text-emerald-500" />
                        <span className="font-bold text-emerald-600">لإنشاء رابط</span>
                        <span>اسحب من المقبض إلى</span>
                    </li>
                    <li className="flex items-center justify-end gap-2">
                        <Unlink size={14} className="text-red-500" />
                        <span className="font-bold text-rose-600">Delete</span>
                        <span>للفصل: حدد الرابط +</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default AdminAcademicGraphPage;
