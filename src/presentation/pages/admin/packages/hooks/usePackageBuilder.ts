import { useCallback, useEffect, useState, useRef } from 'react';
import {
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    MarkerType,
    useReactFlow,
} from '@xyflow/react';
import toast from 'react-hot-toast';
import { AppNode, AppEdge, TermNodeData, GradeNodeData, CourseNodeData } from '../types';
import { updatePackageTotals } from '../utils/aggregation';
import { adminService } from '../../../../../data/api/adminService';

export function usePackageBuilder() {
    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([]);
    const { getNode } = useReactFlow();

    // History for Undo/Redo
    const [history, setHistory] = useState<{ nodes: AppNode[]; edges: AppEdge[] }[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isUndoRedo, setIsUndoRedo] = useState(false);

    // Use a ref to always have the latest edges for the aggregation callback
    const edgesRef = useRef<AppEdge[]>(edges);
    useEffect(() => {
        edgesRef.current = edges;
    }, [edges]);

    // ==================== AGGREGATION LOGIC ====================
    // Recalculate whenever nodes OR edges change
    useEffect(() => {
        if (isUndoRedo) return;

        const timer = setTimeout(() => {
            // Use the ref to get the absolute latest edges
            const currentEdges = edgesRef.current;

            setNodes((currentNodes) => {
                const updatedNodes = updatePackageTotals(currentNodes, currentEdges);
                return updatedNodes;
            });
        }, 50); // Faster debounce for responsiveness

        return () => clearTimeout(timer);
    }, [edges, nodes, setNodes, isUndoRedo]); // Listen to both nodes AND edges

    // ==================== UNDO/REDO LOGIC ====================
    const saveToHistory = useCallback(() => {
        if (isUndoRedo) {
            setIsUndoRedo(false);
            return;
        }
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push({
                nodes: JSON.parse(JSON.stringify(nodes)),
                edges: JSON.parse(JSON.stringify(edges))
            });
            if (newHistory.length > 50) newHistory.shift();
            return newHistory;
        });
        setHistoryIndex(prev => Math.min(prev + 1, 49));
    }, [nodes, edges, historyIndex, isUndoRedo]);

    useEffect(() => {
        if (!isUndoRedo && (nodes.length > 0 || edges.length > 0)) {
            const timeout = setTimeout(saveToHistory, 500);
            return () => clearTimeout(timeout);
        }
    }, [nodes, edges, isUndoRedo, saveToHistory]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setIsUndoRedo(true);
            const prevState = history[historyIndex - 1];
            setNodes(prevState.nodes);
            setEdges(prevState.edges);
            setHistoryIndex(prev => prev - 1);
        }
    }, [history, historyIndex, setNodes, setEdges]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setIsUndoRedo(true);
            const nextState = history[historyIndex + 1];
            setNodes(nextState.nodes);
            setEdges(nextState.edges);
            setHistoryIndex(prev => prev + 1);
        }
    }, [history, historyIndex, setNodes, setEdges]);

    // ==================== CALCULATION LOGIC (NO VISUAL EXPANSION) ====================

    /**
     * Fetches courses for a term and calculates the total price/count.
     * Stores the result on the term node data - does NOT create course nodes.
     */
    /**
     * Fetches courses for a term and calculates the total price/count.
     * Stores the result on the term node data - does NOT create course nodes.
     */
    const calculateTermTotal = useCallback(async (termNodeId: string, termId: number) => {
        try {
            const courses = await adminService.getCourses({ semester_id: termId });

            let totalPrice = 0;
            let coursesCount = 0;
            const includedCourses: { id: number; price: number; name: string; subject?: string }[] = [];

            courses.data.forEach((course: any) => {
                const price = Number(course.price || 0);
                totalPrice += price;
                coursesCount += 1;
                includedCourses.push({
                    id: course.id,
                    price,
                    name: course.name,
                    subject: course.subject?.name
                });
            });

            // Update the term node with calculated totals
            setNodes((currentNodes) => {
                return currentNodes.map(node => {
                    if (node.id === termNodeId) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                isFetched: true,
                                calculatedPrice: totalPrice,
                                calculatedCount: coursesCount,
                                includedCourses, // Store for deduplication
                            }
                        };
                    }
                    return node;
                });
            });

            return { totalPrice, coursesCount };
        } catch (error) {
            console.error("Failed to calculate term total:", error);
            return { totalPrice: 0, coursesCount: 0 };
        }
    }, [setNodes]);

    /**
     * Fetches semesters for a grade and calculates totals for each.
     * Stores the result on the grade node data - does NOT create term nodes.
     */
    const calculateGradeTotal = useCallback(async (gradeNodeId: string, gradeId: number) => {
        try {
            const semesters = await adminService.getSemesters({ grade_id: gradeId });

            let totalPrice = 0;
            let coursesCount = 0;
            const includedCourses: { id: number; price: number; name: string; subject?: string }[] = [];

            // For each semester, fetch its courses and sum
            for (const sem of semesters.data) {
                const courses = await adminService.getCourses({ semester_id: sem.id });
                courses.data.forEach((course: any) => {
                    const price = Number(course.price || 0);
                    totalPrice += price;
                    coursesCount += 1;
                    includedCourses.push({
                        id: course.id,
                        price,
                        name: course.name,
                        subject: course.subject?.name
                    });
                });
            }

            // Update the grade node with calculated totals
            setNodes((currentNodes) => {
                return currentNodes.map(node => {
                    if (node.id === gradeNodeId) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                isFetched: true,
                                calculatedPrice: totalPrice,
                                calculatedCount: coursesCount,
                                includedCourses, // Store for deduplication
                            }
                        };
                    }
                    return node;
                });
            });

            return { totalPrice, coursesCount };
        } catch (error) {
            console.error("Failed to calculate grade total:", error);
            return { totalPrice: 0, coursesCount: 0 };
        }
    }, [setNodes]);


    // ==================== HANDLERS ====================
    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges((eds) => addEdge({
                ...connection,
                type: 'default',
                style: { stroke: '#94a3b8', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
                animated: true,
            }, eds));

            // Calculate totals when a term/grade is connected (no visual expansion)
            const sourceNode = getNode(connection.source);
            if (sourceNode) {
                if (sourceNode.type === 'termNode') {
                    calculateTermTotal(sourceNode.id, (sourceNode.data as TermNodeData).originalId);
                } else if (sourceNode.type === 'gradeNode') {
                    calculateGradeTotal(sourceNode.id, (sourceNode.data as GradeNodeData).originalId);
                }
            }
        },
        [setEdges, getNode, calculateTermTotal, calculateGradeTotal]
    );

    const addPackageNode = useCallback(() => {
        // Prevent multiple packages
        if (nodes.some(n => n.type === 'packageNode')) {
            toast.error('يوجد باقة بالفعل في مساحة العمل. لا يمكن إضافة أكثر من باقة واحدة.');
            return;
        }

        const id = `package-${Date.now()}`;
        const newNode: AppNode = {
            id,
            type: 'packageNode',
            position: { x: 400, y: 200 },
            data: {
                label: 'باقة جديدة',
                totalPrice: 0,
                coursesCount: 0,
                isRoot: true,
            },
        };
        setNodes((nds) => nds.concat(newNode));
    }, [nodes, setNodes]);

    return {
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
        historyLength: history.length,
        addPackageNode,
    };
}
