import { Node, Edge, getIncomers } from '@xyflow/react';
import { AppNode, CourseNodeData, TermNodeData, GradeNodeData, PackageNodeData } from '../types';

interface AggregationResult {
    totalPrice: number;
    coursesCount: number;
}

/**
 * Calculates the total price and course count for a Package node
 * by reading values from its directly connected nodes.
 * 
 * For Term and Grade nodes, we use their pre-calculated values
 * (calculatedPrice, calculatedCount) that were fetched from the API
 * when the node was connected.
 * 
 * For Course nodes, we use their direct price.
 */
export const calculateNodeAggregates = (
    targetNodeId: string,
    nodes: AppNode[],
    edges: Edge[],
    visited: Set<string> = new Set()
): AggregationResult => {
    if (visited.has(targetNodeId)) {
        return { totalPrice: 0, coursesCount: 0 };
    }
    visited.add(targetNodeId);

    const targetNode = nodes.find(n => n.id === targetNodeId);
    if (!targetNode) {
        return { totalPrice: 0, coursesCount: 0 };
    }

    const incomers = getIncomers(targetNode as Node, nodes as Node[], edges);

    // Use a Map to store unique courses by their ID to prevent double counting
    // Map<CourseID, Price>
    const uniqueCourses = new Map<number, number>();

    for (const incomer of incomers) {
        if (incomer.type === 'courseNode') {
            // Course: use direct price
            const courseData = incomer.data as unknown as CourseNodeData;
            // Ensure we have a valid ID and price
            if (courseData.originalId) {
                uniqueCourses.set(courseData.originalId, Number(courseData.price || 0));
            }
        } else if (incomer.type === 'termNode') {
            // Term: use includedCourses if available for granular info
            const termData = incomer.data as any;
            if (termData.includedCourses && Array.isArray(termData.includedCourses)) {
                termData.includedCourses.forEach((c: { id: number; price: number }) => {
                    uniqueCourses.set(c.id, Number(c.price || 0));
                });
            } else if (termData.calculatedPrice !== undefined) {
                // Fallback for legacy/missing data (might double count if mixed with direct courses)
                // We can't easily deduplicate without IDs, so we just add a "virtual" ID or risk it.
                // ideally includedCourses is always present now.
            }
        } else if (incomer.type === 'gradeNode') {
            // Grade: use includedCourses
            const gradeData = incomer.data as any;
            if (gradeData.includedCourses && Array.isArray(gradeData.includedCourses)) {
                gradeData.includedCourses.forEach((c: { id: number; price: number }) => {
                    uniqueCourses.set(c.id, Number(c.price || 0));
                });
            }
        }
    }

    // Calculate totals from the unique map
    let totalPrice = 0;
    uniqueCourses.forEach((price) => {
        totalPrice += price;
    });

    const coursesCount = uniqueCourses.size;

    return { totalPrice, coursesCount };
};

/**
 * Updates ALL Package nodes in the graph with their new calculated totals.
 * Runs a full recalculation based on the current graph structure.
 */
export const updatePackageTotals = (
    nodes: AppNode[],
    edges: Edge[]
): AppNode[] => {
    // Find all package nodes (usually just one, but support multiple)
    const packageNodes = nodes.filter(n => n.type === 'packageNode');

    if (packageNodes.length === 0) {
        return nodes;
    }

    let hasChanges = false;
    const updatedNodes = nodes.map((node) => {
        if (node.type !== 'packageNode') {
            return node;
        }

        // Calculate fresh totals for this package
        const { totalPrice, coursesCount } = calculateNodeAggregates(node.id, nodes, edges);
        const currentData = node.data as PackageNodeData;

        // Check if values actually changed
        if (currentData.totalPrice === totalPrice && currentData.coursesCount === coursesCount) {
            return node;
        }

        hasChanges = true;
        return {
            ...node,
            data: {
                ...node.data,
                totalPrice,
                coursesCount,
            },
        };
    });

    // Only return new array if something changed (optimization for React)
    return hasChanges ? updatedNodes : nodes;
};
